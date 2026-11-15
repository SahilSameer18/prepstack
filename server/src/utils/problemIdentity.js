// Provider rules apply only where we know the URL identifies a problem.
// Other paths keep their case, query and trailing slash semantics.
function problemIdentity(value) {
  if (typeof value !== 'string') return '';
  const link = value.trim();
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    if (['leetcode.com', 'www.leetcode.com'].includes(host)) {
      const match = url.pathname.match(/^\/problems\/([^/]+)/i);
      if (match) return 'https://leetcode.com/problems/' + match[1].toLowerCase() + '/';
    }
    if (['www.geeksforgeeks.org', 'geeksforgeeks.org', 'practice.geeksforgeeks.org'].includes(host)) {
      url.pathname = url.pathname.replace(/\/+$/, '') || '/';
      return url.toString();
    }
    return link;
  } catch {
    return link;
  }
}

// Legacy aliases count once. Keep the earliest known solve, including its
// study-day metadata; never replace an unknown solve date with today's date.
function normalizedSolves(entries = []) {
  const records = new Map();
  for (const raw of entries) {
    const entry = typeof raw.toObject === 'function' ? raw.toObject() : raw;
    const link = problemIdentity(entry.link);
    if (!link) continue;
    const previous = records.get(link);
    if (!previous || (entry.solvedAt && (!previous.solvedAt || new Date(entry.solvedAt) < new Date(previous.solvedAt)))) {
      records.set(link, { ...entry, link });
    }
  }
  return [...records.values()];
}

module.exports = { problemIdentity, normalizedSolves };
