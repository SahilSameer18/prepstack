Popular open-source extensions like LeetHub (50k+ users) work on this exact principle. Here is the complete breakdown of how it works under the hood, how it connects to PrepStack, and why it makes your project standout.

🏗️ How LeetCode Auto-Sync Works (The Architecture)
mermaid
graph LR
    A[User Submits Code on LeetCode] --> B[Chrome Extension Intercepts 'Accepted']
    B --> C[Extension Extracts Problem URL & Title]
    C --> D[POST /api/sheets/sync-submission to PrepStack]
    D --> E[PrepStack DB Updates User Progress Atomically]
    E --> F[PrepStack Dashboard Reflects Solved State Instantly]
🔍 Step-by-Step Technical Breakdown
1. The Chrome Extension (Manifest V3)
You create a lightweight browser extension with 3 simple files:

popup.html / popup.js: A sleek popup where the user logs into their PrepStack account once (generates a personal API token or connects with their PrepStack account).
content_script.js: Runs silently on https://leetcode.com/problems/*.
background.js (Service Worker): Dispatches the authenticated sync request to your PrepStack backend.
2. Detecting the "Accepted" Submission on LeetCode
When a user clicks "Submit" on LeetCode:

LeetCode sends an internal network request to check the submission: GET https://leetcode.com/submissions/detail/<id>/check/
When the result returns:
json
{
  "status_msg": "Accepted",
  "total_correct": 45,
  "total_testcases": 45,
  "question_id": "1"
}
Your extension's content_script.js observes this event (either via DOM observer on the green "Accepted" badge or by intercepting the network response).
3. Syncing with Your PrepStack Backend
As soon as "Accepted" is detected:

The extension extracts the problem URL: https://leetcode.com/problems/two-sum/.
The extension sends a background POST request to your PrepStack API:
http
POST /api/sheets/sync-problem
Authorization: Bearer <user_prepstack_api_token>
Content-Type: application/json
{
  "problemUrl": "https://leetcode.com/problems/two-sum/",
  "platform": "leetcode"
}
Backend Logic on PrepStack:
Your backend finds which sheet(s) contain this problem (e.g. Blind 75, NeetCode 150, Striver SDE).
Atomically pushes the problem link into the user's Progress.solvedProblems using $addToSet.
Returns { success: true, updatedSheets: ["blind-75", "neetcode-150"] }.
🎯 Why This Solves a Real-World Problem & Elevates Your Project
Aspect	Without Extension (Current)	With Chrome Extension Sync
User Experience	User solves a problem on LeetCode $\rightarrow$ has to remember to go to PrepStack $\rightarrow$ find the sheet $\rightarrow$ find the problem $\rightarrow$ click checkbox.	Zero friction: Solve on LeetCode $\rightarrow$ PrepStack updates automatically in the background.
Cost	Free	100% Free (No OpenAI/Gemini tokens used).
Resume Impact	"Built a MERN DSA Tracker" (Average).	"Built an automated full-stack sync engine featuring a Manifest V3 Chrome extension that hooks into LeetCode submission lifecycle to update prep metrics in real-time." (Standout).

