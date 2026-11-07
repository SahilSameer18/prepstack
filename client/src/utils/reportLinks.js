// A plan item or coding topic points at PrepStack content with a ref like "dsa:Arrays", "notes:os:Deadlocks" or "roadmap:frontend".
// The server only keeps refs that exist, so every one of these resolves to a real page. Used by the report page and the PDF.
const SUBJECT = { os: "OS", dbms: "DBMS", cn: "Networks", oops: "OOP" };
const ROADMAP = { frontend: "Frontend", backend: "Backend", fullstack: "Full Stack", android: "Android", "data-analytics": "Data Analytics", "machine-learning": "Machine Learning" };

export const refLink = (ref) => {
  if (!ref) return null;
  const [kind, a] = ref.split(":");
  if (kind === "dsa") return { path: "/dsa/blind-75", label: `Blind 75: ${ref.slice(4)}` };
  if (kind === "notes") return { path: `/notes/${a}`, label: `${SUBJECT[a] || a} notes: ${ref.split(":").slice(2).join(":")}` };
  if (kind === "roadmap") return { path: `/roadmaps/${a}`, label: `${ROADMAP[a] || a} roadmap` };
  return null;
};
