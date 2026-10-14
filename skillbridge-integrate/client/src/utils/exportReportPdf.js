import React from "react";
import { getInterviewReportById } from "../services/interview.api";

/**
 * Generates and triggers an instant client-side download of the interview report PDF.
 * Runs 100% on the client device with zero AI calls and zero server CPU overhead.
 * Dynamically loaded only when user clicks export to keep initial bundle ultra lightweight.
 * 
 * @param {Object} reportInput - The report object (can be full report or dashboard preview item)
 */
export const exportReportPdf = async (reportInput) => {
  if (!reportInput || !reportInput.id) {
    throw new Error("Invalid report data provided for PDF export");
  }

  try {
    // Dynamically load heavy PDF engines only on demand
    const [{ pdf }, { default: InterviewReportPDF }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("../components/pdf/InterviewReportPDF")
    ]);
    let reportData = reportInput;

    // Edge Case: If called from Dashboard where only summary fields exist,
    // fetch the full questions, skill gaps, and roadmap once.
    if (!reportData.technicalQuestions || !reportData.preparationPlan) {
      const response = await getInterviewReportById(reportData.id);
      reportData = response.interviewReport || response;
    }

    // Render PDF blob in browser using React.createElement for standard JS compatibility
    const element = React.createElement(InterviewReportPDF, { report: reportData });
    const blob = await pdf(element).toBlob();
    const url = URL.createObjectURL(blob);

    // Sanitize filename for safe OS download
    const rawTitle = reportData.title || "Interview_Strategy";
    const cleanTitle = rawTitle
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .substring(0, 35);
    const fileName = `SkillBridge_${cleanTitle}_Report.pdf`;

    // Trigger instant browser download
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Revoke memory reference
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 1200);

    return true;
  } catch (error) {
    console.error("Client-side PDF generation failed:", error);
    throw error;
  }
};
