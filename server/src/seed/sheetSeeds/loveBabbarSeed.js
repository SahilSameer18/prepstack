const DSASheet = require('../../models/sheets.model');
const connectDB = require('../seedConfig');

const loveBabbarData = {
  name: "Love Babbar DSA Sheet",
  slug: "love-babbar",
  description: "A comprehensive DSA sheet by Love Babbar covering 450+ problems.",
  topics: [
    {
      title: "Arrays",
      problems: [
        { title: "Reverse the array", link: "https://www.geeksforgeeks.org/problems/reverse-a-string/1", difficulty: "Easy" },
        { title: "Maximum and minimum of an array", link: "https://www.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1", difficulty: "Easy" },
        { title: "Kth smallest element", link: "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1", difficulty: "Medium" },
        { title: "Sort an array of 0s, 1s and 2s", link: "https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1", difficulty: "Medium" },
        { title: "Move all negative elements to end", link: "https://www.geeksforgeeks.org/problems/move-all-negative-elements-to-end1813/1", difficulty: "Easy" },
        { title: "Union of two arrays", link: "https://www.geeksforgeeks.org/problems/union-of-two-arrays3538/1", difficulty: "Easy" },
        { title: "Cyclically rotate an array by one", link: "https://www.geeksforgeeks.org/problems/cyclically-rotate-an-array-by-one2614/1", difficulty: "Easy" },
        { title: "Kadane's Algorithm", link: "https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1", difficulty: "Medium" },
        { title: "Minimize the Heights II", link: "https://www.geeksforgeeks.org/problems/minimize-the-heights3351/1", difficulty: "Medium" },
        { title: "Minimum number of jumps", link: "https://www.geeksforgeeks.org/problems/minimum-number-of-jumps-1587115620/1", difficulty: "Medium" },
        { title: "Find the Duplicate Number", link: "https://www.geeksforgeeks.org/problems/find-duplicates-in-an-array/1", difficulty: "Medium" },
        { title: "Merge 2 sorted arrays without using extra space", link: "https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays-1587115620/1", difficulty: "Medium" },
        { title: "Merge Intervals", link: "https://www.geeksforgeeks.org/problems/overlapping-intervals--170633/1", difficulty: "Medium" },
        { title: "Next Permutation", link: "https://www.geeksforgeeks.org/problems/next-permutation5226/1", difficulty: "Medium" },
        { title: "Count Inversions", link: "https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1", difficulty: "Medium" },
        { title: "Best time to buy and Sell stock", link: "https://www.geeksforgeeks.org/problems/stock-buy-and-sell-1587115621/1", difficulty: "Medium" },
        { title: "Triplet Sum in Array", link: "https://www.geeksforgeeks.org/problems/triplet-sum-in-array-1587115621/1", difficulty: "Medium" },
        { title: "Trapping Rain Water", link: "https://www.geeksforgeeks.org/problems/trapping-rain-water-1587115621/1", difficulty: "Hard" },
        { title: "Chocolate Distribution Problem", link: "https://www.geeksforgeeks.org/problems/chocolate-distribution-problem3825/1", difficulty: "Easy" },
        { title: "Smallest subarray with sum greater than x", link: "https://www.geeksforgeeks.org/problems/smallest-subarray-with-sum-greater-than-x5651/1", difficulty: "Medium" },
        { title: "Three way partitioning", link: "https://www.geeksforgeeks.org/problems/three-way-partitioning/1", difficulty: "Easy" },
        { title: "Minimum swaps required to bring all elements less than or equal to k together", link: "https://www.geeksforgeeks.org/problems/minimum-swaps-required-to-bring-all-elements-less-than-or-equal-to-k-together4847/1", difficulty: "Medium" },
        { title: "Palindromic Array", link: "https://www.geeksforgeeks.org/problems/palindromic-array-1587115620/1", difficulty: "Easy" },
        { title: "Find the median", link: "https://www.geeksforgeeks.org/problems/find-the-median0527/1", difficulty: "Easy" },
        { title: "Median of 2 Sorted Arrays of Different Sizes", link: "https://www.geeksforgeeks.org/problems/median-of-2-sorted-arrays-of-different-sizes/1", difficulty: "Hard" }
      ]
    },
    {
      title: "Matrix",
      problems: [
        { title: "Spirally traversing a matrix", link: "https://www.geeksforgeeks.org/problems/spirally-traversing-a-matrix-1587115621/1", difficulty: "Medium" },
        { title: "Search in a matrix", link: "https://www.geeksforgeeks.org/problems/search-in-a-matrix-1587115621/1", difficulty: "Medium" },
        { title: "Median in a row-wise sorted matrix", link: "https://www.geeksforgeeks.org/problems/median-in-a-row-wise-sorted-matrix1527/1", difficulty: "Hard" },
        { title: "Row with max 1s", link: "https://www.geeksforgeeks.org/problems/row-with-max-1s0023/1", difficulty: "Medium" },
        { title: "Sorted matrix", link: "https://www.geeksforgeeks.org/problems/sorted-matrix2333/1", difficulty: "Easy" },
        { title: "Max rectangle", link: "https://www.geeksforgeeks.org/problems/max-rectangle/1", difficulty: "Hard" },
        { title: "Rotate by 90 degree", link: "https://www.geeksforgeeks.org/problems/rotate-by-90-degree0356/1", difficulty: "Medium" },
        { title: "Kth element in matrix", link: "https://www.geeksforgeeks.org/problems/kth-element-in-matrix/1", difficulty: "Medium" },
        { title: "Common elements in all rows", link: "https://www.geeksforgeeks.org/problems/common-elements1132/1", difficulty: "Medium" }
      ]
    },
    {
      title: "Strings",
      problems: [
        { title: "Reverse a String", link: "https://www.geeksforgeeks.org/problems/reverse-a-string/1", difficulty: "Easy" },
        { title: "Palindrome String", link: "https://www.geeksforgeeks.org/problems/palindrome-string0817/1", difficulty: "Easy" },
        { title: "Check if strings are rotations of each other or not", link: "https://www.geeksforgeeks.org/problems/check-if-strings-are-rotations-of-each-other-or-not-1587115620/1", difficulty: "Easy" },
        { title: "Count and Say", link: "https://www.geeksforgeeks.org/problems/decode-the-pattern1138/1", difficulty: "Medium" },
        { title: "Longest Palindrome in a String", link: "https://www.geeksforgeeks.org/problems/longest-palindrome-in-a-string3411/1", difficulty: "Medium" },
        { title: "Longest Repeating Subsequence", link: "https://www.geeksforgeeks.org/problems/longest-repeating-subsequence2004/1", difficulty: "Medium" },
        { title: "Print all subsequences of a string", link: "https://www.geeksforgeeks.org/problems/power-set4302/1", difficulty: "Medium" },
        { title: "Permutations of a given string", link: "https://www.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1", difficulty: "Medium" },
        { title: "Split the binary string into substrings with equal number of 0s and 1s", link: "https://www.geeksforgeeks.org/problems/split-the-binary-string-into-substrings-with-equal-number-of-0s-and-1s/1", difficulty: "Easy" },
        { title: "Word Wrap", link: "https://www.geeksforgeeks.org/problems/word-wrap1646/1", difficulty: "Hard" },
        { title: "Edit Distance", link: "https://www.geeksforgeeks.org/problems/edit-distance3702/1", difficulty: "Hard" },
        { title: "Next Permutation", link: "https://www.geeksforgeeks.org/problems/next-permutation5226/1", difficulty: "Medium" },
        { title: "Parenthesis Checker", link: "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1", difficulty: "Easy" },
        { title: "Word Break", link: "https://www.geeksforgeeks.org/problems/word-break1352/1", difficulty: "Medium" },
        { title: "Rabin-Karp Algorithm for Pattern Searching", link: "https://www.geeksforgeeks.org/problems/search-pattern-rabin-karp-algorithm--141631/1", difficulty: "Medium" },
        { title: "Longest Prefix Suffix", link: "https://www.geeksforgeeks.org/problems/longest-prefix-suffix2527/1", difficulty: "Medium" },
        { title: "Convert a sentence into its equivalent mobile numeric keypad sequence", link: "https://www.geeksforgeeks.org/problems/convert-a-sentence-into-its-equivalent-mobile-numeric-keypad-sequence0547/1", difficulty: "Easy" },
        { title: "Minimum Swaps for Bracket Balancing", link: "https://www.geeksforgeeks.org/problems/minimum-swaps-for-bracket-balancing2704/1", difficulty: "Easy" },
        { title: "Longest Common Subsequence", link: "https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1", difficulty: "Medium" },
        { title: "Smallest distant window", link: "https://www.geeksforgeeks.org/problems/smallest-distant-window3132/1", difficulty: "Medium" }
      ]
    },
    {
      title: "Searching and Sorting",
      problems: [
        { title: "First and last occurrences of x", link: "https://www.geeksforgeeks.org/problems/first-and-last-occurrences-of-x3116/1", difficulty: "Easy" },
        { title: "Value equal to index value", link: "https://www.geeksforgeeks.org/problems/value-equal-to-index-value1330/1", difficulty: "Easy" },
        { title: "Search in a rotated array", link: "https://www.geeksforgeeks.org/problems/search-in-a-rotated-array0959/1", difficulty: "Easy" },
        { title: "Count Squares", link: "https://www.geeksforgeeks.org/problems/count-squares3649/1", difficulty: "Easy" },
        { title: "Middle of Three", link: "https://www.geeksforgeeks.org/problems/middle-of-three2926/1", difficulty: "Easy" },
        { title: "Find missing and repeating", link: "https://www.geeksforgeeks.org/problems/find-missing-and-repeating2512/1", difficulty: "Medium" },
        { title: "Majority Element", link: "https://www.geeksforgeeks.org/problems/majority-element-1587115620/1", difficulty: "Medium" },
        { title: "Searching in an array where adjacent differ by at most k", link: "https://www.geeksforgeeks.org/problems/searching-in-an-array-where-adjacent-differ-by-at-most-k0456/1", difficulty: "Easy" },
        { title: "Find pair given difference", link: "https://www.geeksforgeeks.org/problems/find-pair-given-difference1559/1", difficulty: "Easy" },
        { title: "Find all four sum numbers", link: "https://www.geeksforgeeks.org/problems/find-all-four-sum-numbers1732/1", difficulty: "Medium" },
        { title: "Stickler Thief", link: "https://www.geeksforgeeks.org/problems/stickler-theif-1587115621/1", difficulty: "Medium" },
        { title: "Merge two sorted arrays", link: "https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays-1587115620/1", difficulty: "Hard" },
        { title: "Product array puzzle", link: "https://www.geeksforgeeks.org/problems/product-array-puzzle4525/1", difficulty: "Easy" },
        { title: "Sort by set bit count", link: "https://www.geeksforgeeks.org/problems/sort-by-set-bit-count1153/1", difficulty: "Easy" },
        { title: "Minimum Swaps to Sort", link: "https://www.geeksforgeeks.org/problems/minimum-swaps/1", difficulty: "Medium" },
        { title: "Bishu and Soldiers", link: "https://www.hackerearth.com/practice/algorithms/searching/binary-search/practice-problems/algorithm/rasta-and-kheshtak/", difficulty: "Easy" },
        { title: "K-th element of two sorted array", link: "https://www.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1", difficulty: "Medium" },
        { title: "Aggressive Cows", link: "https://www.geeksforgeeks.org/problems/aggressive-cows/1", difficulty: "Medium" },
        { title: "Allocate minimum number of pages", link: "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1", difficulty: "Hard" },
        { title: "The Painter's Partition Problem", link: "https://www.geeksforgeeks.org/problems/the-painters-partition-problem1535/1", difficulty: "Hard" }
      ]
    },
    {
      title: "LinkedList",
      problems: [
        { title: "Reverse a linked list", link: "https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1", difficulty: "Easy" },
        { title: "Reverse a linked list in groups of given size", link: "https://www.geeksforgeeks.org/problems/reverse-a-linked-list-in-groups-of-given-size/1", difficulty: "Medium" },
        { title: "Detect Loop in linked list", link: "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1", difficulty: "Easy" },
        { title: "Remove loop in linked list", link: "https://www.geeksforgeeks.org/problems/remove-loop-in-linked-list/1", difficulty: "Medium" },
        { title: "Find first node of loop in a linked list", link: "https://www.geeksforgeeks.org/problems/find-the-first-node-of-loop-in-linked-list--170645/1", difficulty: "Easy" },
        { title: "Remove duplicate element from sorted Linked List", link: "https://www.geeksforgeeks.org/problems/remove-duplicate-element-from-sorted-linked-list/1", difficulty: "Easy" },
        { title: "Remove duplicates from an unsorted linked list", link: "https://www.geeksforgeeks.org/problems/remove-duplicates-from-an-unsorted-linked-list/1", difficulty: "Easy" },
        { title: "Add 1 to a number represented as linked list", link: "https://www.geeksforgeeks.org/problems/add-1-to-a-number-represented-as-linked-list/1", difficulty: "Easy" },
        { title: "Add two numbers represented by linked lists", link: "https://www.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1", difficulty: "Medium" },
        { title: "Intersection of two sorted Linked Lists", link: "https://www.geeksforgeeks.org/problems/intersection-of-two-sorted-linked-lists/1", difficulty: "Easy" },
        { title: "Intersection Point in Y Shapped Linked Lists", link: "https://www.geeksforgeeks.org/problems/intersection-point-in-y-shapped-linked-lists/1", difficulty: "Medium" },
        { title: "Merge Sort for Linked List", link: "https://www.geeksforgeeks.org/problems/sort-a-linked-list/1", difficulty: "Medium" },
        { title: "Quick Sort on Linked List", link: "https://www.geeksforgeeks.org/problems/quick-sort-on-linked-list/1", difficulty: "Medium" },
        { title: "Middle of the Linked List", link: "https://www.geeksforgeeks.org/problems/finding-middle-element-in-a-linked-list/1", difficulty: "Easy" },
        { title: "Check if Linked List is Circular", link: "https://www.geeksforgeeks.org/problems/circular-linked-list/1", difficulty: "Easy" },
        { title: "Split a Circular Linked List into two halves", link: "https://www.geeksforgeeks.org/problems/split-a-circular-linked-list-into-two-halves/1", difficulty: "Easy" },
        { title: "Palindrome Linked List", link: "https://www.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1", difficulty: "Easy" },
        { title: "Reverse a Doubly Linked List", link: "https://www.geeksforgeeks.org/problems/reverse-a-doubly-linked-list/1", difficulty: "Easy" },
        { title: "Find pairs with given sum in doubly linked list", link: "https://www.geeksforgeeks.org/problems/find-pairs-with-given-sum-in-doubly-linked-list/1", difficulty: "Easy" },
        { title: "Flattening a Linked List", link: "https://www.geeksforgeeks.org/problems/flattening-a-linked-list/1", difficulty: "Hard" },
        { title: "Sort a linked list of 0s, 1s and 2s", link: "https://www.geeksforgeeks.org/problems/given-a-linked-list-of-0s-1s-and-2s-sort-it/1", difficulty: "Easy" },
        { title: "Clone a linked list with next and random pointer", link: "https://www.geeksforgeeks.org/problems/clone-a-linked-list-with-next-and-random-pointer/1", difficulty: "Hard" }
      ]
    },
    {
      title: "Bit Manipulation",
      problems: [
        { title: "Number of 1 Bits", link: "https://www.geeksforgeeks.org/problems/set-bits0143/1", difficulty: "Easy" },
        { title: "Non Repeating Numbers", link: "https://www.geeksforgeeks.org/problems/finding-the-numbers0215/1", difficulty: "Medium" },
        { title: "Bit Difference", link: "https://www.geeksforgeeks.org/problems/bit-difference-1587115620/1", difficulty: "Easy" },
        { title: "Count total set bits", link: "https://www.geeksforgeeks.org/problems/count-total-set-bits-1587115620/1", difficulty: "Medium" },
        { title: "Power of 2", link: "https://www.geeksforgeeks.org/problems/power-of-2-1587115620/1", difficulty: "Easy" },
        { title: "Find position of set bit", link: "https://www.geeksforgeeks.org/problems/find-position-of-set-bit3706/1", difficulty: "Easy" }
      ]
    },
    {
      title: "Greedy",
      problems: [
        { title: "N meetings in one room", link: "https://www.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1", difficulty: "Easy" },
        { title: "Job Sequencing Problem", link: "https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1", difficulty: "Medium" },
        { title: "Huffman Encoding", link: "https://www.geeksforgeeks.org/problems/huffman-encoding3345/1", difficulty: "Medium" },
        { title: "Water Connection Problem", link: "https://www.geeksforgeeks.org/problems/water-connection-problem5822/1", difficulty: "Medium" },
        { title: "Fractional Knapsack", link: "https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1", difficulty: "Medium" },
        { title: "Greedy Algorithm for Indian Coin Change", link: "https://www.geeksforgeeks.org/problems/choose-and-swap0531/1", difficulty: "Easy" },
        { title: "Maximum platforms", link: "https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1", difficulty: "Medium" },
        { title: "Shop in Candy Store", link: "https://www.geeksforgeeks.org/problems/shop-in-candy-store1145/1", difficulty: "Easy" },
        { title: "Maximize Sum after K Negations", link: "https://www.geeksforgeeks.org/problems/maximize-sum-after-k-negations1149/1", difficulty: "Easy" },
        { title: "Maximize arri*i of an Array", link: "https://www.geeksforgeeks.org/problems/maximize-arrii-of-an-array0026/1", difficulty: "Easy" }
      ]
    },
    {
      title: "Backtracking",
      problems: [
        { title: "Rat in a Maze Problem - I", link: "https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1", difficulty: "Medium" },
        { title: "N-Queen Problem", link: "https://www.geeksforgeeks.org/problems/n-queen-problem0315/1", difficulty: "Hard" },
        { title: "Word Break - Part 2", link: "https://www.geeksforgeeks.org/problems/word-break-part-23249/1", difficulty: "Hard" },
        { title: "Solve the Sudoku", link: "https://www.geeksforgeeks.org/problems/solve-the-sudoku-1587115621/1", difficulty: "Hard" },
        { title: "m Coloring Problem", link: "https://www.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1", difficulty: "Medium" },
        { title: "Subset Sum Problem", link: "https://www.geeksforgeeks.org/problems/subset-sum-problem2014/1", difficulty: "Medium" },
        { title: "Combination Sum", link: "https://www.geeksforgeeks.org/problems/combination-sum-1587115620/1", difficulty: "Medium" },
        { title: "Largest number in K swaps", link: "https://www.geeksforgeeks.org/problems/largest-number-in-k-swaps-1587115620/1", difficulty: "Hard" }
      ]
    },
    {
      title: "Dynamic Programming",
      problems: [
        { title: "Coin Change", link: "https://www.geeksforgeeks.org/problems/coin-change2448/1", difficulty: "Medium" },
        { title: "0 - 1 Knapsack Problem", link: "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1", difficulty: "Medium" },
        { title: "nCr", link: "https://www.geeksforgeeks.org/problems/ncr1019/1", difficulty: "Medium" },
        { title: "Matrix Chain Multiplication", link: "https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1", difficulty: "Hard" },
        { title: "Edit Distance", link: "https://www.geeksforgeeks.org/problems/edit-distance3702/1", difficulty: "Hard" },
        { title: "Friends Pairing Problem", link: "https://www.geeksforgeeks.org/problems/friends-pairing-problem5425/1", difficulty: "Easy" },
        { title: "Gold Mine Problem", link: "https://www.geeksforgeeks.org/problems/gold-mine-problem2608/1", difficulty: "Medium" },
        { title: "Painting the Fence", link: "https://www.geeksforgeeks.org/problems/painting-the-fence3727/1", difficulty: "Medium" },
        { title: "Longest Increasing Subsequence", link: "https://www.geeksforgeeks.org/problems/longest-increasing-subsequence-1587115620/1", difficulty: "Medium" },
        { title: "LCS of three strings", link: "https://www.geeksforgeeks.org/problems/lcs-of-three-strings0028/1", difficulty: "Medium" },
        { title: "Egg Dropping Puzzle", link: "https://www.geeksforgeeks.org/problems/egg-dropping-puzzle-1587115620/1", difficulty: "Medium" },
        { title: "Maximum length chain", link: "https://www.geeksforgeeks.org/problems/max-length-chain/1", difficulty: "Medium" },
        { title: "Largest square formed in a matrix", link: "https://www.geeksforgeeks.org/problems/largest-square-formed-in-a-matrix0806/1", difficulty: "Medium" }
      ]
    },
    {
      title: "Stacks and Queues",
      problems: [
        { title: "Implement stack using array", link: "https://www.geeksforgeeks.org/problems/implement-stack-using-array/1", difficulty: "Easy" },
        { title: "Implement queue using array", link: "https://www.geeksforgeeks.org/problems/implement-queue-using-array/1", difficulty: "Easy" },
        { title: "Parenthesis Checker", link: "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1", difficulty: "Easy" },
        { title: "Reverse a string using Stack", link: "https://www.geeksforgeeks.org/problems/reverse-a-string-using-stack/1", difficulty: "Easy" },
        { title: "Special Stack", link: "https://www.geeksforgeeks.org/problems/special-stack/1", difficulty: "Easy" },
        { title: "Next Larger Element", link: "https://www.geeksforgeeks.org/problems/next-larger-element-1587115620/1", difficulty: "Medium" },
        { title: "The Celebrity Problem", link: "https://www.geeksforgeeks.org/problems/the-celebrity-problem/1", difficulty: "Medium" },
        { title: "Evaluation of Postfix Expression", link: "https://www.geeksforgeeks.org/problems/evaluation-of-postfix-expression1735/1", difficulty: "Easy" },
        { title: "Overlapping Intervals", link: "https://www.geeksforgeeks.org/problems/overlapping-intervals/0", difficulty: "Medium" },
        { title: "Maximum Rectangular Area in a Histogram", link: "https://www.geeksforgeeks.org/problems/maximum-rectangular-area-in-a-histogram-1587115620/1", difficulty: "Hard" }
      ]
    },
    {
      title: "Binary Trees",
      problems: [
        { title: "Level order traversal", link: "https://www.geeksforgeeks.org/problems/level-order-traversal/1", difficulty: "Easy" },
        { title: "Reverse Level Order Traversal", link: "https://www.geeksforgeeks.org/problems/reverse-level-order-traversal/1", difficulty: "Easy" },
        { title: "Height of Binary Tree", link: "https://www.geeksforgeeks.org/problems/height-of-binary-tree/1", difficulty: "Easy" },
        { title: "Diameter of Binary Tree", link: "https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1", difficulty: "Medium" },
        { title: "Mirror Tree", link: "https://www.geeksforgeeks.org/problems/mirror-tree/1", difficulty: "Easy" },
        { title: "Left View of Binary Tree", link: "https://www.geeksforgeeks.org/problems/left-view-of-binary-tree/1", difficulty: "Easy" },
        { title: "Right View of Binary Tree", link: "https://www.geeksforgeeks.org/problems/right-view-of-binary-tree/1", difficulty: "Easy" },
        { title: "Top View of Binary Tree", link: "https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1", difficulty: "Medium" },
        { title: "Bottom View of Binary Tree", link: "https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1", difficulty: "Medium" },
        { title: "ZigZag Tree Traversal", link: "https://www.geeksforgeeks.org/problems/zigzag-tree-traversal/1", difficulty: "Medium" }
      ]
    },
    {
      title: "Binary Search Tree",
      problems: [
        { title: "Search a node in BST", link: "https://www.geeksforgeeks.org/dsa/binary-search-tree-set-1-search-and-insertion/", difficulty: "Easy" },
        { title: "Delete a node from BST", link: "https://www.geeksforgeeks.org/problems/delete-a-node-from-bst/1", difficulty: "Medium" },
        { title: "Minimum element in BST", link: "https://www.geeksforgeeks.org/problems/minimum-element-in-bst/1", difficulty: "Easy" },
        { title: "Check for BST", link: "https://www.geeksforgeeks.org/problems/check-for-bst/1", difficulty: "Easy" },
        { title: "Lowest Common Ancestor in a BST", link: "https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-bst/1", difficulty: "Easy" }
      ]
    },
    {
      title: "Graphs",
      problems: [
        { title: "BFS traversal of graph", link: "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1", difficulty: "Easy" },
        { title: "DFS traversal of graph", link: "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1", difficulty: "Medium" },
        { title: "Detect cycle in an undirected graph", link: "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1", difficulty: "Medium" },
        { title: "Rat in a Maze Problem - I", link: "https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1", difficulty: "Medium" },
        { title: "Steps by Knight", link: "https://www.geeksforgeeks.org/problems/steps-by-knight5927/1", difficulty: "Medium" }
      ]
    },
    {
      title: "Heap",
      problems: [
        { title: "Heap Sort", link: "https://www.geeksforgeeks.org/problems/heap-sort/1", difficulty: "Medium" },
        { title: "K largest elements", link: "https://www.geeksforgeeks.org/problems/k-largest-elements4206/1", difficulty: "Medium" },
        { title: "Kth smallest element", link: "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1", difficulty: "Medium" }
      ]
    },
    {
      title: "Trie",
      problems: [
        { title: "Trie | (Insert and Search)", link: "https://www.geeksforgeeks.org/dsa/trie-insert-and-search/", difficulty: "Medium" },
        { title: "Shortest Unique Prefix", link: "https://www.geeksforgeeks.org/problems/shortest-unique-prefix-for-every-word/1", difficulty: "Hard" },
        { title: "Phone directory", link: "https://www.geeksforgeeks.org/problems/phone-directory4628/1", difficulty: "Hard" }
      ]
    }
  ]
};

const seedLoveBabbar = async () => {
  await connectDB();
  await DSASheet.findOneAndUpdate(
    { slug: loveBabbarData.slug },
    loveBabbarData,
    { upsert: true, new: true }
  );
  console.log('Love Babbar Sheet Seeded');
};

module.exports = seedLoveBabbar;