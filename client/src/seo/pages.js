// Single source of truth for everything search engines and social apps read about a page.
// Plain JS (no React) on purpose: the app uses it at runtime AND scripts/prerender.mjs uses it at build time
// to write real per-page HTML, so the two can never disagree.

import SECTIONS from './content.js';

const nodeEnv = globalThis.process?.env || {};
const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) || {};

// When you buy a custom domain, set VITE_SITE_URL (Vercel -> Settings -> Environment Variables) and redeploy.
export const SITE_URL = (nodeEnv.VITE_SITE_URL || viteEnv.VITE_SITE_URL || 'https://prepstack-ss.vercel.app').replace(/\/+$/, '');
export const SITE_NAME = 'PrepStack';
export const OG_IMAGE = '/og-image.png'; // 1200x630
export const LOGO = '/logo.png';

export const absoluteUrl = (path) => SITE_URL + (path === '/' ? '/' : path);

// ───────────────────────── content ─────────────────────────
const SHEETS = [
  { slug: 'blind-75', name: 'Blind 75', title: 'Blind 75 DSA Sheet: 75 Must-Do Interview Problems', description: 'Solve the Blind 75, the 75 essential LeetCode problems that cover arrays, strings, trees, graphs and dynamic programming. Track your progress for free.', intro: 'The Blind 75 is a short, curated list of the coding interview problems that cover the core patterns: arrays and hashing, two pointers, sliding window, stacks, trees, graphs and dynamic programming. Mark problems as solved and watch your progress.' },
  { slug: 'neetcode-150', name: 'NeetCode 150', title: 'NeetCode 150: Pattern-Based DSA Practice Sheet', description: 'Work through the NeetCode 150, a pattern-based DSA sheet that goes deeper than the Blind 75. Track solved problems, filter by difficulty and review by topic.', intro: 'NeetCode 150 groups interview problems by pattern so you learn techniques, not just answers. It builds on the Blind 75 with extra depth in every topic.' },
  { slug: 'striver-sde', name: 'Striver SDE Sheet', title: 'Striver SDE Sheet: 179 Interview Problems to Track', description: "Practice Striver's SDE sheet (now called Striver's 180) with 179 handpicked problems for core tech interview rounds. Tick off problems, see progress per topic and keep going.", intro: "Striver's SDE sheet is a structured pattern-by-pattern list of 179 problems that many students use to prepare for product-company interviews." },
  { slug: 'striver-a2z', name: 'Striver A2Z Sheet', title: 'Striver A2Z DSA Sheet: Beginner to Advanced Practice', description: "Follow Striver's A to Z DSA course sheet from basics to advanced topics. A structured path with 450+ problems and free progress tracking for beginners.", intro: "The A2Z sheet takes you from absolute basics to advanced data structures and algorithms in a fixed order, which makes it a good starting point if you are building a foundation from scratch." },
  { slug: 'love-babbar', name: 'Love Babbar DSA Sheet', title: 'Love Babbar 450 DSA Sheet: Track Your Progress', description: "Practice the Love Babbar 450 DSA sheet topic by topic. Tick off solved questions, see your completion per topic and plan what to study next.", intro: 'The Love Babbar sheet (GeeksforGeeks lists 445 questions under its 450 name) covers the data structures and algorithms usually asked in campus placements and tech interviews.' },
];

const NOTES = [
  { slug: 'os', name: 'Operating Systems', title: 'Operating Systems Notes for Interviews: OS Concepts', description: 'Operating system notes for placements: processes, threads, CPU scheduling, deadlocks, memory management, paging and file systems, explained for interviews.', intro: 'Revise the operating system topics interviewers ask about most: processes and threads, CPU scheduling, synchronization, deadlocks, memory management, virtual memory, paging and file systems.' },
  { slug: 'dbms', name: 'Database Management Systems (DBMS)', title: 'DBMS Notes for Interviews: SQL, ACID & Normalization', description: 'DBMS notes for placements and interviews: ER model, normalization, SQL, transactions, ACID properties, indexing and concurrency control in simple language.', intro: 'Revise databases for interviews: the relational model, normalization, SQL, transactions and ACID, indexing, and concurrency control.' },
  { slug: 'cn', name: 'Computer Networks', title: 'Computer Networks Notes: OSI, TCP/IP, HTTP & DNS', description: 'Computer networks notes for interviews: OSI and TCP/IP layers, TCP vs UDP, HTTP and HTTPS, DNS, routing and common networking questions explained clearly.', intro: 'Revise computer networks for interviews: the OSI and TCP/IP models, TCP vs UDP, HTTP and HTTPS, DNS, DHCP and routing.' },
  { slug: 'hld', name: 'System Design (HLD)', title: 'System Design Notes: Concepts and 12 Case Studies', description: 'System design notes for interviews: caching, replication, consistency, queues and reliability, plus 12 case studies such as a URL shortener and chat.', intro: 'Revise system design for interviews: the building blocks (caching, replication, consistency, queues, reliability) and 12 full case studies with numbers and diagrams.' },
  { slug: 'oops', name: 'Object-Oriented Programming (OOP)', title: 'OOP Notes for Interviews: Pillars, SOLID & Patterns', description: 'Object-oriented programming notes for interviews: encapsulation, inheritance, polymorphism, abstraction and SOLID principles, with examples you can explain.', intro: 'Revise object-oriented programming for interviews: encapsulation, inheritance, polymorphism, abstraction and the SOLID principles.' },
];

const ROADMAPS = [
  { slug: 'frontend', name: 'Frontend Development', description: 'A step-by-step frontend developer roadmap: HTML, CSS, JavaScript, React and Next.js, ending with a deployable portfolio project. Free learning path.', intro: 'HTML, CSS, JavaScript, React, Next.js and production: the complete path from zero to a deployable portfolio.' },
  { slug: 'backend', name: 'Backend Development', description: 'A backend developer roadmap: Node.js, Express, MongoDB, REST APIs, authentication and cloud deployment. Learn to build scalable backend applications.', intro: 'Node.js, Express, MongoDB, REST APIs, authentication and cloud: build scalable backend applications.' },
  { slug: 'fullstack', name: 'Full Stack MERN', description: 'A full stack MERN roadmap: combine frontend and backend skills to build and ship production-grade MongoDB, Express, React and Node.js applications.', intro: 'Combine frontend and backend to build production-grade MERN applications.' },
  { slug: 'android', name: 'Android Development', description: 'An Android developer roadmap: Kotlin, Jetpack Compose, the Android SDK and Firebase, through to publishing your app on the Google Play Store.', intro: 'Kotlin, Jetpack Compose, the Android SDK and Firebase: publish apps to Google Play.' },
  { slug: 'data-analytics', name: 'Data Analytics', description: 'A data analytics roadmap from zero: data collection, cleaning, analysis and visualization, through to insights and decisions. A complete learning path.', intro: 'Data collection, cleaning, analysis, visualization and insights: a complete path from zero to job-ready.' },
  { slug: 'machine-learning', name: 'Machine Learning', description: 'A machine learning roadmap: Python, NumPy, Pandas, Scikit-Learn and deep learning, then build and deploy your own ML models. Free learning path.', intro: 'Python, NumPy, Pandas, Scikit-Learn and deep learning: build and deploy ML models.' },
  { slug: 'devops-cloud', name: 'DevOps & Cloud', description: 'A free DevOps and cloud roadmap: Git, Linux, networking, Docker, GitHub Actions, AWS basics, Kubernetes, Terraform and monitoring.', intro: 'Git, Linux, Docker, automatic checks, AWS, Kubernetes and monitoring, step by step.' },
  { slug: 'java-spring', name: 'Java & Spring Boot', description: 'A free Java and Spring Boot roadmap: Java basics, collections, concurrency, Maven, Spring Boot, REST APIs, databases, security and Docker.', intro: 'Java, Spring Boot, REST APIs, databases, security and Docker, step by step.' },
  { slug: 'dsa', name: 'DSA & Problem Solving', description: 'A free DSA roadmap: Big O, arrays, hash tables, trees, graphs, greedy methods and dynamic programming in order, with practice from curated DSA sheets.', intro: 'Big O, arrays, trees, graphs and dynamic programming in a sensible order, with practice from your DSA sheets.' },
];

// ───────────────────────── page table ─────────────────────────
const link = (path, label) => ({ path, label });
const HOME = { name: 'Home', path: '/' };

// One page per notes section (64): its own title, description, canonical and structured data, so each can be found on its own.
const SUBJECT_SHORT = { os: 'OS', dbms: 'DBMS', cn: 'Networks', oops: 'OOP', hld: 'System Design' };
const sectionTitle = (title, short) => [`${title}: ${short} Interview Notes`, `${title} | ${short} Notes`, `${title} | PrepStack`].find((t) => t.length <= 60) || title.slice(0, 60);
const SECTION_PAGES = NOTES.flatMap((n) => (SECTIONS[n.slug] || []).map((s, i, list) => ({
  path: `/notes/${n.slug}/${s.id}`, kind: 'detail', priority: 0.6, changefreq: 'monthly', parent: { name: n.name, path: `/notes/${n.slug}` },
  title: sectionTitle(s.title, SUBJECT_SHORT[n.slug]), description: s.description, h1: s.title, intro: [s.description], readMinutes: s.readMinutes,
  links: [list[i - 1] && link(`/notes/${n.slug}/${list[i - 1].id}`, `Previous: ${list[i - 1].title}`), list[i + 1] && link(`/notes/${n.slug}/${list[i + 1].id}`, `Next: ${list[i + 1].title}`), link(`/notes/${n.slug}`, `All ${n.name} notes`)].filter(Boolean),
})));

const pages = [
  {
    path: '/my-plan', kind: 'static', priority: 0.9, changefreq: 'monthly', parent: HOME,
    title: 'My Plan: Free Interview Study Plan Builder | PrepStack',
    description: 'Build a free interview study plan around your goal and available hours. Preview coverage and your first week, then sign in to save the full schedule.',
    h1: 'Build your interview study plan',
    intro: ['Choose placements, a role switch or big-tech interview prep. Set your available hours, pick your learning material and preview what fits before creating an account. Time estimates are a guide, not a promise of results.'],
    links: [link('/dsa', 'DSA sheets'), link('/notes', 'CS notes'), link('/roadmaps', 'Role roadmaps')],
  },
  {
    path: '/', kind: 'home', priority: 1.0, changefreq: 'weekly',
    title: 'PrepStack: Free Interview Study Plan, DSA Sheets & Notes',
    description: 'Build a free interview study plan around your hours, then practise curated DSA sheets, computer science notes and developer roadmaps. No payment needed.',
    h1: 'Stop grinding blindly. Engineer your placement.',
    intro: ['PrepStack is a free interview preparation workspace for software engineers. Build a study plan around the hours you have, track curated DSA sheets, revise core computer science, follow role-based roadmaps and generate project ideas with AI.'],
    links: [link('/my-plan', 'Study Plan Builder'), link('/dsa', 'DSA Sheets'), link('/notes', 'CS Notes'), link('/roadmaps', 'Roadmaps'), link('/behavioral', 'Behavioral Interview Prep'), link('/resume', 'Resume Guide')],
  },
  {
    path: '/dsa', kind: 'index', priority: 0.9, changefreq: 'weekly', parent: HOME,
    title: 'DSA Sheets: Blind 75, NeetCode 150, Striver & More',
    description: 'Free DSA practice sheets for coding interviews: Blind 75, NeetCode 150, Striver SDE, Striver A2Z and Love Babbar 450. Track your progress on every problem.',
    h1: 'DSA Practice Sheets',
    intro: ['Pick a curated sheet, work through it topic by topic and mark each problem as you solve it.'],
    links: SHEETS.map((s) => link(`/dsa/${s.slug}`, s.name)),
  },
  ...SHEETS.map((s) => ({
    path: `/dsa/${s.slug}`, kind: 'detail', priority: 0.8, changefreq: 'weekly', parent: { name: 'DSA Sheets', path: '/dsa' },
    title: s.title, description: s.description, h1: s.name, intro: [s.intro],
    links: SHEETS.filter((o) => o.slug !== s.slug).map((o) => link(`/dsa/${o.slug}`, o.name)),
  })),
  {
    path: '/notes', kind: 'index', priority: 0.9, changefreq: 'monthly', parent: HOME,
    title: 'CS Notes for Interviews: OS, DBMS, Networks & OOP',
    description: 'Computer science notes for placements and interviews: operating systems, DBMS, computer networks and OOP, organised by topic and written to revise fast.',
    h1: 'Computer Science Notes',
    intro: ['Revise the core computer science subjects interviewers ask about, topic by topic.'],
    links: NOTES.map((n) => link(`/notes/${n.slug}`, n.name)),
  },
  ...NOTES.map((n) => ({
    path: `/notes/${n.slug}`, kind: 'detail', priority: 0.8, changefreq: 'monthly', parent: { name: 'CS Notes', path: '/notes' },
    title: n.title, description: n.description, h1: n.name, intro: [n.intro],
    links: [...(SECTIONS[n.slug] || []).map((s) => link(`/notes/${n.slug}/${s.id}`, s.title)), ...NOTES.filter((o) => o.slug !== n.slug).map((o) => link(`/notes/${o.slug}`, o.name))],
  })),
  ...SECTION_PAGES,
  {
    path: '/roadmaps', kind: 'index', priority: 0.9, changefreq: 'monthly', parent: HOME,
    title: 'Developer Roadmaps: Frontend, Backend, MERN & More',
    description: 'Step-by-step developer roadmaps: frontend, backend, full stack, Android, data, machine learning, DSA, Java and Spring Boot, DevOps and cloud.',
    h1: 'Developer Roadmaps',
    intro: ['Choose a role and follow a clear, ordered learning path with the topics and resources to learn at each step.'],
    links: ROADMAPS.map((r) => link(`/roadmaps/${r.slug}`, r.name)),
  },
  ...ROADMAPS.map((r) => ({
    path: `/roadmaps/${r.slug}`, kind: 'detail', priority: 0.8, changefreq: 'monthly', parent: { name: 'Roadmaps', path: '/roadmaps' },
    title: `${r.name} Roadmap: Step-by-Step Learning Path`, description: r.description, h1: `${r.name} Roadmap`, intro: [r.intro],
    links: ROADMAPS.filter((o) => o.slug !== r.slug).map((o) => link(`/roadmaps/${o.slug}`, `${o.name} roadmap`)),
  })),
  {
    path: '/behavioral', kind: 'static', priority: 0.8, changefreq: 'monthly', parent: HOME,
    title: 'Behavioral Interview Questions & STAR Answer Examples',
    description: 'Common behavioral interview questions for software engineers with STAR-method example answers. Practice teamwork, conflict, leadership and failure questions.',
    h1: 'Behavioral Interview Questions',
    intro: ['Prepare for the HR and behavioral round with common questions and example answers written in the STAR format.'],
    links: [link('/resume', 'Resume Guide'), link('/dsa', 'DSA Sheets')],
  },
  {
    path: '/resume', kind: 'static', priority: 0.8, changefreq: 'monthly', parent: HOME,
    title: 'Software Engineer Resume Guide: ATS-Friendly Tips',
    description: 'How to write an ATS-friendly software engineer resume: what to include in each section, strong bullet point examples and common mistakes to avoid.',
    h1: 'Software Engineer Resume Guide',
    intro: ['Section-by-section advice for building a resume that passes applicant tracking systems and reads well to recruiters.'],
    links: [link('/behavioral', 'Behavioral Interview Questions'), link('/roadmaps', 'Roadmaps')],
  },
  {
    path: '/privacy', kind: 'static', priority: 0.3, changefreq: 'yearly', parent: HOME,
    title: 'Privacy Policy | PrepStack', description: 'How PrepStack collects, uses and protects your data, which third-party services it relies on, and how you can delete your account at any time.',
    h1: 'Privacy Policy', intro: ['How PrepStack handles your data.'], links: [link('/terms', 'Terms of Use')],
  },
  {
    path: '/terms', kind: 'static', priority: 0.3, changefreq: 'yearly', parent: HOME,
    title: 'Terms of Use | PrepStack', description: 'The terms for using PrepStack, including acceptable use, your account responsibilities and how the interview preparation content may be used.',
    h1: 'Terms of Use', intro: ['The rules for using PrepStack.'], links: [link('/privacy', 'Privacy Policy')],
  },
  // ── private / not-yet-built pages: crawlable by nobody, never in the sitemap ──
  ...[
    ['/my-plan/study', 'My study plan | PrepStack', 'Your private daily study plan and reviews.'],
    ['/dashboard', 'Dashboard | PrepStack', 'Your PrepStack dashboard.'],
    ['/profile', 'Profile | PrepStack', 'Your PrepStack profile.'],
    ['/ai-projects', 'AI Project Ideas | PrepStack', 'Generate project ideas with AI.'],
    ['/analyzer', 'Role Analyzer | PrepStack', 'Match your resume to a job description.'],
    ['/login', 'Log in | PrepStack', 'Log in to PrepStack.'],
    ['/register', 'Create your account | PrepStack', 'Create a free PrepStack account.'],
    ['/forgot-password', 'Forgot your password? | PrepStack', 'Ask for a link to choose a new PrepStack password.'],
    ['/reset-password', 'Choose a new password | PrepStack', 'Choose a new PrepStack password.'],
  ].map(([path, title, description]) => ({ path, kind: 'private', noindex: true, title, description, h1: title.replace(' | PrepStack', ''), intro: [description], links: [link('/', 'PrepStack home')] })),
];

// These routes sit behind login (ProtectedRoute in app.routes.jsx), so a crawler only ever sees the login redirect: keep them out of search.
// Sheets, notes, roadmaps and the behavioral guide are open to read, so they are indexable.
const LOGIN_GATED = (p) => p.path === '/resume';
export const allPages = pages.map((p) => (LOGIN_GATED(p) ? { ...p, noindex: true } : p));
export const indexablePages = allPages.filter((p) => !p.noindex);

const NOT_FOUND = { path: null, kind: 'private', noindex: true, title: 'Page not found | PrepStack', description: 'This page does not exist.', h1: 'Page not found', intro: ['The page you are looking for does not exist.'], links: [link('/', 'Go to the PrepStack home page')] };
export const notFoundPage = NOT_FOUND;

const byPath = new Map(allPages.map((p) => [p.path, p]));
/** SEO data for any URL path. Unknown paths (wrong slug, typos) get a noindex "not found" page. */
export const pageFor = (pathname) => {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (clean.startsWith('/analyzer/')) return { ...byPath.get('/analyzer'), path: clean, title: 'Your role report | PrepStack' }; // private report pages: noindex like /analyzer
  return byPath.get(clean) || { ...NOT_FOUND, path: clean };
};

// ───────────────────────── structured data ─────────────────────────
export const jsonLdFor = (page) => {
  if (page.noindex) return [];
  const url = absoluteUrl(page.path);
  const out = [];
  if (page.kind === 'home') {
    out.push(
      { '@context': 'https://schema.org', '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: SITE_URL + LOGO },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: SITE_URL, inLanguage: 'en' },
      { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: SITE_NAME, applicationCategory: 'EducationalApplication', operatingSystem: 'Web', url: SITE_URL, description: page.description, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    );
  } else if (page.readMinutes) {
    out.push({ '@context': 'https://schema.org', '@type': 'LearningResource', name: page.h1, description: page.description, url, inLanguage: 'en', learningResourceType: 'Study notes', timeRequired: `PT${page.readMinutes}M`, isAccessibleForFree: true, isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL } });
  } else {
    out.push({ '@context': 'https://schema.org', '@type': 'WebPage', name: page.title, description: page.description, url, inLanguage: 'en', isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL } });
  }
  if (page.parent) {
    const crumbs = [{ name: 'Home', path: '/' }];
    if (page.parent.path !== '/') crumbs.push(page.parent);
    crumbs.push({ name: page.h1, path: page.path });
    out.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.path) })) });
  }
  return out;
};

export const robotsContent = (noindex) => (noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
