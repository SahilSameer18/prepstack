// Reports saved before the server tidied titles can have a whole lower-case sentence as the title. This shows any title the
// same way the server now saves it: Title Case when it is all lower case, and at most 60 characters, cut at a word.
export const formatTitle = (title) => {
  let t = String(title || "").replace(/\s+/g, " ").trim();
  if (t.length > 60) {
    const cut = t.slice(0, 60);
    t = cut.lastIndexOf(" ") > 36 ? cut.slice(0, cut.lastIndexOf(" ")) : cut;
  }
  return t === t.toLowerCase() ? t.replace(/(^|[\s(/-])([a-z])/g, (m, a, b) => a + b.toUpperCase()) : t;
};

// A short file name for the PDF, such as "prepstack-role-report-full-stack-developer-spring-boot.pdf" (the title part is cut at a word, 40 characters at most).
export const pdfFileName = (title) => {
  let slug = formatTitle(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (slug.length > 40) slug = slug.slice(0, 40).replace(/-[^-]*$/, "");
  return `prepstack-role-report${slug ? `-${slug}` : ""}.pdf`;
};
