// Content of the Resume Guide page and its one-page checklist PDF.
// Everything here is advice, not a guarantee: no company is named as using a rule, and no statistics are quoted.
// The weak/strong examples and the sample resume are invented for illustration.
// What this file says about the Role Analyzer matches server/src/services/analyzer.service.js and resume.service.js:
// it prefers a line that shows a skill being used over a skills list; it never suggests adding a skill the resume lacks;
// it removes email, phone and links before the AI reads the text; scanned (image-only) PDFs fail; PDF max 3 MB and 5 pages.
// Each disputable claim has a row in docs/content/SOURCES.md.

export const sections = [
  {
    id: "contact",
    title: "Contact information",
    recruiterScan: "Can they reach you, and do your links open? Many recruiters click your GitHub or LinkedIn link, so make sure both work.",
    tips: [
      "Put your name, email, phone number, city, and your LinkedIn and GitHub links at the top.",
      "Use a plain, professional email address, ideally a version of your name.",
      "Give only your city and state. A full street address is not needed.",
      "Open every link in a private browser window before you send. Each one should load without a login.",
    ],
    beforeAfter: [
      { weak: "Contact me: cooldude_2003@example.com", strong: "Rahul Kumar | rahul.kumar@example.com | +91 98765 43210", why: "A name-based email looks professional and is easy to match with your application." },
      { weak: "GitHub: github.com/rahul-k (no pinned projects, empty profile)", strong: "GitHub: github.com/rahulkumar (3 pinned project repos, each with a README)", why: "Add a link only if what it opens supports the resume." },
    ],
    mistakes: [
      "A link that is broken, private, or asks for a login.",
      "A joke or hard-to-read email address.",
      "A photo, age, marital status or full street address.",
    ],
    analyzerNote: "The Role Analyzer removes your email, phone number and links before it reads your resume, so it cannot judge this section. Check it yourself.",
    example: `Rahul Kumar
rahul.kumar@example.com  |  +91 98765 43210  |  Bengaluru, Karnataka
linkedin.com/in/rahulkumar-example  |  github.com/rahulkumar-example`,
  },
  {
    id: "education",
    title: "Education",
    recruiterScan: "Your degree, college, graduation year, and whether your courses match the job.",
    tips: [
      "List your degree first, with the college and the expected graduation year.",
      "Add your CGPA or percentage if you want to. Always write the scale (for example 8.6 / 10). Never round it up.",
      "List 4 to 6 courses that match the job, such as Data Structures, Operating Systems, DBMS and Computer Networks.",
      "Add scholarships, ranks or awards in one short line each.",
    ],
    beforeAfter: [
      { weak: "Studied many subjects including some programming.", strong: "Coursework: Data Structures and Algorithms, Operating Systems, DBMS, Computer Networks", why: "Named courses can be matched against a job description. A general sentence cannot." },
      { weak: "CGPA: 8.6", strong: "CGPA: 8.6 / 10", why: "Colleges use different scales, so write yours." },
    ],
    mistakes: [
      "No graduation year, so the reader cannot tell if you are a fresher.",
      "A CGPA with no scale.",
      "A long list of every course you ever took.",
    ],
    analyzerNote: "The Role Analyzer prefers lines that show a skill being used. A course name on its own is weaker than a project that used the skill.",
    example: `B.Tech, Computer Science and Engineering
Example Institute of Technology                              2022 - 2026 (expected)
CGPA: 8.6 / 10
Coursework: Data Structures and Algorithms, Operating Systems, DBMS, Computer Networks`,
  },
  {
    id: "skills",
    title: "Technical skills",
    recruiterScan: "Do your skills match the job, and does the rest of the resume back them up?",
    tips: [
      "Group your skills: Languages, Frameworks, Databases, Tools.",
      "List only what you can explain in an interview. Expect questions on every item.",
      "Put the skills you use most first.",
      "Skip things everyone has (MS Office), and skip skill rating bars.",
    ],
    beforeAfter: [
      { weak: "Skills: Java (Expert), Python (Expert), React (Advanced), Docker (Basic), AWS (Basic), Kafka, Spark, Hadoop...", strong: "Languages: Java, Python, JavaScript\nFrameworks: React, Node.js, Express\nDatabases: MongoDB, PostgreSQL\nTools: Git, Docker", why: "Ratings such as Expert cannot be checked. Short groups are quick to scan." },
      { weak: "Docker appears only in the skills list.", strong: "Docker also appears in a project line: \"Containerized the API with Docker and ran it locally with Docker Compose.\"", why: "A skill shown in a project is better proof than a word in a list." },
    ],
    mistakes: [
      "Listing a tool you have only seen once.",
      "A list of 25 or more items with no groups.",
      "Rating yourself with bars, stars or percentages.",
    ],
    analyzerNote: "The Role Analyzer counts a skill as stronger when it finds it used in a project or experience line, not only in this list. It never suggests adding a skill your resume does not show, and neither should you.",
    example: `Languages:   Java, Python, JavaScript
Frameworks:  React, Node.js, Express
Databases:   MongoDB, PostgreSQL
Tools:       Git, Docker, Postman`,
  },
  {
    id: "experience",
    title: "Work experience and internships",
    recruiterScan: "What you built or changed, with which tools, and what difference it made.",
    tips: [
      "Write 2 to 4 bullets per role. Start each one with a strong verb: Built, Fixed, Reduced, Added.",
      "Say what changed, using the bullet formula below.",
      "Add numbers when you really have them: users, time saved, bugs fixed. If you have no number, describe the result in words.",
      "Write what you did, not what the team did.",
    ],
    beforeAfter: [
      { weak: "Worked on backend development tasks.", strong: "Added two Express.js endpoints with input validation and tests; the team shipped them in the next release.", why: "It names the tool, what was built, and that it shipped." },
      { weak: "Responsible for fixing bugs.", strong: "Fixed 14 UI bugs in a React dashboard, which brought open bug reports for that page from 20 to 6.", why: "A number and a result turn a duty into proof." },
      { weak: "Helped improve performance.", strong: "Added Redis caching to a slow report endpoint, cutting its response time from 1.8 s to 0.4 s.", why: "It says what you did, with what, and how much it changed." },
    ],
    mistakes: [
      "Listing duties (\"responsible for...\") instead of results.",
      "Numbers you cannot explain. An interviewer may ask how you measured them.",
      "Buzzwords with no detail behind them.",
    ],
    analyzerNote: "Bullets like these are the kind of line the Role Analyzer quotes as proof that you have a skill.",
    example: `Software Development Intern, Example Systems Pvt. Ltd.      Jun 2025 - Aug 2025
- Added two Express.js endpoints with input validation and tests, shipped in the next release.
- Fixed 14 UI bugs in a React dashboard; open bug reports for that page fell from 20 to 6.
- Added Redis caching to a slow report endpoint, cutting its response time from 1.8 s to 0.4 s.`,
  },
  {
    id: "projects",
    title: "Engineering projects",
    recruiterScan: "What you built, which tools you used, and whether you can explain the choices you made.",
    tips: [
      "Pick 2 or 3 projects you could talk about for 10 minutes.",
      "Start each project with its name, the tech stack, and links to the live app and the code.",
      "Say what problem it solves and one hard part you handled (login, caching, a slow query).",
      "Make sure the README explains how to run it and the live link works.",
    ],
    beforeAfter: [
      { weak: "Made a chat app using React and Node.", strong: "Built a chat app (React, Node.js, Socket.IO) used by 40 classmates; cut message delay from 2 s to 300 ms by batching database writes.", why: "It names the tools, the users, and one measured improvement." },
      { weak: "Todo app using the MERN stack.", strong: "Task manager (MongoDB, Express, React, Node.js) with JWT login, per-user tasks and tests for the API.", why: "Even a simple app looks stronger when you name the parts you built." },
    ],
    mistakes: [
      "A tutorial project copied with no changes.",
      "A project you cannot explain.",
      "A demo link that no longer works.",
      "Six small projects instead of two good ones.",
    ],
    analyzerNote: "Project lines are a good place to show a skill. Name the tools in the bullet itself, because the Role Analyzer looks for lines that show a skill being used.",
    example: `TaskFlow - React, Node.js, Express, MongoDB         Live: taskflow.example.com | Code: github.com/rahulkumar-example/taskflow
- Built a task manager with JWT login and per-user tasks; 60 users in a class pilot.
- Wrote 25 API tests with Jest and Supertest and ran them in GitHub Actions on every push.
- Added MongoDB indexes on the task list query, which cut the list load time from 900 ms to 120 ms.`,
  },
  {
    id: "honors",
    title: "Honors, contests and certifications",
    recruiterScan: "Evidence that you keep practising and that you finish things.",
    tips: [
      "Add contest ratings or problem counts only if you are happy to be asked about them.",
      "Add hackathons, open-source pull requests (with links) and papers.",
      "List a certification only if it relates to the job.",
      "One line each, with the strongest first.",
    ],
    beforeAfter: [
      { weak: "Participated in a hackathon.", strong: "College hackathon: built a bus-timing app in 24 hours with a team of 4; finished in the top 5 of 30 teams.", why: "It says what you built, how fast, and how it ended." },
      { weak: "Solved many LeetCode problems.", strong: "LeetCode: 220 problems solved, including Medium and Hard.", why: "A number can be checked." },
    ],
    mistakes: [
      "School-level awards that only fill space.",
      "A certificate with no link to the job you want.",
      "A claim you cannot back up in an interview.",
    ],
    analyzerNote: "The Role Analyzer reads only the text of your resume. It cannot open your profile links.",
    example: `- LeetCode: 220 problems solved, including Medium and Hard
- College hackathon: built a bus-timing app in 24 hours; top 5 of 30 teams
- Open source: 2 merged pull requests to a documentation project`,
  },
];

// Short explainers shown before the section cards.
export const basics = [
  {
    id: "one-page",
    title: "The one-page rule, and when to break it",
    paragraphs: [
      "A shorter resume is quicker to read. Most students and freshers can fit what matters on one page, so one page is the usual advice.",
      "A second page is fine when it holds real, relevant content, such as a long internship history or a research paper. It is not fine when it is filler, wide margins or a large font.",
      "If an application tells you a page limit or a format, follow that instead of any advice here.",
    ],
  },
  {
    id: "bullet-formula",
    title: "The bullet formula",
    paragraphs: [
      "Write each bullet as: what you did, how much it changed, and how you did it. In short: action + what + how much + how.",
    ],
    steps: [
      "Weak: Worked on search.",
      "Better: Improved the search page.",
      "Better still: Cut search page load time from 3 s to 1.2 s.",
      "Best: Cut search page load time from 3 s to 1.2 s by adding a database index and caching results.",
    ],
    afterSteps: "If you do not have a real number, say what changed in words. Never invent a number: interviewers ask how you measured it.",
  },
  {
    id: "file-format",
    title: "File format and file name",
    paragraphs: [
      "Send a PDF unless the application asks for another format. Some forms ask for Word, so read the instructions.",
      "Use a PDF with real text, exported from your editor, not a photo or a scan. To test it, open the PDF and try to select a line with your mouse. If you cannot select it, software cannot read it either. The PrepStack Role Analyzer also fails on scanned PDFs.",
      "Name the file Firstname_Lastname_Resume.pdf, so the recruiter can find it among many files.",
    ],
  },
  {
    id: "ats",
    title: "What an ATS is, and what it is not",
    paragraphs: [
      "ATS means applicant tracking system: software that companies use to collect, store and search applications. It usually pulls the text out of your file so recruiters can search it.",
      "There is no single ATS and no single rule. Different companies use different software, and some recruiters read resumes themselves. How often software alone rejects a resume depends on the company, and we cannot say.",
      "So do not chase tricks such as hidden keyword text. Do the plain things: a simple one-column layout, standard section names (Education, Experience, Projects, Skills), real text instead of images, and words from the job description only where they are true for you.",
      "The Role Analyzer on PrepStack is not an ATS. It compares your resume with one job description and shows which requirements it found proof for.",
    ],
  },
  {
    id: "links-profiles",
    title: "Projects, links and profiles",
    paragraphs: [
      "Write the link as visible text (github.com/yourname/project), so it still shows on a printed copy, and make it clickable too.",
      "Pin your 3 to 6 best repositories on GitHub. Each one needs a README with what it does, a screenshot, and how to run it.",
      "Keep your LinkedIn job titles and dates the same as your resume. A mismatch makes a reader wonder which one is right.",
    ],
  },
];

export const roleVariants = [
  { role: "SDE intern", skills: "Keep the skills list short and honest. Add Data Structures, OS and DBMS courses.", projects: "Two solid projects you can explain, plus contest or problem-solving numbers if you have them." },
  { role: "Backend", skills: "Group by language, framework, database and tools. Name the database and the auth method.", projects: "Show an API with login, a database, tests, and one result about speed or reliability. Link the repo with API docs." },
  { role: "Frontend", skills: "Show your framework, state handling, and tools for styling and testing.", projects: "Live links matter most. Mention responsive design, accessibility and page speed if you worked on them. Add screenshots to the README." },
  { role: "Data", skills: "Show Python libraries, SQL, and the tools you use to show results.", projects: "State the question, the data, what you did to clean it, and the result. Put notebooks on GitHub with short explanations." },
];

export const exampleResume = `RAHUL KUMAR
rahul.kumar@example.com | +91 98765 43210 | Bengaluru
linkedin.com/in/rahulkumar-example | github.com/rahulkumar-example

EDUCATION
B.Tech, Computer Science and Engineering, Example Institute of Technology   2022 - 2026 (expected)
CGPA 8.6 / 10. Coursework: Data Structures and Algorithms, Operating Systems, DBMS, Computer Networks

SKILLS
Languages: Java, Python, JavaScript    Frameworks: React, Node.js, Express
Databases: MongoDB, PostgreSQL         Tools: Git, Docker, Postman

EXPERIENCE
Software Development Intern, Example Systems Pvt. Ltd.                    Jun 2025 - Aug 2025
- Added two Express.js endpoints with input validation and tests, shipped in the next release.
- Fixed 14 UI bugs in a React dashboard; open bug reports for that page fell from 20 to 6.
- Added Redis caching to a slow report endpoint, cutting its response time from 1.8 s to 0.4 s.

PROJECTS
TaskFlow - React, Node.js, Express, MongoDB     taskflow.example.com | github.com/rahulkumar-example/taskflow
- Built a task manager with JWT login and per-user tasks; 60 users in a class pilot.
- Wrote 25 API tests with Jest and Supertest and ran them in GitHub Actions on every push.
- Added MongoDB indexes on the task list query, cutting its load time from 900 ms to 120 ms.

CampusBus - React, Socket.IO, Node.js     github.com/rahulkumar-example/campusbus
- Built a bus-timing app in a 24-hour hackathon with a team of 4; finished in the top 5 of 30 teams.

ACHIEVEMENTS
- LeetCode: 220 problems solved, including Medium and Hard
- Open source: 2 merged pull requests to a documentation project`;

export const goodHabits = [
  "Keep it to one page unless you have a real reason for a second.",
  "Use a simple single-column layout with clear headings such as Education, Skills, Experience and Projects.",
  "Use a plain font (Arial, Calibri, Roboto) at 10 to 11 pt.",
  "Write 2 to 4 bullets per role or project, focused on what you did and what changed.",
  "Reuse words from the job description where they are true for you.",
  "Export a PDF with real, selectable text.",
];

export const commonProblems = [
  "A photo, age, marital status or full street address.",
  "Several columns, tables, or skill bars that readers and software can misread.",
  "Starting bullets with \"I\", \"we\" or \"my\" instead of a verb.",
  "Listing tools you could not explain in an interview.",
  "Typing mistakes, broken links, or lines that do not line up.",
];

export const tools = [
  { name: "Overleaf (LaTeX templates)", desc: "An online LaTeX editor with resume templates. You edit the source and export a PDF.", url: "https://www.overleaf.com/gallery/tagged/cv" },
  { name: "FlowCV", desc: "An online resume builder that exports a PDF. Check the exported PDF yourself.", url: "https://flowcv.io" },
];

// The one-page checklist (shown as a PDF download).
export const checklist = [
  { group: "Content", items: [
    "Name, email, phone, city, LinkedIn and GitHub are at the top.",
    "Degree, college and graduation year are clear. CGPA has its scale.",
    "Skills are grouped, and I can explain every one in an interview.",
    "Each bullet says what I did and what changed.",
    "I have 2 or 3 projects I can talk about for 10 minutes.",
    "Every number on the page is real and I know how I got it.",
  ] },
  { group: "Format", items: [
    "One page, unless I have a real reason for a second.",
    "Simple single-column layout, with standard headings.",
    "A plain font at 10 to 11 pt.",
    "No photo, age, marital status or street address.",
    "No skill rating bars, tables or text inside images.",
  ] },
  { group: "Before I send", items: [
    "Every link opens in a private browser window.",
    "I can select the text in the PDF with my mouse.",
    "The file is named Firstname_Lastname_Resume.pdf.",
    "Words from the job description are in my resume only where they are true.",
    "Someone else has read it and I fixed what they found.",
    "I checked it against the job with the Role Analyzer.",
  ] },
];