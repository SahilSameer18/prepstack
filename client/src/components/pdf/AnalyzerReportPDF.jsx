import { Document, Page, Text, View, Link, Svg, Circle, Font, StyleSheet } from "@react-pdf/renderer";
import { refLink } from "../../utils/reportLinks";
import { formatDate } from "../../utils/formatDate";
import { formatTitle } from "../../utils/formatTitle";

// The Role Analyzer report as a PDF. Built in the browser and loaded only when the user clicks Download.
// Only the standard PDF fonts are used (no font files to fetch), so text outside basic Latin may not draw.
Font.registerHyphenationCallback((word) => [word]); // never split a word across lines

const C = { ink: "#18181b", soft: "#52525b", muted: "#71717a", line: "#e4e4e7", card: "#fafafa", dark: "#111113", amber: "#f59e0b", amberDark: "#b45309", link: "#1d4ed8" };
const STATUS = {
  met: { label: "MATCHED", fg: "#047857", bg: "#d1fae5" },
  partial: { label: "PARTLY", fg: "#b45309", bg: "#fef3c7" },
  missing: { label: "MISSING", fg: "#b91c1c", bg: "#fee2e2" },
};
const ORDER = { missing: 0, partial: 1, met: 2 };
const scoreColor = (n) => (n >= 70 ? "#34d399" : n >= 40 ? "#fbbf24" : "#fb7185");

const s = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 60, paddingHorizontal: 34, fontSize: 10, color: C.ink, fontFamily: "Helvetica" }, // No lineHeight here or on a wrapper: on the Page it makes react-pdf drop the fixed footer, and on a wrapper it inflates the spacing of Links. It is set on each text style below.
  header: { backgroundColor: C.dark, borderRadius: 10, padding: 20, flexDirection: "row", alignItems: "center" },
  brand: { fontSize: 8, letterSpacing: 1.5, color: C.amber, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  title: { fontSize: 20, lineHeight: 1.2, color: "#ffffff", fontFamily: "Helvetica-Bold", marginBottom: 6 },
  headSub: { fontSize: 9, color: "#a1a1aa" },
  ringBox: { width: 84, height: 84, marginLeft: 16 },
  ringText: { position: "absolute", top: 0, left: 0, width: 84, height: 84, alignItems: "center", justifyContent: "center" },
  ringNum: { fontSize: 24, color: "#ffffff", fontFamily: "Helvetica-Bold", lineHeight: 1 },
  ringOf: { fontSize: 7, color: "#a1a1aa", marginTop: 2 },
  stats: { flexDirection: "row", marginTop: 10 },
  stat: { flex: 1, borderWidth: 0.75, borderColor: C.line, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: C.card },
  statGap: { marginRight: 8 },
  statK: { fontSize: 8, color: C.muted },
  statV: { fontSize: 15, fontFamily: "Helvetica-Bold", marginTop: 2, lineHeight: 1.1 },
  secRow: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 9 },
  secBar: { width: 3, height: 14, backgroundColor: C.amber, borderRadius: 2, marginRight: 7 },
  secTitle: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  secSub: { fontSize: 8, color: C.muted, marginLeft: 8 },
  card: { borderWidth: 0.75, borderColor: C.line, borderRadius: 8, padding: 10, marginBottom: 7, backgroundColor: "#ffffff" },
  row: { flexDirection: "row" },
  pill: { fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 0.6, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 4, alignSelf: "flex-start" },
  bold: { fontFamily: "Helvetica-Bold", fontSize: 10, lineHeight: 1.3 },
  soft: { fontSize: 9, color: C.soft, lineHeight: 1.4 },
  tiny: { fontSize: 8, color: C.muted, lineHeight: 1.35 },
  quote: { fontSize: 9, color: C.soft, fontFamily: "Helvetica-Oblique", lineHeight: 1.4, borderLeftWidth: 2, borderLeftColor: C.line, paddingLeft: 7, marginTop: 6 },
  link: { fontSize: 9, color: C.link, textDecoration: "none", lineHeight: 1.35 },
  dayLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: C.amberDark, marginBottom: 2 },
  task: { flex: 1, fontSize: 9.5, lineHeight: 1.4 },
  num: { width: 22, fontSize: 10, fontFamily: "Helvetica-Bold", color: C.amberDark, lineHeight: 1.35 },
  bullet: { width: 9, color: C.amberDark, lineHeight: 1.4 },
  foot: { position: "absolute", bottom: 24, left: 34, right: 34, fontSize: 8, color: C.muted, textAlign: "center" },
});

const Section = ({ title, sub }) => (
  <View style={s.secRow} minPresenceAhead={60}>
    <View style={s.secBar} />
    <Text style={s.secTitle}>{title}</Text>
    {sub ? <Text style={s.secSub}>{sub}</Text> : null}
  </View>
);

const Ring = ({ score }) => {
  const size = 84, stroke = 8, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <View style={s.ringBox}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#3f3f46" strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={scoreColor(score)} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - score / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={s.ringText}><Text style={s.ringNum}>{score}</Text><Text style={s.ringOf}>out of 100</Text></View>
    </View>
  );
};

const AnalyzerReportPDF = ({ report, origin }) => {
  const advice = report.skillAdvice || {};
  const reqs = [...report.requirements].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const seen = new Set();
  const gaps = reqs.filter((r) => r.status !== "met" && advice[r.skillKey] && !seen.has(r.skillKey) && seen.add(r.skillKey));
  const must = report.scoreBreakdown?.must || {};
  const mustTotal = (must.met || 0) + (must.partial || 0) + (must.missing || 0);
  const hours = (report.priorities || []).reduce((n, p) => n + (p.hours || 0), 0);
  const stats = [["Required skills", `${must.met || 0} of ${mustTotal} matched`], ["Gaps to close", String(reqs.filter((r) => r.status !== "met").length)], ["Study time", hours ? `${hours} hours` : "-"], ["Plan", `${report.days} days`]];
  const url = (path) => origin + path;

  return (
    <Document title={`${formatTitle(report.title)} - Role Analyzer report`} author="PrepStack">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.brand}>PREPSTACK  ·  ROLE ANALYZER</Text>
            <Text style={s.title}>{formatTitle(report.title)}</Text>
            <Text style={s.headSub}>Created {formatDate(report.createdAt)}. The score is worked out from the marks below, not by the AI.</Text>
          </View>
          <Ring score={report.score} />
        </View>
        <View style={s.stats}>
          {stats.map(([k, v], i) => (
            <View key={k} style={[s.stat, i < stats.length - 1 ? s.statGap : null]}>
              <Text style={s.statK}>{k}</Text>
              <Text style={s.statV}>{v}</Text>
            </View>
          ))}
        </View>

        {report.priorities?.length > 0 && (
          <View>
            <Section title="Focus on these first" />
            {report.priorities.map((p, i) => (
              <View key={i} style={[s.card, s.row]} wrap={false}>
                <Text style={s.num}>{String(i + 1)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.bold}>{p.title}  <Text style={s.tiny}>about {p.hours} hours</Text></Text>
                  <Text style={[s.soft, { marginTop: 2 }]}>{p.why}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Section title="What the job asks for" sub="Gaps first" />
        {reqs.map((r, i) => {
          const st = STATUS[r.status] || STATUS.missing;
          return (
            <View key={i} style={s.card} wrap={false}>
              <View style={s.row}>
                <Text style={[s.pill, { color: st.fg, backgroundColor: st.bg, width: 52, textAlign: "center", marginRight: 9 }]}>{st.label}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.bold}>{r.text}</Text>
                  <Text style={s.tiny}>{r.importance === "must" ? "Required" : "Nice to have"}{r.downgraded ? "  ·  proof not found in your resume, so counted as weaker" : ""}</Text>
                </View>
              </View>
              {r.status !== "missing" && r.evidence ? <Text style={s.quote}>From your resume: "{r.evidence}"</Text> : null}
            </View>
          );
        })}

        {gaps.length > 0 && (
          <View>
            <Section title="Close the gaps" sub="Tap a link to open it" />
            {gaps.map((r) => {
              const a = advice[r.skillKey];
              return (
                <View key={r.skillKey} style={s.card} wrap={false}>
                  <Text style={[s.bold, { marginBottom: 4 }]}>{a.name}</Text>
                  {a.actions.map((x) => <Link key={x.path} src={url(x.path)} style={[s.link, { marginBottom: 2 }]}>›  {x.label}</Link>)}
                  {a.resources.map((x) => <Link key={x.url} src={x.url} style={[s.link, { marginBottom: 2 }]}>›  {x.title} ({x.type === "video" ? "video" : "docs"})</Link>)}
                  {a.actions.length === 0 && a.resources.length === 0 ? <Text style={s.tiny}>No lessons on PrepStack for this yet.</Text> : null}
                </View>
              );
            })}
          </View>
        )}

        {report.plan?.length > 0 && (
          <View>
            <Section title={`Your ${report.days}-day plan`} />
            {report.plan.map((d) => (
              <View key={d.day} style={s.card} wrap={false}>
                <Text style={s.dayLabel}>DAY {String(d.day)}</Text>
                <Text style={s.bold}>{d.focus}</Text>
                <View>
                  {(d.items || []).map((it, i) => {
                    const l = refLink(it.ref, report.refTitles);
                    return (
                      <View key={i} style={[s.row, { marginTop: 3 }]}>
                        <Text style={s.bullet}>•</Text>
                        <Text style={s.task}>{it.task}{l ? "  " : ""}{l ? <Link src={url(l.path)} style={s.link}>{l.label}</Link> : null}</Text>
                      </View>
                    );
                  })}
                  {d.extra ? <Text style={[s.tiny, { marginTop: 4 }]}>{d.extra}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {report.codingTopics?.length > 0 && (
          <View>
            <Section title="Coding topics to practise" />
            {report.codingTopics.map((t, i) => {
              const l = refLink(t.ref, report.refTitles);
              return (
                <View key={i} style={s.card} wrap={false}>
                  {l ? <Link src={url(l.path)} style={[s.link, s.bold]}>{l.label}</Link> : <Text style={s.bold}>{t.ref}</Text>}
                  <Text style={[s.soft, { marginTop: 2 }]}>{t.why}</Text>
                </View>
              );
            })}
          </View>
        )}

        {report.technicalQuestions?.length > 0 && (
          <View>
            <Section title="Questions you may be asked" />
            {report.technicalQuestions.map((q, i) => (
              <View key={i} style={[s.card, s.row]} wrap={false}>
                <Text style={s.num}>{`Q${i + 1}`}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.bold}>{q.question}</Text>
                  <Text style={[s.soft, { marginTop: 2 }]}>{q.why}</Text>
                  {q.resumeAngle ? <Text style={[s.soft, { marginTop: 4 }]}><Text style={s.bold}>Your angle: </Text>{q.resumeAngle}</Text> : null}
                  {(q.followUps || []).map((f, j) => <Text key={j} style={[s.tiny, { marginTop: 2 }]}>Follow-up: {f}</Text>)}
                </View>
              </View>
            ))}
          </View>
        )}

        {report.behavioralQuestions?.length > 0 && (
          <View>
            <Section title="Behavioral questions" sub="Practise them on PrepStack" />
            {report.behavioralQuestions.map((q, i) => (
              <View key={i} style={[s.card, s.row]} wrap={false}>
                <Text style={s.num}>{`B${i + 1}`}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.bold}>{q.question}</Text>
                  {q.resumeAngle ? <Text style={[s.soft, { marginTop: 4 }]}><Text style={s.bold}>Your angle: </Text>{q.resumeAngle}</Text> : null}
                </View>
              </View>
            ))}
            <Link src={url("/behavioral")} style={s.link}>›  Practise on Behavioral Prep</Link>
          </View>
        )}

        {report.resumeTweaks?.length > 0 && (
          <View>
            <Section title="Resume changes to consider" />
            {report.resumeTweaks.map((t, i) => (
              <View key={i} style={s.card} wrap={false}>
                <Text style={s.bold}>{t.keyword}</Text>
                <Text style={[s.soft, { marginTop: 2 }]}>{t.suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        <Text
          style={s.foot} fixed
          render={({ pageNumber, totalPages }) => `PrepStack Role Analyzer  ·  AI-written advice, checked by code. It cannot promise an interview or a job.  ·  Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  );
};

export default AnalyzerReportPDF;
