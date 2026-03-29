
export const roadmaps = [
  {
    title: "Frontend Development",
    icon: "FaLaptopCode",
    color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/10",
    desc: "HTML → CSS → JavaScript → React → Next.js → Production. The complete path from zero to a deployable portfolio.",
    steps: ["HTML & CSS Fundamentals", "JavaScript ES6+", "React.js & Hooks", "Tailwind CSS", "Next.js & SSR", "Deployment & CI/CD"],
    duration: "4–6 months",
    level: "Beginner to Production Level",
    details: [
      { title: "Internet & Web Basics", desc: "Understand HTTP, DNS, Browsers, and Web Hosting." },
      { title: "HTML & CSS Core", desc: "Semantic HTML, CSS Flexbox, Grid, Responsive Design." },
      { title: "JavaScript Deep Dive", desc: "DOM Manipulation, Async/Await, ES6 Features, Prototypes." },
      { title: "Frontend Frameworks", desc: "React Basics, Component Life Cycle, Hooks, State Management." },
      { title: "CSS Frameworks", desc: "Tailwind CSS, Styled Components." },
      { title: "Advanced Topics", desc: "Next.js routing, SSR, SSG, Authentication integration." }
    ]
  },
  {
    title: "Backend Development",
    icon: "FaServer",
    color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", glow: "shadow-green-500/10",
    desc: "Node.js → Express → MongoDB → REST APIs → Auth → Cloud. Build scalable server-side applications from scratch.",
    steps: ["Node.js & npm", "Express.js & REST", "MongoDB & Mongoose", "JWT Authentication", "Docker Basics", "AWS / Railway Deploy"],
    duration: "4–5 months",
    level: "Beginner to Production Level",
    details: [
      { title: "Internet & OS Basics", desc: "Processes, Threads, I/O, Web Servers." },
      { title: "Node.js Platform", desc: "Event Loop, File System, Buffers, Streams." },
      { title: "API Development", desc: "Express.js routing, Middleware, RESTful design." },
      { title: "Databases", desc: "SQL vs NoSQL, MongoDB schema design, Mongoose." },
      { title: "Security & Auth", desc: "Bcrypt, JWT tokens, OAuth, CORS." },
      { title: "Deployment", desc: "Environment variables, Dockerization, CI/CD, AWS Basics." }
    ]
  },
  {
    title: "Full Stack MERN",
    icon: "FaDatabase",
    color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/10",
    desc: "Combine Frontend & Backend with MongoDB, Express, React, and Node.js to build complete production-grade applications.",
    steps: ["React.js Frontend", "Node.js / Express API", "MongoDB Database", "JWT & Cookie Auth", "State Management", "Full Deployment"],
    duration: "6–8 months",
    level: "Intermediate to Advanced",
    recommended: true,
    details: [
      { title: "Frontend Basics", desc: "HTML, CSS, JavaScript, React." },
      { title: "Backend API", desc: "Node.js and Express RESTful Services." },
      { title: "Database Integration", desc: "MongoDB and Mongoose setup." },
      { title: "Full Stack Auth", desc: "End-to-end authentication with JWT." },
      { title: "State Management", desc: "Redux Toolkit or Zustand integration." },
      { title: "Production Build", desc: "Deploying MERN stack onto Vercel and Render." }
    ]
  },
  {
    title: "Android Development",
    icon: "FaMobileAlt",
    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/10",
    desc: "Kotlin → Jetpack Compose → Android SDK → Firebase. Go from nothing to publishing apps on the Google Play Store.",
    steps: ["Kotlin Basics", "Android SDK", "Jetpack Compose", "Firebase Integration", "REST API Calls", "Play Store Publishing"],
    duration: "5–6 months",
    level: "Intermediate to Advanced",
    details: [
      { title: "Kotlin Fundamentals", desc: "Syntax, OOP, Coroutines." },
      { title: "Android Basics", desc: "Activity lifecycle, Intents, Layouts." },
      { title: "Modern UI", desc: "Jetpack Compose fundamentals." },
      { title: "Data Storage", desc: "Room Database, Shared Preferences." },
      { title: "Networking", desc: "Retrofit, OkHttp for API calls." },
      { title: "Publishing", desc: "Play Store Console, App signing." }
    ]
  },
  {
    title: "Machine Learning",
    icon: "FaBrain",
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", glow: "shadow-red-500/10",
    desc: "Python → NumPy → Pandas → Scikit-Learn → Deep Learning. Build and deploy real ML models step by step.",
    steps: ["Python & NumPy", "Data Analysis with Pandas", "Scikit-Learn ML", "Neural Networks", "TensorFlow / PyTorch", "Model Deployment"],
    duration: "5–7 months",
    level: "Intermediate to Advanced",
    details: [
      { title: "Python Basics", desc: "Syntax, Data structures, Functions." },
      { title: "Data Handling", desc: "NumPy matrix operations, Pandas dataframes." },
      { title: "Machine Learning Concepts", desc: "Supervised and Unsupervised Learning." },
      { title: "Algorithms", desc: "Linear Regression, Decision Trees, SVM." },
      { title: "Deep Learning", desc: "Neural Networks, CNNs, TensorFlow/Keras." },
      { title: "Deployment", desc: "Flask/FastAPI model deployment." }
    ]
  }
];
