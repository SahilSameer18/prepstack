// Where the links on a roadmap step go. A step's practice entry is { kind: "notes" | "sheet", target, label }:
//   notes  target "os:os-deadlocks"  -> that notes section
//   sheet  target "blind-75:graph"   -> that DSA sheet (the sheet page has no anchor for a topic yet)
export const practiceLink = (entry) => {
  const [first, second] = entry.target.split(":");
  const path = entry.kind === "notes" ? `/notes/${first}/${second}` : `/dsa/${first}`;
  return { path, label: entry.label };
};

// A step's mini-project opens the AI project generator with the stack already filled in
export const projectLink = (project) => `/ai-projects?stack=${encodeURIComponent(project.stack)}`;
