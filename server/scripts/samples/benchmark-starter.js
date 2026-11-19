// A STARTER benchmark for the Role Analyzer: 12 made-up resume and job pairs (no real people; no contact details), 3 strong, 3 partial, 3 weak
// and 3 tricky matches, with the expected status of each labelled requirement. See docs/research/ANALYZER_BENCHMARK.md.
//
// IMPORTANT: these labels were drafted BEFORE any analyzer run (by the author of this file, from the resume text alone). They are a starting point
// and must be reviewed by at least one other person before the numbers are quoted anywhere. 4 pairs are marked split: 'holdout': do not tune the
// prompt or the code on them; run them once at the end.
//
// A label: { match: [words a report may use for this requirement], expected: 'met' | 'partial' | 'missing', importance: 'must' | 'nice' }.
//   met      the resume shows the person doing it (a project or job, not only a word in a skills list)
//   partial  related evidence, or the word appears but nothing shows it being used
//   missing  nothing in the resume supports it
const pairs = [
  {
    id: 'react-node-fullstack', category: 'strong', split: 'dev', days: 7,
    note: 'Strong match: a full stack student for a junior full stack job',
    resume: `Neel Example, final-year B.Tech Computer Science student
SKILLS: JavaScript, React, Node.js, Express.js, MongoDB, REST APIs, Git, HTML, CSS
PROJECTS
- StudyBoard: a full-stack kanban app. React front end with hooks, a Node.js and Express.js REST API, MongoDB with Mongoose and JWT login. Deployed on Render and Vercel.
- ShopLite: an online store with a cart, built with React and an Express API. Added pagination and search.
EXPERIENCE
- Web development intern, 3 months: built two REST endpoints in Express.js and fixed 12 React UI bugs. Worked in a Git team with pull requests.`,
    jobDescription: `Full Stack Developer (0 to 2 years). You will build features across the stack with a small team. Must have: React, Node.js, Express, MongoDB, REST API design, Git. Good to have: TypeScript, Docker, unit testing with Jest.`,
    requirements: [
      { match: ['react'], expected: 'met', importance: 'must' },
      { match: ['node.js', 'node'], expected: 'met', importance: 'must' },
      { match: ['express', 'express.js'], expected: 'met', importance: 'must' },
      { match: ['mongodb'], expected: 'met', importance: 'must' },
      { match: ['rest api', 'rest apis', 'rest'], expected: 'met', importance: 'must' },
      { match: ['git'], expected: 'met', importance: 'must' },
      { match: ['typescript'], expected: 'missing', importance: 'nice' },
      { match: ['docker'], expected: 'missing', importance: 'nice' },
      { match: ['jest', 'unit testing', 'testing'], expected: 'missing', importance: 'nice' },
    ],
  },
  {
    id: 'java-spring-backend', category: 'strong', split: 'dev', days: 7,
    note: 'Strong match: a Java and Spring Boot student for a backend Java job',
    resume: `Diya Example, B.E. Information Technology, graduating this year
SKILLS: Java, Spring Boot, Spring Data JPA, Hibernate, MySQL, REST APIs, JUnit, Maven, Git
PROJECTS
- Library API: a Spring Boot REST service with Spring Data JPA and MySQL. JUnit and Mockito tests for the service layer.
- Bank Ledger: transactions with Hibernate, request validation and central exception handling.
EXPERIENCE
- Backend intern, 4 months: wrote JPA repositories and REST controllers and 30 unit tests.`,
    jobDescription: `Backend Java Developer (0 to 2 years). Must have: Java, Spring Boot, SQL, JPA or Hibernate, REST APIs, JUnit. Good to have: Docker, Apache Kafka.`,
    requirements: [
      { match: ['java'], expected: 'met', importance: 'must' },
      { match: ['spring boot', 'spring'], expected: 'met', importance: 'must' },
      { match: ['sql', 'mysql'], expected: 'met', importance: 'must' },
      { match: ['jpa', 'hibernate'], expected: 'met', importance: 'must' },
      { match: ['rest api', 'rest apis', 'rest'], expected: 'met', importance: 'must' },
      { match: ['junit', 'unit testing'], expected: 'met', importance: 'must' },
      { match: ['docker'], expected: 'missing', importance: 'nice' },
      { match: ['kafka'], expected: 'missing', importance: 'nice' },
    ],
  },
  {
    id: 'android-kotlin', category: 'strong', split: 'holdout', days: 7,
    note: 'Strong match: an Android and Kotlin student for a junior Android job',
    resume: `Kabir Example, B.Tech Information Technology
SKILLS: Kotlin, Android SDK, Jetpack Compose, MVVM, Room, Retrofit, Coroutines, Firebase, Git
PROJECTS
- ExpenseTracker: Jetpack Compose screens, MVVM with ViewModel and StateFlow, a Room database and Retrofit for exchange rates. In internal testing on Google Play.
- FitLog: a workout logger with Firebase Auth and Cloud Firestore, and background sync with WorkManager.
EXPERIENCE
- Android intern, 3 months: fixed 20 crashes and added a dark theme.`,
    jobDescription: `Android Developer (junior). Must have: Kotlin, Android SDK, Jetpack Compose, MVVM, Room or SQLite, REST APIs with Retrofit. Good to have: unit testing, CI/CD, Dagger or Hilt.`,
    requirements: [
      { match: ['kotlin'], expected: 'met', importance: 'must' },
      { match: ['android sdk', 'android'], expected: 'met', importance: 'must' },
      { match: ['jetpack compose', 'compose'], expected: 'met', importance: 'must' },
      { match: ['mvvm'], expected: 'met', importance: 'must' },
      { match: ['room', 'sqlite'], expected: 'met', importance: 'must' },
      { match: ['retrofit'], expected: 'met', importance: 'must' },
      { match: ['unit testing', 'testing'], expected: 'missing', importance: 'nice' },
      { match: ['ci/cd', 'ci cd'], expected: 'missing', importance: 'nice' },
      { match: ['hilt', 'dagger'], expected: 'missing', importance: 'nice' },
    ],
  },
  {
    id: 'python-django-backend', category: 'partial', split: 'dev', days: 7,
    note: 'Partial match: Django with SQLite and tests, for a job that wants PostgreSQL, Docker and Redis',
    resume: `Rohan Example, B.Sc. Computer Science
SKILLS: Python, Django, Django REST Framework, SQLite, HTML, Git, unittest
PROJECTS
- Notes API: a Django REST Framework API with token authentication and a SQLite database, covered by unit tests written with unittest.
- Blog: Django templates, forms and a customised admin.`,
    jobDescription: `Backend Python Developer. Must have: Python, Django, PostgreSQL, REST APIs, unit testing. Good to have: Docker, Redis, Celery.`,
    requirements: [
      { match: ['python'], expected: 'met', importance: 'must' },
      { match: ['django'], expected: 'met', importance: 'must' },
      { match: ['postgresql', 'postgres'], expected: 'partial', importance: 'must' },
      { match: ['rest api', 'rest apis', 'rest'], expected: 'met', importance: 'must' },
      { match: ['unit testing', 'unittest', 'testing'], expected: 'met', importance: 'must' },
      { match: ['docker'], expected: 'missing', importance: 'nice' },
      { match: ['redis'], expected: 'missing', importance: 'nice' },
      { match: ['celery'], expected: 'missing', importance: 'nice' },
    ],
  },
  {
    id: 'react-ts-frontend', category: 'partial', split: 'dev', days: 7,
    note: 'Partial match: React with tests, but no TypeScript or accessibility work',
    resume: `Sana Example, B.Tech Computer Science
SKILLS: JavaScript, React, Redux, CSS, Tailwind CSS, Jest, React Testing Library, REST APIs, Git
PROJECTS
- Weather Dashboard: a React and Redux app that calls a public weather API, with loading and error states and Jest tests for the reducers.
- Portfolio site: responsive layout with Tailwind CSS and React Testing Library tests for the contact form.
EXPERIENCE
- Frontend intern, 2 months: built three React components and fixed layout bugs.`,
    jobDescription: `Frontend Developer. Must have: React, TypeScript, CSS, REST API integration, component testing. Good to have: accessibility, Next.js.`,
    requirements: [
      { match: ['react'], expected: 'met', importance: 'must' },
      { match: ['typescript'], expected: 'missing', importance: 'must' },
      { match: ['css'], expected: 'met', importance: 'must' },
      { match: ['rest api', 'rest apis', 'api integration'], expected: 'met', importance: 'must' },
      { match: ['component testing', 'testing'], expected: 'met', importance: 'must' },
      { match: ['accessibility'], expected: 'missing', importance: 'nice' },
      { match: ['next.js', 'nextjs'], expected: 'missing', importance: 'nice' },
    ],
  },
  {
    id: 'node-mongo-no-auth', category: 'partial', split: 'holdout', days: 7,
    note: 'Partial match with a trap: REST APIs shown, but no authentication and no Docker',
    resume: `Imran Example, B.Tech Computer Science
SKILLS: JavaScript, Node.js, Express.js, MongoDB, REST APIs, Postman, Git
PROJECTS
- Inventory API: Express REST endpoints for products and orders, MongoDB with Mongoose, request validation with Joi.
- URL Shortener: an Express service that stores links in MongoDB and counts clicks.`,
    jobDescription: `Backend Developer (Node.js). Must have: Node.js, Express, MongoDB, REST APIs, JWT authentication, Docker. Good to have: Redis, automated testing.`,
    requirements: [
      { match: ['node.js', 'node'], expected: 'met', importance: 'must' },
      { match: ['express'], expected: 'met', importance: 'must' },
      { match: ['mongodb'], expected: 'met', importance: 'must' },
      { match: ['rest api', 'rest apis', 'rest'], expected: 'met', importance: 'must' },
      { match: ['jwt', 'authentication'], expected: 'missing', importance: 'must' },
      { match: ['docker'], expected: 'missing', importance: 'must' },
      { match: ['redis'], expected: 'missing', importance: 'nice' },
      { match: ['automated testing', 'testing'], expected: 'missing', importance: 'nice' },
    ],
  },
  {
    id: 'python-ml-basic', category: 'weak', split: 'dev', days: 14,
    note: 'Weak match: two notebooks and a course, for a production ML engineer job',
    resume: `Tara Example, B.Sc. Mathematics
SKILLS: Python, pandas, NumPy, Matplotlib
PROJECTS
- Titanic survival prediction: a notebook with logistic regression in scikit-learn.
- House prices: a notebook with linear regression and a few plots.
COURSES: an online introductory machine learning course.`,
    jobDescription: `Machine Learning Engineer. Must have: Python, PyTorch or TensorFlow, deploying models to production behind an API, SQL, statistics. Good to have: MLOps, AWS.`,
    requirements: [
      { match: ['python'], expected: 'met', importance: 'must' },
      { match: ['pytorch', 'tensorflow'], expected: 'missing', importance: 'must' },
      { match: ['deploying models', 'deployment', 'production'], expected: 'missing', importance: 'must' },
      { match: ['sql'], expected: 'missing', importance: 'must' },
      { match: ['statistics'], expected: 'partial', importance: 'must' },
      { match: ['mlops'], expected: 'missing', importance: 'nice' },
      { match: ['aws'], expected: 'missing', importance: 'nice' },
    ],
  },
  {
    id: 'cpp-dsa-vs-spring', category: 'weak', split: 'dev', days: 14,
    note: 'Weak match: a strong C++ and DSA student applying to a Java Spring backend job',
    resume: `Arjun Example, B.Tech Computer Science
SKILLS: C++, STL, data structures, algorithms, OOP, Linux, Git
ACHIEVEMENTS: solved 300 problems on LeetCode (arrays, trees, graphs, dynamic programming).
PROJECTS
- Library management system in C++ using OOP and file handling.
- A chess engine with minimax search.
- Operating systems course project: a small shell written in C.`,
    jobDescription: `Backend Java Developer. Must have: Java, Spring Boot, SQL, REST APIs, JPA or Hibernate. Good to have: Docker, Apache Kafka.`,
    requirements: [
      { match: ['java'], expected: 'missing', importance: 'must' },
      { match: ['spring boot', 'spring'], expected: 'missing', importance: 'must' },
      { match: ['sql'], expected: 'missing', importance: 'must' },
      { match: ['rest api', 'rest apis', 'rest'], expected: 'missing', importance: 'must' },
      { match: ['jpa', 'hibernate'], expected: 'missing', importance: 'must' },
      { match: ['docker'], expected: 'missing', importance: 'nice' },
      { match: ['kafka'], expected: 'missing', importance: 'nice' },
    ],
  },
  {
    id: 'mern-vs-devops', category: 'weak', split: 'holdout', days: 14,
    note: 'Weak match: MERN projects for a DevOps engineer job',
    resume: `Vikram Example, B.Tech Computer Science
SKILLS: JavaScript, React, Node.js, Express.js, MongoDB, Git
PROJECTS
- Recipe Share: a MERN app with image upload and search. Deployed on Vercel and Render by pushing to Git.
- Chat app: React and Express with websockets.`,
    jobDescription: `DevOps Engineer. Must have: Linux, Docker, Kubernetes, CI/CD pipelines, AWS, infrastructure as code (Terraform). Good to have: monitoring with Prometheus.`,
    requirements: [
      { match: ['linux'], expected: 'missing', importance: 'must' },
      { match: ['docker'], expected: 'missing', importance: 'must' },
      { match: ['kubernetes'], expected: 'missing', importance: 'must' },
      { match: ['ci/cd', 'ci cd', 'pipelines'], expected: 'missing', importance: 'must' },
      { match: ['aws'], expected: 'missing', importance: 'must' },
      { match: ['terraform', 'infrastructure as code'], expected: 'missing', importance: 'must' },
      { match: ['prometheus', 'monitoring'], expected: 'missing', importance: 'nice' },
    ],
  },
  {
    id: 'java-vs-javascript', category: 'tricky', split: 'dev', days: 10,
    note: 'Tricky: Java is not JavaScript (a keyword trap)',
    resume: `Meera Example, B.E. Information Technology
SKILLS: Java, Spring Boot, Spring MVC, Maven, JUnit, MySQL, Git, HTML
PROJECTS
- Student Portal: Spring MVC with Thymeleaf templates and MySQL.
- Attendance API: a Spring Boot REST API tested with JUnit.`,
    jobDescription: `JavaScript Developer. Must have: JavaScript, Node.js, React, REST APIs, Git. Good to have: TypeScript, testing with Jest.`,
    requirements: [
      { match: ['javascript'], expected: 'missing', importance: 'must' },
      { match: ['node.js', 'node'], expected: 'missing', importance: 'must' },
      { match: ['react'], expected: 'missing', importance: 'must' },
      { match: ['rest api', 'rest apis', 'rest'], expected: 'met', importance: 'must' },
      { match: ['git'], expected: 'met', importance: 'must' },
      { match: ['typescript'], expected: 'missing', importance: 'nice' },
      { match: ['jest'], expected: 'missing', importance: 'nice' },
    ],
  },
  {
    id: 'mongodb-vs-postgres', category: 'tricky', split: 'holdout', days: 10,
    note: 'Tricky: a MongoDB person for a PostgreSQL and SQL job',
    resume: `Nikhil Example, B.Tech Computer Science
SKILLS: JavaScript, Node.js, Express.js, MongoDB, Mongoose, REST APIs, Git
PROJECTS
- Event Planner: an Express API with MongoDB and Mongoose models for events, users and tickets.
- Notes app: a REST API over MongoDB with text search.`,
    jobDescription: `Backend Developer. Must have: Node.js, PostgreSQL, SQL, REST APIs, database schema design. Good to have: Redis, Docker.`,
    requirements: [
      { match: ['node.js', 'node'], expected: 'met', importance: 'must' },
      { match: ['postgresql', 'postgres'], expected: 'missing', importance: 'must' },
      { match: ['sql'], expected: 'missing', importance: 'must' },
      { match: ['rest api', 'rest apis', 'rest'], expected: 'met', importance: 'must' },
      { match: ['schema design', 'database schema'], expected: 'partial', importance: 'must' },
      { match: ['redis'], expected: 'missing', importance: 'nice' },
      { match: ['docker'], expected: 'missing', importance: 'nice' },
    ],
  },
  {
    id: 'aws-skills-list-only', category: 'tricky', split: 'dev', days: 10,
    note: 'Tricky: DevOps tools appear only in a skills list, with no project that uses them',
    resume: `Pooja Example, B.Sc. Computer Science
SKILLS: Linux, Docker, Kubernetes, AWS, Terraform, Jenkins, Python, Git
PROJECTS
- Portfolio website: HTML, CSS and JavaScript, hosted on GitHub Pages.
- A Python script that renames and sorts files in a folder.`,
    jobDescription: `Junior DevOps Engineer. Must have: Linux, Docker, AWS, CI/CD pipelines, Kubernetes basics. Good to have: Terraform.`,
    requirements: [
      { match: ['linux'], expected: 'partial', importance: 'must' },
      { match: ['docker'], expected: 'partial', importance: 'must' },
      { match: ['aws'], expected: 'partial', importance: 'must' },
      { match: ['ci/cd', 'ci cd', 'pipelines'], expected: 'partial', importance: 'must' },
      { match: ['kubernetes'], expected: 'partial', importance: 'must' },
      { match: ['terraform'], expected: 'partial', importance: 'nice' },
    ],
  },
];

// The judges' score range for a pair: what the labels themselves give with the analyzer's weights (must 3, nice 1; met 1, partial 0.5, missing 0), plus or minus 15.
const WEIGHT = { must: 3, nice: 1 };
const CREDIT = { met: 1, partial: 0.5, missing: 0 };
for (const pair of pairs) {
  if (pair.judgeScore) continue;
  let got = 0; let total = 0;
  for (const label of pair.requirements) { total += WEIGHT[label.importance]; got += WEIGHT[label.importance] * CREDIT[label.expected]; }
  const score = Math.round((100 * got) / total);
  pair.judgeScore = [Math.max(0, score - 15), Math.min(100, score + 15)];
  pair.labelStatus = 'draft: needs review by a second person';
}

module.exports = pairs;
