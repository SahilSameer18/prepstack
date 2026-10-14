import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: "#1F2937",
    lineHeight: 1.45,
  },
  // ── Header & Branding ──
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    letterSpacing: -0.5,
    lineHeight: 1.1,
  },
  brandAccent: {
    color: "#FF6662",
  },
  brandSub: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 4,
  },
  dateText: {
    fontSize: 8.5,
    color: "#6B7280",
    textAlign: "right",
  },

  // ── Summary Card ──
  summaryCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 3,
  },
  roleSub: {
    fontSize: 8.5,
    color: "#4B5563",
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  scoreLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginTop: 1,
  },

  // ── Section Title ──
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Question Card ──
  card: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 9,
    marginBottom: 8,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  questionNumber: {
    backgroundColor: "#FF6662",
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    marginRight: 6,
    marginTop: 1,
  },
  questionText: {
    flex: 1,
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  intentionBox: {
    backgroundColor: "#F3F4F6",
    borderLeftWidth: 2.5,
    borderLeftColor: "#9CA3AF",
    padding: 5,
    marginBottom: 5,
    borderRadius: 3,
  },
  intentionLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#4B5563",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  intentionText: {
    fontSize: 8.5,
    color: "#374151",
  },
  answerBox: {
    backgroundColor: "#FFF5F5",
    borderLeftWidth: 2.5,
    borderLeftColor: "#FF6662",
    padding: 5,
    borderRadius: 3,
  },
  answerLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#FF6662",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  answerText: {
    fontSize: 8.5,
    color: "#1F2937",
    lineHeight: 1.35,
  },

  // ── Skill Gaps ──
  skillCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 8,
    marginBottom: 7,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  skillName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  priorityBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  resourceList: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2.5,
  },
  resourceType: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    backgroundColor: "#F3F4F6",
    color: "#4B5563",
    marginRight: 6,
    textTransform: "uppercase",
  },
  resourceLink: {
    fontSize: 8,
    color: "#2563EB",
    textDecoration: "underline",
  },

  // ── Roadmap ──
  roadmapDay: {
    flexDirection: "row",
    marginBottom: 7,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 7,
  },
  dayBadge: {
    width: 40,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    marginRight: 8,
  },
  dayText: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#FF6662",
    textTransform: "uppercase",
  },
  dayNum: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#FF6662",
  },
  roadmapContent: {
    flex: 1,
  },
  roadmapFocus: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 3,
  },
  taskItem: {
    fontSize: 8,
    color: "#4B5563",
    marginBottom: 1.5,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
    fontSize: 7.5,
    color: "#9CA3AF",
  },
});

const getScoreColors = (score) => {
  if (!score || score < 60) {
    return { bg: "#FEF2F2", text: "#DC2626", border: "#F87171", label: "Calibrating" };
  }
  if (score >= 80) {
    return { bg: "#ECFDF5", text: "#059669", border: "#34D399", label: "Strong Match" };
  }
  return { bg: "#FFFBEB", text: "#D97706", border: "#FBBF24", label: "Good Match" };
};

const getSeverityColors = (severity) => {
  const s = severity?.toLowerCase();
  if (s === "high") return { bg: "#FEE2E2", text: "#B91C1C" };
  if (s === "medium") return { bg: "#FEF3C7", text: "#B45309" };
  return { bg: "#EFF6FF", text: "#1D4ED8" };
};

export const InterviewReportPDF = ({ report }) => {
  if (!report) return null;

  const scoreInfo = getScoreColors(report.matchScore);
  const technicalQuestions = report.technicalQuestions || [];
  const behavioralQuestions = report.behavioralQuestions || [];
  const skillGaps = report.skillGaps || [];
  const preparationPlan = report.preparationPlan || [];
  const createdDate = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Document Header ── */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.brandTitle}>
              Skill<Text style={styles.brandAccent}>Bridge</Text> AI
            </Text>
            <Text style={styles.brandSub}>AI-Powered Interview Preparation Strategy Report</Text>
          </View>
          <View>
            <Text style={styles.dateText}>Audited: {createdDate}</Text>
            <Text style={styles.dateText}>Report ID: {report.id ? report.id.slice(0, 12) : "N/A"}</Text>
          </View>
        </View>

        {/* ── Executive Summary Card ── */}
        <View style={styles.summaryCard}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.roleTitle}>{report.title || "Custom Interview Strategy Plan"}</Text>
            <Text style={styles.roleSub}>
              Analysis based on candidate resume and target role job description requirements.
            </Text>
          </View>
          {report.matchScore !== null && report.matchScore !== undefined && (
            <View
              style={[
                styles.scoreBadge,
                { backgroundColor: scoreInfo.bg, borderColor: scoreInfo.border, borderWidth: 1 },
              ]}
            >
              <Text style={[styles.scoreNumber, { color: scoreInfo.text }]}>
                {report.matchScore}%
              </Text>
              <Text style={[styles.scoreLabel, { color: scoreInfo.text }]}>
                {scoreInfo.label}
              </Text>
            </View>
          )}
        </View>

        {/* ── Technical Questions ── */}
        {technicalQuestions.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                1. Technical Questions & Model Answers ({technicalQuestions.length})
              </Text>
            </View>
            {technicalQuestions.map((q, idx) => (
              <View key={idx} style={styles.card} wrap={false}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>{idx + 1}</Text>
                  <Text style={styles.questionText}>{q.question}</Text>
                </View>
                {q.intention ? (
                  <View style={styles.intentionBox}>
                    <Text style={styles.intentionLabel}>Interviewer Intention</Text>
                    <Text style={styles.intentionText}>{q.intention}</Text>
                  </View>
                ) : null}
                {q.answer ? (
                  <View style={styles.answerBox}>
                    <Text style={styles.answerLabel}>Model Answer Structure</Text>
                    <Text style={styles.answerText}>{q.answer}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* ── Behavioral Questions ── */}
        {behavioralQuestions.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                2. Behavioral & Situational Questions ({behavioralQuestions.length})
              </Text>
            </View>
            {behavioralQuestions.map((q, idx) => (
              <View key={idx} style={styles.card} wrap={false}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>{idx + 1}</Text>
                  <Text style={styles.questionText}>{q.question}</Text>
                </View>
                {q.intention ? (
                  <View style={styles.intentionBox}>
                    <Text style={styles.intentionLabel}>Interviewer Intention</Text>
                    <Text style={styles.intentionText}>{q.intention}</Text>
                  </View>
                ) : null}
                {q.answer ? (
                  <View style={styles.answerBox}>
                    <Text style={styles.answerLabel}>Model Answer (STAR Format)</Text>
                    <Text style={styles.answerText}>{q.answer}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* ── Skill Gaps & Resources ── */}
        {skillGaps.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                3. Identified Skill Gaps & Curated Learning Resources ({skillGaps.length})
              </Text>
            </View>
            {skillGaps.map((gap, idx) => {
              const sev = getSeverityColors(gap.severity);
              const resources = gap.skillRef?.resources || [];
              return (
                <View key={idx} style={styles.skillCard} wrap={false}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{gap.skill}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: sev.bg }]}>
                      <Text style={[styles.priorityText, { color: sev.text }]}>
                        {gap.severity || "Standard"} Priority
                      </Text>
                    </View>
                  </View>
                  {resources.length > 0 ? (
                    <View style={styles.resourceList}>
                      {resources.map((res, rIdx) => (
                        <View key={rIdx} style={styles.resourceItem}>
                          <Text style={styles.resourceType}>
                            {res.type === "VIDEO" ? "Video" : "Docs"}
                          </Text>
                          {res.url && res.url.startsWith("http") ? (
                            <Link src={res.url} style={styles.resourceLink}>
                              {res.title || res.url}
                            </Link>
                          ) : (
                            <Text style={{ fontSize: 8, color: "#4B5563" }}>
                              {res.title || "Resource Link"}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={{ fontSize: 7.5, color: "#9CA3AF", fontStyle: "italic", marginTop: 2 }}>
                      No direct resource links mapped. Recommended topic for self-study.
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ── 10-Day Preparation Roadmap ── */}
        {preparationPlan.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                4. Structured Preparation Roadmap ({preparationPlan.length} Days)
              </Text>
            </View>
            {preparationPlan.map((plan, idx) => (
              <View key={idx} style={styles.roadmapDay} wrap={false}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayText}>Day</Text>
                  <Text style={styles.dayNum}>{plan.day || idx + 1}</Text>
                </View>
                <View style={styles.roadmapContent}>
                  <Text style={styles.roadmapFocus}>{plan.focus}</Text>
                  {Array.isArray(plan.tasks) &&
                    plan.tasks.map((task, tIdx) => (
                      <Text key={tIdx} style={styles.taskItem}>
                        • {task}
                      </Text>
                    ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Fixed Footer with Page Numbers ── */}
        <View
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) => (
            <>
              <Text>SkillBridge AI — Confidential Interview Preparation</Text>
              <Text>
                Page {pageNumber} of {totalPages}
              </Text>
            </>
          )}
        />
      </Page>
    </Document>
  );
};

export default InterviewReportPDF;
