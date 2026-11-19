// Numbers about the notes, worked out from the data so no page has to type them by hand.
const WORDS_PER_MINUTE = 200;
// Not text for the reader: ids, dates and link targets
const SKIPPED_KEYS = new Set(['id', 'lastChecked', 'links', 'diagrams']);

const countWords = (value) => {
  if (typeof value === 'string') return value.trim().split(/\s+/).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countWords(item), 0);
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((sum, [key, item]) => (SKIPPED_KEYS.has(key) ? sum : sum + countWords(item)), 0);
  }
  return 0;
};

const readMinutes = (words) => Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

const sectionStats = (section) => {
  const words = countWords(section);
  return { words, readMinutes: readMinutes(words) };
};

// sections: the notes' sections as plain objects
const subjectStats = (sections) => {
  const words = sections.reduce((sum, s) => sum + countWords(s), 0);
  const dates = sections.map((s) => s.lastChecked).filter(Boolean).sort();
  return {
    sectionCount: sections.length,
    topicCount: sections.reduce((sum, s) => sum + (Array.isArray(s.topics) ? s.topics.length : 0), 0),
    readMinutes: readMinutes(words),
    lastChecked: dates.length ? dates[dates.length - 1] : null,
  };
};

module.exports = { WORDS_PER_MINUTE, countWords, readMinutes, sectionStats, subjectStats };
