// A plan item or coding topic points at PrepStack content with a ref like "dsa:blind-75:arrays-hashing", "notes:os:os-deadlocks" or "roadmap:frontend".
// The ids in a ref never change; the readable title comes from `titles` (report.refTitles, worked out by the server on every read).
// Reports saved before ids were used have refs like "dsa:Arrays" or "notes:os:Deadlocks": their text after the last ":" is the title.
// The server only keeps refs that exist, so every one of these resolves to a real page. Used by the report page and the PDF.
const SUBJECT = { os: "OS", dbms: "DBMS", cn: "Networks", oops: "OOP" };
const ROADMAP = { frontend: "Frontend", backend: "Backend", fullstack: "Full Stack", android: "Android", "data-analytics": "Data Analytics", "machine-learning": "Machine Learning" };

export const refLink = (ref, titles) => {
  if (!ref) return null;
  const [kind, a] = ref.split(":");
  const title = titles?.[ref];
  if (kind === "dsa") return { path: "/dsa/blind-75", label: `Blind 75: ${title ?? ref.slice(4)}` };
  // a ref made of ids opens its section (its title is known); an older title-style ref opens the subject
  if (kind === "notes") return { path: title ? `/notes/${a}/${ref.split(":")[2]}` : `/notes/${a}`, label: `${SUBJECT[a] || a} notes: ${title ?? ref.split(":").slice(2).join(":")}` };
  if (kind === "roadmap") return { path: `/roadmaps/${a}`, label: `${ROADMAP[a] || a} roadmap` };
  return null;
};
