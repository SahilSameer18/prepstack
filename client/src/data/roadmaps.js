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
      { title: "Internet & Web Fundamentals", desc: "HTTP, HTTPS, DNS, Browser Rendering, Web Hosting, CDNs." },
      { title: "HTML Basics", desc: "Semantic tags, Forms, Accessibility, SEO fundamentals." },
      { title: "CSS Advanced", desc: "Flexbox, Grid, Animations, Responsive Design, CSS Variables, Transitions." },
      { title: "JavaScript Core", desc: "ES6+ features, DOM API, Event Loop, Async/Await, Fetch API, Local Storage." },
      { title: "React Basics", desc: "Components, JSX, Props, State, Lifecycle methods." },
      { title: "React Advanced", desc: "Hooks, Context API, Router, Performance Optimization, Testing with Jest." },
      { title: "CSS Frameworks", desc: "Tailwind CSS, Styled Components, Utility-first design, Theming." },
      { title: "Next.js", desc: "SSR, SSG, API Routes, File-based Routing, Incremental Static Regeneration." },
      { title: "Production & Deployment", desc: "Vercel deployment, CI/CD pipelines, Environment Variables, SEO & Performance." }
    ]
  },
  {
    title: "Backend Development",
    icon: "FaServer",
    color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", glow: "shadow-green-500/10",
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
      { title: "OS & Networking Basics", desc: "Processes, Threads, Ports, Sockets, HTTP & HTTPS protocols." },
      { title: "Node.js Fundamentals", desc: "Event Loop, Modules, File System, Streams, Buffers." },
      { title: "Express.js & Routing", desc: "Routing, Middleware, Error Handling, RESTful APIs, Query Params." },
      { title: "Database Design", desc: "SQL vs NoSQL, MongoDB CRUD, Schema design, Indexing, Aggregation." },
      { title: "Authentication & Security", desc: "JWT, OAuth2, Bcrypt, CORS, Helmet, Rate Limiting." },
      { title: "Testing & Debugging", desc: "Unit Testing, Integration Testing, Postman, Logging, Error Handling." },
      { title: "Docker & Containers", desc: "Dockerfile, Docker Compose, Containerization, Environment Variables." },
      { title: "Deployment & Cloud", desc: "CI/CD pipelines, AWS, Railway, Heroku, Environment Management, Scaling." }
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
      { title: "Frontend Development", desc: "HTML, CSS, JavaScript, React Components, Hooks, Routing, API integration." },
      { title: "Backend API", desc: "Node.js & Express RESTful API, Middlewares, Error Handling, Logging." },
      { title: "Database Layer", desc: "MongoDB Collections, Mongoose Models, Relationships, Aggregation." },
      { title: "Full Stack Authentication", desc: "JWT, Cookies, OAuth, Session Management." },
      { title: "State Management", desc: "Redux Toolkit or Zustand, Context API, Async Actions." },
      { title: "File Storage & Media", desc: "Cloud storage integration (AWS S3, Firebase Storage), File Upload APIs." },
      { title: "Testing & Debugging", desc: "Unit Tests for frontend/backend, Integration Tests, Postman API Testing." },
      { title: "Deployment & Scaling", desc: "Vercel, Render, or AWS deployment, Environment Variables, SSL, Monitoring." },
      { title: "Security & Performance", desc: "Rate Limiting, Caching, Load Balancing, Web Security Best Practices." }
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
      { title: "Kotlin Basics", desc: "Variables, Functions, Classes, Inheritance, Coroutines." },
      { title: "Android Fundamentals", desc: "Activities, Fragments, Lifecycle, Intents, Layouts, Resources." },
      { title: "Modern UI with Compose", desc: "Composables, State, Navigation, Animations." },
      { title: "Data Storage", desc: "Room Database, Shared Preferences, DataStore, SQLite." },
      { title: "Networking & API Calls", desc: "Retrofit, OkHttp, JSON Parsing, Error Handling, Async Calls." },
      { title: "Firebase Services", desc: "Authentication, Firestore, Cloud Storage, Analytics, Push Notifications." },
      { title: "Testing & Debugging", desc: "Unit Tests, Instrumented Tests, Logging, Crashlytics." },
      { title: "Publishing", desc: "Play Store Console, App Signing, Monetization, Ratings & Reviews." }
    ]
  },
  {
    title: "Machine Learning",
    icon: "FaBrain",
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", glow: "shadow-red-500/10",
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
      { title: "Python Basics", desc: "Syntax, Loops, Functions, Data Structures, OOP." },
      { title: "Data Handling", desc: "NumPy Arrays, Pandas DataFrames, Data Cleaning, Feature Engineering." },
      { title: "EDA & Visualization", desc: "Matplotlib, Seaborn, Plotly, Correlation Analysis, Outlier Detection." },
      { title: "ML Algorithms", desc: "Linear/Logistic Regression, Decision Trees, SVM, KNN, Clustering." },
      { title: "Deep Learning", desc: "Neural Networks, CNNs, RNNs, Transformers, Model Training." },
      { title: "Model Evaluation", desc: "Accuracy, Precision, Recall, Confusion Matrix, Hyperparameter Tuning." },
      { title: "Deployment", desc: "Flask/FastAPI APIs, Dockerization, Cloud deployment (AWS/GCP)." },
      { title: "Monitoring & Optimization", desc: "Model Drift, Logging, Scalability, Batch & Real-Time Predictions." },
      { title: "Capstone Project", desc: "End-to-End ML project from data collection to deployment." }
    ]
  }
];