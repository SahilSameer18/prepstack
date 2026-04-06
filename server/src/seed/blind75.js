const DSASheet = require('../models/sheets.model');
const connectDB = require('./seedConfig');

const blind75Data = {
  name: "Blind 75 DSA Sheet",
  slug: "blind-75",
  description: "A curated list of 75 essential LeetCode problems to ace coding interviews.",
  topics: [
    {
      title: "Arrays",
      problems: [
        { title: "Two Sum", link: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", tags: ["array", "hashmap"] },
        { title: "Best Time to Buy and Sell Stock", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "Easy", tags: ["array", "greedy"] },
        { title: "Contains Duplicate", link: "https://leetcode.com/problems/contains-duplicate/", difficulty: "Easy", tags: ["array", "hashset"] },
        { title: "Product of Array Except Self", link: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium", tags: ["array", "prefix", "math"] },
        { title: "Maximum Subarray", link: "https://leetcode.com/problems/maximum-subarray/", difficulty: "Medium", tags: ["array", "kadane", "dp"] },
        { title: "Maximum Product Subarray", link: "https://leetcode.com/problems/maximum-product-subarray/", difficulty: "Medium", tags: ["array", "dp"] },
        { title: "Find Minimum in Rotated Sorted Array", link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", difficulty: "Medium", tags: ["array", "binary-search"] },
        { title: "Search in Rotated Sorted Array", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium", tags: ["array", "binary-search"] },
        { title: "3Sum", link: "https://leetcode.com/problems/3sum/", difficulty: "Medium", tags: ["array", "two-pointers", "sorting"] },
        { title: "Container With Most Water", link: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium", tags: ["array", "two-pointers"] }
      ]
    },
    {
      title: "Binary",
      problems: [
        { title: "Sum of Two Integers", link: "https://leetcode.com/problems/sum-of-two-integers/", difficulty: "Medium", tags: ["bit-manipulation"] },
        { title: "Number of 1 Bits", link: "https://leetcode.com/problems/number-of-1-bits/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Counting Bits", link: "https://leetcode.com/problems/counting-bits/", difficulty: "Easy", tags: ["bit-manipulation", "dp"] },
        { title: "Missing Number", link: "https://leetcode.com/problems/missing-number/", difficulty: "Easy", tags: ["array", "bit-manipulation"] },
        { title: "Reverse Bits", link: "https://leetcode.com/problems/reverse-bits/", difficulty: "Easy", tags: ["bit-manipulation"] }
      ]
    },
    {
      title: "Dynamic Programming",
      problems: [
        { title: "Climbing Stairs", link: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy", tags: ["dp"] },
        { title: "Coin Change", link: "https://leetcode.com/problems/coin-change/", difficulty: "Medium", tags: ["dp"] },
        { title: "Longest Increasing Subsequence", link: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "Medium", tags: ["dp", "binary-search"] },
        { title: "Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "Medium", tags: ["dp"] },
        { title: "Word Break", link: "https://leetcode.com/problems/word-break/", difficulty: "Medium", tags: ["dp", "trie"] },
        { title: "Combination Sum IV", link: "https://leetcode.com/problems/combination-sum-iv/", difficulty: "Medium", tags: ["dp"] },
        { title: "House Robber", link: "https://leetcode.com/problems/house-robber/", difficulty: "Easy", tags: ["dp"] },
        { title: "House Robber II", link: "https://leetcode.com/problems/house-robber-ii/", difficulty: "Medium", tags: ["dp"] },
        { title: "Decode Ways", link: "https://leetcode.com/problems/decode-ways/", difficulty: "Medium", tags: ["dp"] },
        { title: "Unique Paths", link: "https://leetcode.com/problems/unique-paths/", difficulty: "Medium", tags: ["dp", "combinatorics"] },
        { title: "Jump Game", link: "https://leetcode.com/problems/jump-game/", difficulty: "Medium", tags: ["greedy", "dp"] }
      ]
    },
    {
      title: "Graph",
      problems: [
        { title: "Clone Graph", link: "https://leetcode.com/problems/clone-graph/", difficulty: "Medium", tags: ["graph", "dfs", "bfs"] },
        { title: "Course Schedule", link: "https://leetcode.com/problems/course-schedule/", difficulty: "Medium", tags: ["graph", "topological-sort"] },
        { title: "Pacific Atlantic Water Flow", link: "https://leetcode.com/problems/pacific-atlantic-water-flow/", difficulty: "Medium", tags: ["graph", "dfs"] },
        { title: "Number of Islands", link: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium", tags: ["graph", "dfs", "matrix"] },
        { title: "Longest Consecutive Sequence", link: "https://leetcode.com/problems/longest-consecutive-sequence/", difficulty: "Medium", tags: ["array", "hashset"] },
        { title: "Alien Dictionary", link: "https://leetcode.com/problems/alien-dictionary/", difficulty: "Hard", tags: ["graph", "topological-sort"] },
        { title: "Graph Valid Tree", link: "https://leetcode.com/problems/graph-valid-tree/", difficulty: "Medium", tags: ["graph", "union-find"] },
        { title: "Number of Connected Components", link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/", difficulty: "Medium", tags: ["graph", "union-find"] }
      ]
    },
    {
      title: "Intervals",
      problems: [
        { title: "Insert Interval", link: "https://leetcode.com/problems/insert-interval/", difficulty: "Medium", tags: ["intervals"] },
        { title: "Merge Intervals", link: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium", tags: ["intervals"] },
        { title: "Non-overlapping Intervals", link: "https://leetcode.com/problems/non-overlapping-intervals/", difficulty: "Medium", tags: ["intervals", "greedy"] },
        { title: "Meeting Rooms", link: "https://leetcode.com/problems/meeting-rooms/", difficulty: "Easy", tags: ["intervals"] }
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
        { title: "Copy List with Random Pointer", link: "https://leetcode.com/problems/copy-list-with-random-pointer/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "Add Two Numbers", link: "https://leetcode.com/problems/add-two-numbers/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "Find the Duplicate Number", link: "https://leetcode.com/problems/find-the-duplicate-number/", difficulty: "Medium", tags: ["linked-list"] }
      ]
    },
    {
      title: "Stack",
      problems: [
        { title: "Valid Parentheses", link: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy", tags: ["stack"] },
        { title: "Min Stack", link: "https://leetcode.com/problems/min-stack/", difficulty: "Medium", tags: ["stack", "design"] },
        { title: "Evaluate Reverse Polish Notation", link: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", difficulty: "Medium", tags: ["stack"] },
        { title: "Generate Parentheses", link: "https://leetcode.com/problems/generate-parentheses/", difficulty: "Medium", tags: ["backtracking", "stack"] },
        { title: "Daily Temperatures", link: "https://leetcode.com/problems/daily-temperatures/", difficulty: "Medium", tags: ["stack"] },
        { title: "Car Fleet", link: "https://leetcode.com/problems/car-fleet/", difficulty: "Medium", tags: ["stack", "sorting"] },
        { title: "Largest Rectangle in Histogram", link: "https://leetcode.com/problems/largest-rectangle-in-histogram/", difficulty: "Hard", tags: ["stack", "monotonic-stack"] },
        { title: "Online Stock Span", link: "https://leetcode.com/problems/online-stock-span/", difficulty: "Medium", tags: ["stack", "design"] }
      ]
    },
    {
      title: "Trees",
      problems: [
        { title: "Invert Binary Tree", link: "https://leetcode.com/problems/invert-binary-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Maximum Depth of Binary Tree", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Diameter of Binary Tree", link: "https://leetcode.com/problems/diameter-of-binary-tree/", difficulty: "Medium", tags: ["tree"] },
        { title: "Balanced Binary Tree", link: "https://leetcode.com/problems/balanced-binary-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Same Tree", link: "https://leetcode.com/problems/same-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Subtree of Another Tree", link: "https://leetcode.com/problems/subtree-of-another-tree/", difficulty: "Medium", tags: ["tree"] },
        { title: "Lowest Common Ancestor of a BST", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Binary Tree Level Order Traversal", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty: "Medium", tags: ["tree"] },
        { title: "Binary Tree Right Side View", link: "https://leetcode.com/problems/binary-tree-right-side-view/", difficulty: "Medium", tags: ["tree"] },
        { title: "Count Good Nodes in Binary Tree", link: "https://leetcode.com/problems/count-good-nodes-in-binary-tree/", difficulty: "Medium", tags: ["tree"] },
        { title: "Validate Binary Search Tree", link: "https://leetcode.com/problems/validate-binary-search-tree/", difficulty: "Medium", tags: ["tree"] },
        { title: "Kth Smallest Element in a BST", link: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", difficulty: "Medium", tags: ["tree"] },
        { title: "Construct Binary Tree from Preorder and Inorder Traversal", link: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", difficulty: "Medium", tags: ["tree"] },
        { title: "Binary Tree Maximum Path Sum", link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", difficulty: "Hard", tags: ["tree"] },
        { title: "Serialize and Deserialize Binary Tree", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", difficulty: "Hard", tags: ["tree"] }
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