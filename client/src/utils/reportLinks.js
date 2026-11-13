// A plan item or coding topic points at PrepStack content with a ref like "dsa:blind-75:arrays-hashing", "notes:os:os-deadlocks" or "roadmap:frontend".
// The ids in a ref never change; the readable title comes from `titles` (report.refTitles, worked out by the server on every read).
// Reports saved before ids were used have refs like "dsa:Arrays" or "notes:os:Deadlocks": their text after the last ":" is the title.
// The server only keeps refs that exist, so every one of these resolves to a real page. Used by the report page and the PDF.
const SUBJECT = { os: "OS", dbms: "DBMS", cn: "Networks", oops: "OOP", hld: "System Design" };
export const ROADMAP = { frontend: "Frontend", backend: "Backend", fullstack: "Full Stack", android: "Android", "data-analytics": "Data Analytics", "machine-learning": "Machine Learning", "dsa": "DSA & Problem Solving", "java-spring": "Java & Spring Boot", "devops-cloud": "DevOps & Cloud" };

const SHEET = { "blind-75": "Blind 75", "neetcode-150": "NeetCode 150", "striver-sde": "Striver SDE", "striver-a2z": "Striver A2Z", "love-babbar": "Love Babbar" };

// A ref points at one place: dsa:<sheet>:<topic>, notes:<subject>:<section>, roadmap:<slug>, behavioral:<question id>, project:<roadmap>:<step>.
// "mock:<week>" (a timed mock block in a plan) has no page of its own, so it gives nothing, like an unknown ref.
export const refLink = (ref, titles) => {
  if (!ref) return null;
  const [kind, a] = ref.split(":");
  const title = titles?.[ref];
  if (kind === "dsa") {
    // dsa:<sheet>:<topic> opens that sheet; an older dsa:<title> ref (before sheets were named) opens the Blind 75 sheet
    const parts = ref.split(":");
    if (parts.length === 3 && SHEET[a]) return { path: `/dsa/${a}`, label: `${SHEET[a]}: ${title ?? parts[2]}` };
    return { path: "/dsa/blind-75", label: `Blind 75: ${title ?? ref.slice(4)}` };
  }
  // a ref made of ids opens its section (its title is known); an older title-style ref opens the subject
  if (kind === "notes") return { path: title ? `/notes/${a}/${ref.split(":")[2]}` : `/notes/${a}`, label: `${SUBJECT[a] || a} notes: ${title ?? ref.split(":").slice(2).join(":")}` };
  if (kind === "roadmap") return { path: `/roadmaps/${a}`, label: `${ROADMAP[a] || a} roadmap` };
  if (kind === "behavioral") return { path: "/behavioral", label: `Behavioral question: ${title ?? a}` };
  if (kind === "project") {
    const step = ref.split(":")[2];
    return { path: `/roadmaps/${a}#${step}`, label: `${ROADMAP[a] || a} project: ${title ?? step}` };
  }
  return null;
};
