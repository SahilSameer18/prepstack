// Static presentation data for each DSA sheet (badge, accent colour, source link). Unknown slugs get the default.
const SHEET_META = {
  'blind-75': {
    description: 'A curated list of 75 essential LeetCode problems hand-picked to cover every core pattern. The go-to list for FAANG prep - if you can solve these, you can handle most coding rounds.',
    badge: 'FAANG Favourite',
    badgeColor: 'text-info bg-info-solid/10 border-info-solid/20',
    accentColor: 'var(--data-blue)',
    sourceName: 'LeetCode Discuss',
    sourceUrl: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions'
  },
  'neetcode-150': {
    description: 'NeetCode\'s expertly curated 150 problems - a superset of Blind 75 with added depth. Covers every key algorithmic pattern with optimised solutions and video explanations.',
    badge: 'Community Favourite',
    badgeColor: 'text-violet bg-violet-solid/10 border-violet-solid/20',
    accentColor: 'var(--data-purple)',
    sourceName: 'NeetCode.io',
    sourceUrl: 'https://neetcode.io/practice'
  },
  'striver-sde': {
    description: 'Striver\'s SDE sheet as published on takeUforward: handpicked problems in parts, each with its practice page and, for most, his video lecture and an article. A structured path for systematic interview prep.',
    badge: 'Most Popular',
    badgeColor: 'text-brand bg-brand/10 border-brand/20',
    accentColor: 'var(--brand)',
    sourceName: 'takeUforward',
    sourceUrl: 'https://takeuforward.org/prep-hub/strivers-sde-sheet'
  },
  'striver-a2z': {
    description: 'Striver\'s A-to-Z DSA course as problems, from absolute basics to advanced, in his module order. Each problem has its practice page and, for most, his video lecture and an article. Best for starting from scratch.',
    badge: 'Beginner Friendly',
    badgeColor: 'text-ok bg-ok-solid/10 border-ok-solid/20',
    accentColor: 'var(--data-green)',
    sourceName: 'takeUforward',
    sourceUrl: 'https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet'
  },
  'love-babbar': {
    description: 'Love Babbar\'s DSA sheet: as GeeksforGeeks publishes it: a long, thorough list that covers every data structure and algorithm needed for placements and tech interviews, each question with its article and practice link. A few questions appear under more than one topic and count once.',
    badge: 'Complete Coverage',
    badgeColor: 'text-pink bg-pink-solid/10 border-pink-solid/20',
    accentColor: 'var(--data-pink)',
    sourceName: 'CodeHelp / GFG',
    sourceUrl: 'https://practice.geeksforgeeks.org/explore?page=1&sprint=a663236c31453b969852f9ea22507634'
  },
};

export const getSheetMeta = (slug) =>
  SHEET_META[slug] || {
    description: 'A comprehensive DSA problem sheet to master your interview preparation and crack top tech companies.',
    badge: 'Popular',
    badgeColor: 'text-muted bg-ink/5 border-ink/10',
    accentColor: 'var(--brand)',
    sourceName: 'Official Source',
    sourceUrl: '#'
  };
