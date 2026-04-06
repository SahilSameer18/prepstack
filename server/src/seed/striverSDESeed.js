const DSASheet = require('../models/sheets.model');
const connectDB = require('./seedConfig');

const striverSDEData = {
  name: "Striver SDE Sheet",
  slug: "striver-sde",
  description: "The famous SDE sheet by Striver for interview preparation (Placeholder).",
  topics: [

    {
      "title": "Striver SDE Sheet",
      "source": "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/",
      "totalQuestions": 191,
      "topics": [
        {
          "day": 1,
          "topic": "Arrays - I",
          "questions": [
            { "id": 1, "title": "Set Matrix Zeros", "link": "https://takeuforward.org/data-structure/set-matrix-zero/" },
            { "id": 2, "title": "Pascal's Triangle", "link": "https://takeuforward.org/data-structure/program-to-generate-pascals-triangle/" },
            { "id": 3, "title": "Next Permutation", "link": "https://takeuforward.org/data-structure/next_permutation-find-next-lexicographically-greater-permutation/" },
            { "id": 4, "title": "Kadane's Algorithm / Maximum Subarray Sum", "link": "https://takeuforward.org/data-structure/kadanes-algorithm-maximum-subarray-sum-in-an-array/" },
            { "id": 5, "title": "Sort an array of 0s, 1s and 2s", "link": "https://takeuforward.org/data-structure/sort-an-array-of-0s-1s-and-2s/" },
            { "id": 6, "title": "Stock Buy and Sell", "link": "https://takeuforward.org/data-structure/stock-buy-and-sell/" }
          ]
        },
        {
          "day": 2,
          "topic": "Arrays - II",
          "questions": [
            { "id": 7, "title": "Rotate Matrix", "link": "https://takeuforward.org/data-structure/rotate-image-by-90-degree/" },
            { "id": 8, "title": "Merge Overlapping Subintervals", "link": "https://takeuforward.org/data-structure/merge-overlapping-sub-intervals/" },
            { "id": 9, "title": "Merge Two Sorted Arrays Without Extra Space", "link": "https://takeuforward.org/data-structure/merge-two-sorted-arrays-without-extra-space/" },
            { "id": 10, "title": "Find the Duplicate in an Array of N+1 Integers", "link": "https://takeuforward.org/data-structure/find-the-duplicate-in-an-array-of-n1-integers/" },
            { "id": 11, "title": "Repeat and Missing Number", "link": "https://takeuforward.org/data-structure/find-the-repeating-and-missing-numbers/" },
            { "id": 12, "title": "Inversion of Array (Count Inversions)", "link": "https://takeuforward.org/data-structure/count-inversions-in-an-array/" }
          ]
        },
        {
          "day": 3,
          "topic": "Arrays - III",
          "questions": [
            { "id": 13, "title": "Search in a 2D Matrix", "link": "https://takeuforward.org/data-structure/search-in-a-sorted-2d-matrix/" },
            { "id": 14, "title": "Pow(x, n)", "link": "https://takeuforward.org/data-structure/implement-powxn-x-raised-to-the-power-n/" },
            { "id": 15, "title": "Majority Element (>N/2 times)", "link": "https://takeuforward.org/data-structure/find-the-majority-element-that-occurs-more-than-n-2-times/" },
            { "id": 16, "title": "Majority Element (>N/3 times)", "link": "https://takeuforward.org/data-structure/find-the-majority-elements-occurring-more-than-n-3-times/" },
            { "id": 17, "title": "Grid Unique Paths", "link": "https://takeuforward.org/data-structure/grid-unique-paths-count-paths-from-left-top-to-the-right-bottom-of-a-matrix/" },
            { "id": 18, "title": "Reverse Pairs", "link": "https://takeuforward.org/data-structure/count-reverse-pairs/" }
          ]
        },
        {
          "day": 4,
          "topic": "Arrays - IV",
          "questions": [
            { "id": 19, "title": "2-Sum Problem", "link": "https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/" },
            { "id": 20, "title": "4-Sum Problem", "link": "https://takeuforward.org/data-structure/4-sum-find-quads-that-add-up-to-a-target-value/" },
            { "id": 21, "title": "Longest Consecutive Sequence", "link": "https://takeuforward.org/data-structure/longest-consecutive-sequence-in-an-array/" },
            { "id": 22, "title": "Largest Subarray with 0 Sum", "link": "https://takeuforward.org/data-structure/largest-subarray-with-0-sum/" },
            { "id": 23, "title": "Count number of subarrays with given XOR K", "link": "https://takeuforward.org/data-structure/count-the-number-of-subarrays-with-given-xor-k/" },
            { "id": 24, "title": "Longest Substring Without Repeat", "link": "https://takeuforward.org/data-structure/length-of-longest-substring-without-any-repeating-character/" }
          ]
        },
        {
          "day": 5,
          "topic": "Linked List - I",
          "questions": [
            { "id": 25, "title": "Reverse a Linked List", "link": "https://takeuforward.org/data-structure/reverse-a-linked-list/" },
            { "id": 26, "title": "Find the Middle of Linked List", "link": "https://takeuforward.org/data-structure/find-the-middle-of-a-linked-list/" },
            { "id": 27, "title": "Merge Two Sorted Linked Lists", "link": "https://takeuforward.org/data-structure/merge-two-sorted-linked-lists/" },
            { "id": 28, "title": "Remove N-th Node From Back of Linked List", "link": "https://takeuforward.org/data-structure/remove-nth-node-from-the-back-of-the-linked-list/" },
            { "id": 29, "title": "Delete a Given Node in Linked List", "link": "https://takeuforward.org/data-structure/delete-given-node-in-a-linked-list-o1-approach/" },
            { "id": 30, "title": "Add Two Numbers as Linked Lists", "link": "https://takeuforward.org/data-structure/add-two-numbers-represented-as-linked-lists/" }
          ]
        },
        {
          "day": 6,
          "topic": "Linked List - II",
          "questions": [
            { "id": 31, "title": "Find Intersection Point of Y LinkedList", "link": "https://takeuforward.org/data-structure/find-intersection-of-two-linked-lists/" },
            { "id": 32, "title": "Detect a Cycle in Linked List", "link": "https://takeuforward.org/data-structure/detect-a-cycle-in-a-linked-list/" },
            { "id": 33, "title": "Reverse a Linked List in groups of Size K", "link": "https://takeuforward.org/data-structure/reverse-linked-list-in-groups-of-size-k/" },
            { "id": 34, "title": "Check if Linked List is Palindrome", "link": "https://takeuforward.org/data-structure/check-if-given-linked-list-is-plaindrome/" },
            { "id": 35, "title": "Find the Starting Point of Loop in Linked List", "link": "https://takeuforward.org/data-structure/starting-point-of-loop-in-a-linked-list/" },
            { "id": 36, "title": "Flattening a Linked List", "link": "https://takeuforward.org/data-structure/flattening-a-linked-list/" }
          ]
        },
        {
          "day": 7,
          "topic": "Linked List and Arrays",
          "questions": [
            { "id": 37, "title": "Rotate a Linked List", "link": "https://takeuforward.org/data-structure/rotate-a-linked-list/" },
            { "id": 38, "title": "Clone a Linked List with Random and Next Pointer", "link": "https://takeuforward.org/data-structure/clone-linked-list-with-random-and-next-pointer/" },
            { "id": 39, "title": "3 Sum", "link": "https://takeuforward.org/data-structure/3-sum-find-triplets-that-add-up-to-a-zero/" },
            { "id": 40, "title": "Trapping Rainwater", "link": "https://takeuforward.org/data-structure/trapping-rainwater/" },
            { "id": 41, "title": "Remove Duplicate from Sorted Array", "link": "https://takeuforward.org/data-structure/remove-duplicates-in-place-from-sorted-array/" },
            { "id": 42, "title": "Max Consecutive Ones", "link": "https://takeuforward.org/data-structure/count-maximum-consecutive-ones-in-the-array/" }
          ]
        },
        {
          "day": 8,
          "topic": "Greedy",
          "questions": [
            { "id": 43, "title": "N meetings in one room", "link": "https://takeuforward.org/data-structure/n-meetings-in-one-room/" },
            { "id": 44, "title": "Minimum number of platforms required for a railway", "link": "https://takeuforward.org/data-structure/minimum-number-of-platforms-required-for-a-railway/" },
            { "id": 45, "title": "Job Sequencing Problem", "link": "https://takeuforward.org/data-structure/job-sequencing-problem/" },
            { "id": 46, "title": "Fractional Knapsack Problem", "link": "https://takeuforward.org/data-structure/fractional-knapsack-problem-greedy-approach/" },
            { "id": 47, "title": "Greedy algorithm to find minimum number of coins", "link": "https://takeuforward.org/data-structure/greedy-algorithm-to-find-minimum-number-of-coins/" },
            { "id": 48, "title": "Activity Selection", "link": "https://takeuforward.org/data-structure/activity-selection-problem/" }
          ]
        },
        {
          "day": 9,
          "topic": "Recursion",
          "questions": [
            { "id": 49, "title": "Subset Sums", "link": "https://takeuforward.org/data-structure/subset-sum-sum-of-all-subsets/" },
            { "id": 50, "title": "Subset-II", "link": "https://takeuforward.org/data-structure/subset-ii-print-all-the-unique-subsets/" },
            { "id": 51, "title": "Combination Sum-1", "link": "https://takeuforward.org/data-structure/combination-sum-1/" },
            { "id": 52, "title": "Combination Sum-2", "link": "https://takeuforward.org/data-structure/combination-sum-ii-find-all-unique-combinations/" },
            { "id": 53, "title": "Palindrome Partitioning", "link": "https://takeuforward.org/data-structure/palindrome-partitioning/" },
            { "id": 54, "title": "K-th Permutation Sequence", "link": "https://takeuforward.org/data-structure/find-k-th-permutation-sequence/" }
          ]
        },
        {
          "day": 10,
          "topic": "Recursion and Backtracking",
          "questions": [
            { "id": 55, "title": "Permutation Sequence", "link": "https://takeuforward.org/data-structure/find-all-the-permutations-of-the-string/" },
            { "id": 56, "title": "N Queens Problem", "link": "https://takeuforward.org/data-structure/n-queen-problem-return-all-distinct-solutions-to-the-n-queens-puzzle/" },
            { "id": 57, "title": "Sudoku Solver", "link": "https://takeuforward.org/data-structure/sudoku-solver/" },
            { "id": 58, "title": "M Coloring Problem", "link": "https://takeuforward.org/data-structure/m-coloring-problem/" },
            { "id": 59, "title": "Rat in a Maze", "link": "https://takeuforward.org/data-structure/rat-in-a-maze/" },
            { "id": 60, "title": "Print all Permutations of a String/Array", "link": "https://takeuforward.org/data-structure/print-all-permutations-of-a-string-array/" }
          ]
        },
        {
          "day": 11,
          "topic": "Binary Search",
          "questions": [
            { "id": 61, "title": "The N-th Root of an Integer", "link": "https://takeuforward.org/data-structure/nth-root-of-a-number-using-binary-search/" },
            { "id": 62, "title": "Matrix Median", "link": "https://takeuforward.org/data-structure/median-of-row-wise-sorted-matrix/" },
            { "id": 63, "title": "Find the element that appears once in sorted array", "link": "https://takeuforward.org/data-structure/search-single-element-in-a-sorted-array/" },
            { "id": 64, "title": "Search Element in Rotated Sorted Array", "link": "https://takeuforward.org/data-structure/search-element-in-a-rotated-sorted-array/" },
            { "id": 65, "title": "Median of Two Sorted Arrays", "link": "https://takeuforward.org/data-structure/median-of-two-sorted-arrays-of-different-sizes/" },
            { "id": 66, "title": "K-th Element of Two Sorted Arrays", "link": "https://takeuforward.org/data-structure/k-th-element-of-two-sorted-arrays/" },
            { "id": 67, "title": "Allocate Minimum Number of Pages", "link": "https://takeuforward.org/data-structure/allocate-minimum-number-of-pages-from-books/" },
            { "id": 68, "title": "Aggressive Cows", "link": "https://takeuforward.org/data-structure/aggressive-cows-detailed-solution/" }
          ]
        },
        {
          "day": 12,
          "topic": "Heaps",
          "questions": [
            { "id": 69, "title": "Max Heap, Min Heap Implementation", "link": "https://takeuforward.org/data-structure/min-heap-and-max-heap-implementation/" },
            { "id": 70, "title": "Kth Largest Element", "link": "https://takeuforward.org/data-structure/kth-largest-smallest-element-in-an-array/" },
            { "id": 71, "title": "Maximum Sum Combinations", "link": "https://takeuforward.org/data-structure/maximum-sum-combinations/" },
            { "id": 72, "title": "Find Median from Data Stream", "link": "https://takeuforward.org/data-structure/find-median-from-a-data-stream/" },
            { "id": 73, "title": "Merge K sorted arrays", "link": "https://takeuforward.org/data-structure/merge-k-sorted-arrays/" },
            { "id": 74, "title": "K most frequent elements", "link": "https://takeuforward.org/data-structure/k-most-frequent-elements/" }
          ]
        },
        {
          "day": 13,
          "topic": "Stack and Queue - I",
          "questions": [
            { "id": 75, "title": "Implement Stack Using Arrays", "link": "https://takeuforward.org/data-structure/implement-stack-using-array/" },
            { "id": 76, "title": "Implement Queue Using Arrays", "link": "https://takeuforward.org/data-structure/implement-queue-using-array/" },
            { "id": 77, "title": "Implement Stack Using Queue", "link": "https://takeuforward.org/data-structure/implement-stack-using-single-queue/" },
            { "id": 78, "title": "Implement Queue Using Stack", "link": "https://takeuforward.org/data-structure/implement-queue-using-stack-using-single-stack/" },
            { "id": 79, "title": "Check for Balanced Parentheses", "link": "https://takeuforward.org/data-structure/check-for-balanced-parentheses/" },
            { "id": 80, "title": "Next Greater Element", "link": "https://takeuforward.org/data-structure/next-greater-element-using-stack/" },
            { "id": 81, "title": "Sort a Stack", "link": "https://takeuforward.org/data-structure/sort-a-stack/" }
          ]
        },
        {
          "day": 14,
          "topic": "Stack and Queue - II",
          "questions": [
            { "id": 82, "title": "Next Smaller Element", "link": "https://takeuforward.org/data-structure/next-smaller-element/" },
            { "id": 83, "title": "LRU Cache", "link": "https://takeuforward.org/data-structure/lru-cache-implementation/" },
            { "id": 84, "title": "LFU Cache", "link": "https://takeuforward.org/data-structure/lfu-cache-implementation/" },
            { "id": 85, "title": "Largest Rectangle in Histogram", "link": "https://takeuforward.org/data-structure/area-of-largest-rectangle-in-histogram/" },
            { "id": 86, "title": "Sliding Window Maximum", "link": "https://takeuforward.org/data-structure/sliding-window-maximum/" },
            { "id": 87, "title": "Implement Min Stack", "link": "https://takeuforward.org/data-structure/implement-min-stack-o2-space-o1-space/" },
            { "id": 88, "title": "Rotten Orange", "link": "https://takeuforward.org/data-structure/rotten-oranges/" },
            { "id": 89, "title": "Stock Span Problem", "link": "https://takeuforward.org/data-structure/stock-span-problem/" },
            { "id": 90, "title": "The Celebrity Problem", "link": "https://takeuforward.org/data-structure/the-celebrity-problem/" }
          ]
        },
        {
          "day": 15,
          "topic": "String - I",
          "questions": [
            { "id": 91, "title": "Reverse Words in a String", "link": "https://takeuforward.org/data-structure/reverse-words-in-a-string/" },
            { "id": 92, "title": "Longest Palindrome in a String", "link": "https://takeuforward.org/data-structure/longest-palindromic-substring/" },
            { "id": 93, "title": "Roman Number to Integer and vice versa", "link": "https://takeuforward.org/data-structure/roman-number-to-integer-and-vice-versa/" },
            { "id": 94, "title": "Implement ATOI/STRSTR", "link": "https://takeuforward.org/data-structure/implement-atoi/" },
            { "id": 95, "title": "Longest Common Prefix", "link": "https://takeuforward.org/data-structure/longest-common-prefix/" },
            { "id": 96, "title": "Rabin Karp", "link": "https://takeuforward.org/data-structure/rabin-karp-algorithm/" }
          ]
        },
        {
          "day": 16,
          "topic": "String - II",
          "questions": [
            { "id": 97, "title": "Z-Function", "link": "https://takeuforward.org/data-structure/z-function/" },
            { "id": 98, "title": "KMP Algorithm / LPS (Longest Prefix Suffix)", "link": "https://takeuforward.org/data-structure/kmp-algorithm/" },
            { "id": 99, "title": "Minimum Characters needed to be inserted to make it Palindrome", "link": "https://takeuforward.org/data-structure/minimum-characters-needed-to-be-inserted-in-the-beginning-to-make-it-a-palindromic-string/" },
            { "id": 100, "title": "Check for Anagrams", "link": "https://takeuforward.org/data-structure/check-if-two-strings-are-anagrams-of-each-other/" },
            { "id": 101, "title": "Count and Say", "link": "https://takeuforward.org/data-structure/count-and-say/" },
            { "id": 102, "title": "Compare Version Numbers", "link": "https://takeuforward.org/data-structure/compare-version-numbers/" }
          ]
        },
        {
          "day": 17,
          "topic": "Binary Tree - I",
          "questions": [
            { "id": 103, "title": "Inorder Traversal", "link": "https://takeuforward.org/data-structure/inorder-traversal-of-binary-tree/" },
            { "id": 104, "title": "Preorder Traversal", "link": "https://takeuforward.org/data-structure/preorder-traversal-of-binary-tree/" },
            { "id": 105, "title": "Postorder Traversal", "link": "https://takeuforward.org/data-structure/post-order-traversal-of-binary-tree/" },
            { "id": 106, "title": "Morris Inorder Traversal", "link": "https://takeuforward.org/data-structure/morris-inorder-traversal-of-a-binary-tree/" },
            { "id": 107, "title": "Morris Preorder Traversal", "link": "https://takeuforward.org/data-structure/morris-preorder-traversal-of-a-binary-tree/" },
            { "id": 108, "title": "Left View of Binary Tree", "link": "https://takeuforward.org/data-structure/left-view-of-binary-tree/" },
            { "id": 109, "title": "Bottom View of Binary Tree", "link": "https://takeuforward.org/data-structure/bottom-view-of-a-binary-tree/" },
            { "id": 110, "title": "Top View of Binary Tree", "link": "https://takeuforward.org/data-structure/top-view-of-a-binary-tree/" }
          ]
        },
        {
          "day": 18,
          "topic": "Binary Tree - II",
          "questions": [
            { "id": 111, "title": "Level Order Traversal / Level order traversal in spiral form", "link": "https://takeuforward.org/data-structure/level-order-traversal-of-a-binary-tree/" },
            { "id": 112, "title": "Height of a Binary Tree", "link": "https://takeuforward.org/data-structure/height-of-a-binary-tree/" },
            { "id": 113, "title": "Diameter of Binary Tree", "link": "https://takeuforward.org/data-structure/diameter-of-binary-tree/" },
            { "id": 114, "title": "Check if Binary Tree is Height Balanced", "link": "https://takeuforward.org/data-structure/check-whether-the-binary-tree-is-balanced-or-not/" },
            { "id": 115, "title": "LCA in Binary Tree", "link": "https://takeuforward.org/data-structure/lowest-common-ancestor-for-two-given-nodes/" },
            { "id": 116, "title": "Check if Two Trees are Identical", "link": "https://takeuforward.org/data-structure/check-if-two-trees-are-identical/" },
            { "id": 117, "title": "Zig Zag Traversal of Binary Tree", "link": "https://takeuforward.org/data-structure/zig-zag-traversal-of-binary-tree/" },
            { "id": 118, "title": "Boundary Traversal of Binary Tree", "link": "https://takeuforward.org/data-structure/boundary-traversal-of-a-binary-tree/" }
          ]
        },
        {
          "day": 19,
          "topic": "Binary Tree - III",
          "questions": [
            { "id": 119, "title": "Maximum Path Sum", "link": "https://takeuforward.org/data-structure/maximum-sum-path-in-binary-tree/" },
            { "id": 120, "title": "Construct Binary Tree from Inorder and Preorder", "link": "https://takeuforward.org/data-structure/construct-binary-tree-from-inorder-and-preorder-traversal/" },
            { "id": 121, "title": "Construct Binary Tree from Inorder and Postorder", "link": "https://takeuforward.org/data-structure/construct-a-binary-tree-from-postorder-and-inorder-traversal/" },
            { "id": 122, "title": "Symmetric Binary Tree", "link": "https://takeuforward.org/data-structure/check-for-symmetrical-binary-tree/" },
            { "id": 123, "title": "Flatten Binary Tree to LinkedList", "link": "https://takeuforward.org/data-structure/flatten-binary-tree-to-linked-list/" },
            { "id": 124, "title": "Check if Binary Tree is Mirror of Itself", "link": "https://takeuforward.org/data-structure/check-for-symmetrical-binary-tree/" },
            { "id": 125, "title": "Print Root to Node Path in Binary Tree", "link": "https://takeuforward.org/data-structure/print-root-to-node-path-in-a-binary-tree/" },
            { "id": 126, "title": "Path Sum", "link": "https://takeuforward.org/data-structure/root-to-leaf-paths-in-binary-tree/" }
          ]
        },
        {
          "day": 20,
          "topic": "Binary Search Tree - I",
          "questions": [
            { "id": 127, "title": "Populate Next Right Pointers of Tree", "link": "https://takeuforward.org/data-structure/populate-next-right-pointers-of-tree/" },
            { "id": 128, "title": "Search Given Key in BST", "link": "https://takeuforward.org/data-structure/search-in-a-binary-search-tree-explained/" },
            { "id": 129, "title": "Construct BST from given keys", "link": "https://takeuforward.org/data-structure/construct-a-bst-from-a-preorder-traversal/" },
            { "id": 130, "title": "Check is a BT is BST or Not", "link": "https://takeuforward.org/data-structure/check-whether-a-binary-tree-is-a-bst-or-not/" },
            { "id": 131, "title": "Find LCA of two nodes in BST", "link": "https://takeuforward.org/data-structure/lca-in-a-binary-search-tree/" },
            { "id": 132, "title": "Find the Inorder Predecessor/Successor for the given key in a BST", "link": "https://takeuforward.org/data-structure/predecessor-and-successor-in-bst/" },
            { "id": 133, "title": "Floor and Ceil in a BST", "link": "https://takeuforward.org/data-structure/floor-and-ceil-in-a-binary-search-tree/" },
            { "id": 134, "title": "Find K-th smallest and K-th largest element in BST", "link": "https://takeuforward.org/data-structure/kth-largest-smallest-element-in-binary-search-tree/" }
          ]
        },
        {
          "day": 21,
          "topic": "Binary Search Tree - II",
          "questions": [
            { "id": 135, "title": "Find a pair with a given sum in BST", "link": "https://takeuforward.org/data-structure/find-a-pair-with-a-given-sum-in-bst/" },
            { "id": 136, "title": "BST iterator", "link": "https://takeuforward.org/data-structure/binary-search-tree-iterator/" },
            { "id": 137, "title": "Size of Largest BST in Binary Tree", "link": "https://takeuforward.org/data-structure/size-of-largest-bst-in-binary-tree/" },
            { "id": 138, "title": "Serialize and Deserialize Binary Tree", "link": "https://takeuforward.org/data-structure/serialize-and-deserialize-a-binary-tree/" },
            { "id": 139, "title": "Binary Tree to BST", "link": "https://takeuforward.org/data-structure/two-sum-in-bst-check-if-there-exists-a-pair-with-sum-k/" },
            { "id": 140, "title": "Merge Two BST", "link": "https://takeuforward.org/data-structure/merge-two-bst-s/" },
            { "id": 141, "title": "Delete a Node in BST", "link": "https://takeuforward.org/data-structure/delete-a-node-in-binary-search-tree/" },
            { "id": 142, "title": "Recover BST | Correct BST with two nodes swapped", "link": "https://takeuforward.org/data-structure/recover-bst-correct-a-bst-with-two-nodes-swapped/" }
          ]
        },
        {
          "day": 22,
          "topic": "Graph - I",
          "questions": [
            { "id": 143, "title": "Clone a graph", "link": "https://takeuforward.org/graph/clone-graph-leetcode/" },
            { "id": 144, "title": "DFS", "link": "https://takeuforward.org/graph/depth-first-search-dfs/" },
            { "id": 145, "title": "BFS", "link": "https://takeuforward.org/graph/breadth-first-search-bfs-level-order-traversal/" },
            { "id": 146, "title": "Detect Cycle in Undirected Graph", "link": "https://takeuforward.org/data-structure/detect-cycle-in-an-undirected-graph-using-bfs/" },
            { "id": 147, "title": "Detect Cycle in a Directed Graph", "link": "https://takeuforward.org/data-structure/detect-cycle-in-a-directed-graph-using-dfs/" },
            { "id": 148, "title": "Topological Sort", "link": "https://takeuforward.org/data-structure/topological-sort-algorithm-dfs/" },
            { "id": 149, "title": "Number of Islands", "link": "https://takeuforward.org/data-structure/number-of-islands/" },
            { "id": 150, "title": "Bipartite Check", "link": "https://takeuforward.org/data-structure/check-bipartite-graph-bfs/" }
          ]
        },
        {
          "day": 23,
          "topic": "Graph - II",
          "questions": [
            { "id": 151, "title": "Strongly Connected Components (Kosaraju's Algorithm)", "link": "https://takeuforward.org/graph/strongly-connected-components-kosarajus-algorithm/" },
            { "id": 152, "title": "Dijkstra's Algorithm", "link": "https://takeuforward.org/data-structure/dijkstras-algorithm-using-set-priority-queue/" },
            { "id": 153, "title": "Bellman-Ford Algorithm", "link": "https://takeuforward.org/data-structure/bellman-ford-algorithm/" },
            { "id": 154, "title": "Floyd Warshall Algorithm", "link": "https://takeuforward.org/data-structure/floyd-warshall-algorithm/" },
            { "id": 155, "title": "MST using Prim's Algo", "link": "https://takeuforward.org/data-structure/prims-algorithm-minimum-spanning-tree/" },
            { "id": 156, "title": "MST using Kruskal's Algo", "link": "https://takeuforward.org/data-structure/kruskals-algorithm-minimum-spanning-tree/" }
          ]
        },
        {
          "day": 24,
          "topic": "Dynamic Programming - I",
          "questions": [
            { "id": 157, "title": "Max Product Subarray", "link": "https://takeuforward.org/data-structure/maximum-product-subarray-in-an-array/" },
            { "id": 158, "title": "Longest Increasing Subsequence", "link": "https://takeuforward.org/data-structure/longest-increasing-subsequence-dp-41/" },
            { "id": 159, "title": "Longest Common Subsequence", "link": "https://takeuforward.org/data-structure/longest-common-subsequence-dp-25/" },
            { "id": 160, "title": "0-1 Knapsack", "link": "https://takeuforward.org/data-structure/0-1-knapsack-dp-19/" },
            { "id": 161, "title": "Edit Distance", "link": "https://takeuforward.org/data-structure/edit-distance-dp-33/" },
            { "id": 162, "title": "Maximum sum increasing subsequence", "link": "https://takeuforward.org/data-structure/maximum-sum-increasing-subsequence-dp/" },
            { "id": 163, "title": "Matrix Chain Multiplication", "link": "https://takeuforward.org/data-structure/matrix-chain-multiplication-dp-48/" }
          ]
        },
        {
          "day": 25,
          "topic": "Dynamic Programming - II",
          "questions": [
            { "id": 164, "title": "Minimum Sum Path in the Matrix", "link": "https://takeuforward.org/data-structure/minimum-path-sum-in-a-grid-dp-10/" },
            { "id": 165, "title": "Coin Change", "link": "https://takeuforward.org/data-structure/minimum-coins-dp-20/" },
            { "id": 166, "title": "Partition Equal Subset Sum", "link": "https://takeuforward.org/data-structure/subset-sum-equal-to-target-dp-14/" },
            { "id": 167, "title": "Rod Cutting Problem", "link": "https://takeuforward.org/data-structure/rod-cutting-problem-dp-24/" },
            { "id": 168, "title": "Egg Dropping Problem", "link": "https://takeuforward.org/data-structure/egg-drop-problem-dp-37/" },
            { "id": 169, "title": "Word Break", "link": "https://takeuforward.org/data-structure/word-break-dp-39/" },
            { "id": 170, "title": "Independent Set", "link": "https://takeuforward.org/data-structure/maximum-sum-of-non-adjacent-elements-dp-on-subsequences/" },
            { "id": 171, "title": "Palindrome Partitioning (DP)", "link": "https://takeuforward.org/data-structure/palindrome-partitioning-ii-front-partition-dp-53/" }
          ]
        },
        {
          "day": 26,
          "topic": "Dynamic Programming - III",
          "questions": [
            { "id": 172, "title": "Count Square Submatrices with All Ones", "link": "https://takeuforward.org/data-structure/count-square-submatrices-with-all-ones/" },
            { "id": 173, "title": "Minimum Cost to Cut the Stick", "link": "https://takeuforward.org/data-structure/minimum-cost-to-cut-the-stick-dp-50/" },
            { "id": 174, "title": "Buy and Sell Stock – at most 2 transactions allowed", "link": "https://takeuforward.org/data-structure/buy-and-sell-stock-dp-32/" },
            { "id": 175, "title": "Longest Palindromic Subsequence", "link": "https://takeuforward.org/data-structure/longest-palindromic-subsequence-dp-28/" },
            { "id": 176, "title": "Longest Common Substring", "link": "https://takeuforward.org/data-structure/longest-common-substring-dp-27/" },
            { "id": 177, "title": "Count Palindromic Substrings", "link": "https://takeuforward.org/data-structure/count-palindromic-subsequences/" },
            { "id": 178, "title": "Wildcard Matching", "link": "https://takeuforward.org/data-structure/wildcard-matching-dp-34/" }
          ]
        },
        {
          "day": 27,
          "topic": "Trie",
          "questions": [
            { "id": 179, "title": "Implement Trie", "link": "https://takeuforward.org/data-structure/implement-trie-ii/" },
            { "id": 180, "title": "Implement Trie-2", "link": "https://takeuforward.org/data-structure/implement-trie-ii/" },
            { "id": 181, "title": "Longest String with All Prefixes", "link": "https://takeuforward.org/data-structure/complete-string-longest-string-with-all-prefixes/" },
            { "id": 182, "title": "Number of Distinct Substrings in a String", "link": "https://takeuforward.org/data-structure/number-of-distinct-substrings-in-a-string/" },
            { "id": 183, "title": "Bit Manipulation + Tries: Power Set", "link": "https://takeuforward.org/data-structure/power-set-print-all-the-possible-subsequences-of-the-string/" },
            { "id": 184, "title": "Maximum XOR of Two Numbers in an Array", "link": "https://takeuforward.org/data-structure/maximum-xor-of-two-numbers-in-an-array/" },
            { "id": 185, "title": "Maximum XOR With an Element From Array", "link": "https://takeuforward.org/data-structure/maximum-xor-with-an-element-from-array/" }
          ]
        },
        {
          "day": 28,
          "topic": "Segment Tree / Binary Indexed Tree",
          "questions": [
            { "id": 186, "title": "Segment Tree - Build", "link": "https://takeuforward.org/data-structures/segment-tree-build/" },
            { "id": 187, "title": "Segment Tree - Range Sum and Update Queries", "link": "https://takeuforward.org/data-structures/segment-tree-range-sum-query-and-point-updates/" },
            { "id": 188, "title": "Binary Indexed Tree (Fenwick Tree)", "link": "https://takeuforward.org/data-structures/binary-indexed-tree-fenwick-tree/" },
            { "id": 189, "title": "Range Sum with BIT", "link": "https://takeuforward.org/data-structures/binary-indexed-tree-for-range-sum-query/" },
            { "id": 190, "title": "Sparse Table for Range Minimum Query", "link": "https://takeuforward.org/data-structures/sparse-table/" },
            { "id": 191, "title": "Count of Smaller Numbers After Self", "link": "https://takeuforward.org/data-structure/count-of-smaller-numbers-after-self/" }
          ]
        }
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
