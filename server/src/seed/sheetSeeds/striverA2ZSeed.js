const DSASheet = require('../../models/sheets.model');
const connectDB = require('../seedConfig');

const striverA2ZData = {
  name: "Striver A2Z DSA Sheet",
  slug: "striver-a2z",
  description: "A comprehensive DSA path by Striver (Placeholder).",
  topics: [
    {
      title: "Basics – Things to Know in C++/Java/Python",
      problems: [
        { title: "User Input / Output", link: "https://takeuforward.org/c/user-input-output/", difficulty: "Easy", tags: ["basics"] },
        { title: "Data Types", link: "https://takeuforward.org/c/data-types-in-cpp/", difficulty: "Easy", tags: ["basics"] },
        { title: "If Else Statements", link: "https://takeuforward.org/c/if-else-statements/", difficulty: "Easy", tags: ["basics"] },
        { title: "Switch Statement", link: "https://takeuforward.org/c/switch-statement/", difficulty: "Easy", tags: ["basics"] },
        { title: "Arrays and Strings", link: "https://takeuforward.org/c/arrays-and-strings/", difficulty: "Easy", tags: ["basics", "array"] },
        { title: "For Loops", link: "https://takeuforward.org/c/for-loops/", difficulty: "Easy", tags: ["basics"] },
        { title: "While Loops", link: "https://takeuforward.org/c/while-loops/", difficulty: "Easy", tags: ["basics"] },
        { title: "Functions (Pass by Value, Pass by Reference)", link: "https://takeuforward.org/c/functions/", difficulty: "Easy", tags: ["basics"] },
        { title: "Time Complexity (Big O Notation)", link: "https://takeuforward.org/c/time-complexity/", difficulty: "Easy", tags: ["basics"] },
      ]
    },
    {
      title: "Basics – Build-up Mathematical Thinking",
      problems: [
        { title: "Count Digits", link: "https://takeuforward.org/maths/count-digits-in-a-number/", difficulty: "Easy", tags: ["math"] },
        { title: "Reverse a Number", link: "https://takeuforward.org/maths/reverse-a-number/", difficulty: "Easy", tags: ["math"] },
        { title: "Check Palindrome Number", link: "https://takeuforward.org/maths/check-palindrome/", difficulty: "Easy", tags: ["math"] },
        { title: "GCD / HCF of Two Numbers", link: "https://takeuforward.org/maths/find-gcd-of-two-numbers/", difficulty: "Easy", tags: ["math"] },
        { title: "Armstrong Numbers", link: "https://takeuforward.org/maths/check-if-a-number-is-armstrong-number-or-not/", difficulty: "Easy", tags: ["math"] },
        { title: "Print all Divisors", link: "https://takeuforward.org/maths/print-all-divisors-of-a-number/", difficulty: "Easy", tags: ["math"] },
        { title: "Check for Prime", link: "https://takeuforward.org/maths/check-whether-the-given-number-is-prime/", difficulty: "Easy", tags: ["math"] },
      ]
    },
    {
      title: "Basics – Learn STL / Collections",
      problems: [
        { title: "C++ STL", link: "https://takeuforward.org/c/c-stl/", difficulty: "Easy", tags: ["stl"] },
        { title: "Java Collections", link: "https://takeuforward.org/java/java-collections/", difficulty: "Easy", tags: ["stl"] },
        { title: "Python Collections", link: "https://takeuforward.org/python/python-collections/", difficulty: "Easy", tags: ["stl"] },
      ]
    },
    {
      title: "Basics – Basic Recursion",
      problems: [
        { title: "Print 1 to N using Recursion", link: "https://takeuforward.org/recursion/print-1-to-n-using-recursion/", difficulty: "Easy", tags: ["recursion"] },
        { title: "Print N to 1 using Recursion", link: "https://takeuforward.org/recursion/print-n-to-1-using-recursion/", difficulty: "Easy", tags: ["recursion"] },
        { title: "Print Name N Times using Recursion", link: "https://takeuforward.org/recursion/print-name-n-times-using-recursion/", difficulty: "Easy", tags: ["recursion"] },
        { title: "Sum of first N numbers", link: "https://takeuforward.org/recursion/sum-of-first-n-numbers/", difficulty: "Easy", tags: ["recursion", "math"] },
        { title: "Factorial of N", link: "https://takeuforward.org/recursion/factorial-of-a-number-iterative-and-recursive/", difficulty: "Easy", tags: ["recursion", "math"] },
        { title: "Reverse an Array", link: "https://takeuforward.org/recursion/reverse-a-given-array/", difficulty: "Easy", tags: ["recursion", "array"] },
        { title: "Check if String is Palindrome", link: "https://takeuforward.org/recursion/check-if-the-given-string-is-palindrome-or-not/", difficulty: "Easy", tags: ["recursion", "string"] },
        { title: "Fibonacci Number", link: "https://takeuforward.org/recursion/fibonacci-series-using-recursion/", difficulty: "Easy", tags: ["recursion", "math"] },
        { title: "Multiple Recursion Calls", link: "https://takeuforward.org/recursion/multiple-recursion-calls/", difficulty: "Easy", tags: ["recursion"] },
      ]
    },
    {
      title: "Basics – Basic Hashing",
      problems: [
        { title: "Counting Frequencies of Array Elements", link: "https://takeuforward.org/hashing/counting-frequencies-of-array-elements/", difficulty: "Easy", tags: ["hashing", "array"] },
        { title: "Find the Highest/Lowest Frequency Element", link: "https://takeuforward.org/hashing/find-the-highest-lowest-frequency-element/", difficulty: "Easy", tags: ["hashing", "array"] },
      ]
    },
    {
      title: "Step 2.1 – Sorting-I",
      problems: [
        { title: "Selection Sort", link: "https://takeuforward.org/sorting/selection-sort-algorithm/", difficulty: "Easy", tags: ["sorting"] },
        { title: "Bubble Sort", link: "https://takeuforward.org/sorting/bubble-sort-algorithm/", difficulty: "Easy", tags: ["sorting"] },
        { title: "Insertion Sort", link: "https://takeuforward.org/sorting/insertion-sort-algorithm/", difficulty: "Easy", tags: ["sorting"] },
      ]
    },
    {
      title: "Step 2.2 – Sorting-II",
      problems: [
        { title: "Merge Sort", link: "https://takeuforward.org/sorting/merge-sort-algorithm/", difficulty: "Medium", tags: ["sorting", "divide-and-conquer"] },
        { title: "Quick Sort", link: "https://takeuforward.org/sorting/quick-sort-algorithm/", difficulty: "Medium", tags: ["sorting", "divide-and-conquer"] },
        { title: "Recursive Bubble Sort", link: "https://takeuforward.org/sorting/recursive-bubble-sort-algorithm/", difficulty: "Easy", tags: ["sorting", "recursion"] },
        { title: "Recursive Insertion Sort", link: "https://takeuforward.org/sorting/recursive-insertion-sort-algorithm/", difficulty: "Easy", tags: ["sorting", "recursion"] },
      ]
    },
    {
      title: "Array – Easy Array Problems",
      problems: [
        { title: "Largest Element in an Array", link: "https://takeuforward.org/arrays/find-the-largest-element-in-an-array/", difficulty: "Easy", tags: ["array"] },
        { title: "Second Largest Element in an Array", link: "https://takeuforward.org/arrays/find-second-largest-element-in-an-array/", difficulty: "Easy", tags: ["array"] },
        { title: "Check if Array is Sorted", link: "https://takeuforward.org/arrays/check-if-array-is-sorted/", difficulty: "Easy", tags: ["array"] },
        { title: "Remove Duplicates from Sorted Array", link: "https://takeuforward.org/arrays/remove-duplicates-in-place-from-sorted-array/", difficulty: "Easy", tags: ["array", "two-pointers"] },
        { title: "Left Rotate an Array by One Place", link: "https://takeuforward.org/arrays/left-rotate-the-array-by-one/", difficulty: "Easy", tags: ["array"] },
        { title: "Left Rotate an Array by D Places", link: "https://takeuforward.org/arrays/left-rotate-the-array-by-d-elements/", difficulty: "Easy", tags: ["array"] },
        { title: "Move Zeros to End", link: "https://takeuforward.org/arrays/move-all-zeros-to-the-end-of-the-array/", difficulty: "Easy", tags: ["array", "two-pointers"] },
        { title: "Linear Search", link: "https://takeuforward.org/arrays/linear-search-in-an-array/", difficulty: "Easy", tags: ["array", "searching"] },
        { title: "Union of Two Sorted Arrays", link: "https://takeuforward.org/arrays/union-of-two-sorted-arrays/", difficulty: "Easy", tags: ["array", "two-pointers"] },
        { title: "Find Missing Number in Array", link: "https://takeuforward.org/arrays/find-the-missing-number-in-an-array/", difficulty: "Easy", tags: ["array", "math"] },
        { title: "Maximum Consecutive Ones", link: "https://takeuforward.org/arrays/count-maximum-consecutive-ones-in-the-array/", difficulty: "Easy", tags: ["array"] },
        { title: "Find the number that appears once (others appear twice)", link: "https://takeuforward.org/arrays/find-the-number-that-appears-once-and-the-other-numbers-twice/", difficulty: "Easy", tags: ["array", "bit-manipulation"] },
        { title: "Longest Subarray with given Sum K (Positives)", link: "https://takeuforward.org/arrays/longest-subarray-with-sum-k/", difficulty: "Easy", tags: ["array", "hashing"] },
        { title: "Longest Subarray with given Sum K (Positives + Negatives)", link: "https://takeuforward.org/arrays/longest-subarray-with-sum-k-positives-and-negatives/", difficulty: "Easy", tags: ["array", "hashing"] },
      ]
    },
    {
      title: "Array – Medium Array Problems",
      problems: [
        { title: "Two Sum", link: "https://takeuforward.org/arrays/two-sum-check-if-a-pair-with-given-sum-exists-in-array/", difficulty: "Medium", tags: ["array", "hashing"] },
        { title: "Sort an array of 0s, 1s and 2s", link: "https://takeuforward.org/arrays/sort-an-array-of-0s-1s-and-2s/", difficulty: "Medium", tags: ["array", "two-pointers"] },
        { title: "Majority Element (>n/2 times)", link: "https://takeuforward.org/arrays/find-the-majority-element-that-occurs-more-than-n-2-times/", difficulty: "Medium", tags: ["array", "boyer-moore"] },
        { title: "Kadane's Algorithm – Maximum Subarray Sum", link: "https://takeuforward.org/arrays/maximum-subarray-sum-in-an-array/", difficulty: "Medium", tags: ["array", "dp"] },
        { title: "Stock Buy and Sell", link: "https://takeuforward.org/arrays/stock-buy-and-sell/", difficulty: "Easy", tags: ["array", "greedy"] },
        { title: "Rearrange Array Elements by Sign", link: "https://takeuforward.org/arrays/rearrange-array-elements-by-sign/", difficulty: "Medium", tags: ["array"] },
        { title: "Next Permutation", link: "https://takeuforward.org/arrays/next_permutation-find-next-lexicographically-greater-permutation/", difficulty: "Medium", tags: ["array", "math"] },
        { title: "Leaders in an Array", link: "https://takeuforward.org/arrays/leaders-in-an-array-problem/", difficulty: "Medium", tags: ["array"] },
        { title: "Longest Consecutive Sequence", link: "https://takeuforward.org/arrays/longest-consecutive-sequence-in-an-array/", difficulty: "Medium", tags: ["array", "hashing"] },
        { title: "Set Matrix Zeros", link: "https://takeuforward.org/arrays/set-matrix-zero/", difficulty: "Medium", tags: ["array", "matrix"] },
        { title: "Rotate Matrix by 90 degrees", link: "https://takeuforward.org/arrays/rotate-image-by-90-degree/", difficulty: "Medium", tags: ["array", "matrix"] },
        { title: "Spiral Traversal of Matrix", link: "https://takeuforward.org/arrays/spiral-traversal-of-matrix/", difficulty: "Medium", tags: ["array", "matrix"] },
        { title: "Count Subarrays with given Sum", link: "https://takeuforward.org/arrays/count-subarray-sum-equals-k/", difficulty: "Medium", tags: ["array", "hashing", "prefix-sum"] },
      ]
    },
    {
      title: "Array – Hard Array Problems",
      problems: [
        { title: "Pascal's Triangle", link: "https://takeuforward.org/arrays/program-to-generate-pascals-triangle/", difficulty: "Medium", tags: ["array", "math"] },
        { title: "Majority Element (n/3 times)", link: "https://takeuforward.org/arrays/majority-elementsn-3-times-find-the-elements-that-appears-more-than-n-3-times-in-the-array/", difficulty: "Hard", tags: ["array", "boyer-moore"] },
        { title: "3Sum", link: "https://takeuforward.org/arrays/3-sum-find-triplets-that-add-up-to-a-zero/", difficulty: "Medium", tags: ["array", "two-pointers", "sorting"] },
        { title: "4Sum", link: "https://takeuforward.org/arrays/4-sum-find-quads-that-add-up-to-a-target-value/", difficulty: "Hard", tags: ["array", "two-pointers", "sorting"] },
        { title: "Largest Subarray with 0 Sum", link: "https://takeuforward.org/arrays/largest-subarray-with-0-sum/", difficulty: "Medium", tags: ["array", "hashing"] },
        { title: "Count number of subarrays with given XOR K", link: "https://takeuforward.org/arrays/count-the-number-of-subarrays-with-given-xor-k/", difficulty: "Hard", tags: ["array", "hashing", "bit-manipulation"] },
        { title: "Merge Overlapping Subintervals", link: "https://takeuforward.org/arrays/merge-overlapping-sub-intervals/", difficulty: "Medium", tags: ["array", "sorting"] },
        { title: "Merge Two Sorted Arrays Without Extra Space", link: "https://takeuforward.org/arrays/merge-two-sorted-arrays-without-extra-space/", difficulty: "Hard", tags: ["array", "two-pointers"] },
        { title: "Find the Repeating and Missing Number", link: "https://takeuforward.org/arrays/find-the-repeating-and-missing-numbers/", difficulty: "Hard", tags: ["array", "math"] },
        { title: "Count Inversions in an Array", link: "https://takeuforward.org/arrays/count-inversions-in-an-array/", difficulty: "Hard", tags: ["array", "merge-sort"] },
        { title: "Reverse Pairs", link: "https://takeuforward.org/arrays/count-reverse-pairs/", difficulty: "Hard", tags: ["array", "merge-sort"] },
        { title: "Maximum Product Subarray", link: "https://takeuforward.org/arrays/maximum-product-subarray-in-an-array/", difficulty: "Medium", tags: ["array", "dp"] },
      ]
    },
    {
      title: "Binary Search – Binary Search on 1D Arrays",
      problems: [
        { title: "Binary Search to find X in sorted array", link: "https://takeuforward.org/binary-search/binary-search-to-find-x-in-sorted-array/", difficulty: "Easy", tags: ["binary-search", "array"] },
        { title: "Implement Lower Bound", link: "https://takeuforward.org/binary-search/implement-lower-bound/", difficulty: "Easy", tags: ["binary-search", "array"] },
        { title: "Implement Upper Bound", link: "https://takeuforward.org/binary-search/implement-upper-bound/", difficulty: "Easy", tags: ["binary-search", "array"] },
        { title: "Search Insert Position", link: "https://takeuforward.org/binary-search/search-insert-position/", difficulty: "Easy", tags: ["binary-search", "array"] },
        { title: "Floor/Ceil in Sorted Array", link: "https://takeuforward.org/binary-search/floor-and-ceil-in-sorted-array/", difficulty: "Easy", tags: ["binary-search", "array"] },
        { title: "Find the First or Last Occurrence of a Given Number", link: "https://takeuforward.org/binary-search/first-and-last-occurrences-in-array/", difficulty: "Easy", tags: ["binary-search", "array"] },
        { title: "Count Occurrences in Sorted Array", link: "https://takeuforward.org/binary-search/count-occurrences-in-sorted-array/", difficulty: "Easy", tags: ["binary-search", "array"] },
        { title: "Search in Rotated Sorted Array I", link: "https://takeuforward.org/binary-search/search-element-in-a-rotated-sorted-array/", difficulty: "Medium", tags: ["binary-search", "array"] },
        { title: "Search in Rotated Sorted Array II", link: "https://takeuforward.org/binary-search/search-element-in-rotated-sorted-array-ii/", difficulty: "Medium", tags: ["binary-search", "array"] },
        { title: "Find Minimum in Rotated Sorted Array", link: "https://takeuforward.org/binary-search/minimum-in-rotated-sorted-array/", difficulty: "Medium", tags: ["binary-search", "array"] },
        { title: "Find out how many times array has been rotated", link: "https://takeuforward.org/binary-search/find-out-how-many-times-array-has-been-rotated/", difficulty: "Easy", tags: ["binary-search", "array"] },
        { title: "Single Element in a Sorted Array", link: "https://takeuforward.org/binary-search/single-element-in-a-sorted-array/", difficulty: "Medium", tags: ["binary-search", "array"] },
        { title: "Find Peak Element", link: "https://takeuforward.org/binary-search/peak-element-in-array/", difficulty: "Medium", tags: ["binary-search", "array"] },
      ]
    },
    {
      title: "Binary Search – Binary Search on Answers",
      problems: [
        { title: "Find Square Root of a Number in Log N", link: "https://takeuforward.org/binary-search/finding-sqrt-of-a-number-using-binary-search/", difficulty: "Easy", tags: ["binary-search", "math"] },
        { title: "Find the Nth Root of a Number", link: "https://takeuforward.org/binary-search/nth-root-of-a-number-using-binary-search/", difficulty: "Easy", tags: ["binary-search", "math"] },
        { title: "Koko Eating Bananas", link: "https://takeuforward.org/binary-search/koko-eating-bananas/", difficulty: "Medium", tags: ["binary-search"] },
        { title: "Minimum Number of Days to Make m Bouquets", link: "https://takeuforward.org/binary-search/minimum-days-to-make-m-bouquets/", difficulty: "Medium", tags: ["binary-search"] },
        { title: "Find the Smallest Divisor", link: "https://takeuforward.org/binary-search/find-the-smallest-divisor-given-a-threshold/", difficulty: "Medium", tags: ["binary-search"] },
        { title: "Capacity to Ship Packages within D Days", link: "https://takeuforward.org/binary-search/capacity-to-ship-packages-within-d-days/", difficulty: "Medium", tags: ["binary-search"] },
        { title: "Kth Missing Positive Number", link: "https://takeuforward.org/binary-search/kth-missing-positive-number/", difficulty: "Easy", tags: ["binary-search", "array"] },
        { title: "Aggressive Cows", link: "https://takeuforward.org/binary-search/aggressive-cows/", difficulty: "Hard", tags: ["binary-search", "greedy"] },
        { title: "Book Allocation Problem", link: "https://takeuforward.org/binary-search/allocate-minimum-number-of-pages/", difficulty: "Hard", tags: ["binary-search", "greedy"] },
        { title: "Split Array – Largest Sum", link: "https://takeuforward.org/binary-search/split-array-largest-sum/", difficulty: "Hard", tags: ["binary-search"] },
        { title: "Painter's Partition", link: "https://takeuforward.org/binary-search/painters-partition-problem/", difficulty: "Hard", tags: ["binary-search"] },
        { title: "Minimize Max Distance to Gas Station", link: "https://takeuforward.org/binary-search/minimize-the-maximum-distance-between-gas-stations/", difficulty: "Hard", tags: ["binary-search", "greedy"] },
        { title: "Median of Two Sorted Arrays", link: "https://takeuforward.org/binary-search/median-of-two-sorted-arrays/", difficulty: "Hard", tags: ["binary-search", "array"] },
        { title: "Kth Element of Two Sorted Arrays", link: "https://takeuforward.org/binary-search/kth-element-of-two-sorted-arrays/", difficulty: "Hard", tags: ["binary-search", "array"] },
      ]
    },
    {
      title: "Binary Search – Binary Search on 2D Arrays",
      problems: [
        { title: "Find the row with maximum number of 1s", link: "https://takeuforward.org/binary-search/find-the-row-with-maximum-number-of-1s/", difficulty: "Easy", tags: ["binary-search", "matrix"] },
        { title: "Search in a 2D Matrix", link: "https://takeuforward.org/binary-search/search-in-a-2d-matrix/", difficulty: "Medium", tags: ["binary-search", "matrix"] },
        { title: "Search in a 2D Matrix II", link: "https://takeuforward.org/binary-search/search-in-a-sorted-2d-matrix-ii/", difficulty: "Medium", tags: ["binary-search", "matrix"] },
        { title: "Find Peak Element (2D Matrix)", link: "https://takeuforward.org/binary-search/peak-element-in-2d-matrix/", difficulty: "Hard", tags: ["binary-search", "matrix"] },
        { title: "Matrix Median", link: "https://takeuforward.org/binary-search/median-in-a-row-wise-sorted-matrix/", difficulty: "Hard", tags: ["binary-search", "matrix"] },
      ]
    },
    {
      title: "Strings – Basic String Problems",
      problems: [
        { title: "Remove Outermost Parentheses", link: "https://takeuforward.org/string/remove-outermost-parentheses/", difficulty: "Easy", tags: ["string", "stack"] },
        { title: "Reverse Words in a String", link: "https://takeuforward.org/string/reverse-words-in-a-string/", difficulty: "Medium", tags: ["string", "two-pointers"] },
        { title: "Largest Odd Number in a String", link: "https://takeuforward.org/string/largest-odd-number-in-string/", difficulty: "Easy", tags: ["string", "math"] },
        { title: "Longest Common Prefix", link: "https://takeuforward.org/string/longest-common-prefix-in-an-array-of-strings/", difficulty: "Easy", tags: ["string"] },
        { title: "Isomorphic Strings", link: "https://takeuforward.org/string/isomorphic-strings/", difficulty: "Easy", tags: ["string", "hashing"] },
        { title: "Check whether one string is a rotation of another", link: "https://takeuforward.org/string/check-if-strings-are-rotations-of-each-other-or-not/", difficulty: "Easy", tags: ["string"] },
        { title: "Check if two Strings are anagram of each other", link: "https://takeuforward.org/string/valid-anagram/", difficulty: "Easy", tags: ["string", "hashing"] },
      ]
    },
    {
      title: "Strings – Medium String Problems",
      problems: [
        { title: "Sort Characters by Frequency", link: "https://takeuforward.org/string/sort-characters-by-frequency/", difficulty: "Medium", tags: ["string", "hashing", "sorting"] },
        { title: "Maximum Nesting Depth of Parentheses", link: "https://takeuforward.org/string/maximum-nesting-depth-of-parentheses/", difficulty: "Easy", tags: ["string", "stack"] },
        { title: "Roman Number to Integer and vice versa", link: "https://takeuforward.org/string/roman-number-to-integer-and-vice-versa/", difficulty: "Medium", tags: ["string", "math"] },
        { title: "Implement Atoi", link: "https://takeuforward.org/string/implement-atoi/", difficulty: "Medium", tags: ["string", "math"] },
        { title: "Count Number of Substrings", link: "https://takeuforward.org/string/count-number-of-substrings/", difficulty: "Medium", tags: ["string"] },
        { title: "Longest Palindromic Substring", link: "https://takeuforward.org/string/longest-palindromic-substring/", difficulty: "Medium", tags: ["string", "dp"] },
        { title: "Sum of Beauty of All Substrings", link: "https://takeuforward.org/string/sum-of-beauty-of-all-substrings/", difficulty: "Medium", tags: ["string", "hashing"] },
        { title: "Minimum number of bracket reversals needed", link: "https://takeuforward.org/string/minimum-number-of-bracket-reversals-needed-to-make-an-expression-balanced/", difficulty: "Hard", tags: ["string", "stack"] },
      ]
    },
    {
      title: "Strings – Hard String Problems",
      problems: [
        { title: "Count and Say", link: "https://takeuforward.org/string/count-and-say/", difficulty: "Medium", tags: ["string"] },
        { title: "Hashing in Strings (Rabin-Karp Algorithm)", link: "https://takeuforward.org/string/rabin-karp-algorithm/", difficulty: "Hard", tags: ["string", "hashing"] },
        { title: "Z-Function", link: "https://takeuforward.org/string/z-function/", difficulty: "Hard", tags: ["string"] },
        { title: "KMP Algorithm / LPS (pi) array", link: "https://takeuforward.org/string/kmp-algorithm/", difficulty: "Hard", tags: ["string"] },
        { title: "Minimum Characters needed to be Inserted in the Beginning", link: "https://takeuforward.org/string/minimum-characters-to-be-added-at-front-to-make-string-palindrome/", difficulty: "Hard", tags: ["string", "kmp"] },
        { title: "Shortest Palindrome", link: "https://takeuforward.org/string/shortest-palindrome/", difficulty: "Hard", tags: ["string", "kmp"] },
        { title: "Longest Happy Prefix", link: "https://takeuforward.org/string/longest-happy-prefix/", difficulty: "Hard", tags: ["string", "kmp"] },
        { title: "Count palindromes", link: "https://takeuforward.org/string/count-palindromes/", difficulty: "Hard", tags: ["string", "dp"] },

      ]
    },
    {
      title: "Linked List – Learning Linked List",
      problems: [
        { title: "Introduction to LinkedList, learn about struct, and how is a linked list formed", link: "https://takeuforward.org/linked-list/introduction-to-linked-list/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Inserting a node in LinkedList", link: "https://takeuforward.org/linked-list/inserting-a-node-in-a-linked-list/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Deleting a node in LinkedList", link: "https://takeuforward.org/linked-list/deleting-a-node-in-linked-list/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Find the length of the LinkedList", link: "https://takeuforward.org/linked-list/find-the-length-of-a-linked-list/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Search an element in the LinkedList", link: "https://takeuforward.org/linked-list/search-an-element-in-the-linked-list/", difficulty: "Easy", tags: ["linked-list"] },
      ]
    },
    {
      title: "Linked List – Learn Doubly LinkedList",
      problems: [
        { title: "Introduction to DLL, learn about struct, and how is a DLL formed", link: "https://takeuforward.org/linked-list/introduction-to-doubly-linked-list/", difficulty: "Easy", tags: ["linked-list", "doubly-linked-list"] },
        { title: "Insert a node in DLL", link: "https://takeuforward.org/linked-list/insert-a-node-in-doubly-linked-list/", difficulty: "Easy", tags: ["linked-list", "doubly-linked-list"] },
        { title: "Delete a node in DLL", link: "https://takeuforward.org/linked-list/delete-a-node-in-doubly-linked-list/", difficulty: "Easy", tags: ["linked-list", "doubly-linked-list"] },
        { title: "Reverse a DLL", link: "https://takeuforward.org/linked-list/reverse-a-doubly-linked-list/", difficulty: "Easy", tags: ["linked-list", "doubly-linked-list"] },
      ]
    },
    {
      title: "Linked List – Medium Problems of LL",
      problems: [
        { title: "Middle of a LinkedList", link: "https://takeuforward.org/linked-list/find-middle-of-linked-list/", difficulty: "Easy", tags: ["linked-list", "slow-fast-pointer"] },
        { title: "Reverse a LinkedList", link: "https://takeuforward.org/linked-list/reverse-a-linked-list/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Detect a loop in LL", link: "https://takeuforward.org/linked-list/detect-a-cycle-in-a-linked-list/", difficulty: "Easy", tags: ["linked-list", "slow-fast-pointer"] },
        { title: "Find the starting point of the Loop of LinkedList", link: "https://takeuforward.org/linked-list/starting-point-of-loop-in-a-linked-list/", difficulty: "Medium", tags: ["linked-list", "slow-fast-pointer"] },
        { title: "Length of Loop in LinkedList", link: "https://takeuforward.org/linked-list/length-of-loop-in-linked-list/", difficulty: "Easy", tags: ["linked-list", "slow-fast-pointer"] },
        { title: "Check if LL is Palindrome or not", link: "https://takeuforward.org/linked-list/check-if-linked-list-is-palindrome/", difficulty: "Medium", tags: ["linked-list", "slow-fast-pointer"] },
        { title: "Segregate odd and even nodes in LL", link: "https://takeuforward.org/linked-list/odd-even-linked-list/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "Remove Nth node from the back of the LL", link: "https://takeuforward.org/linked-list/remove-nth-node-from-back-of-linked-list/", difficulty: "Medium", tags: ["linked-list", "two-pointers"] },
        { title: "Delete the middle node of LL", link: "https://takeuforward.org/linked-list/delete-middle-node-of-linked-list/", difficulty: "Medium", tags: ["linked-list", "slow-fast-pointer"] },
        { title: "Sort LL", link: "https://takeuforward.org/linked-list/sort-linked-list/", difficulty: "Medium", tags: ["linked-list", "merge-sort"] },
        { title: "Sort a LL of 0s, 1s and 2s", link: "https://takeuforward.org/linked-list/sort-linked-list-of-0s-1s-2s/", difficulty: "Easy", tags: ["linked-list"] },
        { title: "Find the intersection point of Y LinkedList", link: "https://takeuforward.org/linked-list/find-intersection-of-two-linked-lists/", difficulty: "Easy", tags: ["linked-list", "two-pointers"] },
        { title: "Add 1 to a number represented by LL", link: "https://takeuforward.org/linked-list/add-1-to-a-number-represented-as-linked-list/", difficulty: "Medium", tags: ["linked-list", "math"] },
        { title: "Add two numbers in LL", link: "https://takeuforward.org/linked-list/add-two-numbers-as-linked-lists/", difficulty: "Medium", tags: ["linked-list", "math"] },
      ]
    },
    {
      title: "Linked List – Hard Problems of LL",
      problems: [
        { title: "Reverse LL in group of given size K", link: "https://takeuforward.org/linked-list/reverse-linked-list-in-groups-of-size-k/", difficulty: "Hard", tags: ["linked-list", "recursion"] },
        { title: "Rotate a LL", link: "https://takeuforward.org/linked-list/rotate-a-linked-list/", difficulty: "Medium", tags: ["linked-list"] },
        { title: "Flattening of LL", link: "https://takeuforward.org/linked-list/flattening-a-linked-list/", difficulty: "Hard", tags: ["linked-list", "merge-sort"] },
        { title: "Clone a Linked List with random and next pointer", link: "https://takeuforward.org/linked-list/clone-linked-list-with-random-pointer/", difficulty: "Hard", tags: ["linked-list", "hashing"] },
        { title: "Merge K sorted LL", link: "https://takeuforward.org/linked-list/merge-k-sorted-linked-lists/", difficulty: "Hard", tags: ["linked-list", "heap", "merge-sort"] },
      ]
    },
    {
      title: "Recursion – Get a Strong Hold",
      problems: [
        { title: "Recursive Implementation of atoi()", link: "https://takeuforward.org/recursion/recursive-implementation-of-atoi/", difficulty: "Medium", tags: ["recursion", "string"] },
        { title: "Pow(x, n)", link: "https://takeuforward.org/recursion/pow-x-n/", difficulty: "Medium", tags: ["recursion", "math"] },
        { title: "Count Good numbers", link: "https://takeuforward.org/recursion/count-good-numbers/", difficulty: "Medium", tags: ["recursion", "math"] },
        { title: "Sort a stack using recursion", link: "https://takeuforward.org/recursion/sort-a-stack-using-recursion/", difficulty: "Medium", tags: ["recursion", "stack"] },
        { title: "Reverse a stack using recursion", link: "https://takeuforward.org/recursion/reverse-a-stack-using-recursion/", difficulty: "Medium", tags: ["recursion", "stack"] },
      ]
    },
    {
      title: "Recursion – Subsequences Pattern",
      problems: [
        { title: "Generate all binary strings", link: "https://takeuforward.org/recursion/generate-all-binary-strings/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "Generate Parentheses", link: "https://takeuforward.org/recursion/generate-all-parentheses/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "Print all Subsequences / Power Set", link: "https://takeuforward.org/recursion/print-all-subsequences-power-set/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "Count all subsequences with sum K", link: "https://takeuforward.org/recursion/count-all-subsequences-with-sum-k/", difficulty: "Medium", tags: ["recursion"] },
        { title: "Check if there exists a subsequence with sum K", link: "https://takeuforward.org/recursion/check-if-subsequence-with-sum-k-exists/", difficulty: "Easy", tags: ["recursion"] },
        { title: "Combination Sum I", link: "https://takeuforward.org/recursion/combination-sum-1/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "Combination Sum II", link: "https://takeuforward.org/recursion/combination-sum-ii/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "Subset Sum I", link: "https://takeuforward.org/recursion/subset-sum-i/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "Subset Sum II", link: "https://takeuforward.org/recursion/subset-sum-ii/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "Combination Sum III", link: "https://takeuforward.org/recursion/combination-sum-iii/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "Letter Combinations of a Phone Number", link: "https://takeuforward.org/recursion/letter-combinations-of-a-phone-number/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
      ]
    },
    {
      title: "Recusrion – Trying out all Combos / Hard",
      problems: [
        { title: "Permutation Sequence", link: "https://takeuforward.org/recursion/permutation-sequence/", difficulty: "Hard", tags: ["recursion", "math"] },
        { title: "Permutations (all permutations of a string/array)", link: "https://takeuforward.org/recursion/print-all-permutations-of-a-string-array/", difficulty: "Medium", tags: ["recursion", "backtracking"] },
        { title: "N Queens", link: "https://takeuforward.org/recursion/n-queen-problem/", difficulty: "Hard", tags: ["recursion", "backtracking"] },
        { title: "Sudoku Solver", link: "https://takeuforward.org/recursion/sudoku-solver/", difficulty: "Hard", tags: ["recursion", "backtracking"] },
        { title: "M Coloring Problem", link: "https://takeuforward.org/recursion/m-coloring-problem/", difficulty: "Hard", tags: ["recursion", "backtracking", "graph"] },
        { title: "Rat in a Maze", link: "https://takeuforward.org/recursion/rat-in-a-maze/", difficulty: "Hard", tags: ["recursion", "backtracking", "matrix"] },
        { title: "Word Break II", link: "https://takeuforward.org/recursion/word-break-ii/", difficulty: "Hard", tags: ["recursion", "backtracking", "dp"] },
        { title: "Expression Add Operators", link: "https://takeuforward.org/recursion/expression-add-operators/", difficulty: "Hard", tags: ["recursion", "backtracking"] },
      ]
    },
    {
      title: "Learn Bit Manipulation",
      problems: [
        { title: "Introduction to Bit Manipulation (Theory)", link: "https://takeuforward.org/bit-manipulation/introduction-to-bit-manipulation/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Check if the i-th bit is set or not", link: "https://takeuforward.org/bit-manipulation/check-ith-bit/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Check if a number is odd or not", link: "https://takeuforward.org/bit-manipulation/check-odd-even/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Check if a number is power of 2 or not", link: "https://takeuforward.org/bit-manipulation/check-power-of-2/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Count the number of set bits", link: "https://takeuforward.org/bit-manipulation/count-set-bits/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Set/Unset the rightmost unset bit", link: "https://takeuforward.org/bit-manipulation/set-unset-rightmost-bit/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Swap two numbers", link: "https://takeuforward.org/bit-manipulation/swap-two-numbers/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Divide two integers without using multiplication, division and mod operator", link: "https://takeuforward.org/bit-manipulation/divide-two-integers/", difficulty: "Medium", tags: ["bit-manipulation"] },
      ]
    },
    {
      title: "Bit Manipulation – Interview Problems",
      problems: [
        { title: "Count number of bits to be flipped to convert A to B", link: "https://takeuforward.org/bit-manipulation/count-bits-to-flip/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Find the number that appears odd number of times", link: "https://takeuforward.org/bit-manipulation/find-odd-occurrence/", difficulty: "Easy", tags: ["bit-manipulation"] },
        { title: "Power Set (all subsequences using bit manipulation)", link: "https://takeuforward.org/bit-manipulation/power-set-using-bits/", difficulty: "Medium", tags: ["bit-manipulation", "recursion"] },
        { title: "Find XOR of numbers from L to R", link: "https://takeuforward.org/bit-manipulation/xor-of-numbers-from-l-to-r/", difficulty: "Medium", tags: ["bit-manipulation", "math"] },
        { title: "Find two non-repeating elements in an array of repeating elements", link: "https://takeuforward.org/bit-manipulation/find-two-non-repeating/", difficulty: "Medium", tags: ["bit-manipulation"] },
      ]
    },
    {
      title: "Bit Manipulation – Advanced Maths",
      problems: [
        { title: "Print Prime Factors of a Number", link: "https://takeuforward.org/bit-manipulation/print-prime-factors/", difficulty: "Medium", tags: ["bit-manipulation", "math"] },
        { title: "All Divisors of a Number", link: "https://takeuforward.org/bit-manipulation/all-divisors/", difficulty: "Easy", tags: ["bit-manipulation", "math"] },
        { title: "Sieve of Eratosthenes", link: "https://takeuforward.org/bit-manipulation/sieve-of-eratosthenes/", difficulty: "Medium", tags: ["bit-manipulation", "math"] },
        { title: "Find Prime Factorisation of a Number using Sieve", link: "https://takeuforward.org/bit-manipulation/prime-factorisation-using-sieve/", difficulty: "Medium", tags: ["bit-manipulation", "math"] },
        { title: "Power(n, m) mod p", link: "https://takeuforward.org/bit-manipulation/power-n-m-mod-p/", difficulty: "Medium", tags: ["bit-manipulation", "math"] },
      ]
    },
    {
      title: "Stack and Queues – Learning",
      problems: [
        { title: "Implement Stack using Arrays", link: "https://takeuforward.org/stack-and-queue/implement-stack-using-array/", difficulty: "Easy", tags: ["stack"] },
        { title: "Implement Queue using Arrays", link: "https://takeuforward.org/stack-and-queue/implement-queue-using-array/", difficulty: "Easy", tags: ["queue"] },
        { title: "Implement Stack using Queue", link: "https://takeuforward.org/stack-and-queue/implement-stack-using-queue/", difficulty: "Easy", tags: ["stack", "queue"] },
        { title: "Implement Queue using Stack", link: "https://takeuforward.org/stack-and-queue/implement-queue-using-stack/", difficulty: "Easy", tags: ["stack", "queue"] },
        { title: "Implement stack using Linked List", link: "https://takeuforward.org/stack-and-queue/implement-stack-using-linked-list/", difficulty: "Easy", tags: ["stack", "linked-list"] },
        { title: "Implement queue using Linked List", link: "https://takeuforward.org/stack-and-queue/implement-queue-using-linked-list/", difficulty: "Easy", tags: ["queue", "linked-list"] },
        { title: "Check for Balanced Parentheses", link: "https://takeuforward.org/stack-and-queue/check-for-balanced-parentheses/", difficulty: "Easy", tags: ["stack", "string"] },
        { title: "Implement Min Stack", link: "https://takeuforward.org/stack-and-queue/implement-min-stack/", difficulty: "Medium", tags: ["stack"] },
      ]
    },
    {
      title: "Prefix, Infix, PostFix Conversion Problems",
      problems: [
        { title: "Infix to Postfix Conversion using Stack", link: "https://takeuforward.org/stack-and-queue/infix-to-postfix-conversion/", difficulty: "Medium", tags: ["stack"] },
        { title: "Prefix to Infix Conversion", link: "https://takeuforward.org/stack-and-queue/prefix-to-infix-conversion/", difficulty: "Medium", tags: ["stack"] },
        { title: "Prefix to Postfix Conversion", link: "https://takeuforward.org/stack-and-queue/prefix-to-postfix-conversion/", difficulty: "Medium", tags: ["stack"] },
        { title: "Postfix to Prefix Conversion", link: "https://takeuforward.org/stack-and-queue/postfix-to-prefix-conversion/", difficulty: "Medium", tags: ["stack"] },
        { title: "Postfix to Infix", link: "https://takeuforward.org/stack-and-queue/postfix-to-infix/", difficulty: "Medium", tags: ["stack"] },
        { title: "Convert Infix To Prefix Notation", link: "https://takeuforward.org/stack-and-queue/infix-to-prefix-conversion/", difficulty: "Medium", tags: ["stack"] },
      ]
    },
    {
      title: "Monotonic Stack/Queue Problems",
      problems: [
        { title: "Next Greater Element", link: "https://takeuforward.org/stack-and-queue/next-greater-element/", difficulty: "Medium", tags: ["stack", "monotonic-stack"] },
        { title: "Next Greater Element II (circular)", link: "https://takeuforward.org/stack-and-queue/next-greater-element-ii/", difficulty: "Medium", tags: ["stack", "monotonic-stack"] },
        { title: "Next Smaller Element", link: "https://takeuforward.org/stack-and-queue/next-smaller-element/", difficulty: "Medium", tags: ["stack", "monotonic-stack"] },
        { title: "Number of NGEs to the right", link: "https://takeuforward.org/stack-and-queue/number-of-nge-to-right/", difficulty: "Medium", tags: ["stack", "monotonic-stack"] },
        { title: "Trapping Rainwater", link: "https://takeuforward.org/stack-and-queue/trapping-rainwater/", difficulty: "Hard", tags: ["stack", "two-pointers"] },
        { title: "Sum of Subarray Minimums", link: "https://takeuforward.org/stack-and-queue/sum-of-subarray-minimums/", difficulty: "Hard", tags: ["stack", "monotonic-stack"] },
        { title: "Asteroid Collision", link: "https://takeuforward.org/stack-and-queue/asteroid-collision/", difficulty: "Medium", tags: ["stack"] },
        { title: "Sum of subarray ranges", link: "https://takeuforward.org/stack-and-queue/sum-of-subarray-ranges/", difficulty: "Medium", tags: ["stack", "monotonic-stack"] },
        { title: "Remove k Digits", link: "https://takeuforward.org/stack-and-queue/remove-k-digits/", difficulty: "Medium", tags: ["stack", "greedy"] },
        { title: "Largest rectangle in a histogram", link: "https://takeuforward.org/stack-and-queue/largest-rectangle-in-histogram/", difficulty: "Hard", tags: ["stack", "monotonic-stack"] },
        { title: "Maximal Rectangles", link: "https://takeuforward.org/stack-and-queue/maximal-rectangle/", difficulty: "Hard", tags: ["stack", "monotonic-stack", "matrix"] },
      ]
    },
    {
      title: "Stack and Queue – Implementation Problems",
      problems: [
        { title: "Sliding Window Maximum", link: "https://takeuforward.org/stack-and-queue/sliding-window-maximum/", difficulty: "Hard", tags: ["queue", "sliding-window", "monotonic-queue"] },
        { title: "Stock span problem", link: "https://takeuforward.org/stack-and-queue/stock-span-problem/", difficulty: "Medium", tags: ["stack", "monotonic-stack"] },
        { title: "The Celebrity Problem", link: "https://takeuforward.org/stack-and-queue/celebrity-problem/", difficulty: "Medium", tags: ["stack", "two-pointers"] },
        { title: "LRU cache (IMPORTANT)", link: "https://takeuforward.org/stack-and-queue/lru-cache/", difficulty: "Hard", tags: ["stack", "queue", "linked-list", "hashing"] },
        { title: "LFU Cache", link: "https://takeuforward.org/stack-and-queue/lfu-cache/", difficulty: "Hard", tags: ["stack", "queue", "hashing"] },
      ]
    },
    {
      title: "Sliding Window & Two Pointers – Medium Problems",
      problems: [
        { title: "Longest Substring Without Repeating Characters", link: "https://takeuforward.org/sliding-window-two-pointer/longest-substring-without-repeating-characters/", difficulty: "Medium", tags: ["sliding-window", "string", "hashing"] },
        { title: "Max Consecutive Ones III", link: "https://takeuforward.org/sliding-window-two-pointer/max-consecutive-ones-iii/", difficulty: "Medium", tags: ["sliding-window", "array"] },
        { title: "Fruit Into Baskets", link: "https://takeuforward.org/sliding-window-two-pointer/fruit-into-baskets/", difficulty: "Medium", tags: ["sliding-window", "hashing"] },
        { title: "Longest repeating character replacement", link: "https://takeuforward.org/sliding-window-two-pointer/longest-repeating-character-replacement/", difficulty: "Medium", tags: ["sliding-window", "string"] },
        { title: "Binary subarray with sum", link: "https://takeuforward.org/sliding-window-two-pointer/binary-subarray-with-sum/", difficulty: "Medium", tags: ["sliding-window", "array"] },
        { title: "Count number of nice subarrays", link: "https://takeuforward.org/sliding-window-two-pointer/count-number-of-nice-subarrays/", difficulty: "Medium", tags: ["sliding-window", "array"] },
        { title: "Number of substrings containing all three characters", link: "https://takeuforward.org/sliding-window-two-pointer/number-of-substrings-with-all-three-chars/", difficulty: "Medium", tags: ["sliding-window", "string"] },
        { title: "Maximum points you can obtain from cards", link: "https://takeuforward.org/sliding-window-two-pointer/maximum-points-from-cards/", difficulty: "Medium", tags: ["sliding-window", "array"] },
      ]
    },
    {
      title: "Sliding Window & Two Pointers – Hard Problems",
      problems: [
        { title: "Longest Substring with At Most K Distinct Characters", link: "https://takeuforward.org/sliding-window-two-pointer/longest-substring-with-at-most-k-distinct-chars/", difficulty: "Hard", tags: ["sliding-window", "string", "hashing"] },
        { title: "Subarray with k different integers", link: "https://takeuforward.org/sliding-window-two-pointer/subarray-with-k-different-integers/", difficulty: "Hard", tags: ["sliding-window", "hashing"] },
        { title: "Minimum Window Substring", link: "https://takeuforward.org/sliding-window-two-pointer/minimum-window-substring/", difficulty: "Hard", tags: ["sliding-window", "string", "hashing"] },
        { title: "Minimum Window Subsequence", link: "https://takeuforward.org/sliding-window-two-pointer/minimum-window-subsequence/", difficulty: "Hard", tags: ["sliding-window", "string", "dp"] },
      ]
    },
    {
      title: "Heaps – Learning",
      problems: [
        { title: "Introduction to Priority Queue", link: "https://takeuforward.org/heap/introduction-to-priority-queue/", difficulty: "Easy", tags: ["heap"] },
        { title: "Min Heap and Max Heap Implementation", link: "https://takeuforward.org/heap/min-heap-max-heap/", difficulty: "Easy", tags: ["heap"] },
        { title: "Check if an array represents a min-heap or not", link: "https://takeuforward.org/heap/check-min-heap/", difficulty: "Easy", tags: ["heap", "array"] },
        { title: "Convert min Heap to max Heap", link: "https://takeuforward.org/heap/convert-min-heap-to-max-heap/", difficulty: "Easy", tags: ["heap"] },
      ]
    },
    {
      title: "Heaps – Medium Problems",
      problems: [
        { title: "Kth largest element in an array", link: "https://takeuforward.org/heap/kth-largest-element/", difficulty: "Medium", tags: ["heap", "array"] },
        { title: "Kth smallest element in an array", link: "https://takeuforward.org/heap/kth-smallest-element/", difficulty: "Medium", tags: ["heap", "array"] },
        { title: "Sort K sorted array", link: "https://takeuforward.org/heap/sort-k-sorted-array/", difficulty: "Medium", tags: ["heap", "sorting"] },
        { title: "Merge M sorted Lists", link: "https://takeuforward.org/heap/merge-m-sorted-lists/", difficulty: "Medium", tags: ["heap", "linked-list"] },
        { title: "Replace each array element by its corresponding rank", link: "https://takeuforward.org/heap/replace-elements-by-rank/", difficulty: "Medium", tags: ["heap", "array"] },
        { title: "Task Scheduler", link: "https://takeuforward.org/heap/task-scheduler/", difficulty: "Medium", tags: ["heap", "greedy"] },
        { title: "Hands of Straights", link: "https://takeuforward.org/heap/hands-of-straights/", difficulty: "Medium", tags: ["heap", "greedy", "hashing"] },
      ]
    },
    {
      title: "Heaps – Hard Problems",
      problems: [
        { title: "Design Twitter", link: "https://takeuforward.org/heap/design-twitter/", difficulty: "Hard", tags: ["heap", "design", "hashing"] },
        { title: "Connect n ropes with minimum cost", link: "https://takeuforward.org/heap/connect-n-ropes-minimum-cost/", difficulty: "Medium", tags: ["heap", "greedy"] },
        { title: "Kth largest element in a stream of running integers", link: "https://takeuforward.org/heap/kth-largest-in-stream/", difficulty: "Easy", tags: ["heap"] },
        { title: "Maximum Sum Combination", link: "https://takeuforward.org/heap/maximum-sum-combination/", difficulty: "Medium", tags: ["heap", "sorting"] },
        { title: "Find Median from Data Stream", link: "https://takeuforward.org/heap/find-median-from-data-stream/", difficulty: "Hard", tags: ["heap"] },
        { title: "K most frequent elements", link: "https://takeuforward.org/heap/k-most-frequent-elements/", difficulty: "Medium", tags: ["heap", "hashing"] },
      ]
    },
    {
      title: "Greedy Algo – Easy Problems",
      problems: [
        { title: "Assign Cookies", link: "https://takeuforward.org/greedy/assign-cookies/", difficulty: "Easy", tags: ["greedy"] },
        { title: "Fractional Knapsack Problem", link: "https://takeuforward.org/greedy/fractional-knapsack-problem/", difficulty: "Medium", tags: ["greedy"] },
        { title: "Greedy algorithm to find minimum number of coins", link: "https://takeuforward.org/greedy/minimum-number-of-coins/", difficulty: "Easy", tags: ["greedy"] },
        { title: "Lemonade Change", link: "https://takeuforward.org/greedy/lemonade-change/", difficulty: "Easy", tags: ["greedy"] },
        { title: "Valid Parenthesis String", link: "https://takeuforward.org/greedy/valid-parenthesis-string/", difficulty: "Medium", tags: ["greedy", "string"] },
      ]
    },
    {
      title: "Greedy Algo – Medium/Hard Problems",
      problems: [
        { title: "N meetings in one room", link: "https://takeuforward.org/greedy/n-meetings-in-one-room/", difficulty: "Easy", tags: ["greedy", "sorting"] },
        { title: "Jump Game", link: "https://takeuforward.org/greedy/jump-game/", difficulty: "Medium", tags: ["greedy", "array"] },
        { title: "Jump Game II", link: "https://takeuforward.org/greedy/jump-game-ii/", difficulty: "Medium", tags: ["greedy", "array"] },
        { title: "Minimum number of platforms required for a railway", link: "https://takeuforward.org/greedy/minimum-platforms-required/", difficulty: "Medium", tags: ["greedy", "sorting"] },
        { title: "Job Sequencing Problem", link: "https://takeuforward.org/greedy/job-sequencing-problem/", difficulty: "Medium", tags: ["greedy", "sorting"] },
        { title: "Candy", link: "https://takeuforward.org/greedy/candy/", difficulty: "Hard", tags: ["greedy", "array"] },
        { title: "Program for Shortest Job First (or SJF) CPU Scheduling", link: "https://takeuforward.org/greedy/shortest-job-first-scheduling/", difficulty: "Medium", tags: ["greedy", "sorting"] },
        { title: "Program for Least Recently Used (LRU) Page Replacement Algorithm", link: "https://takeuforward.org/greedy/lru-page-replacement/", difficulty: "Hard", tags: ["greedy"] },
        { title: "Insert Interval", link: "https://takeuforward.org/greedy/insert-interval/", difficulty: "Medium", tags: ["greedy", "array"] },
        { title: "Non-overlapping Intervals", link: "https://takeuforward.org/greedy/non-overlapping-intervals/", difficulty: "Medium", tags: ["greedy", "sorting"] },
      ]
    },
    {
      title: "Binary Trees – Traversals",
      problems: [
        { title: "Introduction to Trees", link: "https://takeuforward.org/binary-tree/introduction-to-trees/", difficulty: "Easy", tags: ["tree"] },
        { title: "Binary Tree Representation in C++", link: "https://takeuforward.org/binary-tree/binary-tree-representation/", difficulty: "Easy", tags: ["tree"] },
        { title: "Binary Tree Traversals in Binary Tree (PreOrder, InOrder, PostOrder)", link: "https://takeuforward.org/binary-tree/binary-tree-traversals/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Preorder Traversal of Binary Tree", link: "https://takeuforward.org/binary-tree/preorder-traversal/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Inorder Traversal of Binary Tree", link: "https://takeuforward.org/binary-tree/inorder-traversal/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Post-order Traversal of Binary Tree", link: "https://takeuforward.org/binary-tree/postorder-traversal/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Level order Traversal / Level order traversal in spiral form", link: "https://takeuforward.org/binary-tree/level-order-traversal/", difficulty: "Medium", tags: ["tree", "bfs"] },
        { title: "Iterative PreOrder Traversal of Binary Tree", link: "https://takeuforward.org/binary-tree/iterative-preorder-traversal/", difficulty: "Easy", tags: ["tree", "stack"] },
        { title: "Iterative Inorder Traversal of Binary Tree", link: "https://takeuforward.org/binary-tree/iterative-inorder-traversal/", difficulty: "Easy", tags: ["tree", "stack"] },
        { title: "Post-order Traversal of Binary Tree using 2 stack", link: "https://takeuforward.org/binary-tree/iterative-postorder-traversal/", difficulty: "Medium", tags: ["tree", "stack"] },
        { title: "All Traversals in One (PreOrder InOrder PostOrder)", link: "https://takeuforward.org/binary-tree/all-traversals/", difficulty: "Medium", tags: ["tree", "dfs"] },
      ]
    },
    {
      title: "Binary Trees – Medium Problems",
      problems: [
        { title: "Height of a Binary Tree", link: "https://takeuforward.org/binary-tree/height-of-binary-tree/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Check if the Binary Tree is Height-Balanced or Not", link: "https://takeuforward.org/binary-tree/check-if-binary-tree-is-balanced/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Diameter of Binary Tree", link: "https://takeuforward.org/binary-tree/diameter-of-binary-tree/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Maximum Path Sum in Binary Tree", link: "https://takeuforward.org/binary-tree/maximum-path-sum/", difficulty: "Hard", tags: ["tree", "dfs"] },
        { title: "Check if two trees are identical or not", link: "https://takeuforward.org/binary-tree/check-identical-trees/", difficulty: "Easy", tags: ["tree", "dfs"] },
        { title: "Zigzag or Spiral Traversal in Binary Tree", link: "https://takeuforward.org/binary-tree/zigzag-traversal/", difficulty: "Medium", tags: ["tree", "bfs"] },
        { title: "Boundary Traversal of a Binary Tree", link: "https://takeuforward.org/binary-tree/boundary-traversal/", difficulty: "Medium", tags: ["tree", "dfs"] },
        { title: "Vertical Order Traversal of Binary Tree", link: "https://takeuforward.org/binary-tree/vertical-order-traversal/", difficulty: "Hard", tags: ["tree", "bfs", "hashing"] },
        { title: "Top View of Binary Tree", link: "https://takeuforward.org/binary-tree/top-view/", difficulty: "Medium", tags: ["tree", "bfs"] },
        { title: "Bottom View of Binary Tree", link: "https://takeuforward.org/binary-tree/bottom-view/", difficulty: "Medium", tags: ["tree", "bfs"] },
        { title: "Right/Left View of Binary Tree", link: "https://takeuforward.org/binary-tree/right-left-view/", difficulty: "Medium", tags: ["tree", "bfs", "dfs"] },
        { title: "Symmetric Binary Tree", link: "https://takeuforward.org/binary-tree/symmetric-binary-tree/", difficulty: "Easy", tags: ["tree", "dfs"] },
      ]
    },
    {
      title: "Binary Trees – Hard Problems",
      problems: [
        { title: "Root to Node Path in Binary Tree", link: "https://takeuforward.org/binary-tree/root-to-node-path/", difficulty: "Medium", tags: ["tree", "dfs"] },
        { title: "LCA in Binary Tree", link: "https://takeuforward.org/binary-tree/lca-in-binary-tree/", difficulty: "Medium", tags: ["tree", "dfs"] },
        { title: "Maximum width of a Binary Tree", link: "https://takeuforward.org/binary-tree/maximum-width/", difficulty: "Medium", tags: ["tree", "bfs"] },
        { title: "Check for Children Sum Property", link: "https://takeuforward.org/binary-tree/children-sum-property/", difficulty: "Medium", tags: ["tree", "dfs"] },
        { title: "Print all the Nodes at a distance of K in a Binary Tree", link: "https://takeuforward.org/binary-tree/nodes-at-distance-k/", difficulty: "Hard", tags: ["tree", "dfs", "bfs"] },
        { title: "Minimum time taken to BURN the Binary Tree from a Node", link: "https://takeuforward.org/binary-tree/burn-binary-tree/", difficulty: "Hard", tags: ["tree", "bfs", "dfs"] },
        { title: "Count total Nodes in a COMPLETE Binary Tree", link: "https://takeuforward.org/binary-tree/count-nodes-in-complete-binary-tree/", difficulty: "Medium", tags: ["tree", "binary-search"] },
        { title: "Requirements needed to construct a Unique Binary Tree (Theory)", link: "https://takeuforward.org/binary-tree/unique-binary-tree/", difficulty: "Easy", tags: ["tree"] },
        { title: "Construct Binary Tree from inorder and preorder", link: "https://takeuforward.org/binary-tree/construct-from-inorder-preorder/", difficulty: "Hard", tags: ["tree", "recursion"] },
        { title: "Construct the Binary Tree from Postorder and Inorder Traversal", link: "https://takeuforward.org/binary-tree/construct-from-inorder-postorder/", difficulty: "Hard", tags: ["tree", "recursion"] },
        { title: "Serialize and De-serialize Binary Tree", link: "https://takeuforward.org/binary-tree/serialize-and-deserialize/", difficulty: "Hard", tags: ["tree", "bfs"] },
        { title: "Morris Preorder Traversal of a Binary Tree", link: "https://takeuforward.org/binary-tree/morris-preorder-traversal/", difficulty: "Hard", tags: ["tree"] },
        { title: "Morris Inorder Traversal of a Binary Tree", link: "https://takeuforward.org/binary-tree/morris-inorder-traversal/", difficulty: "Hard", tags: ["tree"] },
        { title: "Flatten Binary Tree to LinkedList", link: "https://takeuforward.org/binary-tree/flatten-binary-tree-to-linked-list/", difficulty: "Medium", tags: ["tree", "linked-list"] },
      ]
    },
    {
      title: "Binary Search Tree – Concept",
      problems: [
        { title: "Introduction to Binary Search Tree", link: "https://takeuforward.org/binary-search-tree/introduction-to-bst/", difficulty: "Easy", tags: ["bst"] },
        { title: "Search in a Binary Search Tree", link: "https://takeuforward.org/binary-search-tree/search-in-bst/", difficulty: "Easy", tags: ["bst"] },
        { title: "Find Min/Max in BST", link: "https://takeuforward.org/binary-search-tree/find-min-max-in-bst/", difficulty: "Easy", tags: ["bst"] },
      ]
    },
    {
      title: "Binary Search Tree – Practice Problems",
      problems: [
        { title: "Ceil in a BST", link: "https://takeuforward.org/binary-search-tree/ceil-in-bst/", difficulty: "Medium", tags: ["bst"] },
        { title: "Floor in a BST", link: "https://takeuforward.org/binary-search-tree/floor-in-bst/", difficulty: "Medium", tags: ["bst"] },
        { title: "Insert a given Node in BST", link: "https://takeuforward.org/binary-search-tree/insert-in-bst/", difficulty: "Medium", tags: ["bst"] },
        { title: "Delete a Node in BST", link: "https://takeuforward.org/binary-search-tree/delete-in-bst/", difficulty: "Medium", tags: ["bst"] },
        { title: "Find K-th smallest/largest element in BST", link: "https://takeuforward.org/binary-search-tree/kth-smallest-largest-in-bst/", difficulty: "Medium", tags: ["bst"] },
        { title: "Check if a tree is a BST or BT", link: "https://takeuforward.org/binary-search-tree/validate-bst/", difficulty: "Medium", tags: ["bst"] },
        { title: "LCA in Binary Search Tree", link: "https://takeuforward.org/binary-search-tree/lca-in-bst/", difficulty: "Medium", tags: ["bst"] },
        { title: "Construct a BST from a preorder traversal", link: "https://takeuforward.org/binary-search-tree/construct-bst-from-preorder/", difficulty: "Medium", tags: ["bst"] },
        { title: "Inorder Successor/Predecessor in BST", link: "https://takeuforward.org/binary-search-tree/inorder-successor-predecessor-bst/", difficulty: "Medium", tags: ["bst"] },
        { title: "BST Iterator", link: "https://takeuforward.org/binary-search-tree/bst-iterator/", difficulty: "Medium", tags: ["bst", "stack"] },
        { title: "Two Sum In BST | Check if there exists a pair with Sum K", link: "https://takeuforward.org/binary-search-tree/two-sum-in-bst/", difficulty: "Medium", tags: ["bst"] },
        { title: "Recover BST | Correct BST with two nodes swapped", link: "https://takeuforward.org/binary-search-tree/recover-bst/", difficulty: "Hard", tags: ["bst"] },
        { title: "Largest BST in Binary Tree", link: "https://takeuforward.org/binary-search-tree/largest-bst-in-binary-tree/", difficulty: "Hard", tags: ["bst", "tree"] },
      ]
    },
    {
      title: "Graphs – Learning",
      problems: [
        { title: "Graph and Types", link: "https://takeuforward.org/graph/graph-and-types/", difficulty: "Easy", tags: ["graph"] },
        { title: "Graph Representation in C++ (Matrix and List)", link: "https://takeuforward.org/graph/graph-representation/", difficulty: "Easy", tags: ["graph"] },
        { title: "Connected Components | Logic Explanation", link: "https://takeuforward.org/graph/connected-components/", difficulty: "Easy", tags: ["graph", "dfs"] },
        { title: "BFS (Breadth First Search)", link: "https://takeuforward.org/graph/bfs-of-graph/", difficulty: "Easy", tags: ["graph", "bfs"] },
        { title: "DFS (Depth First Search)", link: "https://takeuforward.org/graph/dfs-of-graph/", difficulty: "Easy", tags: ["graph", "dfs"] },
      ]
    },
    {
      title: "Graphs – Problems on BFS/DFS",
      problems: [
        { title: "Number of provinces (leetcode)", link: "https://takeuforward.org/graph/number-of-provinces/", difficulty: "Medium", tags: ["graph", "dfs", "union-find"] },
        { title: "Connected Components Problem in Matrix", link: "https://takeuforward.org/graph/connected-components-matrix/", difficulty: "Medium", tags: ["graph", "bfs", "dfs"] },
        { title: "Rotten Oranges", link: "https://takeuforward.org/graph/rotten-oranges/", difficulty: "Medium", tags: ["graph", "bfs", "matrix"] },
        { title: "Flood Fill", link: "https://takeuforward.org/graph/flood-fill/", difficulty: "Easy", tags: ["graph", "dfs", "bfs", "matrix"] },
        { title: "Cycle Detection in unirected Graph (bfs)", link: "https://takeuforward.org/graph/cycle-detection-undirected-bfs/", difficulty: "Medium", tags: ["graph", "bfs"] },
        { title: "Cycle Detection in undirected Graph (dfs)", link: "https://takeuforward.org/graph/cycle-detection-undirected-dfs/", difficulty: "Medium", tags: ["graph", "dfs"] },
        { title: "0/1 Matrix (Bfs Problem)", link: "https://takeuforward.org/graph/01-matrix/", difficulty: "Medium", tags: ["graph", "bfs", "matrix"] },
        { title: "Surrounded Regions (dfs)", link: "https://takeuforward.org/graph/surrounded-regions/", difficulty: "Medium", tags: ["graph", "dfs", "bfs"] },
        { title: "Number of Enclaves (flood fill implementation – multisource)", link: "https://takeuforward.org/graph/number-of-enclaves/", difficulty: "Medium", tags: ["graph", "bfs", "dfs"] },
        { title: "Word Ladder – I", link: "https://takeuforward.org/graph/word-ladder-i/", difficulty: "Hard", tags: ["graph", "bfs"] },
        { title: "Word Ladder – II", link: "https://takeuforward.org/graph/word-ladder-ii/", difficulty: "Hard", tags: ["graph", "bfs"] },
        { title: "Number of Distinct Islands", link: "https://takeuforward.org/graph/number-of-distinct-islands/", difficulty: "Medium", tags: ["graph", "dfs", "hashing"] },
        { title: "Bipartite Check using BFS", link: "https://takeuforward.org/graph/bipartite-check-bfs/", difficulty: "Medium", tags: ["graph", "bfs"] },
        { title: "Bipartite Check using DFS", link: "https://takeuforward.org/graph/bipartite-check-dfs/", difficulty: "Medium", tags: ["graph", "dfs"] },
      ]
    },
    {
      title: "Graphs – Topo Sort and Problems",
      problems: [
        { title: "Topo Sort", link: "https://takeuforward.org/graph/topological-sort-dfs/", difficulty: "Medium", tags: ["graph", "dfs", "topological-sort"] },
        { title: "Kahn's Algorithm", link: "https://takeuforward.org/graph/kahns-algorithm/", difficulty: "Medium", tags: ["graph", "bfs", "topological-sort"] },
        { title: "Cycle Detection in Directed Graph using BFS (Kahn's algorithm)", link: "https://takeuforward.org/graph/cycle-detection-directed-bfs/", difficulty: "Medium", tags: ["graph", "bfs", "topological-sort"] },
        { title: "Cycle Detection in Directed Graph using DFS", link: "https://takeuforward.org/graph/cycle-detection-directed-dfs/", difficulty: "Medium", tags: ["graph", "dfs"] },
        { title: "Find eventual safe states – BFS – Topological Sort", link: "https://takeuforward.org/graph/find-eventual-safe-states/", difficulty: "Medium", tags: ["graph", "bfs", "topological-sort"] },
        { title: "Alien dictionary (topological sort)", link: "https://takeuforward.org/graph/alien-dictionary/", difficulty: "Hard", tags: ["graph", "topological-sort"] },
        { title: "Shortest path in Directed Acyclic Graph", link: "https://takeuforward.org/graph/shortest-path-dag/", difficulty: "Medium", tags: ["graph", "topological-sort"] },
        { title: "Shortest Path in Undirected Graph with unit weights", link: "https://takeuforward.org/graph/shortest-path-undirected/", difficulty: "Medium", tags: ["graph", "bfs"] },
        { title: "Word Ladder – I (again with topo approach)", link: "https://takeuforward.org/graph/word-ladder-i/", difficulty: "Hard", tags: ["graph", "bfs"] },
        { title: "Course Schedule I", link: "https://takeuforward.org/graph/course-schedule-i/", difficulty: "Medium", tags: ["graph", "topological-sort"] },
        { title: "Course Schedule II", link: "https://takeuforward.org/graph/course-schedule-ii/", difficulty: "Medium", tags: ["graph", "topological-sort"] },
      ]
    },
    {
      title: "Graphs – Shortest Path Algorithms",
      problems: [
        { title: "Dijkstra's Algorithm", link: "https://takeuforward.org/graph/dijkstras-algorithm/", difficulty: "Medium", tags: ["graph", "dijkstra", "heap"] },
        { title: "Why Priority Queue is used in Dijkstra's Algorithm?", link: "https://takeuforward.org/graph/dijkstras-priority-queue/", difficulty: "Medium", tags: ["graph", "dijkstra"] },
        { title: "Shortest path in a binary maze", link: "https://takeuforward.org/graph/shortest-path-binary-maze/", difficulty: "Medium", tags: ["graph", "bfs", "dijkstra"] },
        { title: "Path With Minimum Effort", link: "https://takeuforward.org/graph/path-minimum-effort/", difficulty: "Medium", tags: ["graph", "dijkstra"] },
        { title: "Cheapest Flights Within K Stops", link: "https://takeuforward.org/graph/cheapest-flights-within-k-stops/", difficulty: "Medium", tags: ["graph", "dijkstra", "dp"] },
        { title: "Network Delay Time", link: "https://takeuforward.org/graph/network-delay-time/", difficulty: "Medium", tags: ["graph", "dijkstra"] },
        { title: "Number of Ways to Arrive at Destination", link: "https://takeuforward.org/graph/number-of-ways-arrive-destination/", difficulty: "Medium", tags: ["graph", "dijkstra"] },
        { title: "Minimum Multiplications to reach End", link: "https://takeuforward.org/graph/minimum-multiplications-to-reach-end/", difficulty: "Medium", tags: ["graph", "bfs"] },
        { title: "Bellman Ford Algorithm", link: "https://takeuforward.org/graph/bellman-ford-algorithm/", difficulty: "Medium", tags: ["graph", "bellman-ford"] },
        { title: "Floyd Warshall Algorithm", link: "https://takeuforward.org/graph/floyd-warshall-algorithm/", difficulty: "Medium", tags: ["graph", "floyd-warshall", "dp"] },
        { title: "Find the City With the Smallest Number of Neighbors at a Threshold Distance", link: "https://takeuforward.org/graph/find-city-threshold-distance/", difficulty: "Medium", tags: ["graph", "floyd-warshall"] },
      ]
    },
    {
      title: "Graphs – Minimum Spanning Tree/Disjoint Set",
      problems: [
        { title: "Minimum Spanning Tree – Theory", link: "https://takeuforward.org/graph/minimum-spanning-tree/", difficulty: "Easy", tags: ["graph", "mst"] },
        { title: "Prim's Algorithm", link: "https://takeuforward.org/graph/prims-algorithm/", difficulty: "Medium", tags: ["graph", "mst", "greedy"] },
        { title: "Disjoint Set [Union by Rank] [Union by Size] [Path Compression]", link: "https://takeuforward.org/graph/disjoint-set/", difficulty: "Medium", tags: ["graph", "union-find"] },
        { title: "Kruskal's Algorithm", link: "https://takeuforward.org/graph/kruskals-algorithm/", difficulty: "Medium", tags: ["graph", "mst", "union-find"] },
        { title: "Number of Operations to Make Network Connected", link: "https://takeuforward.org/graph/number-of-operations-network-connected/", difficulty: "Medium", tags: ["graph", "union-find"] },
        { title: "Most Stones Removed with Same Row or Column", link: "https://takeuforward.org/graph/most-stones-removed/", difficulty: "Medium", tags: ["graph", "union-find"] },
        { title: "Accounts Merge", link: "https://takeuforward.org/graph/accounts-merge/", difficulty: "Hard", tags: ["graph", "union-find"] },
        { title: "Number of Islands II", link: "https://takeuforward.org/graph/number-of-islands-ii/", difficulty: "Hard", tags: ["graph", "union-find"] },
        { title: "Making a Large Island", link: "https://takeuforward.org/graph/making-a-large-island/", difficulty: "Hard", tags: ["graph", "union-find", "bfs"] },
        { title: "Swim in Rising Water", link: "https://takeuforward.org/graph/swim-in-rising-water/", difficulty: "Hard", tags: ["graph", "dijkstra", "binary-search"] },
      ]
    },
    {
      title: "Graphs – Other Algorithms",
      problems: [
        { title: "Bridges in Graph – Using Tarjan's Algorithm of time in and low time", link: "https://takeuforward.org/graph/bridges-in-graph/", difficulty: "Hard", tags: ["graph", "tarjan"] },
        { title: "Articulation Point – I", link: "https://takeuforward.org/graph/articulation-points/", difficulty: "Hard", tags: ["graph", "tarjan"] },
        { title: "Kosaraju's Algorithm for Strongly Connected Components", link: "https://takeuforward.org/graph/kosarajus-algorithm/", difficulty: "Hard", tags: ["graph", "scc", "dfs"] },
        { title: "Bellman Ford Algorithm (revisited)", link: "https://takeuforward.org/graph/bellman-ford-algorithm/", difficulty: "Medium", tags: ["graph", "bellman-ford"] },
      ]
    },
    {
      title: "Introduction to DP",
      problems: [
        { title: "Dynamic Programming Introduction", link: "https://takeuforward.org/dynamic-programming/introduction-to-dynamic-programming/", difficulty: "Easy", tags: ["dp"] },
        { title: "Climbing Stairs", link: "https://takeuforward.org/dynamic-programming/climbing-stairs/", difficulty: "Easy", tags: ["dp"] },
        { title: "Frog Jump (DP-3)", link: "https://takeuforward.org/dynamic-programming/frog-jump/", difficulty: "Easy", tags: ["dp"] },
        { title: "Frog Jump with k distances (DP-4)", link: "https://takeuforward.org/dynamic-programming/frog-jump-k-distances/", difficulty: "Easy", tags: ["dp"] },
        { title: "Maximum Sum of non-adjacent elements (DP 5)", link: "https://takeuforward.org/dynamic-programming/max-sum-non-adjacent/", difficulty: "Medium", tags: ["dp"] },
        { title: "House Robber (DP 6)", link: "https://takeuforward.org/dynamic-programming/house-robber/", difficulty: "Medium", tags: ["dp"] },
      ]
    },
    {
      title: "2D/3D DP and DP on Grids",
      problems: [
        { title: "Ninja's Training (DP 7)", link: "https://takeuforward.org/dynamic-programming/ninjas-training/", difficulty: "Medium", tags: ["dp"] },
        { title: "Grid Unique Paths (DP 8)", link: "https://takeuforward.org/dynamic-programming/grid-unique-paths/", difficulty: "Medium", tags: ["dp", "matrix"] },
        { title: "Grid Unique Paths 2 (DP 9)", link: "https://takeuforward.org/dynamic-programming/grid-unique-paths-2/", difficulty: "Medium", tags: ["dp", "matrix"] },
        { title: "Minimum path sum in Grid (DP 10)", link: "https://takeuforward.org/dynamic-programming/minimum-path-sum/", difficulty: "Medium", tags: ["dp", "matrix"] },
        { title: "Minimum path sum in Triangular Grid (DP 11)", link: "https://takeuforward.org/dynamic-programming/minimum-path-sum-triangle/", difficulty: "Medium", tags: ["dp"] },
        { title: "Minimum/Maximum Falling Path Sum (DP-12)", link: "https://takeuforward.org/dynamic-programming/minimum-maximum-falling-path-sum/", difficulty: "Medium", tags: ["dp", "matrix"] },
        { title: "3D DP: Chocolate Pickup (DP-13)", link: "https://takeuforward.org/dynamic-programming/chocolate-pickup/", difficulty: "Hard", tags: ["dp", "matrix"] },
      ]
    },
    {
      title: "DP on Subsequences",
      problems: [
        { title: "Subset sum equal to target (DP-14)", link: "https://takeuforward.org/dynamic-programming/subset-sum-equal-to-target/", difficulty: "Medium", tags: ["dp", "recursion"] },
        { title: "Partition Equal Subset Sum (DP-15)", link: "https://takeuforward.org/dynamic-programming/partition-equal-subset-sum/", difficulty: "Medium", tags: ["dp"] },
        { title: "Partition Set Into 2 Subsets With Min Absolute Sum Diff (DP-16)", link: "https://takeuforward.org/dynamic-programming/partition-set-into-2-subsets-with-min-absolute-diff/", difficulty: "Hard", tags: ["dp"] },
        { title: "Count Subsets with Sum K (DP-17)", link: "https://takeuforward.org/dynamic-programming/count-subsets-with-sum-k/", difficulty: "Medium", tags: ["dp"] },
        { title: "Count Partitions with Given Difference (DP-18)", link: "https://takeuforward.org/dynamic-programming/count-partitions-with-given-difference/", difficulty: "Medium", tags: ["dp"] },
        { title: "0/1 Knapsack (DP-19)", link: "https://takeuforward.org/dynamic-programming/0-1-knapsack/", difficulty: "Medium", tags: ["dp"] },
        { title: "Minimum Coins (DP-20)", link: "https://takeuforward.org/dynamic-programming/minimum-coins/", difficulty: "Medium", tags: ["dp"] },
        { title: "Target Sum (DP-21)", link: "https://takeuforward.org/dynamic-programming/target-sum/", difficulty: "Medium", tags: ["dp"] },
        { title: "Coin Change 2 (DP-22)", link: "https://takeuforward.org/dynamic-programming/coin-change-2/", difficulty: "Medium", tags: ["dp"] },
        { title: "Unbounded Knapsack (DP-23)", link: "https://takeuforward.org/dynamic-programming/unbounded-knapsack/", difficulty: "Medium", tags: ["dp"] },
        { title: "Rod Cutting Problem (DP-24)", link: "https://takeuforward.org/dynamic-programming/rod-cutting/", difficulty: "Hard", tags: ["dp"] },
      ]
    },
    {
      title: "DP on Strings",
      problems: [
        { title: "Longest Common Subsequence (DP-25)", link: "https://takeuforward.org/dynamic-programming/longest-common-subsequence/", difficulty: "Medium", tags: ["dp", "string"] },
        { title: "Print Longest Common Subsequence (DP-26)", link: "https://takeuforward.org/dynamic-programming/print-longest-common-subsequence/", difficulty: "Medium", tags: ["dp", "string"] },
        { title: "Longest Common Substring (DP-27)", link: "https://takeuforward.org/dynamic-programming/longest-common-substring/", difficulty: "Medium", tags: ["dp", "string"] },
        { title: "Longest Palindromic Subsequence (DP-28)", link: "https://takeuforward.org/dynamic-programming/longest-palindromic-subsequence/", difficulty: "Medium", tags: ["dp", "string"] },
        { title: "Minimum insertions to make string palindrome (DP-29)", link: "https://takeuforward.org/dynamic-programming/min-insertions-to-make-palindrome/", difficulty: "Medium", tags: ["dp", "string"] },
        { title: "Minimum Insertions/Deletions to Convert String (DP-30)", link: "https://takeuforward.org/dynamic-programming/min-insertions-deletions-to-convert-string/", difficulty: "Medium", tags: ["dp", "string"] },
        { title: "Shortest Common Supersequence (DP-31)", link: "https://takeuforward.org/dynamic-programming/shortest-common-supersequence/", difficulty: "Hard", tags: ["dp", "string"] },
        { title: "Distinct Subsequences (DP-32)", link: "https://takeuforward.org/dynamic-programming/distinct-subsequences/", difficulty: "Hard", tags: ["dp", "string"] },
        { title: "Edit Distance (DP-33)", link: "https://takeuforward.org/dynamic-programming/edit-distance/", difficulty: "Hard", tags: ["dp", "string"] },
        { title: "Wildcard Matching (DP-34)", link: "https://takeuforward.org/dynamic-programming/wildcard-matching/", difficulty: "Hard", tags: ["dp", "string"] },
      ]
    },
    {
      title: "DP on Stocks",
      problems: [
        { title: "Best Time to Buy and Sell Stock (DP-35)", link: "https://takeuforward.org/dynamic-programming/best-time-to-buy-sell-stock-i/", difficulty: "Easy", tags: ["dp", "array"] },
        { title: "Buy and Sell Stock – II (DP-36)", link: "https://takeuforward.org/dynamic-programming/best-time-to-buy-sell-stock-ii/", difficulty: "Medium", tags: ["dp", "array"] },
        { title: "Buy and Sell Stocks III (DP-37)", link: "https://takeuforward.org/dynamic-programming/best-time-to-buy-sell-stock-iii/", difficulty: "Hard", tags: ["dp", "array"] },
        { title: "Buy and Stock Sell IV (DP-38)", link: "https://takeuforward.org/dynamic-programming/best-time-to-buy-sell-stock-iv/", difficulty: "Hard", tags: ["dp", "array"] },
        { title: "Buy and Sell Stocks With Cooldown (DP-39)", link: "https://takeuforward.org/dynamic-programming/best-time-buy-sell-stocks-with-cooldown/", difficulty: "Medium", tags: ["dp", "array"] },
        { title: "Buy and Sell Stocks With Transaction Fee (DP-40)", link: "https://takeuforward.org/dynamic-programming/best-time-buy-sell-stocks-transaction-fee/", difficulty: "Medium", tags: ["dp", "array"] },
      ]
    },
    {
      title: "DP on LIS",
      problems: [
        { title: "Longest Increasing Subsequence (DP-41)", link: "https://takeuforward.org/dynamic-programming/longest-increasing-subsequence/", difficulty: "Medium", tags: ["dp", "array"] },
        { title: "Print Longest Increasing Subsequence (DP-42)", link: "https://takeuforward.org/dynamic-programming/print-longest-increasing-subsequence/", difficulty: "Medium", tags: ["dp", "array"] },
        { title: "Longest Increasing Subsequence using Binary Search (DP-43)", link: "https://takeuforward.org/dynamic-programming/lis-binary-search/", difficulty: "Medium", tags: ["dp", "binary-search"] },
        { title: "Longest Divisible Subset (DP-44)", link: "https://takeuforward.org/dynamic-programming/longest-divisible-subset/", difficulty: "Medium", tags: ["dp"] },
        { title: "Longest String Chain (DP-45)", link: "https://takeuforward.org/dynamic-programming/longest-string-chain/", difficulty: "Medium", tags: ["dp", "string"] },
        { title: "Longest Bitonic Subsequence (DP-46)", link: "https://takeuforward.org/dynamic-programming/longest-bitonic-subsequence/", difficulty: "Hard", tags: ["dp", "array"] },
        { title: "Number of Longest Increasing Subsequences (DP-47)", link: "https://takeuforward.org/dynamic-programming/number-of-lis/", difficulty: "Hard", tags: ["dp", "array"] },
      ]
    },
    {
      title: "MCM DP / Interval DP",
      problems: [
        { title: "Matrix Chain Multiplication (DP-48)", link: "https://takeuforward.org/dynamic-programming/matrix-chain-multiplication/", difficulty: "Hard", tags: ["dp"] },
        { title: "Matrix Chain Multiplication – Bottom-Up (DP-49)", link: "https://takeuforward.org/dynamic-programming/matrix-chain-multiplication-bottom-up/", difficulty: "Hard", tags: ["dp"] },
        { title: "Minimum Cost to Cut the Stick (DP-50)", link: "https://takeuforward.org/dynamic-programming/minimum-cost-to-cut-the-stick/", difficulty: "Hard", tags: ["dp"] },
        { title: "Burst Balloons (DP-51)", link: "https://takeuforward.org/dynamic-programming/burst-balloons/", difficulty: "Hard", tags: ["dp"] },
        { title: "Evaluate Boolean Expression to True (DP-52)", link: "https://takeuforward.org/dynamic-programming/evaluate-boolean-expression/", difficulty: "Hard", tags: ["dp"] },
        { title: "Palindrome Partitioning – II (DP-53)", link: "https://takeuforward.org/dynamic-programming/palindrome-partitioning-ii/", difficulty: "Hard", tags: ["dp", "string"] },
        { title: "Partition Array for Maximum Sum (DP-54)", link: "https://takeuforward.org/dynamic-programming/partition-array-maximum-sum/", difficulty: "Medium", tags: ["dp"] },
        { title: "Maximum Rectangle Area with all 1s (DP-55)", link: "https://takeuforward.org/dynamic-programming/maximum-rectangle-area-all-1s/", difficulty: "Hard", tags: ["dp", "stack", "matrix"] },
        { title: "Count Square Submatrices with All Ones (DP-56)", link: "https://takeuforward.org/dynamic-programming/count-square-submatrices/", difficulty: "Medium", tags: ["dp", "matrix"] },
      ]
    },
    {
      title: "Tries – Theory",
      problems: [
        { title: "Implement Trie – I (Prefix Tree)", link: "https://takeuforward.org/trie/implement-trie-prefix-tree/", difficulty: "Medium", tags: ["trie"] },
        { title: "Implement Trie – II", link: "https://takeuforward.org/trie/implement-trie-ii/", difficulty: "Medium", tags: ["trie"] },
        { title: "Longest String with All Prefixes", link: "https://takeuforward.org/trie/longest-string-with-all-prefixes/", difficulty: "Medium", tags: ["trie"] },
        { title: "Number of Distinct Substrings in a String", link: "https://takeuforward.org/trie/number-of-distinct-substrings/", difficulty: "Hard", tags: ["trie"] },
        { title: "Bit Pre-requisites for this step (Trie)", link: "https://takeuforward.org/trie/bit-prerequisites-for-trie/", difficulty: "Easy", tags: ["trie", "bit-manipulation"] },
        { title: "Maximum XOR of two numbers in an array", link: "https://takeuforward.org/trie/maximum-xor-two-numbers/", difficulty: "Medium", tags: ["trie", "bit-manipulation"] },
        { title: "Maximum XOR With an Element From Array", link: "https://takeuforward.org/trie/maximum-xor-with-element/", difficulty: "Hard", tags: ["trie", "bit-manipulation"] },
      ]
    }
  ]
};

const seedStriverA2Z = async () => {
  await connectDB();
  await DSASheet.findOneAndUpdate(
    { slug: striverA2ZData.slug },
    striverA2ZData,
    { upsert: true, new: true }
  );
  console.log('Striver A2Z Sheet Seeded');
};

module.exports = seedStriverA2Z;
