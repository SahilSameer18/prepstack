const DSASheet = require('../../sheets.model');
const connectDB = require('../../../../shared/config/seedConfig');

const blind75Data = {
  name: "Blind 75 DSA Sheet",
  slug: "blind-75",
  description: "A curated list of 75 essential LeetCode problems to ace coding interviews.",
  topics: [
    {
      id: "arrays-hashing",
      title: "Arrays & Hashing",
      problems: [
        { title: "Two Sum", link: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", tags: ["array", "hashmap"], video: "https://youtu.be/UXDSeD9mN-k", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/two-sum" },
        { title: "Contains Duplicate", link: "https://leetcode.com/problems/contains-duplicate/", difficulty: "Easy", tags: ["array", "hashset"], video: "https://www.youtube.com/watch?v=3OamzN90kPg" },
        { title: "Valid Anagram", link: "https://leetcode.com/problems/valid-anagram/", difficulty: "Easy", tags: ["array", "hashmap"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/check-if-two-strings-are-anagrams", video: "https://www.youtube.com/watch?v=9UtInBqnCgA" },
        { title: "Group Anagrams", link: "https://leetcode.com/problems/group-anagrams/", difficulty: "Medium", tags: ["array", "hashmap"], video: "https://www.youtube.com/watch?v=vzdNOK2oB2E" },
        { title: "Top K Frequent Elements", link: "https://leetcode.com/problems/top-k-frequent-elements/", difficulty: "Medium", tags: ["array", "hashmap", "heap"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/top-k-frequent-elements", video: "https://www.youtube.com/watch?v=YPTqKIgVk-k" },
        { title: "Product of Array Except Self", link: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium", tags: ["array", "prefix", "math"], video: "https://www.youtube.com/watch?v=bNvIQI2wAjk" },
        { title: "Encode and Decode Strings", link: "https://leetcode.com/problems/encode-and-decode-strings/", difficulty: "Medium", tags: ["string", "hashmap"] },
        { title: "Longest Consecutive Sequence", link: "https://leetcode.com/problems/longest-consecutive-sequence/", difficulty: "Medium", tags: ["array", "hashset"], video: "https://youtu.be/oO5uLE7EUlM", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/longest-consecutive-sequence-in-an-array" }
      ]
    },
    {
      id: "two-pointers",
      title: "Two Pointers",
      problems: [
        { title: "Valid Palindrome", link: "https://leetcode.com/problems/valid-palindrome/", difficulty: "Easy", tags: ["string", "two-pointers"], video: "https://www.youtube.com/watch?v=twuC1F6gLI8&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9&index=4", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/valid-palindrome" },
        { title: "3Sum", link: "https://leetcode.com/problems/3sum/", difficulty: "Medium", tags: ["array", "two-pointers", "sorting"], video: "https://youtu.be/DhFh8Kw7ymk", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/3sum" },
        { title: "Container With Most Water", link: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium", tags: ["array", "two-pointers"], video: "https://www.youtube.com/watch?v=UuiTKBwPgAo" }
      ]
    },
    {
      id: "sliding-window",
      title: "Sliding Window",
      problems: [
        {
          title: "Best Time to Buy And Sell Stock",
          link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
          difficulty: "Easy",
          tags: ["array", "greedy"]
        },
        { title: "Longest Substring Without Repeating Characters", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "Medium", tags: ["string", "sliding-window"], video: "https://youtu.be/-zSxTJkcdAo?si=I2zfR-vlDMg0zU9z", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/longest-substring-without-repeating-characters" },
        { title: "Longest Repeating Character Replacement", link: "https://leetcode.com/problems/longest-repeating-character-replacement/", difficulty: "Medium", tags: ["string", "sliding-window"], video: "https://youtu.be/_eNhaDCr6P0?si=pBWcEjozF5poom0p", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/longest-repeating-character-replacement" },
        { title: "Minimum Window Substring", link: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "Hard", tags: ["string", "sliding-window"], video: "https://youtu.be/WJaij9ffOIY?si=-xnsWIH84zWU0ICd", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/minimum-window-substring" }
      ]
    },
    {
      id: "stack",
      title: "Stack",
      problems: [
        { title: "Valid Parentheses", link: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy", tags: ["stack"], video: "https://youtu.be/xwjS0iZhw4I?si=UoyKpFn4Q3nf5h2R", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/check-balanced-parentheses-using-a-stack" },
      ]
    },
    {
      id: "binary-search",
      title: "Binary Search",
      problems: [
        { title: "Find Minimum In Rotated Sorted Array", link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", difficulty: "Medium", tags: ["binary-search"], video: "https://youtu.be/nhEMDKMB44g", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/find-minimum-in-rotated-sorted-array" },
        { title: "Search In Rotated Sorted Array", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium", tags: ["binary-search"], video: "https://www.youtube.com/watch?v=r3pMQ8-Ad5s&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=64", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/search-in-rotated-sorted-array" },
      ]
    },
    {
      id: "linked-list",
      title: "Linked List",
      problems: [
        { title: "Reverse Linked List", link: "https://leetcode.com/problems/reverse-linked-list/", difficulty: "Easy", tags: ["linked-list"], video: "https://youtu.be/D2vI2DNJGd8?si=RCaLSx01qR21IBdh", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/reverse-a-singly-linked-list" },
        { title: "Merge Two Sorted Lists", link: "https://leetcode.com/problems/merge-two-sorted-lists/", difficulty: "Easy", tags: ["linked-list"], video: "https://www.youtube.com/watch?v=Xb4slcp1U38&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=29", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/merge-two-sorted-linked-lists" },
        { title: "Linked List Cycle", link: "https://leetcode.com/problems/linked-list-cycle/", difficulty: "Easy", tags: ["linked-list"], video: "https://youtu.be/wiOo4DC5GGA?si=zagt6O6tFXc4_3cx", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/detect-cycle-linked-list" },
        { title: "Reorder List", link: "https://leetcode.com/problems/reorder-list/", difficulty: "Medium", tags: ["linked-list"], video: "https://www.youtube.com/watch?v=S5bfdUTrKLM" },
        { title: "Remove Nth Node From End of List", link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", difficulty: "Medium", tags: ["linked-list"], video: "https://youtu.be/3kMKYQ2wNIU?si=DtFDnPU7z9HMz_GM", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/remove-the-nth-node-from-the-end-of-a-linked-list" },
        { title: "Merge K Sorted Lists", link: "https://leetcode.com/problems/merge-k-sorted-lists/", difficulty: "Hard", tags: ["linked-list"], video: "https://youtu.be/ykelywHJWLg?si=InMg9MmTHzY22NSR", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/flatten-linked-list" }
      ]
    },
    {
      id: "trees",
      title: "Trees",
      problems: [
        { title: "Invert Binary Tree", link: "https://leetcode.com/problems/invert-binary-tree/", difficulty: "Easy", tags: ["tree"], video: "https://www.youtube.com/watch?v=OnSn2XEQ4MY" },
        { title: "Maximum Depth of Binary Tree", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", difficulty: "Easy", tags: ["tree"], video: "https://youtu.be/eD3tmO66aBA" },
        { title: "Same Tree", link: "https://leetcode.com/problems/same-tree/", difficulty: "Easy", tags: ["tree"], video: "https://youtu.be/BhuvF_-PWS0", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/check-identical-binary-trees" },
        { title: "Subtree of Another Tree", link: "https://leetcode.com/problems/subtree-of-another-tree/", difficulty: "Easy", tags: ["tree"], video: "https://www.youtube.com/watch?v=E36O5SWp-LE" },
        { title: "Lowest Common Ancestor of a Binary Search Tree", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", difficulty: "Medium", tags: ["tree"], video: "https://youtu.be/cX_kPV_foZc", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/lowest-common-ancestor-of-a-binary-search-tree" },
        { title: "Binary Tree Level Order Traversal", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty: "Medium", tags: ["tree"], video: "https://youtu.be/EoAsWbO7sqg", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/binary-tree-level-order-traversal" },
        { title: "Validate Binary Search Tree", link: "https://leetcode.com/problems/validate-binary-search-tree/", difficulty: "Medium", tags: ["tree"], video: "https://youtu.be/f-sj7I5oXEI", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/validate-binary-search-tree" },
        { title: "Kth Smallest Element in a BST", link: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", difficulty: "Medium", tags: ["tree"], video: "https://youtu.be/9TJYWh0adfk", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/kth-smallest-and-largest-elements-in-a-bst" },
        { title: "Construct Binary Tree from Preorder and Inorder Traversal", link: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", difficulty: "Medium", tags: ["tree"], video: "https://youtu.be/aZNaLrVebKQ", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/construct-a-binary-tree-from-preorder-and-inorder" },
        { title: "Binary Tree Maximum Path Sum", link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", difficulty: "Hard", tags: ["tree"], video: "https://youtu.be/WszrfSwMz58", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/binary-tree-maximum-path-sum" },
        { title: "Serialize and Deserialize Binary Tree", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", difficulty: "Hard", tags: ["tree"], video: "https://youtu.be/-YbXySKJsX8", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/serialize-and-deserialize-a-binary-tree" }
      ]
    },
    {
      id: "heap-priority-queue",
      title: " Heap/Priority Queue",
      problems: [
        { title: "Find Median from Data Stream", link: "https://leetcode.com/problems/find-median-from-data-stream/", difficulty: "Hard", tags: ["heap", "priority-queue"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/find-median-data-stream", video: "https://www.youtube.com/watch?v=itmhHWaHupI" }
      ]
    },
    {
      id: "backtracking",
      title: "Backtracking",
      problems: [
        { title: "Word Search", link: "https://leetcode.com/problems/word-search/", difficulty: "Medium", tags: ["backtracking"], video: "https://www.youtube.com/watch?v=pfiQ_PS1g8E" },
        { title: "Combination Sum", link: "https://leetcode.com/problems/combination-sum/", difficulty: "Medium", tags: ["backtracking"], video: "https://www.youtube.com/watch?v=OyZFFqQtu98&list=PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma&index=49", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/combination-sum" }
      ]
    },
    {
      id: "trie",
      title: "Trie",
      problems: [
        { title: "Implement Trie (Prefix Tree)", link: "https://leetcode.com/problems/implement-trie-prefix-tree/", difficulty: "Medium", tags: ["trie"], video: "https://www.youtube.com/watch?v=dBGUmUQhjaM&list=PLgUwDviBIf0pcIDCZnxhv0LkHf5KzG9zp", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/trie-implementation" },
        { title: "Design Add and Search Words Data Structure", link: "https://leetcode.com/problems/design-add-and-search-words-data-structure/", difficulty: "Medium", tags: ["trie"], video: "https://www.youtube.com/watch?v=BTf05gs_8iU" },
        { title: "Word Search II", link: "https://leetcode.com/problems/word-search-ii/", difficulty: "Hard", tags: ["trie", "backtracking"], video: "https://www.youtube.com/watch?v=pfiQ_PS1g8E" }
      ]
    },
    {
      id: "graph",
      title: "Graph",
      problems: [
        { title: "Clone Graph", link: "https://leetcode.com/problems/clone-graph/", difficulty: "Medium", tags: ["graph", "dfs", "bfs"], video: "https://www.youtube.com/watch?v=mQeF6bN8hMk" },
        { title: "Course Schedule", link: "https://leetcode.com/problems/course-schedule/", difficulty: "Medium", tags: ["graph", "topological-sort"], video: "https://youtu.be/zQ3zgFypzX4", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/detect-a-cycle-in-an-undirected-graph" },
        { title: "Pacific Atlantic Water Flow", link: "https://leetcode.com/problems/pacific-atlantic-water-flow/", difficulty: "Medium", tags: ["graph", "dfs"], video: "https://www.youtube.com/watch?v=s-VkcjHqkGI" },
        { title: "Number of Islands", link: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium", tags: ["graph", "dfs", "matrix"], video: "https://www.youtube.com/watch?v=muncqlKJrH0&list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn&index=8" },
        { title: "Alien Dictionary", link: "https://leetcode.com/problems/alien-dictionary/", difficulty: "Hard", tags: ["graph", "topological-sort"], video: "https://youtu.be/U3N_je7tWAs", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/alien-dictionary" },
        { title: "Graph Valid Tree", link: "https://leetcode.com/problems/graph-valid-tree/", difficulty: "Medium", tags: ["graph", "union-find"] },
        { title: "Number of Connected Components In An Undirected Graph", link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/", difficulty: "Medium", tags: ["graph", "union-find"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/connected-components" }
      ]
    },
    {
      id: "dynamic-programming",
      title: "Dynamic Programming",
      problems: [
        { title: "Climbing Stairs", link: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy", tags: ["dp"], video: "https://youtu.be/mLfjzJsN8us", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/climbing-stairs" },
        { title: "House Robber", link: "https://leetcode.com/problems/house-robber/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=3WaxQMELSkw", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/house-robber-ii" },
        { title: "House Robber II", link: "https://leetcode.com/problems/house-robber-ii/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=rWAJCfYYOvM" },
        { title: "Longest Palindromic Substring", link: "https://leetcode.com/problems/longest-palindromic-substring/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=XYQecbcd6_c" },
        { title: "Palindromic Substrings", link: "https://leetcode.com/problems/palindromic-substring/", difficulty: "Medium", tags: ["dp"] },
        { title: "Decode Ways", link: "https://leetcode.com/problems/decode-ways/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=6aEyTjOwlJU" },
        { title: "Coin Change", link: "https://leetcode.com/problems/coin-change/", difficulty: "Medium", tags: ["dp"], video: "https://www.youtube.com/watch?v=myPeWb3Y68A", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/minimum-coins" },
        { title: "Maximum Product Subarray", link: "https://leetcode.com/problems/maximum-product-subarray/", difficulty: "Medium", tags: ["dp"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/maximum-product-subarray", video: "https://www.youtube.com/watch?v=lXVy6YWFcRM" },
        { title: "Word Break", link: "https://leetcode.com/problems/word-break/", difficulty: "Medium", tags: ["dp", "trie"], video: "https://www.youtube.com/watch?v=Sx9NNgInc3A" },
        { title: "Longest Increasing Subsequence", link: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "Medium", tags: ["dp", "binary-search"], video: "https://youtu.be/on2hvxBXJH4", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/longest-increasing-subsequence" },
      ]
    },
    {
      id: "2-d-dynamic-programming",
      title: "2-D Dynamic Programming",
      problems: [
        { title: "Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "Medium", tags: ["dp"], video: "https://youtu.be/-zI4mrF2Pb4", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/longest-common-subsequence" },
        { title: "Unique Paths", link: "https://leetcode.com/problems/unique-paths/", difficulty: "Medium", tags: ["dp", "combinatorics"], video: "https://www.youtube.com/watch?v=sdE0A2Oxofw", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/grid-unique-paths" },
      ]
    },
    {
      id: "greedy",
      title: "Greedy",
      problems: [
        { title: "Maximum Subarray", link: "https://leetcode.com/problems/maximum-subarray/", difficulty: "Medium", tags: ["greedy", "dp"], video: "https://youtu.be/AHZpyENo7k4", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/kadanes-algorithm" },
        { title: "Jump Game", link: "https://leetcode.com/problems/jump-game/", difficulty: "Medium", tags: ["greedy", "dp"], video: "https://youtu.be/tZAa_jJ3SwQ?si=voKd7n9VTLDRRNzJ", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/jump-game" },
      ]
    },
    {
      id: "intervals",
      title: "Intervals",
      problems: [
        { title: "Insert Interval", link: "https://leetcode.com/problems/insert-interval/", difficulty: "Medium", tags: ["intervals"], video: "https://youtu.be/xxRE-46OCC8?si=a7aPuIw16zDx2lAa", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/insert-interval" },
        { title: "Merge Intervals", link: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium", tags: ["intervals"], video: "https://www.youtube.com/watch?v=2JzRBPFYbKE&list=PLgUwDviBIf0rPG3Ictpu74YWBQ1CaBkm2&index=6", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/merge-overlapping-intervals" },
        { title: "Non-overlapping Intervals", link: "https://leetcode.com/problems/non-overlapping-intervals/", difficulty: "Medium", tags: ["intervals", "greedy"], video: "https://youtu.be/HDHQ8lAWakY?si=JVtLqboGdpUTOVjf", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/non-overlapping-intervals" },
        { title: "Meeting Rooms", link: "https://leetcode.com/problems/meeting-rooms/", difficulty: "Easy", tags: ["intervals"] },
        { title: "Meeting Rooms II", link: "https://leetcode.com/problems/meeting-rooms-ii/", difficulty: "Medium", tags: ["intervals", "heap"] }
      ]
    },
    {
      id: "math-geometry",
      title: "Math & Geometry",
      problems: [
        { title: "Rotate Image", link: "https://leetcode.com/problems/rotate-image/", difficulty: "Medium", tags: ["matrix", "geometry"], video: "https://youtu.be/Z0R2u6gd3GU", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/rotate-matrix-90-degrees-clockwise" },
        { title: "Spiral Matrix", link: "https://leetcode.com/problems/spiral-matrix/", difficulty: "Medium", tags: ["matrix"], video: "https://youtu.be/3Zv-s9UUrFM", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/spiral-traversal-of-a-matrix" },
        { title: "Set Matrix Zeroes", link: "https://leetcode.com/problems/set-matrix-zeroes/", difficulty: "Medium", tags: ["matrix"], video: "https://youtu.be/N0MgLvceX7M", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/set-matrix-zeroes" },
      ]
    },
    {
      id: "bit-manipulation",
      title: "Bit Manipulation",
      problems: [
        { title: "Number of 1 Bits", link: "https://leetcode.com/problems/number-of-1-bits/", difficulty: "Easy", tags: ["bit-manipulation"], video: "https://youtu.be/nttpF8kwgd4?si=x9o8PsYaA2XVZ9rV", article: "https://takeuforward.org/blogs/data-structure-and-algorithm/count-set-bits-in-an-integer" },
        { title: "Counting Bits", link: "https://leetcode.com/problems/counting-bits/", difficulty: "Easy", tags: ["bit-manipulation"], video: "https://www.youtube.com/watch?v=RyBM56RIWrM" },
        { title: "Reverse Bits", link: "https://leetcode.com/problems/reverse-bits/", difficulty: "Easy", tags: ["bit-manipulation"], video: "https://www.youtube.com/watch?v=UcoN6UjAI64" },
        { title: "Missing Number", link: "https://leetcode.com/problems/missing-number/", difficulty: "Easy", tags: ["bit-manipulation"], article: "https://takeuforward.org/blogs/data-structure-and-algorithm/missing-number-solutions", video: "https://www.youtube.com/watch?v=WnPLSRLSANE" },
        { title: "Sum of Two Integers", link: "https://leetcode.com/problems/sum-of-two-integers/", difficulty: "Medium", tags: ["bit-manipulation"], video: "https://www.youtube.com/watch?v=gVUrDV4tZfY" },
      ]
    }
  ]
};

const seedBlind75 = async () => {
  await connectDB();
  await DSASheet.findOneAndUpdate(
    { slug: blind75Data.slug },
    blind75Data,
    { upsert: true, returnDocument: 'after' }
  );
  console.log('Blind 75 Sheet Seeded');
};

module.exports = seedBlind75;
module.exports.data = blind75Data; // also exported so tests can check the data
