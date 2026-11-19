// What a saved problem note may contain. A copy of client/src/data/problemNoteOptions.js (the chips on the note drawer);
// test/problem-notes.test.js fails if the two lists differ.
module.exports = {
  TIME_COMPLEXITIES: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'O(N²)', 'O(2ⁿ)'],
  SPACE_COMPLEXITIES: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
  COMMON_PATTERNS: [
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
  ],
  APPROACH_MAX: 5000,
};
