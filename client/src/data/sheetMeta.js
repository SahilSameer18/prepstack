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
    description: 'Striver\'s legendary SDE sheet - 191 handpicked problems to take you from beginner to job-ready. Follows a structured topic-by-topic progression, perfect for systematic interview prep.',
    badge: 'Most Popular',
    badgeColor: 'text-brand bg-brand/10 border-brand/20',
    accentColor: 'var(--brand)',
    sourceName: 'takeUforward',
    sourceUrl: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/'
  },
  'striver-a2z': {
    description: 'The ultimate A-to-Z DSA course by Striver covering 450+ problems from absolute basics to advanced. Best for those starting from scratch and building a rock-solid foundation.',
    badge: 'Beginner Friendly',
    badgeColor: 'text-ok bg-ok-solid/10 border-ok-solid/20',
    accentColor: 'var(--data-green)',
    sourceName: 'takeUforward',
    sourceUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/'
  },
  'love-babbar': {
    description: 'Love Babbar\'s comprehensive 450-problem DSA sheet - a thorough grind ensuring complete coverage of every data structure and algorithm needed to crack top tech companies.',
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
