const DSASheet = require('../../models/sheets.model');
const connectDB = require('../seedConfig');

const neetcode150Data = {
  name: "NeetCode 150 DSA Sheet",
  slug: "neetcode-150",
  description: "Complete list of 150 essential LeetCode problems curated by NeetCode.",
  topics: [
    {
      title: "Arrays & Hashing",
      problems: [
        { title: "Contains Duplicate", link: "https://leetcode.com/problems/contains-duplicate/", difficulty: "Easy", tags: ["array", "hashset"] },
        { title: "Valid Anagram", link: "https://leetcode.com/problems/valid-anagram/", difficulty: "Easy", tags: ["string", "hashmap"] },
        { title: "Two Sum", link: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", tags: ["array", "hashmap"] },
        { title: "Group Anagrams", link: "https://leetcode.com/problems/group-anagrams/", difficulty: "Medium", tags: ["array", "hashmap", "sorting"] },
        { title: "Top K Frequent Elements", link: "https://leetcode.com/problems/top-k-frequent-elements/", difficulty: "Medium", tags: ["heap", "hashmap"] },
        { title: "Product of Array Except Self", link: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium", tags: ["array"] },
        { title: "Valid Sudoku", link: "https://leetcode.com/problems/valid-sudoku/", difficulty: "Medium", tags: ["array", "hashset"] },
        { title: "Encode and Decode Strings", link: "https://leetcode.com/problems/encode-and-decode-strings/", difficulty: "Medium", tags: ["string"] },
        { title: "Longest Consecutive Sequence", link: "https://leetcode.com/problems/longest-consecutive-sequence/", difficulty: "Medium", tags: ["array", "hashset"] }
      ]
    },
    {
      title: "Two Pointers",
      problems: [
        { title: "Valid Palindrome", link: "https://leetcode.com/problems/valid-palindrome/", difficulty: "Easy", tags: ["string", "two-pointers"] },
        { title: "Two Sum II - Input Array Is Sorted", link: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", difficulty: "Medium", tags: ["array", "two-pointers"] },
        { title: "3Sum", link: "https://leetcode.com/problems/3sum/", difficulty: "Medium", tags: ["array", "two-pointers"] },
        { title: "Container With Most Water", link: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium", tags: ["array", "two-pointers"] },
        { title: "Trapping Rain Water", link: "https://leetcode.com/problems/trapping-rain-water/", difficulty: "Hard", tags: ["array", "two-pointers"] }
      ]
    },
    {
      title: "Sliding Window",
      problems: [
        { title: "Best Time to Buy and Sell Stock", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "Easy", tags: ["array"] },
        { title: "Longest Substring Without Repeating Characters", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "Medium", tags: ["string", "sliding-window"] },
        { title: "Longest Repeating Character Replacement", link: "https://leetcode.com/problems/longest-repeating-character-replacement/", difficulty: "Medium", tags: ["string", "sliding-window"] },
        { title: "Permutation in String", link: "https://leetcode.com/problems/permutation-in-string/", difficulty: "Medium", tags: ["string", "sliding-window"] },
        { title: "Minimum Window Substring", link: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "Hard", tags: ["string", "sliding-window"] },
        { title: "Sliding Window Maximum", link: "https://leetcode.com/problems/sliding-window-maximum/", difficulty: "Hard", tags: ["deque"] }
      ]
    },
    {
      title: "Stack",
      problems: [
        { title: "Valid Parentheses", link: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy", tags: ["stack"] },
        { title: "Min Stack", link: "https://leetcode.com/problems/min-stack/", difficulty: "Medium", tags: ["stack", "design"] },
        { title: "Evaluate Reverse Polish Notation", link: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", difficulty: "Medium", tags: ["stack"] },
        { title: "Daily Temperatures", link: "https://leetcode.com/problems/daily-temperatures/", difficulty: "Medium", tags: ["stack"] },
        { title: "Car Fleet", link: "https://leetcode.com/problems/car-fleet/", difficulty: "Medium", tags: ["stack"] },
        { title: "Largest Rectangle in Histogram", link: "https://leetcode.com/problems/largest-rectangle-in-histogram/", difficulty: "Hard", tags: ["stack"] }
      ]
    },
    {
      title: "Binary Search",
      problems: [
        { title: "Binary Search", link: "https://leetcode.com/problems/binary-search/", difficulty: "Easy", tags: ["binary-search"] },
        { title: "Search a 2D Matrix", link: "https://leetcode.com/problems/search-a-2d-matrix/", difficulty: "Medium", tags: ["binary-search"] },
        { title: "Koko Eating Bananas", link: "https://leetcode.com/problems/koko-eating-bananas/", difficulty: "Medium", tags: ["binary-search"] },
        { title: "Find Minimum in Rotated Sorted Array", link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", difficulty: "Medium", tags: ["binary-search"] },
        { title: "Search in Rotated Sorted Array", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium", tags: ["binary-search"] },
        { title: "Time Based Key-Value Store", link: "https://leetcode.com/problems/time-based-key-value-store/", difficulty: "Medium", tags: ["design", "binary-search"] },
        { title: "Median of Two Sorted Arrays", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", difficulty: "Hard", tags: ["binary-search"] }
      ]
    },
    {
      title: "Linked List",
      problems: [
        { title: "Reverse Linked List", link: "https://leetcode.com/problems/reverse-linked-list/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Merge Two Sorted Lists", link: "https://leetcode.com/problems/merge-two-sorted-lists/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Linked List Cycle", link: "https://leetcode.com/problems/linked-list-cycle/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Remove Nth Node From End of List", link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "Reorder List", link: "https://leetcode.com/problems/reorder-list/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "Copy List with Random Pointer", link: "https://leetcode.com/problems/copy-list-with-random-pointer/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "Add Two Numbers", link: "https://leetcode.com/problems/add-two-numbers/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "Find The Duplicate Number", link: "https://leetcode.com/problems/find-the-duplicate-number/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "LRU Cache", link: "https://leetcode.com/problems/lru-cache/", difficulty: "Medium", tags: ["design", "linked-list"] },
        { title: "Merge K Sorted Lists", link: "https://leetcode.com/problems/merge-k-sorted-lists/", difficulty: "Hard", tags: ["linked-list", "heap"] },
        { title: " Reverse Nodes in K Group", link: "https://leetcode.com/problems/reverse-nodes-in-k-group/", difficulty: "Hard", tags: ["linked-list"] }
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
        { title: "Construct Binary Tree from Preorder and Inorder", link: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", difficulty: "Medium", tags: ["tree"] },
        { title: "Binary Tree Maximum Path Sum", link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", difficulty: "Hard", tags: ["tree"] },
        { title: "Serialize and Deserialize Binary Tree", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", difficulty: "Hard", tags: ["tree"] }
      ]
    },
    {
      title: "Heap / Priority Queue",
      problems: [
        { title: "Kth Largest Element in a Stream", link: "https://leetcode.com/problems/kth-largest-element-in-a-stream/", difficulty: "Medium", tags: ["heap"] },
        { title: "Last Stone Weight", link: "https://leetcode.com/problems/last-stone-weight/", difficulty: "Easy", tags: ["heap"] },
        { title: "K Closest Points to Origin", link: "https://leetcode.com/problems/k-closest-points-to-origin/", difficulty: "Medium", tags: ["heap"] },
        { title: "Kth Largest Element in An Array", link: "https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty: "Medium", tags: ["heap"] },
        { title: " Task Scheduler", link: "https://leetcode.com/problems/task-scheduler/", difficulty: "Medium", tags: ["heap"] },
        { title: "Design Twitter", link: "https://leetcode.com/problems/design-twitter/", difficulty: "Medium", tags: ["heap", "design"] },
        { title: "Find Median from Data Stream", link: "https://leetcode.com/problems/find-median-from-data-stream/", difficulty: "Hard", tags: ["heap", "design"] }
      ]
    },
    {
      title: "Backtracking",
      problems: [
        { title: "Generate Parentheses", link: "https://leetcode.com/problems/generate-parentheses/", difficulty: "Medium", tags: ["backtracking"] },
        { title: "Subsets", link: "https://leetcode.com/problems/subsets/", difficulty: "Medium", tags: ["backtracking"] },
        { title: "Permutations", link: "https://leetcode.com/problems/permutations/", difficulty: "Medium", tags: ["backtracking"] },
        { title: "Combination Sum", link: "https://leetcode.com/problems/combination-sum/", difficulty: "Medium", tags: ["backtracking"] },
        { title: "Word Search", link: "https://leetcode.com/problems/word-search/", difficulty: "Medium", tags: ["backtracking"] },
        { title: "Palindrome Partitioning", link: "https://leetcode.com/problems/palindrome-partitioning/", difficulty: "Medium", tags: ["backtracking"] },
        { title: "Combination Sum II", link: "https://leetcode.com/problems/combination-sum-ii/", difficulty: "Medium", tags: ["backtracking"] },
        { title: "Word Search II", link: "https://leetcode.com/problems/word-search-ii/", difficulty: "Hard", tags: ["backtracking"] },
        { title: "Letter Combinations of a Phone Number", link: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/", difficulty: "Medium", tags: ["backtracking"] },
        { title: "N Queens", link: "https://leetcode.com/problems/n-queens/", difficulty: "Hard", tags: ["backtracking"] }
      ]
    },
    {
      title: "Trie",
      problems: [
        { title: "Implement Trie", link: "https://leetcode.com/problems/implement-trie-prefix-tree/", difficulty: "Medium", tags: ["trie"] },
        { title: "Design Add and Search Words Data Structure", link: "https://leetcode.com/problems/add-and-search-word-data-structure-design/", difficulty: "Medium", tags: ["trie"] },
        { title: "Word Search II", link: "https://leetcode.com/problems/word-search-ii/", difficulty: "Hard", tags: ["trie", "backtracking"] }
      ]
    },
    {
      title: "Graph",
      problems: [
        { title: "Number of Islands", link: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium", tags: ["graph"] },
        { title: "Max Area of Island", link: "https://leetcode.com/problems/max-area-of-island/", difficulty: "Medium", tags: ["graph"] },
        { title: "Clone Graph", link: "https://leetcode.com/problems/clone-graph/", difficulty: "Medium", tags: ["graph"] },
        { title: "Walls And Gates", link: "https://leetcode.com/problems/walls-and-gates/", difficulty: "Medium", tags: ["graph"] },
        { title: "Rotting Oranges", link: "https://leetcode.com/problems/rotting-oranges/", difficulty: "Medium", tags: ["graph"] },
        { title: "Pacific Atlantic Water FLow", link: "https://leetcode.com/problems/pacific-atlantic-water-flow/", difficulty: "Medium", tags: ["graph"] },
        { title: "Surrounded Regions", link: "https://leetcode.com/problems/surrounded-regions/", difficulty: "Medium", tags: ["graph"] },
        { title: "Course Schedule", link: "https://leetcode.com/problems/course-schedule/", difficulty: "Medium", tags: ["graph"] },
        { title: "Course Schedule II", link: "https://leetcode.com/problems/course-schedule-ii/", difficulty: "Medium", tags: ["graph"] },
        { title: "Graph Valid Tree", link: "https://leetcode.com/problems/graph-valid-tree/", difficulty: "Medium", tags: ["graph"] },
        { title: "Number of Connected Components in An Undirected Graph", link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/", difficulty: "Medium", tags: ["graph"] },
        { title: "Redundant Connection", link: "https://leetcode.com/problems/redundant-connection/", difficulty: "Medium", tags: ["graph"] },
        { title: "Word Ladder", link: "https://leetcode.com/problems/word-ladder/", difficulty: "Medium", tags: ["graph"] }
      ]
    },
    {
      title: "Advanced Graphs",
      problems: [
        { title: "Network Delay Time", link: "https://leetcode.com/problems/network-delay-time/", difficulty: "Medium", tags: ["graph"] },
        { title: "Recontruct Itinerary", link: "https://leetcode.com/problems/reconstruct-itinerary/", difficulty: "Hard", tags: ["graph"] },
        { title: "Min Cost to Connect All Points", link: "https://leetcode.com/problems/min-cost-to-connect-all-points/", difficulty: "Medium", tags: ["graph"] },
        { title: "Swim in Rising Water", link: "https://leetcode.com/problems/swim-in-rising-water/", difficulty: "Hard", tags: ["graph"] },
        { title: "Allen Dictionary", link: "https://leetcode.com/problems/alien-dictionary/", difficulty: "Hard", tags: ["graph"] },
        { title: "Cheapest Flights Within K Stops", link: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", difficulty: "Medium", tags: ["graph"] }
      ]
    },
    {
      title: "1D Dynamic Programming",
      problems: [
        { title: "Climbing Stairs", link: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy", tags: ["dp"] },
        { title: "Min Cost Climbing Stairs", link: "https://leetcode.com/problems/min-cost-climbing-stairs/", difficulty: "Easy", tags: ["dp"] },
        { title: "House Robber", link: "https://leetcode.com/problems/house-robber/", difficulty: "Easy", tags: ["dp"] },
        { title: "House Robber II", link: "https://leetcode.com/problems/house-robber-ii/", difficulty: "Medium", tags: ["dp"] },
        { title: "Longest Palindromic Substring", link: "https://leetcode.com/problems/longest-palindromic-substring/", difficulty: "Medium", tags: ["dp"] },
        { title: "Palindromic Substrings", link: "https://leetcode.com/problems/palindromic-substrings/", difficulty: "Medium", tags: ["dp"] },
        { title: "Decode Ways", link: "https://leetcode.com/problems/decode-ways/", difficulty: "Medium", tags: ["dp"] },
        { title: "Coin Change", link: "https://leetcode.com/problems/coin-change/", difficulty: "Medium", tags: ["dp"] },
        { title: "Maximum Product Subarray", link: "https://leetcode.com/problems/maximum-product-subarray/", difficulty: "Medium", tags: ["dp"] },
        { title: "Word Break", link: "https://leetcode.com/problems/word-break/", difficulty: "Medium", tags: ["dp"] },
        { title: "Longest Increasing Subsequence", link: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "Medium", tags: ["dp"] },
        { title: "Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "Medium", tags: ["dp"] },
        { title: "Partition Equal Subset Sum", link: "https://leetcode.com/problems/partition-equal-subset-sum/", difficulty: "Medium", tags: ["dp"] }
      ]
    },
    {
      title: "2D Dynamic Programming",
      problems: [
        { title: "Unique Paths", link: "https://leetcode.com/problems/unique-paths/", difficulty: "Medium", tags: ["dp"] },
        { title: "Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "Medium", tags: ["dp"] },
        { title: "Best Time to Buy And Sell Stock with Cooldown", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/", difficulty: "Medium", tags: ["dp"] },
        { title: "Coin Change II", link: "https://leetcode.com/problems/coin-change-ii/", difficulty: "Medium", tags: ["dp"] },
        { title: "Target Sum", link: "https://leetcode.com/problems/target-sum/", difficulty: "Medium", tags: ["dp"] },
        { title: "Interleaving String", link: "https://leetcode.com/problems/interleaving-string/", difficulty: "Medium", tags: ["dp"] },
        { title: "Longest Increasing Path In a Matrix", link: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/", difficulty: "Hard", tags: ["dp"] },
        { title: "Distinct Subsequences", link: "https://leetcode.com/problems/distinct-subsequences/", difficulty: "Hard", tags: ["dp"] },
        { title: "Edit Distance", link: "https://leetcode.com/problems/edit-distance/", difficulty: "Hard", tags: ["dp"] },
        { title: "Burst Ballonos", link: "https://leetcode.com/problems/burst-balloons/", difficulty: "Hard", tags: ["dp"] },
        { title: "Regular Expression Matching", link: "https://leetcode.com/problems/regular-expression-matching/", difficulty: "Hard", tags: ["dp"] },
      ]
    },
    {
      title: "Greedy",
      problems: [
        { title: "Maximum Subarray", link: "https://leetcode.com/problems/maximum-subarray/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Jump Game", link: "https://leetcode.com/problems/jump-game/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Jump Game 2", link: "https://leetcode.com/problems/jump-game-ii/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Gas Station", link: "https://leetcode.com/problems/gas-station/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Hand of Straights", link: "https://leetcode.com/problems/hand-of-straights/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Merge Triplets to Form Target Triplet", link: "https://leetcode.com/problems/merge-triplets-to-form-target-triplet/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Partition Labels", link: "https://leetcode.com/problems/partition-labels/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Valid Parenthesis String", link: "https://leetcode.com/problems/valid-parenthesis-string/", difficulty: "Medium", tags: ["greedy"] }
      ]
    },
    {
      title: "Intervals",
      problems: [
        { title: "Insert Interval", link: "https://leetcode.com/problems/insert-interval/", difficulty: "Medium", tags: ["intervals"] },
        { title: "Merge Intervals", link: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium", tags: ["intervals"] },
        { title: "Non-overlapping Intervals", link: "https://leetcode.com/problems/non-overlapping-intervals/", difficulty: "Medium", tags: ["intervals"] },
        { title: "Meeting Rooms", link: "https://leetcode.com/problems/meeting-rooms/", difficulty: "Easy", tags: ["intervals"] },
        { title: "Meeting Rooms II", link: "https://leetcode.com/problems/meeting-rooms-ii/", difficulty: "Medium", tags: ["intervals"] },
        { title: "Minimum Interval to Include Each Query", link: "https://leetcode.com/problems/minimum-interval-to-include-each-query/", difficulty: "Hard", tags: ["intervals"] }
      ]
    },
    {
      title: "Math & Geometry",
      problems: [
        { title: "Rotate Image", link: "https://leetcode.com/problems/rotate-image/", difficulty: "Medium", tags: ["math", "geometry"] },
        { title: "Spiral Matrix", link: "https://leetcode.com/problems/spiral-matrix/", difficulty: "Medium", tags: ["math", "geometry"] },
        { title: "Set Matrix Zeroes", link: "https://leetcode.com/problems/set-matrix-zeroes/", difficulty: "Medium", tags: ["math", "geometry"] },
        { title: "Happy Number", link: "https://leetcode.com/problems/happy-number/", difficulty: "Easy", tags: ["math"] },
        { title: "Plus One", link: "https://leetcode.com/problems/plus-one/", difficulty: "Easy", tags: ["math"] },
        { title: "Pow(x, n)", link: "https://leetcode.com/problems/powx-n/", difficulty: "Medium", tags: ["math"] },
        { title: "Multiple Strings", link: "https://leetcode.com/problems/multiply-strings/", difficulty: "Medium", tags: ["math"] },
        { title: "Detect Squares", link: "https://leetcode.com/problems/detect-squares/", difficulty: "Medium", tags: ["math"] },
      ]
    },
    {
      title: "Bit Manipulation",
      problems: [
        { title: "Single Number", link: "https://leetcode.com/problems/single-number/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Number of 1 Bits", link: "https://leetcode.com/problems/number-of-1-bits/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Counting Bits", link: "https://leetcode.com/problems/counting-bits/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Missing Number", link: "https://leetcode.com/problems/missing-number/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Reverse Bits", link: "https://leetcode.com/problems/reverse-bits/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Sum of Two Integers", link: "https://leetcode.com/problems/sum-of-two-integers/", difficulty: "Medium", tags: ["bit-manipulation"] },
        { title: "Reverse Integers", link: "https://leetcode.com/problems/reverse-integer/", difficulty: "Medium", tags: ["bit-manipulation"] }
      ]
    }
  ]
};

const seedNeetCode150 = async () => {
  await connectDB();
  await DSASheet.findOneAndUpdate(
    { slug: neetcode150Data.slug },
    neetcode150Data,
    { upsert: true, new: true }
  );
  console.log('NeetCode 150 Sheet Seeded');
};




module.exports = seedNeetCode150;