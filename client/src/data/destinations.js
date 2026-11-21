import { roadmaps } from "./roadmaps";

// Every page someone might want to reach, so a few letters find it (the 404 "Jump to" box and the Ctrl+K box share this list).
export const DESTINATIONS = [
  { label: "My plan", to: "/my-plan" },
  { label: "DSA sheets", to: "/dsa" },
  ...[["Blind 75", "blind-75"], ["NeetCode 150", "neetcode-150"], ["Striver SDE", "striver-sde"], ["Striver A2Z", "striver-a2z"], ["Love Babbar", "love-babbar"]]
    .map(([name, slug]) => ({ label: `DSA sheet: ${name}`, to: `/dsa/${slug}` })),
  { label: "CS notes", to: "/notes" },
  ...[["Operating Systems", "os"], ["DBMS", "dbms"], ["Computer Networks", "cn"], ["OOP in Java", "oops"], ["System Design", "hld"]]
    .map(([name, slug]) => ({ label: `Notes: ${name}`, to: `/notes/${slug}` })),
  { label: "Roadmaps", to: "/roadmaps" },
  ...roadmaps.map((r) => ({ label: `Roadmap: ${r.title}`, to: `/roadmaps/${r.slug}` })),
  { label: "Role Analyzer", to: "/analyzer" },
  { label: "AI projects", to: "/ai-projects" },
  { label: "Behavioral prep", to: "/behavioral" },
  { label: "Resume guide", to: "/resume" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Profile", to: "/profile" },
  { label: "Privacy policy", to: "/privacy" },
  { label: "Terms of use", to: "/terms" },
];

// Words typed -> the matching pages (every word must appear in the label)
export const matchDestinations = (query, limit = 6) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return words.length ? DESTINATIONS.filter((d) => words.every((w) => d.label.toLowerCase().includes(w))).slice(0, limit) : [];
};
