import { Document, Page, Text, View, Link, Font, StyleSheet } from "@react-pdf/renderer";
import { checklist } from "../../data/resumeGuide";

// The one-page resume checklist as a PDF. Built in the browser and loaded only when the user clicks Download.
// Only the standard PDF fonts are used (no font files to fetch).
Font.registerHyphenationCallback((word) => [word]); // never split a word across lines

const C = { ink: "#18181b", soft: "#52525b", muted: "#71717a", line: "#e4e4e7", amber: "#f59e0b", amberDark: "#b45309", link: "#1d4ed8" };

const s = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 60, paddingHorizontal: 44, fontSize: 10, color: C.ink, fontFamily: "Helvetica" },
  brand: { fontSize: 8, letterSpacing: 1.5, color: C.amberDark, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  title: { fontSize: 22, lineHeight: 1.2, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  sub: { fontSize: 10, lineHeight: 1.4, color: C.soft, marginBottom: 6 },
  secRow: { flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 8 },
  secBar: { width: 3, height: 14, backgroundColor: C.amber, borderRadius: 2, marginRight: 7 },
  secTitle: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  item: { flexDirection: "row", alignItems: "flex-start", marginBottom: 7 },
  box: { width: 11, height: 11, borderWidth: 1, borderColor: C.soft, borderRadius: 2, marginRight: 9, marginTop: 1 },
  itemText: { flex: 1, fontSize: 10.5, lineHeight: 1.4 },
  note: { marginTop: 18, borderTopWidth: 0.75, borderTopColor: C.line, paddingTop: 10, fontSize: 9, lineHeight: 1.4, color: C.soft },
  link: { color: C.link, textDecoration: "none" },
  foot: { position: "absolute", bottom: 24, left: 44, right: 44, fontSize: 8, color: C.muted, textAlign: "center" },
});

const ResumeChecklistPDF = ({ origin }) => (
  <Document title="Resume checklist - PrepStack" author="PrepStack">
    <Page size="A4" style={s.page}>
      <Text style={s.brand}>PREPSTACK  ·  RESUME GUIDE</Text>
      <Text style={s.title}>One-page resume checklist</Text>
      <Text style={s.sub}>Tick each box before you send your resume. It is advice, not a rule: if an application gives its own instructions, follow them.</Text>

      {checklist.map((group) => (
        <View key={group.group}>
          <View style={s.secRow} minPresenceAhead={60}>
            <View style={s.secBar} />
            <Text style={s.secTitle}>{group.group}</Text>
          </View>
          {group.items.map((item) => (
            <View key={item} style={s.item} wrap={false}>
              <View style={s.box} />
              <Text style={s.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      <Text style={s.note}>
        Check your resume against a real job description with the Role Analyzer at <Link style={s.link} src={`${origin}/analyzer`}>{origin.replace(/^https?:\/\//, "")}/analyzer</Link>. The full guide, with weak and strong examples for every section, is at <Link style={s.link} src={`${origin}/resume`}>{origin.replace(/^https?:\/\//, "")}/resume</Link>.
      </Text>

      <Text style={s.foot} fixed>PrepStack gives advice only. It cannot promise an interview or a job.</Text>
    </Page>
  </Document>
);

export default ResumeChecklistPDF;
