// The choices on a problem note. The server keeps a copy (server/src/data/problemNoteOptions.js) to check what it saves;
// server/test/problem-notes.test.js fails if the two drift apart.
export const TIME_COMPLEXITIES = ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'O(N²)', 'O(2ⁿ)'];
export const SPACE_COMPLEXITIES = ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'];
export const COMMON_PATTERNS = [
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Monotonic Stack',
  'Fast & Slow Pointers',
  'DFS / Backtracking',
  'BFS / Level Order',
  'Dynamic Programming',
  'Prefix Sums',
  'Greedy',
  'Union Find / Graph',
  'Trie',
  'Bit Manipulation',
];
export const APPROACH_MAX = 5000;
