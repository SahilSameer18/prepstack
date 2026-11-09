// Builds the one-page resume checklist PDF in the browser and starts the download. The PDF library is big, so it is loaded only here, on click.
export const exportResumeChecklistPdf = async () => {
  const [{ pdf }, { default: ResumeChecklistPDF }, React] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../components/pdf/ResumeChecklistPDF"),
    import("react"),
  ]);
  const blob = await pdf(React.createElement(ResumeChecklistPDF, { origin: window.location.origin })).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "prepstack-resume-checklist.pdf";
  a.click();
  URL.revokeObjectURL(url);
};
