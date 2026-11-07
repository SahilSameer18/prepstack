// Builds the report PDF in the browser and starts the download. The PDF library is big, so it is loaded only here, on click.
export const exportReportPdf = async (report) => {
  const [{ pdf }, { default: AnalyzerReportPDF }, React] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../components/pdf/AnalyzerReportPDF"),
    import("react"),
  ]);
  const blob = await pdf(React.createElement(AnalyzerReportPDF, { report, origin: window.location.origin })).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "report"}-role-analyzer.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
