export const roadmaps = [
  {
    title: "Frontend Development",
    icon: "FaLaptopCode",
    color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/10",
    desc: "HTML → CSS → JavaScript → React → Next.js → Production. Complete path from zero to deployable portfolio.",
    steps: [
      "Web Basics & HTML Fundamentals",
      "CSS Deep Dive: Flexbox, Grid & Animations",
      "JavaScript ES6+ & DOM Manipulation",
      "React.js Components, Hooks & Routing",
      "State Management & Context API",
      "Tailwind CSS & Styled Components",
      "Next.js, SSR, SSG, and API Routes",
      "Testing & Debugging Frontend",
      "Deployment, CI/CD, and Performance Optimization"
    ],
    duration: "4–6 months",
    level: "Beginner to Production Level",
    details: [
      { title: "Internet & Web Fundamentals", desc: "HTTP, HTTPS, DNS, Browser Rendering, Web Hosting, CDNs.", resources: [
        { label: "How the Web Works – MDN", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works" },
        { label: "HTTP in depth – CS50", url: "https://cs50.harvard.edu/web/2020/weeks/0/" },
        { label: "Web Dev Roadmap – roadmap.sh", url: "https://roadmap.sh/frontend" },
      ]},
      { title: "HTML Basics", desc: "Semantic tags, Forms, Accessibility, SEO fundamentals.", resources: [
        { label: "HTML Full Course – freeCodeCamp", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
        { label: "HTML Reference – MDN", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
        { label: "HTML Tutorial – W3Schools", url: "https://www.w3schools.com/html/" },
      ]},
      { title: "CSS Advanced", desc: "Flexbox, Grid, Animations, Responsive Design, CSS Variables, Transitions.", resources: [
        { label: "Flexbox Froggy (Game)", url: "https://flexboxfroggy.com/" },
        { label: "CSS Grid Garden (Game)", url: "https://cssgridgarden.com/" },
        { label: "CSS Full Course – Kevin Powell", url: "https://www.youtube.com/kepowob" },
      ]},
      { title: "JavaScript Core", desc: "ES6+ features, DOM API, Event Loop, Async/Await, Fetch API, Local Storage.", resources: [
        { label: "JavaScript.info (Best Free Book)", url: "https://javascript.info/" },
        { label: "The Odin Project – JS Path", url: "https://www.theodinproject.com/paths/full-stack-javascript" },
        { label: "Namaste JavaScript – Akshay Saini", url: "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP" },
      ]},
      { title: "React Basics", desc: "Components, JSX, Props, State, Lifecycle methods.", resources: [
        { label: "React Official Docs", url: "https://react.dev/learn" },
        { label: "React Full Course – Traversy Media", url: "https://www.youtube.com/watch?v=LDB4uaJ87e0" },
        { label: "React Tutorial – Scrimba", url: "https://scrimba.com/learn/learnreact" },
      ]},
      { title: "React Advanced", desc: "Hooks, Context API, Router, Performance Optimization, Testing with Jest.", resources: [
        { label: "React Hooks Deep Dive – Kent C. Dodds", url: "https://kentcdodds.com/blog/react-hooks" },
        { label: "React Router Docs", url: "https://reactrouter.com/en/main" },
        { label: "Testing Library Docs", url: "https://testing-library.com/docs/react-testing-library/intro/" },
      ]},
      { title: "CSS Frameworks", desc: "Tailwind CSS, Styled Components, Utility-first design, Theming.", resources: [
        { label: "Tailwind CSS Official Docs", url: "https://tailwindcss.com/docs/installation" },
        { label: "Styled Components Docs", url: "https://styled-components.com/docs" },
        { label: "Tailwind Crash Course – Net Ninja", url: "https://www.youtube.com/watch?v=ft30zcMlFa8" },
      ]},
      { title: "Next.js", desc: "SSR, SSG, API Routes, File-based Routing, Incremental Static Regeneration.", resources: [
        { label: "Next.js Official Docs", url: "https://nextjs.org/docs" },
        { label: "Next.js Crash Course – Traversy Media", url: "https://www.youtube.com/watch?v=mTz0GXj8NN0" },
        { label: "Learn Next.js – Vercel", url: "https://nextjs.org/learn" },
      ]},
      { title: "Production & Deployment", desc: "Vercel deployment, CI/CD pipelines, Environment Variables, SEO & Performance.", resources: [
        { label: "Deploy to Vercel – Docs", url: "https://vercel.com/docs" },
        { label: "GitHub Actions CI/CD", url: "https://docs.github.com/en/actions" },
        { label: "Web.dev Performance Guide", url: "https://web.dev/performance/" },
      ]},
    ]
  },
  {
    title: "Backend Development",
    icon: "FaServer",
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", glow: "shadow-red-500/10",
    desc: "Node.js → Express → MongoDB → REST APIs → Auth → Cloud. Build scalable backend applications.",
    steps: [
      "Computer & Networking Basics",
      "Node.js & npm",
      "Express.js & Middleware",
      "MongoDB & Mongoose",
      "Authentication & Authorization",
      "Testing & Debugging",
      "Containerization with Docker",
      "Cloud Deployment & CI/CD"
    ],
    duration: "4–5 months",
    level: "Beginner to Production Level",
    details: [
      { title: "OS & Networking Basics", desc: "Processes, Threads, Ports, Sockets, HTTP & HTTPS protocols.", resources: [
        { label: "CS50: Intro to CS – Harvard", url: "https://cs50.harvard.edu/x/" },
        { label: "Computer Networks – Gate Smashers", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_" },
        { label: "HTTP Crash Course – Traversy Media", url: "https://www.youtube.com/watch?v=iYM2zFP3Zn0" },
      ]},
      { title: "Node.js Fundamentals", desc: "Event Loop, Modules, File System, Streams, Buffers.", resources: [
        { label: "Node.js Official Docs", url: "https://nodejs.org/en/docs/" },
        { label: "Node.js Crash Course – Net Ninja", url: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9jsz4LDYc6kv3ymONOKxwBU" },
        { label: "The Complete Node.js Dev Course – Udemy", url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/" },
      ]},
      { title: "Express.js & Routing", desc: "Routing, Middleware, Error Handling, RESTful APIs, Query Params.", resources: [
        { label: "Express.js Official Docs", url: "https://expressjs.com/" },
        { label: "REST API with Node & Express – freeCodeCamp", url: "https://www.youtube.com/watch?v=l8WPWK9mS5M" },
        { label: "API Design Best Practices", url: "https://restfulapi.net/" },
      ]},
      { title: "Database Design", desc: "SQL vs NoSQL, MongoDB CRUD, Schema design, Indexing, Aggregation.", resources: [
        { label: "MongoDB University (Free)", url: "https://learn.mongodb.com/" },
        { label: "Mongoose Docs", url: "https://mongoosejs.com/docs/" },
        { label: "SQL vs NoSQL – Fireship", url: "https://www.youtube.com/watch?v=t0GlGbtMTio" },
      ]},
      { title: "Authentication & Security", desc: "JWT, OAuth2, Bcrypt, CORS, Helmet, Rate Limiting.", resources: [
        { label: "JWT Authentication Guide", url: "https://jwt.io/introduction" },
        { label: "Passport.js Docs", url: "https://www.passportjs.org/" },
        { label: "Node.js Security Checklist", url: "https://blog.risingstack.com/node-js-security-checklist/" },
      ]},
      { title: "Testing & Debugging", desc: "Unit Testing, Integration Testing, Postman, Logging, Error Handling.", resources: [
        { label: "Jest Docs", url: "https://jestjs.io/docs/getting-started" },
        { label: "Postman Learning Center", url: "https://learning.postman.com/" },
        { label: "Node.js Debugging – Official", url: "https://nodejs.org/en/docs/guides/debugging-getting-started/" },
      ]},
      { title: "Docker & Containers", desc: "Dockerfile, Docker Compose, Containerization, Environment Variables.", resources: [
        { label: "Docker Official Docs", url: "https://docs.docker.com/" },
        { label: "Docker Crash Course – TechWorld with Nana", url: "https://www.youtube.com/watch?v=3c-iBn73dDE" },
        { label: "Docker for Beginners – freeCodeCamp", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo" },
      ]},
      { title: "Deployment & Cloud", desc: "CI/CD pipelines, AWS, Railway, Heroku, Environment Management, Scaling.", resources: [
        { label: "AWS Free Tier", url: "https://aws.amazon.com/free/" },
        { label: "Railway.app Docs", url: "https://docs.railway.app/" },
        { label: "GitHub Actions CI/CD – Fireship", url: "https://www.youtube.com/watch?v=R8_veQiYBjI" },
      ]},
    ]
  },
  {
    title: "Full Stack MERN",
    icon: "FaDatabase",
    color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/10",
    desc: "Combine Frontend & Backend to build production-grade MERN applications.",
    steps: [
      "Frontend Foundations with React.js",
      "Backend Development with Node.js & Express",
      "Database Integration with MongoDB & Mongoose",
      "End-to-End Authentication & Authorization",
      "State Management & Advanced Hooks",
      "File Uploads & Cloud Storage",
      "Testing & Error Handling Full Stack",
      "Deployment: Vercel, Render, or AWS",
      "Performance Optimization & Security"
    ],
    duration: "6–8 months",
    level: "Intermediate to Advanced",
    recommended: true,
    details: [
      { title: "Frontend Development", desc: "HTML, CSS, JavaScript, React Components, Hooks, Routing, API integration.", resources: [
        { label: "React Official Docs", url: "https://react.dev/" },
        { label: "Full Stack Open (FREE)", url: "https://fullstackopen.com/en/" },
        { label: "React + Vite Setup Guide", url: "https://vitejs.dev/guide/" },
      ]},
      { title: "Backend API", desc: "Node.js & Express RESTful API, Middlewares, Error Handling, Logging.", resources: [
        { label: "Express.js Docs", url: "https://expressjs.com/" },
        { label: "REST API Design Guide", url: "https://restfulapi.net/" },
        { label: "MERN Stack Tutorial – freeCodeCamp", url: "https://www.youtube.com/watch?v=7CqJlxBYj-M" },
      ]},
      { title: "Database Layer", desc: "MongoDB Collections, Mongoose Models, Relationships, Aggregation.", resources: [
        { label: "MongoDB University", url: "https://learn.mongodb.com/" },
        { label: "Mongoose Quick Start", url: "https://mongoosejs.com/docs/index.html" },
        { label: "MongoDB Aggregation – Official", url: "https://www.mongodb.com/docs/manual/aggregation/" },
      ]},
      { title: "Full Stack Authentication", desc: "JWT, Cookies, OAuth, Session Management.", resources: [
        { label: "JWT.io Introduction", url: "https://jwt.io/introduction" },
        { label: "Auth with Cookies vs JWT – YouTube", url: "https://www.youtube.com/watch?v=UBUNrFtufWo" },
        { label: "Google OAuth Guide", url: "https://developers.google.com/identity/protocols/oauth2" },
      ]},
      { title: "State Management", desc: "Redux Toolkit or Zustand, Context API, Async Actions.", resources: [
        { label: "Redux Toolkit Docs", url: "https://redux-toolkit.js.org/" },
        { label: "Zustand GitHub", url: "https://github.com/pmndrs/zustand" },
        { label: "React Context Explained – Kent C. Dodds", url: "https://kentcdodds.com/blog/how-to-use-react-context-effectively" },
      ]},
      { title: "File Storage & Media", desc: "Cloud storage integration (AWS S3, Firebase Storage), File Upload APIs.", resources: [
        { label: "AWS S3 Docs", url: "https://docs.aws.amazon.com/s3/" },
        { label: "Firebase Storage Docs", url: "https://firebase.google.com/docs/storage" },
        { label: "Cloudinary Media Upload Guide", url: "https://cloudinary.com/documentation/upload_images" },
      ]},
      { title: "Testing & Debugging", desc: "Unit Tests for frontend/backend, Integration Tests, Postman API Testing.", resources: [
        { label: "Jest Docs", url: "https://jestjs.io/docs/getting-started" },
        { label: "React Testing Library", url: "https://testing-library.com/docs/react-testing-library/intro/" },
        { label: "Postman API Testing", url: "https://learning.postman.com/docs/getting-started/introduction/" },
      ]},
      { title: "Deployment & Scaling", desc: "Vercel, Render, or AWS deployment, Environment Variables, SSL, Monitoring.", resources: [
        { label: "Vercel Deployment Guide", url: "https://vercel.com/docs" },
        { label: "Render.com Docs", url: "https://render.com/docs" },
        { label: "AWS EC2 Free Tier", url: "https://aws.amazon.com/ec2/getting-started/" },
      ]},
      { title: "Security & Performance", desc: "Rate Limiting, Caching, Load Balancing, Web Security Best Practices.", resources: [
        { label: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
        { label: "Node.js Security Checklist", url: "https://blog.risingstack.com/node-js-security-checklist/" },
        { label: "Web Performance – web.dev", url: "https://web.dev/performance/" },
      ]},
    ]
  },
  {
    title: "Android Development",
    icon: "FaMobileAlt",
    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/10",
    desc: "Kotlin → Jetpack Compose → Android SDK → Firebase. Publish apps to Google Play Store.",
    steps: [
      "Kotlin Language Basics",
      "Object-Oriented Kotlin & Coroutines",
      "Android SDK Fundamentals",
      "Jetpack Compose UI Development",
      "Data Storage & Room Database",
      "Networking with Retrofit & OkHttp",
      "Firebase Integration (Auth, Firestore, Storage)",
      "Testing & Debugging Android Apps",
      "Play Store Publishing & Monetization"
    ],
    duration: "5–6 months",
    level: "Intermediate to Advanced",
    details: [
      { title: "Kotlin Basics", desc: "Variables, Functions, Classes, Inheritance, Coroutines.", resources: [
        { label: "Kotlin Official Docs", url: "https://kotlinlang.org/docs/home.html" },
        { label: "Kotlin Bootcamp – Google Codelabs", url: "https://developer.android.com/codelabs/kotlin-bootcamp-introduction" },
        { label: "Kotlin Crash Course – Traversy Media", url: "https://www.youtube.com/watch?v=5flXf8nuq60" },
      ]},
      { title: "Android Fundamentals", desc: "Activities, Fragments, Lifecycle, Intents, Layouts, Resources.", resources: [
        { label: "Android Developer Docs", url: "https://developer.android.com/guide" },
        { label: "Android Basics – Google Codelabs", url: "https://developer.android.com/courses/android-basics-compose/course" },
        { label: "Android Dev – Philipp Lackner", url: "https://www.youtube.com/@PhilippLackner" },
      ]},
      { title: "Modern UI with Compose", desc: "Composables, State, Navigation, Animations.", resources: [
        { label: "Jetpack Compose Docs", url: "https://developer.android.com/jetpack/compose/documentation" },
        { label: "Compose Pathway – Google", url: "https://developer.android.com/courses/pathways/compose" },
        { label: "Jetpack Compose Crash Course", url: "https://www.youtube.com/watch?v=6_wK_Ud8--0" },
      ]},
      { title: "Data Storage", desc: "Room Database, Shared Preferences, DataStore, SQLite.", resources: [
        { label: "Room Persistence Library Docs", url: "https://developer.android.com/training/data-storage/room" },
        { label: "DataStore Guide", url: "https://developer.android.com/topic/libraries/architecture/datastore" },
        { label: "Room CRUD App – Philipp Lackner", url: "https://www.youtube.com/watch?v=bOd3wO0uFr8" },
      ]},
      { title: "Networking & API Calls", desc: "Retrofit, OkHttp, JSON Parsing, Error Handling, Async Calls.", resources: [
        { label: "Retrofit Docs", url: "https://square.github.io/retrofit/" },
        { label: "OkHttp Docs", url: "https://square.github.io/okhttp/" },
        { label: "Retrofit Tutorial – Philipp Lackner", url: "https://www.youtube.com/watch?v=t6Sql3WgRdc" },
      ]},
      { title: "Firebase Services", desc: "Authentication, Firestore, Cloud Storage, Analytics, Push Notifications.", resources: [
        { label: "Firebase Docs", url: "https://firebase.google.com/docs" },
        { label: "Firebase Android Codelab", url: "https://firebase.google.com/codelabs/firebase-android" },
        { label: "Firebase Complete Course – Reso Coder", url: "https://www.youtube.com/watch?v=dqejXX191Zg" },
      ]},
      { title: "Testing & Debugging", desc: "Unit Tests, Instrumented Tests, Logging, Crashlytics.", resources: [
        { label: "Android Testing Docs", url: "https://developer.android.com/training/testing" },
        { label: "Crashlytics Setup", url: "https://firebase.google.com/docs/crashlytics/get-started?platform=android" },
        { label: "Unit Testing in Android – Philipp Lackner", url: "https://www.youtube.com/watch?v=EkfVL5vCDmo" },
      ]},
      { title: "Publishing", desc: "Play Store Console, App Signing, Monetization, Ratings & Reviews.", resources: [
        { label: "Publishing to Google Play – Docs", url: "https://developer.android.com/distribute" },
        { label: "Google Play Console Help", url: "https://support.google.com/googleplay/android-developer" },
        { label: "App Signing Guide", url: "https://developer.android.com/studio/publish/app-signing" },
      ]},
    ]
  },
  {
    title: "Data Analytics",
    icon: "FaChartLine",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/10",
    desc: "Data collection → Cleaning → Analysis → Visualization → Insights → Decision Making. Complete path from zero to actionable analytics portfolio.",
    steps: [
      "Introduction to Data & Analytics Basics",
      "Excel & Google Sheets for Data Handling",
      "Data Cleaning & Transformation with Python/Pandas",
      "Exploratory Data Analysis (EDA) & Statistics",
      "Data Visualization with Matplotlib, Seaborn & Plotly",
      "SQL for Data Extraction & Querying",
      "Intermediate Python for Analytics & Automation",
      "Business Analytics & KPI Dashboards",
      "Capstone Project & Reporting"
    ],
    duration: "4–6 months",
    level: "Beginner to Professional Analytics",
    details: [
      { title: "Data Fundamentals", desc: "Types of data, Structured vs Unstructured, Data Life Cycle, Data Ethics & Privacy.", resources: [
        { label: "Google Data Analytics Certificate", url: "https://grow.google/certificates/data-analytics/" },
        { label: "Data Literacy – DataCamp", url: "https://www.datacamp.com/courses/understanding-data-science" },
        { label: "What is Data Analytics? – IBM", url: "https://www.ibm.com/topics/data-analytics" },
      ]},
      { title: "Spreadsheet Skills (Excel)", desc: "Formulas, Pivot Tables, Charts, Conditional Formatting, Data Validation.", resources: [
        { label: "Excel Full Tutorial – GCFGlobal", url: "https://edu.gcfglobal.org/en/excel/" },
        { label: "Excel for Data Analysts – freeCodeCamp", url: "https://www.youtube.com/watch?v=PSNXoAs2FtQ" },
        { label: "Google Sheets Tutorial – Google", url: "https://support.google.com/docs/answer/6000292" },
      ]},
      { title: "Data Cleaning & Preprocessing", desc: "Handling missing data, Duplicates, Normalization, Encoding categorical variables, Outlier detection.", resources: [
        { label: "Pandas Official Docs", url: "https://pandas.pydata.org/docs/" },
        { label: "Data Cleaning with Python – Kaggle", url: "https://www.kaggle.com/learn/data-cleaning" },
        { label: "Missing Data Techniques – Towards DS", url: "https://towardsdatascience.com/handling-missing-values-with-python-bd37a36d9oad" },
      ]},
      { title: "Statistics & Probability", desc: "Descriptive stats, Inferential stats, Probability distributions, Hypothesis testing, Correlation & Regression.", resources: [
        { label: "Statistics for Data Science – Khan Academy", url: "https://www.khanacademy.org/math/statistics-probability" },
        { label: "StatQuest with Josh Starmer", url: "https://www.youtube.com/@statquest" },
        { label: "Think Stats (Free Book)", url: "https://greenteapress.com/wp/think-stats-2e/" },
      ]},
      { title: "Python for Data Analytics", desc: "NumPy, Pandas, DataFrames, Filtering, Aggregation, Grouping, Merging datasets.", resources: [
        { label: "Python for Data Analysis – Kaggle", url: "https://www.kaggle.com/learn/python" },
        { label: "NumPy Tutorial – freeCodeCamp", url: "https://www.youtube.com/watch?v=QUT1VHiLmmI" },
        { label: "Pandas Crash Course – Corey Schafer", url: "https://www.youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdDCSskIFdDS" },
      ]},
      { title: "Data Visualization", desc: "Matplotlib, Seaborn, Plotly, Interactive dashboards, Storytelling with data.", resources: [
        { label: "Matplotlib Official Docs", url: "https://matplotlib.org/stable/tutorials/index.html" },
        { label: "Seaborn Tutorial – Kaggle", url: "https://www.kaggle.com/learn/data-visualization" },
        { label: "Plotly Dash Docs", url: "https://dash.plotly.com/" },
      ]},
      { title: "SQL & Databases", desc: "Basic & Advanced Queries, Joins, Aggregations, Subqueries, Views.", resources: [
        { label: "SQL Tutorial – Mode Analytics", url: "https://mode.com/sql-tutorial/" },
        { label: "SQLZoo (Interactive)", url: "https://sqlzoo.net/" },
        { label: "SQL for Data Science – Coursera", url: "https://www.coursera.org/learn/sql-for-data-science" },
      ]},
      { title: "Business Analytics", desc: "KPIs, Metrics, Decision-making insights, Reporting & Presentation skills.", resources: [
        { label: "Google Looker Studio (Free)", url: "https://lookerstudio.google.com/" },
        { label: "PowerBI Learning – Microsoft", url: "https://learn.microsoft.com/en-us/power-bi/" },
        { label: "Business Analytics – Wharton (Coursera)", url: "https://www.coursera.org/learn/wharton-business-analytics" },
      ]},
      { title: "Capstone & Portfolio", desc: "End-to-end analytics project: Data collection → Cleaning → Analysis → Visualization → Insights → Dashboard.", resources: [
        { label: "Kaggle Datasets & Competitions", url: "https://www.kaggle.com/datasets" },
        { label: "Public APIs for Projects", url: "https://github.com/public-apis/public-apis" },
        { label: "Portfolio Ideas for Data Analysts", url: "https://www.datacamp.com/blog/data-analyst-portfolio-examples" },
      ]},
    ]
  },
  {
    title: "Machine Learning",
    icon: "FaBrain",
    color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/10",
    desc: "Python → NumPy → Pandas → Scikit-Learn → Deep Learning. Build and deploy ML models.",
    steps: [
      "Python Programming Fundamentals",
      "Data Handling with NumPy & Pandas",
      "Exploratory Data Analysis (EDA)",
      "Machine Learning Algorithms with Scikit-Learn",
      "Deep Learning with TensorFlow/Keras & PyTorch",
      "Model Evaluation, Hyperparameter Tuning",
      "Deployment with Flask/FastAPI",
      "Monitoring & Scaling ML Models",
      "End-to-End Project Deployment"
    ],
    duration: "5–7 months",
    level: "Intermediate to Advanced",
    details: [
      { title: "Python Basics", desc: "Syntax, Loops, Functions, Data Structures, OOP.", resources: [
        { label: "Python for Everybody – Dr. Chuck", url: "https://www.py4e.com/" },
        { label: "Python Tutorial – freeCodeCamp", url: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
        { label: "Automate the Boring Stuff (Free Book)", url: "https://automatetheboringstuff.com/" },
      ]},
      { title: "Data Handling", desc: "NumPy Arrays, Pandas DataFrames, Data Cleaning, Feature Engineering.", resources: [
        { label: "NumPy Docs", url: "https://numpy.org/doc/" },
        { label: "Pandas Docs", url: "https://pandas.pydata.org/docs/" },
        { label: "Feature Engineering – Kaggle", url: "https://www.kaggle.com/learn/feature-engineering" },
      ]},
      { title: "EDA & Visualization", desc: "Matplotlib, Seaborn, Plotly, Correlation Analysis, Outlier Detection.", resources: [
        { label: "EDA with Python – Kaggle", url: "https://www.kaggle.com/learn/data-visualization" },
        { label: "Seaborn Official Docs", url: "https://seaborn.pydata.org/" },
        { label: "Plotly for ML – Docs", url: "https://plotly.com/python/" },
      ]},
      { title: "ML Algorithms", desc: "Linear/Logistic Regression, Decision Trees, SVM, KNN, Clustering.", resources: [
        { label: "Scikit-Learn Docs", url: "https://scikit-learn.org/stable/user_guide.html" },
        { label: "ML Course – Andrew Ng (Coursera)", url: "https://www.coursera.org/learn/machine-learning" },
        { label: "StatQuest ML Playlist", url: "https://www.youtube.com/@statquest/playlists" },
      ]},
      { title: "Deep Learning", desc: "Neural Networks, CNNs, RNNs, Transformers, Model Training.", resources: [
        { label: "Deep Learning Specialization – deeplearning.ai", url: "https://www.deeplearning.ai/courses/deep-learning-specialization/" },
        { label: "PyTorch Official Tutorial", url: "https://pytorch.org/tutorials/" },
        { label: "TensorFlow Crash Course – Google", url: "https://developers.google.com/machine-learning/crash-course" },
      ]},
      { title: "Model Evaluation", desc: "Accuracy, Precision, Recall, Confusion Matrix, Hyperparameter Tuning.", resources: [
        { label: "Model Evaluation – Scikit-Learn", url: "https://scikit-learn.org/stable/modules/model_evaluation.html" },
        { label: "Hyperparameter Tuning – Weights & Biases", url: "https://wandb.ai/site/articles/introduction-hyperparameter-tuning" },
        { label: "Cross Validation Explained – StatQuest", url: "https://www.youtube.com/watch?v=fSytzGwwBVw" },
      ]},
      { title: "Deployment", desc: "Flask/FastAPI APIs, Dockerization, Cloud deployment (AWS/GCP).", resources: [
        { label: "FastAPI Docs", url: "https://fastapi.tiangolo.com/" },
        { label: "Deploy ML with Flask – Towards DS", url: "https://towardsdatascience.com/deploying-machine-learning-models-with-flask-5b3d60cf9194" },
        { label: "GCP ML Engine – Google", url: "https://cloud.google.com/ai-platform/docs" },
      ]},
      { title: "Monitoring & Optimization", desc: "Model Drift, Logging, Scalability, Batch & Real-Time Predictions.", resources: [
        { label: "ML Monitoring – Evidently AI", url: "https://www.evidentlyai.com/" },
        { label: "Weights & Biases (MLOps)", url: "https://wandb.ai/" },
        { label: "MLflow Docs", url: "https://mlflow.org/docs/latest/index.html" },
      ]},
      { title: "Capstone Project", desc: "End-to-End ML project from data collection to deployment.", resources: [
        { label: "Kaggle Competitions", url: "https://www.kaggle.com/competitions" },
        { label: "Papers With Code", url: "https://paperswithcode.com/" },
        { label: "Hugging Face Spaces", url: "https://huggingface.co/spaces" },
      ]},
    ]
  }
];