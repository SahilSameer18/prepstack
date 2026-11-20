const DSASheet = require('../../sheets.model');
const connectDB = require('../../../../shared/config/seedConfig');

const neetcode150Data = {
  name: "NeetCode 150 DSA Sheet",
  slug: "neetcode-150",
  description: "Complete list of 150 essential LeetCode problems curated by NeetCode.",
  topics: [
    {
      id: "arrays-hashing",
      title: "Arrays & Hashing",
      problems: [
        { title: "Contains Duplicate", link: "https://leetcode.com/problems/contains-duplicate/", difficulty: "Easy", tags: ["array", "hashset"], video: "https://www.youtube.com/watch?v=3OamzN90kPg" },
        { title: "Valid Anagram", link: "https://leetcode.com/problems/valid-anagram/", difficulty: "Easy", tags: ["string", "hashmap"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/check-if-two-strings-are-anagrams", video: "https://www.youtube.com/watch?v=9UtInBqnCgA" },
        { title: "Two Sum", link: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", tags: ["array", "hashmap"], video: "https://youtu.be/UXDSeD9mN-k", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/two-sum" },
        { title: "Group Anagrams", link: "https://leetcode.com/problems/group-anagrams/", difficulty: "Medium", tags: ["array", "hashmap", "sorting"], video: "https://www.youtube.com/watch?v=vzdNOK2oB2E" },
        { title: "Top K Frequent Elements", link: "https://leetcode.com/problems/top-k-frequent-elements/", difficulty: "Medium", tags: ["heap", "hashmap"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/top-k-frequent-elements", video: "https://www.youtube.com/watch?v=YPTqKIgVk-k" },
        { title: "Product of Array Except Self", link: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium", tags: ["array"], video: "https://www.youtube.com/watch?v=bNvIQI2wAjk" },
        { title: "Valid Sudoku", link: "https://leetcode.com/problems/valid-sudoku/", difficulty: "Medium", tags: ["array", "hashset"], video: "https://www.youtube.com/watch?v=TjFXEUCMqI8" },
        { title: "Encode and Decode Strings", link: "https://leetcode.com/problems/encode-and-decode-strings/", difficulty: "Medium", tags: ["string"] },
        { title: "Longest Consecutive Sequence", link: "https://leetcode.com/problems/longest-consecutive-sequence/", difficulty: "Medium", tags: ["array", "hashset"], video: "https://youtu.be/oO5uLE7EUlM", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/longest-consecutive-sequence-in-an-array" }
      ]
    },
    {
      id: "two-pointers",
      title: "Two Pointers",
      problems: [
        { title: "Valid Palindrome", link: "https://leetcode.com/problems/valid-palindrome/", difficulty: "Easy", tags: ["string", "two-pointers"], video: "https://www.youtube.com/watch?v=twuC1F6gLI8&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=4", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/valid-palindrome" },
        { title: "Two Sum II - Input Array Is Sorted", link: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", difficulty: "Medium", tags: ["array", "two-pointers"] },
        { title: "3Sum", link: "https://leetcode.com/problems/3sum/", difficulty: "Medium", tags: ["array", "two-pointers"], video: "https://youtu.be/DhFh8Kw7ymk", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/3sum" },
        { title: "Container With Most Water", link: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium", tags: ["array", "two-pointers"], video: "https://www.youtube.com/watch?v=UuiTKBwPgAo" },
        { title: "Trapping Rain Water", link: "https://leetcode.com/problems/trapping-rain-water/", difficulty: "Hard", tags: ["array", "two-pointers"], video: "https://youtu.be/1_5VuquLbXg?si=NFG6df318_6OtGvg", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/trapping-rain-water" }
      ]
    },
    {
      id: "sliding-window",
      title: "Sliding Window",
      problems: [
        { title: "Best Time to Buy and Sell Stock", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "Easy", tags: ["array"], video: "https://youtu.be/excAOvwF_Wk", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/best-time-to-buy-and-sell-stock" },
        { title: "Longest Substring Without Repeating Characters", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "Medium", tags: ["string", "sliding-window"], video: "https://youtu.be/-zSxTJkcdAo?si=I2zfR-vlDMg0zU9z", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/longest-substring-without-repeating-characters" },
        { title: "Longest Repeating Character Replacement", link: "https://leetcode.com/problems/longest-repeating-character-replacement/", difficulty: "Medium", tags: ["string", "sliding-window"], video: "https://youtu.be/_eNhaDCr6P0?si=pBWcEjozF5poom0p", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/longest-repeating-character-replacement" },
        { title: "Permutation in String", link: "https://leetcode.com/problems/permutation-in-string/", difficulty: "Medium", tags: ["string", "sliding-window"], video: "https://www.youtube.com/watch?v=UbyhOgBN834" },
        { title: "Minimum Window Substring", link: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "Hard", tags: ["string", "sliding-window"], video: "https://youtu.be/WJaij9ffOIY?si=-xnsWIH84zWU0ICd", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/minimum-window-substring" },
        { title: "Sliding Window Maximum", link: "https://leetcode.com/problems/sliding-window-maximum/", difficulty: "Hard", tags: ["deque"], video: "https://youtu.be/NwBvene4Imo?si=eU1PY-bcQfk5wdog", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/sliding-window-maximum" }
      ]
    },
    {
      id: "stack",
      title: "Stack",
      problems: [
        { title: "Valid Parentheses", link: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy", tags: ["stack"], video: "https://youtu.be/xwjS0iZhw4I?si=UoyKpFn4Q3nf5h2R", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/check-balanced-parentheses-using-a-stack" },
        { title: "Min Stack", link: "https://leetcode.com/problems/min-stack/", difficulty: "Medium", tags: ["stack", "design"], video: "https://youtu.be/NdDIaH91P0g?si=4_Jbsq5trFvfSdUY" },
        { title: "Evaluate Reverse Polish Notation", link: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", difficulty: "Medium", tags: ["stack"], video: "https://www.youtube.com/watch?v=iu0082c4HDE" },
        { title: "Daily Temperatures", link: "https://leetcode.com/problems/daily-temperatures/", difficulty: "Medium", tags: ["stack"], video: "https://www.youtube.com/watch?v=cTBiBSnjO3c" },
        { title: "Car Fleet", link: "https://leetcode.com/problems/car-fleet/", difficulty: "Medium", tags: ["stack"], video: "https://www.youtube.com/watch?v=Pr6T-3yB9RM" },
        { title: "Largest Rectangle in Histogram", link: "https://leetcode.com/problems/largest-rectangle-in-histogram/", difficulty: "Hard", tags: ["stack"], video: "https://youtu.be/Bzat9vgD0fs?si=DiBlLejXcr6EJoyB", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/largest-rectangle-in-histogram" }
      ]
    },
    {
      id: "binary-search",
      title: "Binary Search",
      problems: [
        { title: "Binary Search", link: "https://leetcode.com/problems/binary-search/", difficulty: "Easy", tags: ["binary-search"], video: "https://youtu.be/MHf6awe89xw", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/binary-search-algorithm" },
        { title: "Search a 2D Matrix", link: "https://leetcode.com/problems/search-a-2d-matrix/", difficulty: "Medium", tags: ["binary-search"], video: "https://youtu.be/ZYpYur0znng", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/search-in-sorted-2d-matrix" },
        { title: "Koko Eating Bananas", link: "https://leetcode.com/problems/koko-eating-bananas/", difficulty: "Medium", tags: ["binary-search"], video: "https://youtu.be/qyfekrNni90", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/koko-eating-bananas" },
        { title: "Find Minimum in Rotated Sorted Array", link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", difficulty: "Medium", tags: ["binary-search"], video: "https://youtu.be/nhEMDKMB44g", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/find-minimum-in-rotated-sorted-array" },
        { title: "Search in Rotated Sorted Array", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium", tags: ["binary-search"], video: "https://www.youtube.com/watch?v=r3pMQ8-Ad5s&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=64", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/search-in-rotated-sorted-array" },
        { title: "Time Based Key-Value Store", link: "https://leetcode.com/problems/time-based-key-value-store/", difficulty: "Medium", tags: ["design", "binary-search"], video: "https://www.youtube.com/watch?v=fu2cD_6E8Hw" },
        { title: "Median of Two Sorted Arrays", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", difficulty: "Hard", tags: ["binary-search"], video: "https://www.youtube.com/watch?v=NTop3VTjmxk&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=65", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/median-of-2-sorted-arrays" }
      ]
    },
    {
      id: "linked-list",
      title: "Linked List",
      problems: [
        { title: "Reverse Linked List", link: "https://leetcode.com/problems/reverse-linked-list/", difficulty: "Easy", tags: ["linked-list"], video: "https://youtu.be/D2vI2DNJGd8?si=RCaLSx01qR21IBdh", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/reverse-a-singly-linked-list" },
        { title: "Merge Two Sorted Lists", link: "https://leetcode.com/problems/merge-two-sorted-lists/", difficulty: "Easy", tags: ["linked-list"], video: "https://www.youtube.com/watch?v=Xb4slcp1U38&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=29", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/merge-two-sorted-linked-lists" },
        { title: "Linked List Cycle", link: "https://leetcode.com/problems/linked-list-cycle/", difficulty: "Easy", tags: ["linked-list"], video: "https://youtu.be/wiOo4DC5GGA?si=zagt6O6tFXc4_3cx", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/detect-cycle-linked-list" },
        { title: "Remove Nth Node From End of List", link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", difficulty: "Medium", tags: ["linked-list"], video: "https://youtu.be/3kMKYQ2wNIU?si=DtFDnPU7z9HMz_GM", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/remove-the-nth-node-from-the-end-of-a-linked-list" },
        { title: "Reorder List", link: "https://leetcode.com/problems/reorder-list/", difficulty: "Medium", tags: ["linked-list"], video: "https://www.youtube.com/watch?v=S5bfdUTrKLM" },
        { title: "Copy List with Random Pointer", link: "https://leetcode.com/problems/copy-list-with-random-pointer/", difficulty: "Medium", tags: ["linked-list"], video: "https://youtu.be/q570bKdrnlw?si=epZtpWvtNwuTf23o", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/clone-linked-list-random-pointer" },
        { title: "Add Two Numbers", link: "https://leetcode.com/problems/add-two-numbers/", difficulty: "Medium", tags: ["linked-list"], video: "https://www.youtube.com/watch?v=LBVsXSMOIk4&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=32", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/add-two-numbers-linked-lists-reverse-order" },
        { title: "Find The Duplicate Number", link: "https://leetcode.com/problems/find-the-duplicate-number/", difficulty: "Medium", tags: ["linked-list"], video: "https://www.youtube.com/watch?v=32Ll35mhWg0&list=PLgUwDviBIf0rPG3Ictpu74YWBQ1CaBkm2&index=1", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/find-the-duplicate-number" },
        { title: "LRU Cache", link: "https://leetcode.com/problems/lru-cache/", difficulty: "Medium", tags: ["design", "linked-list"], video: "https://www.youtube.com/watch?v=z9bJUPxzFOw" },
        { title: "Merge K Sorted Lists", link: "https://leetcode.com/problems/merge-k-sorted-lists/", difficulty: "Hard", tags: ["linked-list", "heap"], video: "https://youtu.be/ykelywHJWLg?si=InMg9MmTHzY22NSR", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/flatten-linked-list" },
        { title: " Reverse Nodes in K Group", link: "https://leetcode.com/problems/reverse-nodes-in-k-group/", difficulty: "Hard", tags: ["linked-list"], video: "https://youtu.be/lIar1skcQYI?si=_jFghHKX4eaK36a1", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/reverse-linked-list-k-groups" }
      ]
    },
    {
      id: "trees",
      title: "Trees",
      problems: [
        { title: "Invert Binary Tree", link: "https://leetcode.com/problems/invert-binary-tree/", difficulty: "Easy", tags: ["tree"], video: "https://www.youtube.com/watch?v=OnSn2XEQ4MY" },
        { title: "Maximum Depth of Binary Tree", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", difficulty: "Easy", tags: ["tree"], video: "https://youtu.be/eD3tmO66aBA" },
        { title: "Diameter of Binary Tree", link: "https://leetcode.com/problems/diameter-of-binary-tree/", difficulty: "Easy", tags: ["tree"], video: "https://youtu.be/Rezetez59Nk", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/diameter-of-a-binary-tree" },
        { title: "Balanced Binary Tree", link: "https://leetcode.com/problems/balanced-binary-tree/", difficulty: "Easy", tags: ["tree"], video: "https://youtu.be/Yt50Jfbd8Po", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/check-if-a-binary-tree-is-height-balanced" },
        { title: "Same Tree", link: "https://leetcode.com/problems/same-tree/", difficulty: "Easy", tags: ["tree"], video: "https://youtu.be/BhuvF_-PWS0", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/check-identical-binary-trees" },
        { title: "Subtree of Another Tree", link: "https://leetcode.com/problems/subtree-of-another-tree/", difficulty: "Easy", tags: ["tree"], video: "https://www.youtube.com/watch?v=E36O5SWp-LE" },
        { title: "Lowest Common Ancestor of a Binary Search Tree", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", difficulty: "Medium", tags: ["tree"], video: "https://youtu.be/cX_kPV_foZc", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/lowest-common-ancestor-of-a-binary-search-tree" },
        { title: "Binary Tree Level Order Traversal", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty: "Medium", tags: ["tree"], video: "https://youtu.be/EoAsWbO7sqg", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/binary-tree-level-order-traversal" },
        { title: "Binary Tree Right Side View", link: "https://leetcode.com/problems/binary-tree-right-side-view/", difficulty: "Medium", tags: ["tree"], video: "https://youtu.be/KV4mRzTjlAk", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/left-and-right-views-of-a-binary-tree" },
        { title: "Count Good Nodes in Binary Tree", link: "https://leetcode.com/problems/count-good-nodes-in-binary-tree/", difficulty: "Medium", tags: ["tree"], video: "https://www.youtube.com/watch?v=7cp5imvDzl4" },
        { title: "Validate Binary Search Tree", link: "https://leetcode.com/problems/validate-binary-search-tree/", difficulty: "Medium", tags: ["tree"], video: "https://youtu.be/f-sj7I5oXEI", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/validate-binary-search-tree" },
        { title: "Kth Smallest Element in a BST", link: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", difficulty: "Medium", tags: ["tree"], video: "https://youtu.be/9TJYWh0adfk", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/kth-smallest-and-largest-elements-in-a-bst" },
        { title: "Construct Binary Tree From Preorder And Inorder Traversal", link: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", difficulty: "Medium", tags: ["tree"], video: "https://youtu.be/aZNaLrVebKQ", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/construct-a-binary-tree-from-preorder-and-inorder" },
        { title: "Binary Tree Maximum Path Sum", link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", difficulty: "Hard", tags: ["tree"], video: "https://youtu.be/WszrfSwMz58", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/binary-tree-maximum-path-sum" },
        { title: "Serialize and Deserialize Binary Tree", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", difficulty: "Hard", tags: ["tree"], video: "https://youtu.be/-YbXySKJsX8", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/serialize-and-deserialize-a-binary-tree" }
      ]
    },
    {
      id: "heap-priority-queue",
      title: "Heap / Priority Queue",
      problems: [
        { title: "Kth Largest Element in a Stream", link: "https://leetcode.com/problems/kth-largest-element-in-a-stream/", difficulty: "Easy", tags: ["heap"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/kth-largest-element-stream", video: "https://www.youtube.com/watch?v=hOjcdrqMoQ8" },
        { title: "Last Stone Weight", link: "https://leetcode.com/problems/last-stone-weight/", difficulty: "Easy", tags: ["heap"], video: "https://www.youtube.com/watch?v=B-QCq79-Vfw" },
        { title: "K Closest Points to Origin", link: "https://leetcode.com/problems/k-closest-points-to-origin/", difficulty: "Medium", tags: ["heap"], video: "https://www.youtube.com/watch?v=rI2EBUEMfTk" },
        { title: "Kth Largest Element in An Array", link: "https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty: "Medium", tags: ["heap"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/k-th-largest-element-in-an-array", video: "https://www.youtube.com/watch?v=XEmy13g1Qxc" },
        { title: " Task Scheduler", link: "https://leetcode.com/problems/task-scheduler/", difficulty: "Medium", tags: ["heap"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/task-scheduler", video: "https://www.youtube.com/watch?v=s8p8ukTyA2I" },
        { title: "Design Twitter", link: "https://leetcode.com/problems/design-twitter/", difficulty: "Medium", tags: ["heap", "design"], video: "https://www.youtube.com/watch?v=pNichitDD2E" },
        { title: "Find Median from Data Stream", link: "https://leetcode.com/problems/find-median-from-data-stream/", difficulty: "Hard", tags: ["heap", "design"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/find-median-data-stream", video: "https://www.youtube.com/watch?v=itmhHWaHupI" }
      ]
    },
    {
      id: "backtracking",
      title: "Backtracking",
      problems: [
        { title: "Generate Parentheses", link: "https://leetcode.com/problems/generate-parentheses/", difficulty: "Medium", tags: ["backtracking"], video: "https://www.youtube.com/watch?v=s9fokUqJ76A" },
        { title: "Subsets", link: "https://leetcode.com/problems/subsets/", difficulty: "Medium", tags: ["backtracking"], video: "https://www.youtube.com/watch?v=rYkfBRtMJr8&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=52" },
        { title: "Subsets II", link: "https://leetcode.com/problems/subsets-ii/", difficulty: "Medium", tags: ["backtracking"], video: "https://www.youtube.com/watch?v=RIn3gOkbhQE&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=53" },
        { title: "Permutations", link: "https://leetcode.com/problems/permutations/", difficulty: "Medium", tags: ["backtracking"], video: "https://www.youtube.com/watch?v=s7AvT7cGdSo" },
        { title: "Combination Sum", link: "https://leetcode.com/problems/combination-sum/", difficulty: "Medium", tags: ["backtracking"], video: "https://www.youtube.com/watch?v=OyZFFqQtu98&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=49", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/combination-sum" },
        { title: "Word Search", link: "https://leetcode.com/problems/word-search/", difficulty: "Medium", tags: ["backtracking"], video: "https://www.youtube.com/watch?v=pfiQ_PS1g8E" },
        { title: "Palindrome Partitioning", link: "https://leetcode.com/problems/palindrome-partitioning/", difficulty: "Medium", tags: ["backtracking"], video: "https://youtu.be/_H8V5hJUGd0", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/palindromic-partitioning" },
        { title: "Combination Sum II", link: "https://leetcode.com/problems/combination-sum-ii/", difficulty: "Medium", tags: ["backtracking"], video: "https://www.youtube.com/watch?v=G1fRTGRxXU8&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=50" },
        { title: "Letter Combinations of a Phone Number", link: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/", difficulty: "Medium", tags: ["backtracking"], video: "https://www.youtube.com/watch?v=0snEunUacZY" },
        { title: "N-Queens", link: "https://leetcode.com/problems/n-queens/", difficulty: "Hard", tags: ["backtracking"], video: "https://www.youtube.com/watch?v=i05Ju7AftcM&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=57" }
      ]
    },
    {
      id: "trie",
      title: "Trie",
      problems: [
        { title: "Implement Trie Prefix Tree", link: "https://leetcode.com/problems/implement-trie-prefix-tree/", difficulty: "Medium", tags: ["trie"], video: "https://www.youtube.com/watch?v=dBGUmUQhjaM&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/trie-implementation" },
        { title: "Design Add and Search Words Data Structure", link: "https://leetcode.com/problems/add-and-search-word-data-structure-design/", difficulty: "Medium", tags: ["trie"], video: "https://www.youtube.com/watch?v=BTf05gs_8iU" },
        { title: "Word Search II", link: "https://leetcode.com/problems/word-search-ii/", difficulty: "Hard", tags: ["trie", "backtracking"], video: "https://www.youtube.com/watch?v=pfiQ_PS1g8E" }
      ]
    },
    {
      id: "graph",
      title: "Graph",
      problems: [
        { title: "Number of Islands", link: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium", tags: ["graph"], video: "https://www.youtube.com/watch?v=muncqlKJrH0&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=8" },
        { title: "Max Area of Island", link: "https://leetcode.com/problems/max-area-of-island/", difficulty: "Medium", tags: ["graph"], video: "https://www.youtube.com/watch?v=iJGr1OtmH0c" },
        { title: "Clone Graph", link: "https://leetcode.com/problems/clone-graph/", difficulty: "Medium", tags: ["graph"], video: "https://www.youtube.com/watch?v=mQeF6bN8hMk" },
        { title: "Walls And Gates", link: "https://leetcode.com/problems/walls-and-gates/", difficulty: "Medium", tags: ["graph"] },
        { title: "Rotting Oranges", link: "https://leetcode.com/problems/rotting-oranges/", difficulty: "Medium", tags: ["graph"], video: "https://www.youtube.com/watch?v=yf3oUhkvqA0", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/rotting-oranges" },
        { title: "Pacific Atlantic Water FLow", link: "https://leetcode.com/problems/pacific-atlantic-water-flow/", difficulty: "Medium", tags: ["graph"], video: "https://www.youtube.com/watch?v=s-VkcjHqkGI" },
        { title: "Surrounded Regions", link: "https://leetcode.com/problems/surrounded-regions/", difficulty: "Medium", tags: ["graph"], video: "https://youtu.be/BtdgAys4yMk", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/surrounded-regions" },
        { title: "Course Schedule", link: "https://leetcode.com/problems/course-schedule/", difficulty: "Medium", tags: ["graph"], video: "https://youtu.be/zQ3zgFypzX4", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/detect-a-cycle-in-an-undirected-graph" },
        { title: "Course Schedule II", link: "https://leetcode.com/problems/course-schedule-ii/", difficulty: "Medium", tags: ["graph"], video: "https://youtu.be/WAOfKpxYHR8", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/course-schedule-ii" },
        { title: "Graph Valid Tree", link: "https://leetcode.com/problems/graph-valid-tree/", difficulty: "Medium", tags: ["graph"] },
        { title: "Number of Connected Components in An Undirected Graph", link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/", difficulty: "Medium", tags: ["graph"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/connected-components" },
        { title: "Redundant Connection", link: "https://leetcode.com/problems/redundant-connection/", difficulty: "Medium", tags: ["graph"], video: "https://www.youtube.com/watch?v=FXWRE67PLL0" },
        { title: "Word Ladder", link: "https://leetcode.com/problems/word-ladder/", difficulty: "Hard", tags: ["graph"], video: "https://youtu.be/tRPda0rcf8E", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/word-ladder" }
      ]
    },
    {
      id: "advanced-graphs",
      title: "Advanced Graphs",
      problems: [
        { title: "Network Delay Time", link: "https://leetcode.com/problems/network-delay-time/", difficulty: "Medium", tags: ["graph"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/network-delay-time", video: "https://www.youtube.com/watch?v=EaphyqKU4PQ" },
        { title: "Reconstruct Itinerary", link: "https://leetcode.com/problems/reconstruct-itinerary/", difficulty: "Hard", tags: ["graph"] },
        { title: "Min Cost to Connect All Points", link: "https://leetcode.com/problems/min-cost-to-connect-all-points/", difficulty: "Medium", tags: ["graph"], video: "https://www.youtube.com/watch?v=f7JOBJIC-NA" },
        { title: "Swim in Rising Water", link: "https://leetcode.com/problems/swim-in-rising-water/", difficulty: "Hard", tags: ["graph"], video: "https://www.youtube.com/watch?v=amvrKlMLuGY" },
        { title: "Alien Dictionary", link: "https://leetcode.com/problems/alien-dictionary/", difficulty: "Hard", tags: ["graph"], video: "https://youtu.be/U3N_je7tWAs", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/alien-dictionary" },
        { title: "Cheapest Flights Within K Stops", link: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", difficulty: "Medium", tags: ["graph"], video: "https://youtu.be/9XybHVqTHcQ", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/cheapest-flights-within-k-stops" }
      ]
    },
    {
      id: "1d-dynamic-programming",
      title: "1D Dynamic Programming",
      problems: [
        { title: "Climbing Stairs", link: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy", tags: ["dp"], video: "https://youtu.be/mLfjzJsN8us", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/climbing-stairs" },
        { title: "Min Cost Climbing Stairs", link: "https://leetcode.com/problems/min-cost-climbing-stairs/", difficulty: "Easy", tags: ["dp"], video: "https://www.youtube.com/watch?v=ktmzAZWkEZ0" },
        { title: "House Robber", link: "https://leetcode.com/problems/house-robber/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=3WaxQMELSkw", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/house-robber-ii" },
        { title: "House Robber II", link: "https://leetcode.com/problems/house-robber-ii/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=rWAJCfYYOvM" },
        { title: "Longest Palindromic Substring", link: "https://leetcode.com/problems/longest-palindromic-substring/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=XYQecbcd6_c" },
        { title: "Palindromic Substrings", link: "https://leetcode.com/problems/palindromic-substrings/", difficulty: "Medium", tags: ["dp"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/palindromic-substrings", video: "https://www.youtube.com/watch?v=4RACzI5-du8" },
        { title: "Decode Ways", link: "https://leetcode.com/problems/decode-ways/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=6aEyTjOwlJU" },
        { title: "Coin Change", link: "https://leetcode.com/problems/coin-change/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=myPeWb3Y68A", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/minimum-coins" },
        { title: "Maximum Product Subarray", link: "https://leetcode.com/problems/maximum-product-subarray/", difficulty: "Medium", tags: ["dp"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/maximum-product-subarray", video: "https://www.youtube.com/watch?v=lXVy6YWFcRM" },
        { title: "Word Break", link: "https://leetcode.com/problems/word-break/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=Sx9NNgInc3A" },
        { title: "Longest Increasing Subsequence", link: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "Medium", tags: ["dp"], video: "https://youtu.be/on2hvxBXJH4", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/longest-increasing-subsequence" },
        { title: "Partition Equal Subset Sum", link: "https://leetcode.com/problems/partition-equal-subset-sum/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=7win3dcgo3k", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/partition-equal-subset-sum" }
      ]
    },
    {
      id: "2d-dynamic-programming",
      title: "2D Dynamic Programming",
      problems: [
        { title: "Unique Paths", link: "https://leetcode.com/problems/unique-paths/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=sdE0A2Oxofw", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/grid-unique-paths" },
        { title: "Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "Medium", tags: ["dp"], video: "https://youtu.be/-zI4mrF2Pb4", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/longest-common-subsequence" },
        { title: "Best Time to Buy And Sell Stock with Cooldown", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/", difficulty: "Medium", tags: ["dp"], video: "https://youtu.be/IGIe46xw3YY", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/best-time-to-buy-and-sell-stock-with-cooldown" },
        { title: "Coin Change II", link: "https://leetcode.com/problems/coin-change-ii/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=HgyouUi11zk", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/coin-change-ii-combinations" },
        { title: "Target Sum", link: "https://leetcode.com/problems/target-sum/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=b3GD8263-PQ" },
        { title: "Interleaving String", link: "https://leetcode.com/problems/interleaving-string/", difficulty: "Medium", tags: ["dp"] },
        { title: "Longest Increasing Path In a Matrix", link: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/", difficulty: "Hard", tags: ["dp"], video: "https://www.youtube.com/watch?v=wCc_nd-GiEc" },
        { title: "Distinct Subsequences", link: "https://leetcode.com/problems/distinct-subsequences/", difficulty: "Hard", tags: ["dp"], video: "https://youtu.be/nVG7eTiD2bY" },
        { title: "Edit Distance", link: "https://leetcode.com/problems/edit-distance/", difficulty: "Medium", tags: ["dp"], video: "https://youtu.be/fJaKO8FbDdo" },
        { title: "Burst Balloons", link: "https://leetcode.com/problems/burst-balloons/", difficulty: "Hard", tags: ["dp"], video: "https://youtu.be/Yz4LlDSlkns" },
        { title: "Regular Expression Matching", link: "https://leetcode.com/problems/regular-expression-matching/", difficulty: "Hard", tags: ["dp"], video: "https://www.youtube.com/watch?v=HAA8mgxlov8" },
      ]
    },
    {
      id: "greedy",
      title: "Greedy",
      problems: [
        { title: "Maximum Subarray", link: "https://leetcode.com/problems/maximum-subarray/", difficulty: "Medium", tags: ["greedy"], video: "https://youtu.be/AHZpyENo7k4", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/kadanes-algorithm" },
        { title: "Jump Game", link: "https://leetcode.com/problems/jump-game/", difficulty: "Medium", tags: ["greedy"], video: "https://youtu.be/tZAa_jJ3SwQ?si=voKd7n9VTLDRRNzJ", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/jump-game" },
        { title: "Jump Game II", link: "https://leetcode.com/problems/jump-game-ii/", difficulty: "Medium", tags: ["greedy"], video: "https://youtu.be/7SBVnw7GSTk?si=9uUouBELh9K3m2jZ", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/jump-game-ii-minimum-jumps" },
        { title: "Gas Station", link: "https://leetcode.com/problems/gas-station/", difficulty: "Medium", tags: ["greedy"], video: "https://www.youtube.com/watch?v=lJwbPZGo05A" },
        { title: "Hand of Straights", link: "https://leetcode.com/problems/hand-of-straights/", difficulty: "Medium", tags: ["greedy"], video: "https://www.youtube.com/watch?v=amnrMCVd2YI" },
        { title: "Merge Triplets to Form Target Triplet", link: "https://leetcode.com/problems/merge-triplets-to-form-target-triplet/", difficulty: "Medium", tags: ["greedy"], video: "https://www.youtube.com/watch?v=kShkQLQZ9K4" },
        { title: "Partition Labels", link: "https://leetcode.com/problems/partition-labels/", difficulty: "Medium", tags: ["greedy"], video: "https://www.youtube.com/watch?v=B7m8UmZE-vw" },
        { title: "Valid Parenthesis String", link: "https://leetcode.com/problems/valid-parenthesis-string/", difficulty: "Medium", tags: ["greedy"], video: "https://youtu.be/cHT6sG_hUZI?si=XRHeyh7jOaLaTy3g" }
      ]
    },
    {
      id: "intervals",
      title: "Intervals",
      problems: [
        { title: "Insert Interval", link: "https://leetcode.com/problems/insert-interval/", difficulty: "Medium", tags: ["intervals"], video: "https://youtu.be/xxRE-46OCC8?si=a7aPuIw16zDx2lAa", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/insert-interval" },
        { title: "Merge Intervals", link: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium", tags: ["intervals"], video: "https://www.youtube.com/watch?v=2JzRBPFYbKE&list=PLgUwDviBIf0rPG3Ictpu74YWBQ1CaBkm2&index=6", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/merge-overlapping-intervals" },
        { title: "Non-overlapping Intervals", link: "https://leetcode.com/problems/non-overlapping-intervals/", difficulty: "Medium", tags: ["intervals"], video: "https://youtu.be/HDHQ8lAWakY?si=JVtLqboGdpUTOVjf", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/non-overlapping-intervals" },
        { title: "Meeting Rooms", link: "https://leetcode.com/problems/meeting-rooms/", difficulty: "Easy", tags: ["intervals"] },
        { title: "Meeting Rooms II", link: "https://leetcode.com/problems/meeting-rooms-ii/", difficulty: "Medium", tags: ["intervals"] },
        { title: "Minimum Interval to Include Each Query", link: "https://leetcode.com/problems/minimum-interval-to-include-each-query/", difficulty: "Hard", tags: ["intervals"], video: "https://www.youtube.com/watch?v=5hQ5WWW5awQ" }
      ]
    },
    {
      id: "math-geometry",
      title: "Math & Geometry",
      problems: [
        { title: "Rotate Image", link: "https://leetcode.com/problems/rotate-image/", difficulty: "Medium", tags: ["math", "geometry"], video: "https://youtu.be/Z0R2u6gd3GU", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/rotate-matrix-90-degrees-clockwise" },
        { title: "Spiral Matrix", link: "https://leetcode.com/problems/spiral-matrix/", difficulty: "Medium", tags: ["math", "geometry"], video: "https://youtu.be/3Zv-s9UUrFM", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/spiral-traversal-of-a-matrix" },
        { title: "Set Matrix Zeroes", link: "https://leetcode.com/problems/set-matrix-zeroes/", difficulty: "Medium", tags: ["math", "geometry"], video: "https://youtu.be/N0MgLvceX7M", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/set-matrix-zeroes" },
        { title: "Happy Number", link: "https://leetcode.com/problems/happy-number/", difficulty: "Easy", tags: ["math"], video: "https://www.youtube.com/watch?v=ljz85bxOYJ0" },
        { title: "Plus One", link: "https://leetcode.com/problems/plus-one/", difficulty: "Easy", tags: ["math"], video: "https://www.youtube.com/watch?v=jIaA8boiG1s" },
        { title: "Pow(x, n)", link: "https://leetcode.com/problems/powx-n/", difficulty: "Medium", tags: ["math"], video: "https://youtu.be/l0YC3876qxg" },
        { title: "Multiply Strings", link: "https://leetcode.com/problems/multiply-strings/", difficulty: "Medium", tags: ["math"] },
        { title: "Detect Squares", link: "https://leetcode.com/problems/detect-squares/", difficulty: "Medium", tags: ["math"], video: "https://www.youtube.com/watch?v=bahebearrDc" },
      ]
    },
    {
      id: "bit-manipulation",
      title: "Bit Manipulation",
      problems: [
        { title: "Single Number", link: "https://leetcode.com/problems/single-number/", difficulty: "Easy", tags: ["bit-manipulation"], video: "https://youtu.be/bYWLJb3vCWY?t=1369", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/single-number-i" },
        { title: "Number of 1 Bits", link: "https://leetcode.com/problems/number-of-1-bits/", difficulty: "Easy", tags: ["bit-manipulation"], video: "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/count-set-bits-in-an-integer" },
        { title: "Counting Bits", link: "https://leetcode.com/problems/counting-bits/", difficulty: "Easy", tags: ["bit-manipulation"], video: "https://www.youtube.com/watch?v=RyBM56RIWrM" },
        { title: "Missing Number", link: "https://leetcode.com/problems/missing-number/", difficulty: "Easy", tags: ["bit-manipulation"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/missing-number-solutions", video: "https://www.youtube.com/watch?v=WnPLSRLSANE" },
        { title: "Reverse Bits", link: "https://leetcode.com/problems/reverse-bits/", difficulty: "Easy", tags: ["bit-manipulation"], video: "https://www.youtube.com/watch?v=UcoN6UjAI64" },
        { title: "Sum of Two Integers", link: "https://leetcode.com/problems/sum-of-two-integers/", difficulty: "Medium", tags: ["bit-manipulation"], video: "https://www.youtube.com/watch?v=gVUrDV4tZfY" },
        { title: "Reverse Integer", link: "https://leetcode.com/problems/reverse-integer/", difficulty: "Medium", tags: ["bit-manipulation"], video: "https://youtu.be/1xNbjMdbjug?t=930", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/reverse-digits-of-a-number" }
      ]
    }
  ]
};

const seedNeetCode150 = async () => {
  await connectDB();
  await DSASheet.findOneAndUpdate(
    { slug: neetcode150Data.slug },
    neetcode150Data,
    { upsert: true, returnDocument: 'after' }
  );
  console.log('NeetCode 150 Sheet Seeded');
};




module.exports = seedNeetCode150;
module.exports.data = neetcode150Data;