Solution A: The LeetCode Auto-Sync Chrome Extension (Highest ROI, Lowest Effort)

(You already have the architecture designed in docs/track.md — now it needs to be built!)

How it works:
A tiny Manifest V3 browser extension (content.js + background.js + popup.html).
The user logs into PrepStack once in the extension popup (generates a personal API token from their /profile).
When the user clicks "Submit" on LeetCode and gets an Accepted verdict, the extension silently sends the problem URL to PrepStack's backend.
PrepStack finds all sheets containing that link and marks them solved.
Why this fixes churn:
Zero user friction: The user never has to open PrepStack just to tick a box. They just solve problems on LeetCode, and PrepStack silently builds their verified telemetry.
Retention hook: When they visit PrepStack, their streak, progress rings, and topic analytics are already 100% updated.