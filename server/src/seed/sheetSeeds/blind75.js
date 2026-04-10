const DSASheet = require('../../models/sheets.model');
const connectDB = require('../seedConfig');

const blind75Data = {
  name: "Blind 75 DSA Sheet",
  slug: "blind-75",
  description: "A curated list of 75 essential LeetCode problems to ace coding interviews.",
  topics: [
    {
      title: "Arrays & Hashing",
      problems: [
        { title: "Two Sum", link: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", tags: ["array", "hashmap"] },
        { title: "Contains Duplicate", link: "https://leetcode.com/problems/contains-duplicate/", difficulty: "Easy", tags: ["array", "hashset"] },
        { title: "Valid Anagram", link: "https://leetcode.com/problems/valid-anagram/", difficulty: "Easy", tags: ["array", "hashmap"] },
        { title: "Group Anagrams", link: "https://leetcode.com/problems/group-anagrams/", difficulty: "Medium", tags: ["array", "hashmap"] },
        { title: "Top K Frequent Elements", link: "https://leetcode.com/problems/top-k-frequent-elements/", difficulty: "Medium", tags: ["array", "hashmap", "heap"] },
        { title: "Product of Array Except Self", link: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium", tags: ["array", "prefix", "math"] },
        { title: "Encode and Decode Strings", link: "https://leetcode.com/problems/encode-and-decode-strings/", difficulty: "Medium", tags: ["string", "hashmap"] },
        { title: "Longest Consecutive Sequence", link: "https://leetcode.com/problems/longest-consecutive-sequence/", difficulty: "Medium", tags: ["array", "hashset"] }
      ]
    },
    {
      title: "Two Pointers",
      problems: [
        { title: "Valid Palindrome", link: "https://leetcode.com/problems/valid-palindrome/", difficulty: "Easy", tags: ["string", "two-pointers"] },
        { title: "3Sum", link: "https://leetcode.com/problems/3sum/", difficulty: "Medium", tags: ["array", "two-pointers", "sorting"] },
        { title: "Container With Most Water", link: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium", tags: ["array", "two-pointers"] }
      ]
    },
    {
      title: "Sliding Window",
      problems: [
        {
          title: "Best Time to Buy And Sell Stock",
          link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
          difficulty: "Easy",
          tags: ["array", "greedy"]
        },
        { title: "Longest Substring Without Repeating Characters", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "Medium", tags: ["string", "sliding-window"] },
        { title: "Longest Repeating Character Replacement", link: "https://leetcode.com/problems/longest-repeating-character-replacement/", difficulty: "Medium", tags: ["string", "sliding-window"] },
        { title: "Minimum Window Substring", link: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "Hard", tags: ["string", "sliding-window"] }
      ]
    },
    {
      title: "Stack",
      problems: [
        { title: "Valid Parentheses", link: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy", tags: ["stack"] },
      ]
    },
    {
      title: "Binary Search",
      problems: [
        { title: "Find Minimum In Rotated Sorted Array", link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", difficulty: "Medium", tags: ["binary-search"] },
        { title: "Search In Rotated Sorted Array", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium", tags: ["binary-search"] },
      ]
    },
    {
      title: "Linked List",
      problems: [
        { title: "Reverse Linked List", link: "https://leetcode.com/problems/reverse-linked-list/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Merge Two Sorted Lists", link: "https://leetcode.com/problems/merge-two-sorted-lists/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Linked List Cycle", link: "https://leetcode.com/problems/linked-list-cycle/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Reorder List", link: "https://leetcode.com/problems/reorder-list/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "Remove Nth Node From End of List", link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "Merge K Sorted Lists", link: "https://leetcode.com/problems/merge-k-sorted-lists/", difficulty: "Hard", tags: ["linked-list"] }
      ]
    },
    {
      title: "Trees",
      problems: [
        { title: "Invert Binary Tree", link: "https://leetcode.com/problems/invert-binary-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Maximum Depth of Binary Tree", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Same Tree", link: "https://leetcode.com/problems/same-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Subtree of Another Tree", link: "https://leetcode.com/problems/subtree-of-another-tree/", difficulty: "Medium", tags: ["tree"] },
        { title: "Lowest Common Ancestor of a BST", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Binary Tree Level Order Traversal", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty: "Medium", tags: ["tree"] },
        { title: "Validate Binary Search Tree", link: "https://leetcode.com/problems/validate-binary-search-tree/", difficulty: "Medium", tags: ["tree"] },
        { title: "Kth Smallest Element in a BST", link: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", difficulty: "Medium", tags: ["tree"] },
        { title: "Construct Binary Tree from Preorder and Inorder Traversal", link: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", difficulty: "Medium", tags: ["tree"] },
        { title: "Binary Tree Maximum Path Sum", link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", difficulty: "Hard", tags: ["tree"] },
        { title: "Serialize and Deserialize Binary Tree", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", difficulty: "Hard", tags: ["tree"] }
      ]
    },
    {
      title: " Heap/Priority Queue",
      problems: [
        { title: "Find Median from Data Stream", link: "https://leetcode.com/problems/find-median-from-data-stream/", difficulty: "Hard", tags: ["heap", "priority-queue"] }
      ]
    },
    {
      title: "Backtracking",
      problems: [
        { title: "Word Search", link: "https://leetcode.com/problems/word-search/", difficulty: "Medium", tags: ["backtracking"] },
        { title: "Combination Sum", link: "https://leetcode.com/problems/combination-sum/", difficulty: "Medium", tags: ["backtracking"] }
      ]
    },
    {
      title: "Trie",
      problems: [
        { title: "Implement Trie (Prefix Tree)", link: "https://leetcode.com/problems/implement-trie-prefix-tree/", difficulty: "Medium", tags: ["trie"] },
        { title: "Design Add and Search Words Data Structure", link: "https://leetcode.com/problems/design-add-and-search-words-data-structure/", difficulty: "Medium", tags: ["trie"] },
        { title: "Word Search II", link: "https://leetcode.com/problems/word-search-ii/", difficulty: "Hard", tags: ["trie", "backtracking"] }
      ]
    },
    {
      title: "Graph",
      problems: [
        { title: "Clone Graph", link: "https://leetcode.com/problems/clone-graph/", difficulty: "Medium", tags: ["graph", "dfs", "bfs"] },
        { title: "Course Schedule", link: "https://leetcode.com/problems/course-schedule/", difficulty: "Medium", tags: ["graph", "topological-sort"] },
        { title: "Pacific Atlantic Water Flow", link: "https://leetcode.com/problems/pacific-atlantic-water-flow/", difficulty: "Medium", tags: ["graph", "dfs"] },
        { title: "Number of Islands", link: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium", tags: ["graph", "dfs", "matrix"] },
        { title: "Alien Dictionary", link: "https://leetcode.com/problems/alien-dictionary/", difficulty: "Hard", tags: ["graph", "topological-sort"] },
        { title: "Graph Valid Tree", link: "https://leetcode.com/problems/graph-valid-tree/", difficulty: "Medium", tags: ["graph", "union-find"] },
        { title: "Number of Connected Components", link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/", difficulty: "Medium", tags: ["graph", "union-find"] }
      ]
    },
    {
      title: "Dynamic Programming",
      problems: [
        { title: "Climbing Stairs", link: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy", tags: ["dp"] },
        { title: "House Robber", link: "https://leetcode.com/problems/house-robber/", difficulty: "Easy", tags: ["dp"] },
        { title: "House Robber II", link: "https://leetcode.com/problems/house-robber-ii/", difficulty: "Medium", tags: ["dp"] },
        { title: "Longest Palindromic Substring", link: "https://leetcode.com/problems/longest-palindromic-substring/", difficulty: "Medium", tags: ["dp"] },
        { title: "Palindromic Substring", link: "https://leetcode.com/problems/palindromic-substring/", difficulty: "Medium", tags: ["dp"] },
        { title: "Decode Ways", link: "https://leetcode.com/problems/decode-ways/", difficulty: "Medium", tags: ["dp"] },
        { title: "Coin Change", link: "https://leetcode.com/problems/coin-change/", difficulty: "Medium", tags: ["dp"] },
        { title: "Maximum Product Subarray", link: "https://leetcode.com/problems/maximum-product-subarray/", difficulty: "Medium", tags: ["dp"] },
        { title: "Word Break", link: "https://leetcode.com/problems/word-break/", difficulty: "Medium", tags: ["dp", "trie"] },
        { title: "Longest Increasing Subsequence", link: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "Medium", tags: ["dp", "binary-search"] },
      ]
    },
    {
      title: "2-D Dynamic Programming",
      problems: [
        { title: "Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "Medium", tags: ["dp"] },
        { title: "Unique Paths", link: "https://leetcode.com/problems/unique-paths/", difficulty: "Medium", tags: ["dp", "combinatorics"] },
      ]
    },
    {
      title: "Greedy",
      problems: [
        { title: "Maximum Subarray", link: "https://leetcode.com/problems/maximum-subarray/", difficulty: "Medium", tags: ["greedy", "dp"] },
        { title: "Jump Game", link: "https://leetcode.com/problems/jump-game/", difficulty: "Medium", tags: ["greedy", "dp"] },
      ]
    },
    {
      title: "Intervals",
      problems: [
        { title: "Insert Interval", link: "https://leetcode.com/problems/insert-interval/", difficulty: "Medium", tags: ["intervals"] },
        { title: "Merge Intervals", link: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium", tags: ["intervals"] },
        { title: "Non-overlapping Intervals", link: "https://leetcode.com/problems/non-overlapping-intervals/", difficulty: "Medium", tags: ["intervals", "greedy"] },
        { title: "Meeting Rooms", link: "https://leetcode.com/problems/meeting-rooms/", difficulty: "Easy", tags: ["intervals"] },
        { title: "Meeting Rooms II", link: "https://leetcode.com/problems/meeting-rooms-ii/", difficulty: "Medium", tags: ["intervals", "heap"] }
      ]
    },
    {
      title: "Math & Geometry",
      problems: [
        { title: "Rotate Image", link: "https://leetcode.com/problems/rotate-image/", difficulty: "Medium", tags: ["matrix", "geometry"] },
        { title: "Spiral Matrix", link: "https://leetcode.com/problems/spiral-matrix/", difficulty: "Medium", tags: ["matrix"] },
        { title: "Set Matrix Zeroes", link: "https://leetcode.com/problems/set-matrix-zeroes/", difficulty: "Medium", tags: ["matrix"] },
      ]
    },
    {
      title: "Bit Manipulation",
      problems: [
        { title: "Number of 1 Bits", link: "https://leetcode.com/problems/number-of-1-bits/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Counting Bits", link: "https://leetcode.com/problems/counting-bits/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Reverse Bits", link: "https://leetcode.com/problems/reverse-bits/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Missing Number", link: "https://leetcode.com/problems/missing-number/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Sum of Two Integers", link: "https://leetcode.com/problems/sum-of-two-integers/", difficulty: "Easy", tags: ["bit-manipulation"] },
      ]
    }
  ]
};

const seedBlind75 = async () => {
  await connectDB();
  await DSASheet.findOneAndUpdate(
    { slug: blind75Data.slug },
    blind75Data,
    { upsert: true, new: true }
  );
  console.log('Blind 75 Sheet Seeded');
};

module.exports = seedBlind75;