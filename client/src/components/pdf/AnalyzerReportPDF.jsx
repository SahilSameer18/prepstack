import { Document, Page, Text, View, Link, StyleSheet } from "@react-pdf/renderer";

// The Role Analyzer report as a PDF. Built in the browser and loaded only when the user clicks Download.
// Only standard PDF fonts are used (no font files to fetch), so text outside basic Latin may not draw.
const ink = "#18181b", soft = "#52525b", line = "#e4e4e7", amber = "#b45309";
const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: ink, fontFamily: "Helvetica", lineHeight: 1.4 },
  brand: { fontSize: 9, color: amber, marginBottom: 4 },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  sub: { color: soft, marginTop: 2 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 6 },
  box: { borderWidth: 0.5, borderColor: line, borderRadius: 4, padding: 8, marginBottom: 6 },
  bold: { fontFamily: "Helvetica-Bold" },
  soft: { color: soft, fontSize: 9 },
  link: { color: "#1d4ed8", fontSize: 9 },
  foot: { position: "absolute", bottom: 20, left: 40, right: 40, fontSize: 8, color: soft, textAlign: "center" },
});

const LABEL = { met: "Matched", partial: "Partly", missing: "Missing" };

const refUrl = (ref, origin) => {
  if (!ref) return null;
  const [kind, a] = ref.split(":");
  if (kind === "dsa") return { url: `${origin}/dsa/blind-75`, label: `Blind 75: ${ref.slice(4)}` };
  if (kind === "notes") return { url: `${origin}/notes/${a}`, label: `CS notes: ${ref.split(":").slice(2).join(":")}` };
  if (kind === "roadmap") return { url: `${origin}/roadmaps/${a}`, label: "Roadmap" };
  return null;
};

const AnalyzerReportPDF = ({ report, origin }) => {
  const advice = report.skillAdvice || {};
  const seen = new Set();
  const gaps = report.requirements.filter((r) => r.status !== "met" && advice[r.skillKey] && !seen.has(r.skillKey) && seen.add(r.skillKey));
  const must = report.scoreBreakdown?.must || {};
  const mustTotal = (must.met || 0) + (must.partial || 0) + (must.missing || 0);

  return (
    <Document title={`${report.title} - Role Analyzer report`} author="PrepStack">
      <Page size="A4" style={s.page}>
        <Text style={s.brand}>PREPSTACK ROLE ANALYZER</Text>
        <Text style={s.title}>{report.title}</Text>
        <Text style={s.sub}>Match score {report.score} out of 100. {must.met || 0} of {mustTotal} required skills matched. {report.days}-day plan.</Text>
        <Text style={s.soft}>Created {new Date(report.createdAt).toLocaleDateString()}. The score is worked out from the marks below, not by the AI.</Text>

        {report.priorities?.length > 0 && (
          <View>
            <Text style={s.h2}>Focus on these first</Text>
            {report.priorities.map((p, i) => (
              <View key={i} style={s.box} wrap={false}>
                <Text style={s.bold}>{i + 1}. {p.title} (about {p.hours} hours)</Text>
                <Text style={s.soft}>{p.why}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={s.h2}>What the job asks for</Text>
        {[...report.requirements].map((r, i) => (
          <View key={i} style={s.box} wrap={false}>
            <Text style={s.bold}>{r.text}</Text>
            <Text style={s.soft}>{LABEL[r.status]} - {r.importance === "must" ? "required" : "nice to have"}{r.downgraded ? " - proof not found in your resume, so counted as weaker" : ""}</Text>
            {r.status !== "missing" && r.evidence ? <Text style={s.soft}>From your resume: "{r.evidence}"</Text> : null}
          </View>
        ))}

        {gaps.length > 0 && (
          <View>
            <Text style={s.h2}>Close the gaps</Text>
            {gaps.map((r) => {
              const a = advice[r.skillKey];
              return (
                <View key={r.skillKey} style={s.box} wrap={false}>
                  <Text style={s.bold}>{a.name}</Text>
                  {a.actions.map((x) => <Link key={x.path} src={origin + x.path} style={s.link}>{x.label}</Link>)}
                  {a.resources.map((x) => <Link key={x.url} src={x.url} style={s.link}>{x.title} ({x.type === "video" ? "video" : "docs"})</Link>)}
                </View>
              );
            })}
          </View>
        )}

        {report.plan?.length > 0 && (
          <View>
            <Text style={s.h2}>Your {report.days}-day plan</Text>
            {report.plan.map((d) => (
              <View key={d.day} style={s.box} wrap={false}>
                <Text style={s.bold}>Day {d.day}: {d.focus}</Text>
                {(d.items || []).map((it, i) => {
                  const l = refUrl(it.ref, origin);
                  return <Text key={i}>- {it.task}{l ? " " : ""}{l ? <Link src={l.url} style={s.link}>{l.label}</Link> : null}</Text>;
                })}
                {d.extra ? <Text style={s.soft}>{d.extra}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {report.technicalQuestions?.length > 0 && (
          <View>
            <Text style={s.h2}>Questions you may be asked</Text>
            {report.technicalQuestions.map((q, i) => (
              <View key={i} style={s.box} wrap={false}>
                <Text style={s.bold}>{q.question}</Text>
                <Text style={s.soft}>{q.why}</Text>
                {q.resumeAngle ? <Text style={s.soft}>Your resume angle: {q.resumeAngle}</Text> : null}
              </View>
            ))}
            {(report.behavioralQuestions || []).map((q, i) => (
              <View key={`b${i}`} style={s.box} wrap={false}>
                <Text style={s.bold}>{q.question}</Text>
                {q.resumeAngle ? <Text style={s.soft}>Your resume angle: {q.resumeAngle}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {report.resumeTweaks?.length > 0 && (
          <View>
            <Text style={s.h2}>Resume changes to consider</Text>
            {report.resumeTweaks.map((t, i) => (
              <Text key={i} style={{ marginBottom: 4 }}><Text style={s.bold}>{t.keyword}</Text> - {t.suggestion}</Text>
            ))}
          </View>
        )}

        <Text style={s.foot} fixed render={({ pageNumber, totalPages }) => `This report is AI-written advice checked by code. It cannot promise an interview or a job.   Page ${pageNumber} of ${totalPages}`} />
      </Page>
    </Document>
  );
};

export default AnalyzerReportPDF;
