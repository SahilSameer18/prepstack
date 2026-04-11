const DSASheet = require('../../models/sheets.model');
const connectDB = require('../seedConfig');

const striverSDEData = {
  name: "Striver SDE Sheet",
  slug: "striver-sde",
  description: "The famous SDE sheet by Striver for interview preparation.",
  topics: [
    {
      title: "Arrays - I",
      problems: [
        { title: "Set Matrix Zeros", link: "https://takeuforward.org/data-structure/set-matrix-zero/", difficulty: "Medium", tags: ["array", "matrix"] },
        { title: "Pascal's Triangle", link: "https://takeuforward.org/data-structure/program-to-generate-pascals-triangle/", difficulty: "Easy", tags: ["array", "math"] },
        { title: "Next Permutation", link: "https://takeuforward.org/data-structure/next_permutation-find-next-lexicographically-greater-permutation/", difficulty: "Medium", tags: ["array"] },
        { title: "Kadane's Algorithm / Maximum Subarray Sum", link: "https://takeuforward.org/data-structure/kadanes-algorithm-maximum-subarray-sum-in-an-array/", difficulty: "Medium", tags: ["array", "greedy"] },
        { title: "Sort an array of 0s, 1s and 2s", link: "https://takeuforward.org/data-structure/sort-an-array-of-0s-1s-and-2s/", difficulty: "Medium", tags: ["array", "sorting"] },
        { title: "Stock Buy and Sell", link: "https://takeuforward.org/data-structure/stock-buy-and-sell/", difficulty: "Easy", tags: ["array", "greedy"] }
      ]
    },
    {
      title: "Arrays - II",
      problems: [
        { title: "Rotate Matrix", link: "https://takeuforward.org/data-structure/rotate-image-by-90-degree/", difficulty: "Medium", tags: ["array", "matrix"] },
        { title: "Merge Overlapping Subintervals", link: "https://takeuforward.org/data-structure/merge-overlapping-sub-intervals/", difficulty: "Medium", tags: ["array", "intervals"] },
        { title: "Merge Two Sorted Arrays Without Extra Space", link: "https://takeuforward.org/data-structure/merge-two-sorted-arrays-without-extra-space/", difficulty: "Hard", tags: ["array", "two-pointers"] },
        { title: "Find the Duplicate in an Array of N+1 Integers", link: "https://takeuforward.org/data-structure/find-the-duplicate-in-an-array-of-n1-integers/", difficulty: "Medium", tags: ["array", "cycle-detection"] },
        { title: "Repeat and Missing Number", link: "https://takeuforward.org/data-structure/find-the-repeating-and-missing-numbers/", difficulty: "Medium", tags: ["array", "math"] },
        { title: "Inversion of Array (Count Inversions)", link: "https://takeuforward.org/data-structure/count-inversions-in-an-array/", difficulty: "Hard", tags: ["array", "merge-sort"] }
      ]
    },
    {
      title: "Arrays - III",
      problems: [
        { title: "Search in a 2D Matrix", link: "https://takeuforward.org/data-structure/search-in-a-sorted-2d-matrix/", difficulty: "Medium", tags: ["array", "binary-search"] },
        { title: "Pow(x, n)", link: "https://takeuforward.org/data-structure/implement-powxn-x-raised-to-the-power-n/", difficulty: "Medium", tags: ["math", "recursion"] },
        { title: "Majority Element (>N/2 times)", link: "https://takeuforward.org/data-structure/find-the-majority-element-that-occurs-more-than-n-2-times/", difficulty: "Easy", tags: ["array", "moore-voting"] },
        { title: "Majority Element (>N/3 times)", link: "https://takeuforward.org/data-structure/find-the-majority-elements-occurring-more-than-n-3-times/", difficulty: "Medium", tags: ["array", "moore-voting"] },
        { title: "Grid Unique Paths", link: "https://takeuforward.org/data-structure/grid-unique-paths-count-paths-from-left-top-to-the-right-bottom-of-a-matrix/", difficulty: "Medium", tags: ["dp", "matrix"] },
        { title: "Reverse Pairs", link: "https://takeuforward.org/data-structure/count-reverse-pairs/", difficulty: "Hard", tags: ["array", "merge-sort"] }
      ]
    },
    {
      title: "Arrays - IV",
      problems: [
        { title: "2-Sum Problem", link: "https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/", difficulty: "Easy", tags: ["array", "hashmap"] },
        { title: "4-Sum Problem", link: "https://takeuforward.org/data-structure/4-sum-find-quads-that-add-up-to-a-target-value/", difficulty: "Medium", tags: ["array", "two-pointers"] },
        { title: "Longest Consecutive Sequence", link: "https://takeuforward.org/data-structure/longest-consecutive-sequence-in-an-array/", difficulty: "Medium", tags: ["array", "hashset"] },
        { title: "Largest Subarray with 0 Sum", link: "https://takeuforward.org/data-structure/largest-subarray-with-0-sum/", difficulty: "Medium", tags: ["array", "hashmap"] },
        { title: "Count number of subarrays with given XOR K", link: "https://takeuforward.org/data-structure/count-the-number-of-subarrays-with-given-xor-k/", difficulty: "Medium", tags: ["array", "hashmap"] },
        { title: "Longest Substring Without Repeat", link: "https://takeuforward.org/data-structure/length-of-longest-substring-without-any-repeating-character/", difficulty: "Medium", tags: ["string", "sliding-window"] }
      ]
    },
    {
      title: "Linked List - I",
      problems: [
        { title: "Reverse a Linked List", link: "https://takeuforward.org/data-structure/reverse-a-linked-list/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Find the Middle of Linked List", link: "https://takeuforward.org/data-structure/find-the-middle-of-a-linked-list/", difficulty: "Easy", tags: ["linked-list", "two-pointers"] },
        { title: "Merge Two Sorted Linked Lists", link: "https://takeuforward.org/data-structure/merge-two-sorted-linked-lists/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Remove N-th Node From Back of Linked List", link: "https://takeuforward.org/data-structure/remove-nth-node-from-the-back-of-the-linked-list/", difficulty: "Medium", tags: ["linked-list", "two-pointers"] },
        { title: "Delete a Given Node in Linked List", link: "https://takeuforward.org/data-structure/delete-given-node-in-a-linked-list-o1-approach/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Add Two Numbers as Linked Lists", link: "https://takeuforward.org/data-structure/add-two-numbers-represented-as-linked-lists/", difficulty: "Medium", tags: ["linked-list", "math"] }
      ]
    },
    {
      title: "Linked List - II",
      problems: [
        { title: "Find Intersection Point of Y LinkedList", link: "https://takeuforward.org/data-structure/find-intersection-of-two-linked-lists/", difficulty: "Easy", tags: ["linked-list", "two-pointers"] },
        { title: "Detect a Cycle in Linked List", link: "https://takeuforward.org/data-structure/detect-a-cycle-in-a-linked-list/", difficulty: "Easy", tags: ["linked-list", "cycle-detection"] },
        { title: "Reverse a Linked List in groups of Size K", link: "https://takeuforward.org/data-structure/reverse-linked-list-in-groups-of-size-k/", difficulty: "Hard", tags: ["linked-list"] },
        { title: "Check if Linked List is Palindrome", link: "https://takeuforward.org/data-structure/check-if-given-linked-list-is-plaindrome/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Find the Starting Point of Loop in Linked List", link: "https://takeuforward.org/data-structure/starting-point-of-loop-in-a-linked-list/", difficulty: "Medium", tags: ["linked-list", "cycle-detection"] },
        { title: "Flattening a Linked List", link: "https://takeuforward.org/data-structure/flattening-a-linked-list/", difficulty: "Hard", tags: ["linked-list"] }
      ]
    },
    {
      title: "Linked List and Arrays",
      problems: [
        { title: "Rotate a Linked List", link: "https://takeuforward.org/data-structure/rotate-a-linked-list/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "Clone a Linked List with Random and Next Pointer", link: "https://takeuforward.org/data-structure/clone-linked-list-with-random-and-next-pointer/", difficulty: "Medium", tags: ["linked-list", "hashmap"] },
        { title: "3 Sum", link: "https://takeuforward.org/data-structure/3-sum-find-triplets-that-add-up-to-a-zero/", difficulty: "Medium", tags: ["array", "two-pointers", "sorting"] },
        { title: "Trapping Rainwater", link: "https://takeuforward.org/data-structure/trapping-rainwater/", difficulty: "Hard", tags: ["array", "two-pointers"] },
        { title: "Remove Duplicate from Sorted Array", link: "https://takeuforward.org/data-structure/remove-duplicates-in-place-from-sorted-array/", difficulty: "Easy", tags: ["array", "two-pointers"] },
        { title: "Max Consecutive Ones", link: "https://takeuforward.org/data-structure/count-maximum-consecutive-ones-in-the-array/", difficulty: "Easy", tags: ["array"] }
      ]
    },
    {
      title: "Greedy",
      problems: [
        { title: "N meetings in one room", link: "https://takeuforward.org/data-structure/n-meetings-in-one-room/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Minimum number of platforms required for a railway", link: "https://takeuforward.org/data-structure/minimum-number-of-platforms-required-for-a-railway/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Job Sequencing Problem", link: "https://takeuforward.org/data-structure/job-sequencing-problem/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Fractional Knapsack Problem", link: "https://takeuforward.org/data-structure/fractional-knapsack-problem-greedy-approach/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Greedy algorithm to find minimum number of coins", link: "https://takeuforward.org/data-structure/greedy-algorithm-to-find-minimum-number-of-coins/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Activity Selection", link: "https://takeuforward.org/data-structure/activity-selection-problem/", difficulty: "Easy", tags: ["greedy"] }
      ]
    },
    {
      title: "Recursion",
      problems: [
        { title: "Subset Sums", link: "https://takeuforward.org/data-structure/subset-sum-sum-of-all-subsets/", difficulty: "Medium", tags: ["recursion"] },
        { title: "Subset-II", link: "https://takeuforward.org/data-structure/subset-ii-print-all-the-unique-subsets/", difficulty: "Medium", tags: ["recursion"] },
        { title: "Combination Sum-1", link: "https://takeuforward.org/data-structure/combination-sum-1/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "Combination Sum-2", link: "https://takeuforward.org/data-structure/combination-sum-ii-find-all-unique-combinations/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "Palindrome Partitioning", link: "https://takeuforward.org/data-structure/palindrome-partitioning/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "K-th Permutation Sequence", link: "https://takeuforward.org/data-structure/find-k-th-permutation-sequence/", difficulty: "Hard", tags: ["recursion"] }
      ]
    },
    {
      title: "Recursion and Backtracking",
      problems: [
        { title: "Permutation Sequence", link: "https://takeuforward.org/data-structure/find-all-the-permutations-of-the-string/", difficulty: "Medium", tags: ["backtracking"] },
        { title: "N Queens Problem", link: "https://takeuforward.org/data-structure/n-queen-problem-return-all-distinct-solutions-to-the-n-queens-puzzle/", difficulty: "Hard", tags: ["backtracking"] },
        { title: "Sudoku Solver", link: "https://takeuforward.org/data-structure/sudoku-solver/", difficulty: "Hard", tags: ["backtracking"] },
        { title: "M Coloring Problem", link: "https://takeuforward.org/data-structure/m-coloring-problem/", difficulty: "Hard", tags: ["backtracking"] },
        { title: "Rat in a Maze", link: "https://takeuforward.org/data-structure/rat-in-a-maze/", difficulty: "Medium", tags: ["backtracking"] },
        { title: "Print all Permutations of a String/Array", link: "https://takeuforward.org/data-structure/print-all-permutations-of-a-string-array/", difficulty: "Medium", tags: ["backtracking"] }
      ]
    },
    {
      title: "Binary Search",
      problems: [
        { title: "The N-th Root of an Integer", link: "https://takeuforward.org/data-structure/nth-root-of-a-number-using-binary-search/", difficulty: "Medium", tags: ["binary-search"] },
        { title: "Matrix Median", link: "https://takeuforward.org/data-structure/median-of-row-wise-sorted-matrix/", difficulty: "Hard", tags: ["binary-search"] },
        { title: "Find the element that appears once in sorted array", link: "https://takeuforward.org/data-structure/search-single-element-in-a-sorted-array/", difficulty: "Easy", tags: ["binary-search"] },
        { title: "Search Element in Rotated Sorted Array", link: "https://takeuforward.org/data-structure/search-element-in-a-rotated-sorted-array/", difficulty: "Medium", tags: ["binary-search"] },
        { title: "Median of Two Sorted Arrays", link: "https://takeuforward.org/data-structure/median-of-two-sorted-arrays-of-different-sizes/", difficulty: "Hard", tags: ["binary-search"] },
        { title: "K-th Element of Two Sorted Arrays", link: "https://takeuforward.org/data-structure/k-th-element-of-two-sorted-arrays/", difficulty: "Hard", tags: ["binary-search"] },
        { title: "Allocate Minimum Number of Pages", link: "https://takeuforward.org/data-structure/allocate-minimum-number-of-pages-from-books/", difficulty: "Hard", tags: ["binary-search"] },
        { title: "Aggressive Cows", link: "https://takeuforward.org/data-structure/aggressive-cows-detailed-solution/", difficulty: "Medium", tags: ["binary-search"] }
      ]
    },
    {
      title: "Heaps",
      problems: [
        { title: "Max Heap, Min Heap Implementation", link: "https://takeuforward.org/data-structure/min-heap-and-max-heap-implementation/", difficulty: "Medium", tags: ["heap"] },
        { title: "Kth Largest Element", link: "https://takeuforward.org/data-structure/kth-largest-smallest-element-in-an-array/", difficulty: "Medium", tags: ["heap"] },
        { title: "Maximum Sum Combinations", link: "https://takeuforward.org/data-structure/maximum-sum-combinations/", difficulty: "Hard", tags: ["heap"] },
        { title: "Find Median from Data Stream", link: "https://takeuforward.org/data-structure/find-median-from-a-data-stream/", difficulty: "Hard", tags: ["heap"] },
        { title: "Merge K sorted arrays", link: "https://takeuforward.org/data-structure/merge-k-sorted-arrays/", difficulty: "Medium", tags: ["heap"] },
        { title: "K most frequent elements", link: "https://takeuforward.org/data-structure/k-most-frequent-elements/", difficulty: "Medium", tags: ["heap", "hashmap"] }
      ]
    },
    {
      title: "Stack and Queue - I",
      problems: [
        { title: "Implement Stack Using Arrays", link: "https://takeuforward.org/data-structure/implement-stack-using-array/", difficulty: "Easy", tags: ["stack"] },
        { title: "Implement Queue Using Arrays", link: "https://takeuforward.org/data-structure/implement-queue-using-array/", difficulty: "Easy", tags: ["queue"] },
        { title: "Implement Stack Using Queue", link: "https://takeuforward.org/data-structure/implement-stack-using-single-queue/", difficulty: "Medium", tags: ["stack", "queue"] },
        { title: "Implement Queue Using Stack", link: "https://takeuforward.org/data-structure/implement-queue-using-stack-using-single-stack/", difficulty: "Medium", tags: ["stack", "queue"] },
        { title: "Check for Balanced Parentheses", link: "https://takeuforward.org/data-structure/check-for-balanced-parentheses/", difficulty: "Easy", tags: ["stack", "string"] },
        { title: "Next Greater Element", link: "https://takeuforward.org/data-structure/next-greater-element-using-stack/", difficulty: "Medium", tags: ["stack", "monotonic-stack"] },
        { title: "Sort a Stack", link: "https://takeuforward.org/data-structure/sort-a-stack/", difficulty: "Medium", tags: ["stack", "recursion"] }
      ]
    },
    {
      title: "Stack and Queue - II",
      problems: [
        { title: "Next Smaller Element", link: "https://takeuforward.org/data-structure/next-smaller-element/", difficulty: "Medium", tags: ["stack", "monotonic-stack"] },
        { title: "LRU Cache", link: "https://takeuforward.org/data-structure/lru-cache-implementation/", difficulty: "Medium", tags: ["design", "hashmap"] },
        { title: "LFU Cache", link: "https://takeuforward.org/data-structure/lfu-cache-implementation/", difficulty: "Hard", tags: ["design", "hashmap"] },
        { title: "Largest Rectangle in Histogram", link: "https://takeuforward.org/data-structure/area-of-largest-rectangle-in-histogram/", difficulty: "Hard", tags: ["stack"] },
        { title: "Sliding Window Maximum", link: "https://takeuforward.org/data-structure/sliding-window-maximum/", difficulty: "Hard", tags: ["queue", "sliding-window"] },
        { title: "Implement Min Stack", link: "https://takeuforward.org/data-structure/implement-min-stack-o2-space-o1-space/", difficulty: "Easy", tags: ["stack"] },
        { title: "Rotten Orange", link: "https://takeuforward.org/data-structure/rotten-oranges/", difficulty: "Medium", tags: ["bfs", "queue"] },
        { title: "Stock Span Problem", link: "https://takeuforward.org/data-structure/stock-span-problem/", difficulty: "Medium", tags: ["stack"] },
        { title: "Maximum of Minimums for Every Window Size", link: "https://takeuforward.org/data-structure/maximum-of-minimums-for-every-window-size/", difficulty: "Hard", tags: ["stack"] },
        { title: "The Celebrity Problem", link: "https://takeuforward.org/data-structure/the-celebrity-problem/", difficulty: "Medium", tags: ["stack", "two-pointers"] }
      ]
    },
    {
      title: "String - I",
      problems: [
        { title: "Reverse Words in a String", link: "https://takeuforward.org/data-structure/reverse-words-in-a-string/", difficulty: "Easy", tags: ["string"] },
        { title: "Longest Palindrome in a String", link: "https://takeuforward.org/data-structure/longest-palindromic-substring/", difficulty: "Medium", tags: ["string"] },
        { title: "Roman Number to Integer and vice versa", link: "https://takeuforward.org/data-structure/roman-number-to-integer-and-vice-versa/", difficulty: "Easy", tags: ["string", "math"] },
        { title: "Implement ATOI/STRSTR", link: "https://takeuforward.org/data-structure/implement-atoi/", difficulty: "Medium", tags: ["string"] },
        { title: "Longest Common Prefix", link: "https://takeuforward.org/data-structure/longest-common-prefix/", difficulty: "Easy", tags: ["string"] },
        { title: "Rabin Karp", link: "https://takeuforward.org/data-structure/rabin-karp-algorithm/", difficulty: "Medium", tags: ["string", "hashing"] }
      ]
    },
    {
      title: "String - II",
      problems: [
        { title: "Z-Function", link: "https://takeuforward.org/data-structure/z-function/", difficulty: "Hard", tags: ["string", "algorithm"] },
        { title: "KMP Algorithm / LPS (Longest Prefix Suffix)", link: "https://takeuforward.org/data-structure/kmp-algorithm/", difficulty: "Hard", tags: ["string", "algorithm"] },
        { title: "Minimum Characters needed to be inserted to make it Palindrome", link: "https://takeuforward.org/data-structure/minimum-characters-needed-to-be-inserted-in-the-beginning-to-make-it-a-palindromic-string/", difficulty: "Hard", tags: ["string"] },
        { title: "Check for Anagrams", link: "https://takeuforward.org/data-structure/check-if-two-strings-are-anagrams-of-each-other/", difficulty: "Easy", tags: ["string", "hashmap"] },
        { title: "Count and Say", link: "https://takeuforward.org/data-structure/count-and-say/", difficulty: "Medium", tags: ["string"] },
        { title: "Compare Version Numbers", link: "https://takeuforward.org/data-structure/compare-version-numbers/", difficulty: "Medium", tags: ["string"] }
      ]
    },
    {
      title: "Binary Tree - I",
      problems: [
        { title: "Inorder Traversal", link: "https://takeuforward.org/data-structure/inorder-traversal-of-binary-tree/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Preorder Traversal", link: "https://takeuforward.org/data-structure/preorder-traversal-of-binary-tree/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Postorder Traversal", link: "https://takeuforward.org/data-structure/post-order-traversal-of-binary-tree/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Morris Inorder Traversal", link: "https://takeuforward.org/data-structure/morris-inorder-traversal-of-a-binary-tree/", difficulty: "Medium", tags: ["tree"] },
        { title: "Morris Preorder Traversal", link: "https://takeuforward.org/data-structure/morris-preorder-traversal-of-a-binary-tree/", difficulty: "Medium", tags: ["tree"] },
        { title: "Left View of Binary Tree", link: "https://takeuforward.org/data-structure/left-view-of-binary-tree/", difficulty: "Medium", tags: ["tree", "bfs"] },
        { title: "Bottom View of Binary Tree", link: "https://takeuforward.org/data-structure/bottom-view-of-a-binary-tree/", difficulty: "Medium", tags: ["tree", "bfs"] },
        { title: "Top View of Binary Tree", link: "https://takeuforward.org/data-structure/top-view-of-a-binary-tree/", difficulty: "Medium", tags: ["tree", "bfs"] }
      ]
    },
    {
      title: "Binary Tree - II",
      problems: [
        { title: "Level Order Traversal / Spiral Traversal", link: "https://takeuforward.org/data-structure/level-order-traversal-of-a-binary-tree/", difficulty: "Medium", tags: ["tree", "bfs"] },
        { title: "Height of a Binary Tree", link: "https://takeuforward.org/data-structure/height-of-a-binary-tree/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Diameter of Binary Tree", link: "https://takeuforward.org/data-structure/diameter-of-binary-tree/", difficulty: "Medium", tags: ["tree", "dfs"] },
        { title: "Check if Binary Tree is Height Balanced", link: "https://takeuforward.org/data-structure/check-whether-the-binary-tree-is-balanced-or-not/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "LCA in Binary Tree", link: "https://takeuforward.org/data-structure/lowest-common-ancestor-for-two-given-nodes/", difficulty: "Medium", tags: ["tree"] },
        { title: "Check if Two Trees are Identical", link: "https://takeuforward.org/data-structure/check-if-two-trees-are-identical/", difficulty: "Easy", tags: ["tree"] },
        { title: "Zig Zag Traversal of Binary Tree", link: "https://takeuforward.org/data-structure/zig-zag-traversal-of-binary-tree/", difficulty: "Medium", tags: ["tree", "bfs"] },
        { title: "Boundary Traversal of Binary Tree", link: "https://takeuforward.org/data-structure/boundary-traversal-of-a-binary-tree/", difficulty: "Hard", tags: ["tree"] }
      ]
    },
    {
      title: "Binary Tree - III",
      problems: [
        { title: "Maximum Path Sum", link: "https://takeuforward.org/data-structure/maximum-sum-path-in-binary-tree/", difficulty: "Hard", tags: ["tree"] },
        { title: "Construct Binary Tree from Inorder and Preorder", link: "https://takeuforward.org/data-structure/construct-binary-tree-from-inorder-and-preorder-traversal/", difficulty: "Medium", tags: ["tree"] },
        { title: "Construct Binary Tree from Inorder and Postorder", link: "https://takeuforward.org/data-structure/construct-a-binary-tree-from-postorder-and-inorder-traversal/", difficulty: "Medium", tags: ["tree"] },
        { title: "Symmetric Binary Tree", link: "https://takeuforward.org/data-structure/check-for-symmetrical-binary-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Flatten Binary Tree to LinkedList", link: "https://takeuforward.org/data-structure/flatten-binary-tree-to-linked-list/", difficulty: "Medium", tags: ["tree", "linked-list"] },
        { title: "Check if Binary Tree is Mirror of Itself", link: "https://takeuforward.org/data-structure/check-for-symmetrical-binary-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Print Root to Node Path in Binary Tree", link: "https://takeuforward.org/data-structure/print-root-to-node-path-in-a-binary-tree/", difficulty: "Medium", tags: ["tree"] },
        { title: "Path Sum", link: "https://takeuforward.org/data-structure/root-to-leaf-paths-in-binary-tree/", difficulty: "Medium", tags: ["tree"] }
      ]
    },
    {
      title: "Binary Search Tree - I",
      problems: [
        { title: "Populate Next Right Pointers of Tree", link: "https://takeuforward.org/data-structure/populate-next-right-pointers-of-tree/", difficulty: "Medium", tags: ["tree"] },
        { title: "Search Given Key in BST", link: "https://takeuforward.org/data-structure/search-in-a-binary-search-tree-explained/", difficulty: "Easy", tags: ["bst"] },
        { title: "Construct BST from given keys", link: "https://takeuforward.org/data-structure/construct-a-bst-from-a-preorder-traversal/", difficulty: "Medium", tags: ["bst"] },
        { title: "Check if a BT is BST or Not", link: "https://takeuforward.org/data-structure/check-whether-a-binary-tree-is-a-bst-or-not/", difficulty: "Medium", tags: ["bst"] },
        { title: "Find LCA of two nodes in BST", link: "https://takeuforward.org/data-structure/lca-in-a-binary-search-tree/", difficulty: "Easy", tags: ["bst"] },
        { title: "Inorder Predecessor/Successor in BST", link: "https://takeuforward.org/data-structure/predecessor-and-successor-in-bst/", difficulty: "Medium", tags: ["bst"] },
        { title: "Floor and Ceil in a BST", link: "https://takeuforward.org/data-structure/floor-and-ceil-in-a-binary-search-tree/", difficulty: "Medium", tags: ["bst"] },
        { title: "K-th smallest and largest in BST", link: "https://takeuforward.org/data-structure/kth-largest-smallest-element-in-binary-search-tree/", difficulty: "Medium", tags: ["bst"] }
      ]
    },
    {
      title: "Binary Search Tree - II",
      problems: [
        { title: "Find a pair with a given sum in BST", link: "https://takeuforward.org/data-structure/find-a-pair-with-a-given-sum-in-bst/", difficulty: "Medium", tags: ["bst"] },
        { title: "BST iterator", link: "https://takeuforward.org/data-structure/binary-search-tree-iterator/", difficulty: "Medium", tags: ["bst", "design"] },
        { title: "Size of Largest BST in Binary Tree", link: "https://takeuforward.org/data-structure/size-of-largest-bst-in-binary-tree/", difficulty: "Hard", tags: ["tree", "bst"] },
        { title: "Serialize and Deserialize Binary Tree", link: "https://takeuforward.org/data-structure/serialize-and-deserialize-a-binary-tree/", difficulty: "Hard", tags: ["tree"] },
        { title: "Binary Tree to BST / Two Sum in BST", link: "https://takeuforward.org/data-structure/two-sum-in-bst-check-if-there-exists-a-pair-with-sum-k/", difficulty: "Medium", tags: ["bst"] },
        { title: "Merge Two BST", link: "https://takeuforward.org/data-structure/merge-two-bst-s/", difficulty: "Medium", tags: ["bst"] },
        { title: "Delete a Node in BST", link: "https://takeuforward.org/data-structure/delete-a-node-in-binary-search-tree/", difficulty: "Medium", tags: ["bst"] },
        { title: "Recover BST", link: "https://takeuforward.org/data-structure/recover-bst-correct-a-bst-with-two-nodes-swapped/", difficulty: "Hard", tags: ["bst"] }
      ]
    },
    {
      title: "Graph - I",
      problems: [
        { title: "Clone a Graph", link: "https://takeuforward.org/graph/clone-graph-leetcode/", difficulty: "Medium", tags: ["graph"] },
        { title: "DFS", link: "https://takeuforward.org/graph/depth-first-search-dfs/", difficulty: "Easy", tags: ["graph", "dfs"] },
        { title: "BFS", link: "https://takeuforward.org/graph/breadth-first-search-bfs-level-order-traversal/", difficulty: "Easy", tags: ["graph", "bfs"] },
        { title: "Detect Cycle in Undirected Graph", link: "https://takeuforward.org/data-structure/detect-cycle-in-an-undirected-graph-using-bfs/", difficulty: "Medium", tags: ["graph"] },
        { title: "Detect Cycle in Directed Graph using DFS", link: "https://takeuforward.org/data-structure/detect-cycle-in-a-directed-graph-using-dfs/", difficulty: "Medium", tags: ["graph"] },
        { title: "Detect Cycle in Directed Graph using BFS", link: "https://takeuforward.org/data-structure/detect-cycle-in-a-directed-graph-using-bfs/", difficulty: "Medium", tags: ["graph"] },
        { title: "Topological Sort", link: "https://takeuforward.org/data-structure/topological-sort-algorithm-dfs/", difficulty: "Medium", tags: ["graph"] },
        { title: "Number of Islands", link: "https://takeuforward.org/data-structure/number-of-islands/", difficulty: "Medium", tags: ["graph", "bfs"] },
        { title: "Bipartite Check", link: "https://takeuforward.org/data-structure/check-bipartite-graph-bfs/", difficulty: "Medium", tags: ["graph"] }
      ]
    },
    {
      title: "Graph - II",
      problems: [
        { title: "Strongly Connected Components (Kosaraju)", link: "https://takeuforward.org/graph/strongly-connected-components-kosarajus-algorithm/", difficulty: "Hard", tags: ["graph"] },
        { title: "Dijkstra's Algorithm", link: "https://takeuforward.org/data-structure/dijkstras-algorithm-using-set-priority-queue/", difficulty: "Medium", tags: ["graph", "heap"] },
        { title: "Bellman-Ford Algorithm", link: "https://takeuforward.org/data-structure/bellman-ford-algorithm/", difficulty: "Medium", tags: ["graph"] },
        { title: "Floyd Warshall Algorithm", link: "https://takeuforward.org/data-structure/floyd-warshall-algorithm/", difficulty: "Hard", tags: ["graph"] },
        { title: "MST using Prim's Algo", link: "https://takeuforward.org/data-structure/prims-algorithm-minimum-spanning-tree/", difficulty: "Medium", tags: ["graph", "heap"] },
        { title: "MST using Kruskal's Algo", link: "https://takeuforward.org/data-structure/kruskals-algorithm-minimum-spanning-tree/", difficulty: "Medium", tags: ["graph"] }
      ]
    },
    {
      title: "Dynamic Programming - I",
      problems: [
        { title: "Max Product Subarray", link: "https://takeuforward.org/data-structure/maximum-product-subarray-in-an-array/", difficulty: "Medium", tags: ["dp", "array"] },
        { title: "Longest Increasing Subsequence", link: "https://takeuforward.org/data-structure/longest-increasing-subsequence-dp-41/", difficulty: "Medium", tags: ["dp"] },
        { title: "Longest Common Subsequence", link: "https://takeuforward.org/data-structure/longest-common-subsequence-dp-25/", difficulty: "Medium", tags: ["dp"] },
        { title: "0-1 Knapsack", link: "https://takeuforward.org/data-structure/0-1-knapsack-dp-19/", difficulty: "Medium", tags: ["dp"] },
        { title: "Edit Distance", link: "https://takeuforward.org/data-structure/edit-distance-dp-33/", difficulty: "Hard", tags: ["dp"] },
        { title: "Maximum sum increasing subsequence", link: "https://takeuforward.org/data-structure/maximum-sum-increasing-subsequence-dp/", difficulty: "Medium", tags: ["dp"] },
        { title: "Matrix Chain Multiplication", link: "https://takeuforward.org/data-structure/matrix-chain-multiplication-dp-48/", difficulty: "Hard", tags: ["dp"] }
      ]
    },
    {
      title: "Dynamic Programming - II",
      problems: [
        { title: "Minimum Sum Path in Matrix", link: "https://takeuforward.org/data-structure/minimum-path-sum-in-a-grid-dp-10/", difficulty: "Medium", tags: ["dp"] },
        { title: "Coin Change", link: "https://takeuforward.org/data-structure/minimum-coins-dp-20/", difficulty: "Medium", tags: ["dp"] },
        { title: "Partition Equal Subset Sum", link: "https://takeuforward.org/data-structure/subset-sum-equal-to-target-dp-14/", difficulty: "Medium", tags: ["dp"] },
        { title: "Rod Cutting Problem", link: "https://takeuforward.org/data-structure/rod-cutting-problem-dp-24/", difficulty: "Medium", tags: ["dp"] },
        { title: "Egg Dropping Problem", link: "https://takeuforward.org/data-structure/egg-drop-problem-dp-37/", difficulty: "Hard", tags: ["dp"] },
        { title: "Word Break", link: "https://takeuforward.org/data-structure/word-break-dp-39/", difficulty: "Medium", tags: ["dp"] },
        { title: "Independent Set / Max Non-Adjacent Sum", link: "https://takeuforward.org/data-structure/maximum-sum-of-non-adjacent-elements-dp-on-subsequences/", difficulty: "Medium", tags: ["dp"] },
        { title: "Palindrome Partitioning (DP)", link: "https://takeuforward.org/data-structure/palindrome-partitioning-ii-front-partition-dp-53/", difficulty: "Hard", tags: ["dp"] }
      ]
    },
    {
      title: "Dynamic Programming - III",
      problems: [
        { title: "Count Square Submatrices with All Ones", link: "https://takeuforward.org/data-structure/count-square-submatrices-with-all-ones/", difficulty: "Medium", tags: ["dp"] },
        { title: "Minimum Cost to Cut the Stick", link: "https://takeuforward.org/data-structure/minimum-cost-to-cut-the-stick-dp-50/", difficulty: "Hard", tags: ["dp"] },
        { title: "Buy and Sell Stock (at most 2 transactions)", link: "https://takeuforward.org/data-structure/buy-and-sell-stock-dp-32/", difficulty: "Hard", tags: ["dp"] },
        { title: "Longest Palindromic Subsequence", link: "https://takeuforward.org/data-structure/longest-palindromic-subsequence-dp-28/", difficulty: "Medium", tags: ["dp"] },
        { title: "Longest Common Substring", link: "https://takeuforward.org/data-structure/longest-common-substring-dp-27/", difficulty: "Medium", tags: ["dp"] },
        { title: "Count Palindromic Substrings", link: "https://takeuforward.org/data-structure/count-palindromic-subsequences/", difficulty: "Medium", tags: ["dp"] },
        { title: "Wildcard Matching", link: "https://takeuforward.org/data-structure/wildcard-matching-dp-34/", difficulty: "Hard", tags: ["dp"] }
      ]
    },
    {
      title: "Trie",
      problems: [
        { title: "Implement Trie", link: "https://takeuforward.org/data-structure/implement-trie-ii/", difficulty: "Medium", tags: ["trie"] },
        { title: "Implement Trie II", link: "https://takeuforward.org/data-structure/implement-trie-ii/", difficulty: "Medium", tags: ["trie"] },
        { title: "Longest String with All Prefixes", link: "https://takeuforward.org/data-structure/complete-string-longest-string-with-all-prefixes/", difficulty: "Medium", tags: ["trie"] },
        { title: "Number of Distinct Substrings", link: "https://takeuforward.org/data-structure/number-of-distinct-substrings-in-a-string/", difficulty: "Medium", tags: ["trie"] },
        { title: "Power Set (Bit Manipulation + Trie)", link: "https://takeuforward.org/data-structure/power-set-print-all-the-possible-subsequences-of-the-string/", difficulty: "Medium", tags: ["bit-manipulation"] },
        { title: "Maximum XOR of Two Numbers", link: "https://takeuforward.org/data-structure/maximum-xor-of-two-numbers-in-an-array/", difficulty: "Medium", tags: ["trie", "bit-manipulation"] },
        { title: "Maximum XOR With Element from Array", link: "https://takeuforward.org/data-structure/maximum-xor-with-an-element-from-array/", difficulty: "Hard", tags: ["trie", "bit-manipulation"] }
      ]
    },
    {
        title: "Segment Tree / Binary Indexed Tree",
        problems: [
          { title: "Segment Tree - Build", link: "https://takeuforward.org/data-structures/segment-tree-build/", difficulty: "Medium", tags: ["segment-tree"] },
          { title: "Segment Tree - Range Sum and Update Queries", link: "https://takeuforward.org/data-structures/segment-tree-range-sum-query-and-point-updates/", difficulty: "Hard", tags: ["segment-tree"] },
          { title: "Binary Indexed Tree (Fenwick Tree)", link: "https://takeuforward.org/data-structures/binary-indexed-tree-fenwick-tree/", difficulty: "Medium", tags: ["fenwick-tree"] },
          { title: "Range Sum with BIT", link: "https://takeuforward.org/data-structures/binary-indexed-tree-for-range-sum-query/", difficulty: "Medium", tags: ["fenwick-tree"] },
          { title: "Sparse Table for Range Minimum Query", link: "https://takeuforward.org/data-structures/sparse-table/", difficulty: "Hard", tags: ["range-query"] },
          { title: "Count of Smaller Numbers After Self", link: "https://takeuforward.org/data-structure/count-of-smaller-numbers-after-self/", difficulty: "Hard", tags: ["segment-tree", "fenwick-tree"] }
        ]
      }
    ]
};

const seedStriverSDE = async () => {
  await connectDB();
  await DSASheet.findOneAndUpdate(
    { slug: striverSDEData.slug },
    striverSDEData,
    { upsert: true, new: true }
  );
  console.log('Striver SDE Sheet Seeded');
};

module.exports = seedStriverSDE;
