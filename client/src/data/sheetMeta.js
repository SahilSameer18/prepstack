// Static presentation data for each DSA sheet (badge, accent colour, source link). Unknown slugs get the default.
const SHEET_META = {
  'blind-75': {
    description: 'A curated list of 75 essential LeetCode problems hand-picked to cover every core pattern. The go-to list for FAANG prep - if you can solve these, you can handle most coding rounds.',
    badge: 'FAANG Favourite',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    accentColor: '#3b82f6',
    sourceName: 'LeetCode Discuss',
    sourceUrl: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions'
  },
  'neetcode-150': {
    description: 'NeetCode\'s expertly curated 150 problems - a superset of Blind 75 with added depth. Covers every key algorithmic pattern with optimised solutions and video explanations.',
    badge: 'Community Favourite',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    accentColor: '#a855f7',
    sourceName: 'NeetCode.io',
    sourceUrl: 'https://neetcode.io/practice'
  },
  'striver-sde': {
    description: 'Striver\'s legendary SDE sheet - 191 handpicked problems to take you from beginner to job-ready. Follows a structured topic-by-topic progression, perfect for systematic interview prep.',
    badge: 'Most Popular',
    badgeColor: 'text-[#ffa116] bg-[#ffa116]/10 border-[#ffa116]/20',
    accentColor: '#ffa116',
    sourceName: 'takeUforward',
    sourceUrl: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/'
  },
  'striver-a2z': {
    description: 'The ultimate A-to-Z DSA course by Striver covering 450+ problems from absolute basics to advanced. Best for those starting from scratch and building a rock-solid foundation.',
    badge: 'Beginner Friendly',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    accentColor: '#10b981',
    sourceName: 'takeUforward',
    sourceUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/'
  },
  'love-babbar': {
    description: 'Love Babbar\'s comprehensive 450-problem DSA sheet - a thorough grind ensuring complete coverage of every data structure and algorithm needed to crack top tech companies.',
    badge: 'Complete Coverage',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    accentColor: '#ec4899',
    sourceName: 'CodeHelp / GFG',
    sourceUrl: 'https://practice.geeksforgeeks.org/explore?page=1&sprint=a663236c31453b969852f9ea22507634'
  },
};

export const getSheetMeta = (slug) =>
  SHEET_META[slug] || {
    description: 'A comprehensive DSA problem sheet to master your interview preparation and crack top tech companies.',
    badge: 'Popular',
    badgeColor: 'text-gray-400 bg-white/5 border-white/10',
    accentColor: '#ffa116',
    sourceName: 'Official Source',
    sourceUrl: '#'
  };
