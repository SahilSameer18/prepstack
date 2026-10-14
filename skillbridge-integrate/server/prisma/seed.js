import prisma from "../src/lib/prisma.js";

/**
 * Each skill's `aliases` are literal, lowercase substrings expected to appear
 * inside Gemini's free-text skill gap (e.g. "Containerization (Docker/Kubernetes)").
 * Kept deliberately specific (tool/tech names, not broad concepts) so one skill's
 * alias never accidentally swallows a different tool's gap.
 *
 * Fill in every `url: "TODO"` with a real documentation link (DOCUMENTATION)
 * and a real YouTube video/playlist link (VIDEO) before running the seed.
 */
const skills = [
  // ---------- Languages ----------
  {
    name: "JavaScript",
    aliases: ["javascript", "ecmascript", "js"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "JavaScript Docs - MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      },
      {
        type: "VIDEO",
        title: "JavaScript Full Course - freeCodeCamp",
        url: "https://www.youtube.com/playlist?list=PLQEaRBV9gAFuf-27K64l7-hV7o0fr9zx7",
      },
    ],
  },
  {
    name: "TypeScript",
    aliases: ["typescript", "ts", "ts language", "typescript language"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "TypeScript Handbook",
        url: "https://www.typescriptlang.org/docs/",
      },
      {
        type: "VIDEO",
        title: "TypeScript Full Course - freeCodeCamp",
        url: "https://youtube.com/playlist?list=PLu71SKxNbfoBkkr8lblqtsJvxrw3j1tWC&si=zuHBF0b-BZlOsIzF",
      },
    ],
  },
  {
    name: "Python",
    aliases: ["python", "py", "python3", "python programming"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Python Official Docs",
        url: "https://docs.python.org/3/",
      },
      {
        type: "VIDEO",
        title: "Python Full Course - freeCodeCamp",
        url: "https://youtu.be/ERCMXc8x7mc?si=PoQLBp4bS6JWUg6K",
      },
    ],
  },
  {
    name: "Java",
    aliases: [
      "java",
      "java programming",
      "java language",
      "jdk",
      "jvm",
      "jvm internals",
      "garbage collection",
      "concurrency in java",
      "multithreading in java",
      "multithreading and concurrency in java",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Java Documentation - Oracle",
        url: "https://docs.oracle.com/en/java/",
      },
      {
        type: "VIDEO",
        title: "Java Full Course - freeCodeCamp",
        url: "https://youtube.com/playlist?list=PLQEaRBV9gAFsR15tNo2QLF9d2qc-c018p&si=3YcQJJLwwa2HnuqC",
      },
    ],
  },
  {
    name: "C++",
    aliases: ["c++", "cpp"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "C++ Reference",
        url: "https://en.cppreference.com/w/cpp",
      },
      {
        type: "VIDEO",
        title: "C++ Full Course - freeCodeCamp",
        url: "https://youtu.be/Z2oxGj36vZk?si=whXD71yw0dkE_8Mg",
      },
    ],
  },
  {
    name: "Go",
    aliases: ["golang", "go"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Go Documentation",
        url: "https://go.dev/doc/",
      },
      {
        type: "VIDEO",
        title: "Go Full Course - freeCodeCamp",
        url: "https://youtu.be/yZgwW6Yuc_E?si=36PmnBxT5aYk2Cdq",
      },
    ],
  },
  {
    name: "PHP",
    aliases: ["php", "php8", "php programming", "modern php", "php / laravel"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "PHP Official Documentation",
        url: "https://www.php.net/docs.php",
      },
      {
        type: "VIDEO",
        title: "PHP Full Course - freeCodeCamp",
        url: "https://youtu.be/OK_JCtrrv-c",
      },
    ],
  },

  // ---------- Frontend ----------
  {
    name: "React",
    aliases: ["react.js", "reactjs", "react"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "React Docs",
        url: "https://react.dev/",
      },
      {
        type: "VIDEO",
        title: "React Full Course",
        url: "https://youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige&si=7yownj5uA0KLDJVn",
      },
    ],
  },
  {
    name: "Vue.js",
    aliases: ["vue.js", "vuejs", "vue"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Vue.js Guide",
        url: "https://vuejs.org/guide/",
      },
      {
        type: "VIDEO",
        title: "Vue.js Full Course",
        url: "https://youtu.be/jT7F1hK6hJ8?si=gW8y76V1-4WdK-5W",
      },
    ],
  },
  {
    name: "Angular",
    aliases: ["angular", "angularjs", "angular.js", "angular 2+", "angular framework"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Angular Docs",
        url: "https://angular.dev/",
      },
      {
        type: "VIDEO",
        title: "Angular Full Course",
        url: "https://youtube.com/playlist?list=PLu71SKxNbfoB57gV87_bIUP9Q_gq81m3I&si=Q12nJ2X98Xv6_oQZ",
      },
    ],
  },
  {
    name: "Tailwind CSS",
    aliases: ["tailwindcss", "tailwind", "tailwind css"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Tailwind CSS Docs",
        url: "https://tailwindcss.com/docs",
      },
      {
        type: "VIDEO",
        title: "Tailwind CSS Crash Course",
        url: "https://youtu.be/_9mTJ84uL1Q?si=82hDabuirNBlpt-v",
      },
    ],
  },
  {
    name: "Redux",
    aliases: ["redux", "redux toolkit", "rtk", "redux state management"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Redux Docs",
        url: "https://redux.js.org/",
      },
      {
        type: "VIDEO",
        title: "Redux Crash Course",
        url: "https://youtu.be/Q5TqsetwCoE?si=8tL_gWRvYYFhpe_f",
      },
    ],
  },
  {
    name: "Zustand",
    aliases: ["zustand"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Zustand Docs",
        url: "https://github.com/pmndrs/zustand",
      },
      {
        type: "VIDEO",
        title: "Zustand Crash Course",
        url: "https://youtu.be/HU6YEFfzopo?si=3wvc93JIWktj9olP",
      },
    ],
  },
  {
    name: "React Query",
    aliases: [
      "react query",
      "tanstack query",
      "tanstack react query",
      "@tanstack/react-query",
      "react-query",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "TanStack Query Documentation",
        url: "https://tanstack.com/query/latest",
      },
      {
        type: "VIDEO",
        title: "React Query Crash Course",
        url: "https://youtu.be/KrruJTTwOgU?si=-Gfvs1SlEXdj13uq",
      },
    ],
  },
  {
    name: "Material UI",
    aliases: ["material ui", "mui", "@mui"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Material UI Documentation",
        url: "https://mui.com/",
      },
      {
        type: "VIDEO",
        title: "Material UI Tutorial",
        url: "https://youtube.com/playlist?list=PLC3y8-rFHvwh-K9mDlrrcDywl7CeVL2rO&si=lni1olkEj9Vbls0v",
      },
    ],
  },
  {
    name: "Bootstrap",
    aliases: ["bootstrap", "bootstrap 5"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Bootstrap Documentation",
        url: "https://getbootstrap.com/docs/",
      },
      {
        type: "VIDEO",
        title: "Bootstrap 5 Crash Course",
        url: "https://youtu.be/fB00t4At0rk?si=JraoRgzbVNz8GO_U",
      },
    ],
  },
  {
    name: "Next.js",
    aliases: ["next", "nextjs", "next.js", "nextjs framework", "next.js framework"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Next.js Documentation",
        url: "https://nextjs.org/docs",
      },
      {
        type: "VIDEO",
        title: "Next.js Full Course",
        url: "https://youtu.be/MZbwu3-uz3Y?si=45kU3gCSYA9gyWIw",
      },
    ],
  },

  // ---------- Backend ----------
  {
    name: "Node.js",
    aliases: ["node.js", "nodejs", "node", "node runtime", "node.js runtime"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Node.js Docs",
        url: "https://nodejs.org/en/docs/",
      },
      {
        type: "VIDEO",
        title: "Node.js Full Course",
        url: "https://youtube.com/playlist?list=PL78RhpUUKSwfeSOOwfE9x6l5jTjn5LbY3&si=5pxR-eTJTlH_gQci",
      },
    ],
  },
  {
    name: "Express.js",
    aliases: ["express.js", "expressjs", "express", "express framework", "express.js framework"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Express.js Docs",
        url: "https://expressjs.com/",
      },
      {
        type: "VIDEO",
        title: "Express.js Crash Course",
        url: "https://youtube.com/playlist?list=PL78RhpUUKSwfeSOOwfE9x6l5jTjn5LbY3&si=5pxR-eTJTlH_gQci",
      },
    ],
  },
  {
    name: "Django",
    aliases: ["django"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Django Docs",
        url: "https://docs.djangoproject.com/",
      },
      {
        type: "VIDEO",
        title: "Django Full Course",
        url: "https://youtu.be/iflSRpcyzdI?si=xwMweeLm5tvAFWVv",
      },
    ],
  },
  {
    name: "Spring Boot",
    aliases: [
      "spring boot",
      "springboot",
      "spring",
      "spring boot framework",
      "spring framework",
      "spring boot/hibernate",
      "spring boot / hibernate",
      "java ecosystem",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Spring Boot Docs",
        url: "https://spring.io/projects/spring-boot",
      },
      {
        type: "VIDEO",
        title: "Spring Boot Full Course",
        url: "https://youtube.com/playlist?list=PLEYgx5hMdopw&si=U3z6Hi9UGZCdXuOI",
      },
    ],
  },
  {
    name: "Hibernate / JPA",
    aliases: [
      "hibernate",
      "jpa",
      "java persistence api",
      "spring data jpa",
      "orm hibernate",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Hibernate ORM Documentation",
        url: "https://hibernate.org/orm/documentation/",
      },
      {
        type: "VIDEO",
        title: "Hibernate & JPA Full Course",
        url: "https://youtu.be/VRpH91Gsmk4",
      },
    ],
  },
  {
    name: "Build Tools (Maven/Gradle)",
    aliases: [
      "maven",
      "gradle",
      "java-based build tools",
      "java build tools",
      "build tools (maven/gradle)",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Apache Maven Documentation",
        url: "https://maven.apache.org/guides/",
      },
      {
        type: "VIDEO",
        title: "Maven & Gradle Crash Course",
        url: "https://youtu.be/0b59bY4qfio",
      },
    ],
  },
  {
    name: "REST APIs",
    aliases: ["restful", "rest api", "rest apis", "restful apis", "rest"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "REST API Tutorial",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
      },
      {
        type: "VIDEO",
        title: "REST API Crash Course",
        url: "https://youtu.be/XvFmUE-36Kc?si=zNNIjRoetLyxDyAF",
      },
    ],
  },
  {
    name: "GraphQL",
    aliases: ["graphql", "gql", "graphql api"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "GraphQL Docs",
        url: "https://graphql.org/",
      },
      {
        type: "VIDEO",
        title: "GraphQL Crash Course",
        url: "https://youtu.be/WtkKwO1viI8?si=0jUI1Loav0lpl8GW",
      },
    ],
  },
  {
    name: "Socket.io",
    aliases: [
      "socket.io",
      "socketio",
      "websockets",
      "websocket",
      "web socket",
      "web sockets",
      "real-time communication",
      "real time communication",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Socket.io Docs",
        url: "https://socket.io/docs/",
      },
      {
        type: "VIDEO",
        title: "Socket.io Crash Course",
        url: "https://youtu.be/CzcfeL7ymbU?si=fIdyWt85rElSnJ-Q",
      },
    ],
  },
  {
    name: "NestJS",
    aliases: ["nestjs", "nest", "nest.js"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "NestJS Documentation",
        url: "https://docs.nestjs.com/",
      },
      {
        type: "VIDEO",
        title: "NestJS Full Course",
        url: "https://youtu.be/KMg_Qg0WCds?si=R-5DQngiKv1UF6Rk",
      },
    ],
  },
  {
    name: "FastAPI",
    aliases: ["fastapi"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "FastAPI Documentation",
        url: "https://fastapi.tiangolo.com/",
      },
      {
        type: "VIDEO",
        title: "FastAPI Course",
        url: "https://youtu.be/fxRCoEUmq8s?si=S5ytqiOjruNwz4on",
      },
    ],
  },
  {
    name: "Flask",
    aliases: ["flask"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Flask Documentation",
        url: "https://flask.palletsprojects.com/",
      },
      {
        type: "VIDEO",
        title: "Flask Course",
        url: "https://youtu.be/QZfaRHzWM0k?si=xsFvzebKhZgMhMa6",
      },
    ],
  },
  {
    name: "ASP.NET Core",
    aliases: ["asp.net core", "asp.net", "dotnet", ".net", ".net core"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "ASP.NET Core Documentation",
        url: "https://learn.microsoft.com/en-us/aspnet/core/",
      },
      {
        type: "VIDEO",
        title: "ASP.NET Core Full Course",
        url: "https://youtu.be/YbRe4iIVYJk?si=5meY9Dj4h-lqbGBN",
      },
    ],
  },
  {
    name: "Laravel",
    aliases: ["laravel"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Laravel Documentation",
        url: "https://laravel.com/docs",
      },
      {
        type: "VIDEO",
        title: "Laravel Full Course",
        url: "https://youtu.be/MYyJ4PuL4pY?si=DxM3e4W3H6c1_vvP",
      },
    ],
  },
  {
    name: "Ruby on Rails",
    aliases: ["ruby on rails", "rails", "ror"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Ruby on Rails Guides",
        url: "https://guides.rubyonrails.org/",
      },
      {
        type: "VIDEO",
        title: "Ruby on Rails Course",
        url: "https://youtu.be/fmyvWz5TUWg?si=AfM-5Qg6U_4hcbW7",
      },
    ],
  },

  // ---------- Databases ----------
  {
    name: "SQL",
    aliases: ["sql"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "SQL Tutorial",
        url: "https://www.postgresql.org/docs/current/tutorial-sql.html",
      },
      {
        type: "VIDEO",
        title: "SQL Full Course",
        url: "https://youtu.be/yE6tIle64tU?si=qJ--xX3IM-WiFmDi",
      },
    ],
  },
  {
    name: "PostgreSQL",
    aliases: ["postgresql", "postgres", "postgres database"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "PostgreSQL Docs",
        url: "https://www.postgresql.org/docs/",
      },
      {
        type: "VIDEO",
        title: "PostgreSQL Full Course",
        url: "https://youtu.be/cnzka7kF5Zk?si=Lr8wFWkjFILQvtOu",
      },
    ],
  },
  {
    name: "MongoDB",
    aliases: ["mongodb", "mongo", "mongodb database"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "MongoDB Docs",
        url: "https://docs.mongodb.com/",
      },
      {
        type: "VIDEO",
        title: "MongoDB Full Course",
        url: "https://youtu.be/M1dKYQ7GsTg?si=Czr6msSSqbO-AzfQ",
      },
    ],
  },
  {
    name: "Redis",
    aliases: [
      "redis",
      "redis cache",
      "redis caching",
      "redis caching implementation",
      "redis (caching & pub/sub)",
      "caching strategies",
      "caching strategies (redis/memcached)",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Redis Docs",
        url: "https://redis.io/docs/",
      },
      {
        type: "VIDEO",
        title: "Redis Crash Course",
        url: "https://youtube.com/playlist?list=PLxamJ86SDCj28nzE9l6frczaVhPX7P7o7&si=jBXuZhuJ6WdHF17Y",
      },
    ],
  },
  {
    name: "Oracle Database",
    aliases: ["oracle", "oracle db", "oracle database"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Oracle Database Documentation",
        url: "https://docs.oracle.com/en/database/",
      },
      {
        type: "VIDEO",
        title: "Oracle SQL Tutorial",
        url: "https://youtube.com/playlist?list=PLsphD3EpR7F9mmtY2jBt_O8Q9XmvrhQEF&si=wyp8zQmUFafwEwOO",
      },
    ],
  },
  {
    name: "Firebase",
    aliases: ["firebase", "cloud firestore", "firestore"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Firebase Documentation",
        url: "https://firebase.google.com/docs",
      },
      {
        type: "VIDEO",
        title: "Firebase Full Course",
        url: "https://youtu.be/fgdpvwEWJ9M?si=fbSKvz1h5TG1qM6_",
      },
    ],
  },
  {
    name: "Prisma",
    aliases: ["prisma", "prisma orm", "prisma client"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Prisma Documentation",
        url: "https://www.prisma.io/docs",
      },
      {
        type: "VIDEO",
        title: "Prisma ORM Crash Course",
        url: "https://youtu.be/kkwrvcTVd1k?si=IIxUsHkL97ANlc5g",
      },
    ],
  },
  {
    name: "MySQL",
    aliases: ["mysql", "mysql database"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "MySQL Documentation",
        url: "https://dev.mysql.com/doc/",
      },
      {
        type: "VIDEO",
        title: "MySQL Full Course",
        url: "https://youtu.be/yE6tIle64tU?si=qJ--xX3IM-WiFmDi",
      },
    ],
  },
  {
    name: "SQLite",
    aliases: ["sqlite", "sqlite database"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "SQLite Documentation",
        url: "https://www.sqlite.org/docs.html",
      },
      {
        type: "VIDEO",
        title: "SQLite Full Course",
        url: "https://youtu.be/yE6tIle64tU?si=qJ--xX3IM-WiFmDi",
      },
    ],
  },

  // ---------- DevOps / Cloud ----------
  {
    name: "Docker",
    aliases: [
      "docker",
      "docker containers",
      "containerization",
      "docker containerization",
      "docker & containerization",
      "containerization (docker)",
      "containerization (docker/kubernetes)",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Docker Docs",
        url: "https://docs.docker.com/",
      },
      {
        type: "VIDEO",
        title: "Docker Full Course",
        url: "https://youtu.be/OhnTMWmfTBE?si=r0UZvguY6INh_u8R",
      },
    ],
  },
  {
    name: "Kubernetes",
    aliases: ["kubernetes", "k8s", "k8s cluster", "kubernetes orchestration"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Kubernetes Docs",
        url: "https://kubernetes.io/docs/",
      },
      {
        type: "VIDEO",
        title: "Kubernetes Full Course",
        url: "https://youtu.be/_4uQI4ihGVU?si=kwBBFasjkWKjHW1V",
      },
    ],
  },
  {
    name: "AWS",
    aliases: ["amazon web services", "aws", "aws services", "amazon cloud"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "AWS Documentation",
        url: "https://docs.aws.amazon.com/",
      },
      {
        type: "VIDEO",
        title: "AWS Full Course",
        url: "https://youtu.be/N4sJj-SxX00?si=FHUnjRnk132Wu96C",
      },
    ],
  },
  {
    name: "Azure",
    aliases: ["azure"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Microsoft Azure Docs",
        url: "https://learn.microsoft.com/azure/",
      },
      {
        type: "VIDEO",
        title: "Azure Full Course",
        url: "https://www.youtube.com/live/hUxB_Uenq14?si=CdYB2756GslJzUlX",
      },
    ],
  },
  {
    name: "GCP",
    aliases: ["google cloud", "gcp"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Google Cloud Docs",
        url: "https://cloud.google.com/docs/",
      },
      {
        type: "VIDEO",
        title: "GCP Full Course",
        url: "https://youtu.be/hUxB_Uenq14?si=CdYB2756GslJzUlX",
      },
    ],
  },
  {
    name: "CI/CD",
    aliases: [
      "continuous integration",
      "continuous deployment",
      "ci/cd",
      "ci cd",
      "cicd",
      "deployment pipeline",
      "deployment pipelines",
      "devops",
      "cloud infrastructure & devops",
      "ci/cd pipeline",
      "ci/cd pipeline implementation",
      "ci/cd pipeline configuration",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "CI/CD Concepts Guide",
        url: "https://about.gitlab.com/topics/ci-cd/",
      },
      {
        type: "VIDEO",
        title: "CI/CD Crash Course",
        url: "https://youtube.com/playlist?list=PLzpJO-82rjC6ZD0uAhP8HR9RV9xGaPbIJ&si=EBlLozpJVg-5aY4c",
      },
    ],
  },
  {
    name: "Terraform",
    aliases: [
      "terraform",
      "infrastructure as code",
      "iac",
      "hashicorp terraform",
      "infrastructure as code (terraform)",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Terraform Documentation",
        url: "https://developer.hashicorp.com/terraform/docs",
      },
      {
        type: "VIDEO",
        title: "Terraform Full Course - freeCodeCamp",
        url: "https://youtu.be/7xngnjfIlK4",
      },
    ],
  },
  {
    name: "Git",
    aliases: ["version control", "git", "github", "gitlab"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Git Documentation",
        url: "https://git-scm.com/doc",
      },
      {
        type: "VIDEO",
        title: "Git & GitHub Full Course",
        url: "https://youtu.be/zTjRZNkhiEU?si=1VJ5DTv9a1n2kwCW",
      },
    ],
  },
  {
    name: "Linux/Bash",
    aliases: [
      "shell scripting",
      "bash",
      "linux",
      "linux system administration",
      "bash scripting",
      "linux administration",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Bash Reference Manual",
        url: "https://www.gnu.org/software/bash/manual/",
      },
      {
        type: "VIDEO",
        title: "Linux Command Line Full Course",
        url: "https://youtube.com/playlist?list=PL5Qp2b7x1b6d899d3E1-78Qd1C1oW3W9p&si=g0l1p345f67d8e9f",
      },
    ],
  },
  {
    name: "GitHub Actions",
    aliases: ["github actions", "github workflows", "github action"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "GitHub Actions Documentation",
        url: "https://docs.github.com/actions",
      },
      {
        type: "VIDEO",
        title: "GitHub Actions Tutorial",
        url: "https://youtu.be/Xwpi0ITkL3U?si=_aV91HiyAtrmi3Fe",
      },
    ],
  },
  {
    name: "Apache Kafka",
    aliases: ["kafka", "apache kafka"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Apache Kafka Documentation",
        url: "https://kafka.apache.org/documentation/",
      },
      {
        type: "VIDEO",
        title: "Apache Kafka Course",
        url: "https://youtu.be/ZJJHm_bd9Zo?si=oKgXSiNeIue7RpaS",
      },
    ],
  },
  {
    name: "RabbitMQ",
    aliases: ["rabbitmq"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "RabbitMQ Documentation",
        url: "https://www.rabbitmq.com/documentation.html",
      },
      {
        type: "VIDEO",
        title: "RabbitMQ Tutorial",
        url: "https://youtu.be/FGU3oFIeG0Q?si=ON4j77M1poOQ8Bx7",
      },
    ],
  },

  // ---------- Testing ----------

  {
    name: "Unit Testing",
    aliases: [
      "unit testing",
      "unit-testing",
      "automated testing",
      "integration testing",
      "unit/integration",
      "testing",
      "software testing",
      "automated testing (unit/integration)",
      "automated testing (unit/e2e)",
      "unit and integration testing",
      "professional software testing",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Unit Testing Guide",
        url: "https://www.softwaretestinghelp.com/unit-testing/",
      },
      {
        type: "VIDEO",
        title: "Unit Testing Full Course",
        url: "https://youtube.com/playlist?list=PL4cUxeGkcC9iyuClsf48SSgsJPBStHo7F&si=kcnbdmA-ClSZiZNO",
      },
    ],
  },
  {
    name: "Jest",
    aliases: [
      "jest",
      "jest testing",
      "jest/cypress",
      "jest/mocha",
      "jest/react testing library",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Jest Docs",
        url: "https://jestjs.io/docs/getting-started",
      },
      {
        type: "VIDEO",
        title: "Jest Full Course",
        url: "https://youtube.com/playlist?list=PL8p2I9GklV47ZpFC9sNHTXwJRgwwzdkNG&si=tkDeHKsFH0WZPD2n",
      },
    ],
  },
  {
    name: "Cypress",
    aliases: ["cypress"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Cypress Docs",
        url: "https://docs.cypress.io/",
      },
      {
        type: "VIDEO",
        title: "Cypress Crash Course",
        url: "https://youtu.be/u8vMu7viCm8?si=Tf8b17GwN2ryR5dt",
      },
    ],
  },
  {
    name: "Playwright",
    aliases: ["playwright"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Playwright Docs",
        url: "https://playwright.dev/docs/intro",
      },
      {
        type: "VIDEO",
        title: "Playwright Crash Course",
        url: "https://youtu.be/mX6fK9q_lq4?si=Xo4t9v5l4t5w4t5w",
      },
    ],
  },
  {
    name: "Mocha",
    aliases: ["mocha"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Mocha Docs",
        url: "https://mochajs.org/",
      },
      {
        type: "VIDEO",
        title: "Mocha & Chai Crash Course",
        url: "https://youtu.be/QhK4rY4y4y4?si=QhK4rY4y4y4y4y4y",
      },
    ],
  },
  {
    name: "Test-Driven Development",
    aliases: ["test driven development", "test-driven development", "tdd"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "TDD Guide",
        url: "https://www.agilealliance.org/glossary/tdd/",
      },
      {
        type: "VIDEO",
        title: "TDD Crash Course",
        url: "https://youtu.be/QhK4rY4y4y4?si=QhK4rY4y4y4y4y4y",
      },
    ],
  },
  {
    name: "Selenium",
    aliases: ["selenium", "selenium webdriver"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Selenium Documentation",
        url: "https://www.selenium.dev/documentation/",
      },
      {
        type: "VIDEO",
        title: "Selenium WebDriver Full Course",
        url: "https://youtu.be/j7VZsCCnptM",
      },
    ],
  },
  {
    name: "Postman",
    aliases: ["postman", "postman api testing"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Postman Documentation",
        url: "https://learning.postman.com/docs/",
      },
      {
        type: "VIDEO",
        title: "Postman API Testing Course",
        url: "https://youtu.be/VywxIQ2ZXw4",
      },
    ],
  },
  {
    name: "API Testing",
    aliases: ["api testing", "rest api testing", "api automation testing"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "API Testing Guide",
        url: "https://www.postman.com/api-platform/api-testing/",
      },
      {
        type: "VIDEO",
        title: "API Testing Full Course",
        url: "https://youtu.be/7YcW25PHnAA",
      },
    ],
  },
  {
    name: "Swagger / OpenAPI",
    aliases: ["swagger", "swagger ui", "openapi", "openapi specification"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Swagger Documentation",
        url: "https://swagger.io/docs/",
      },
      {
        type: "VIDEO",
        title: "Swagger API Documentation Tutorial",
        url: "https://youtu.be/S8kmHtQeflo",
      },
    ],
  },

  // ---------- CS Fundamentals ----------
  {
    name: "Data Structures",
    aliases: [
      "data structures",
      "data structure",
      "dsa",
      "competitive programming",
      "advanced competitive programming",
      "data structures and algorithms",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Data Structures Guide",
        url: "https://www.geeksforgeeks.org/data-structures/",
      },
      {
        type: "VIDEO",
        title: "Data Structures Full Course",
        url: "https://youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&si=-9zcL4wdErJEvW3t",
      },
    ],
  },
  {
    name: "Algorithms",
    aliases: ["algorithm", "algorithms", "dsa", "algorithmic problem solving"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Algorithms Guide",
        url: "https://www.geeksforgeeks.org/fundamentals-of-algorithms/",
      },
      {
        type: "VIDEO",
        title: "Algorithms Full Course",
        url: "https://youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&si=-9zcL4wdErJEvW3t",
      },
    ],
  },
  {
    name: "System Design",
    aliases: [
      "system design",
      "systems design",
      "architecting systems",
      "system design & scalability",
      "scalability",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "System Design Primer",
        url: "https://github.com/donnemartin/system-design-primer",
      },
      {
        type: "VIDEO",
        title: "System Design Full Course",
        url: "https://youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX&si=lv2x4ylfdVV0rRmZ",
      },
    ],
  },
  {
    name: "Object-Oriented Programming",
    aliases: ["object oriented programming", "object-oriented", "oop"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "OOP Concepts Guide",
        url: "https://docs.oracle.com/javase/tutorial/java/concepts/",
      },
      {
        type: "VIDEO",
        title: "OOP Crash Course",
        url: "https://youtube.com/playlist?list=PL9gnSGHSqcno1G3XjUbwzXHL8_EttOuKk&si=BlpI1KJyW7fGbNeI",
      },
    ],
  },
  {
    name: "Design Patterns",
    aliases: ["design patterns", "design pattern"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Design Patterns Guide",
        url: "https://refactoring.guru/design-patterns",
      },
      {
        type: "VIDEO",
        title: "Design Patterns Crash Course",
        url: "https://youtu.be/vNXuyhsSFbg?si=N7j4mX7gW410i7Hn",
      },
    ],
  },
  {
    name: "Big O / Time Complexity",
    aliases: ["space complexity", "time complexity", "big o"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Big O Notation Guide",
        url: "https://www.bigocheatsheet.com/",
      },
      {
        type: "VIDEO",
        title: "Big O Crash Course",
        url: "https://youtu.be/5T0SiJocPCI?si=MIdD_SvRXff9MZVV",
      },
    ],
  },

  // ---------- Architecture ----------
  {
    name: "Microservices",
    aliases: ["microservice", "microservices"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Microservices Guide",
        url: "https://microservices.io/",
      },
      {
        type: "VIDEO",
        title: "Microservices Crash Course",
        url: "https://youtu.be/Jl9OKQ92SJU?si=oKWnviiSaplGZTz6",
      },
    ],
  },
  {
    name: "Load Balancing",
    aliases: ["load balancer", "load balancing", "load-balancer", "load-balancing"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Load Balancing Guide",
        url: "https://www.nginx.com/resources/glossary/load-balancing/",
      },
      {
        type: "VIDEO",
        title: "Load Balancing Crash Course",
        url: "https://youtu.be/C842vFY5kRo?si=jKY1GhvY9hbuuY5n",
      },
    ],
  },
  {
    name: "Message Queues",
    aliases: ["message queues", "message queue", "queue systems"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Message Queues Guide",
        url: "https://www.redhat.com/en/topics/integration/what-is-a-message-queue",
      },
      {
        type: "VIDEO",
        title: "Message Queues Crash Course",
        url: "https://youtu.be/IJkYipYNEtI?si=Iwth3f_0P9rBEieF",
      },
    ],
  },

  // ---------- Security ----------
  {
    name: "Authentication & Authorization",
    aliases: ["authorization", "authentication", "auth", "authn", "authz"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Auth Concepts Guide",
        url: "https://developer.okta.com/docs/concepts/authentication/",
      },
      {
        type: "VIDEO",
        title: "Authentication Crash Course",
        url: "https://youtu.be/A95rliroC8Q?si=muCwn3AYqN-3bqqX",
      },
    ],
  },
  {
    name: "JWT",
    aliases: ["json web token", "jwt", "jwts", "json web tokens"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "JWT Introduction",
        url: "https://jwt.io/introduction/",
      },
      {
        type: "VIDEO",
        title: "JWT Crash Course",
        url: "https://youtu.be/pkKn8q5AvsY?si=cucOrNX3JCoHkV6x",
      },
    ],
  },
  {
    name: "OAuth 2.0",
    aliases: ["oauth2", "oauth 2.0", "oauth"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "OAuth 2.0 Guide",
        url: "https://oauth.net/2/",
      },
      {
        type: "VIDEO",
        title: "OAuth 2.0 Crash Course",
        url: "https://youtu.be/WSsOXo07LeE?si=fXBfTdHFMKqBhS09",
      },
    ],
  },
  {
    name: "Web Security (OWASP)",
    aliases: ["sql injection", "csrf", "xss", "owasp", "web security", "cybersecurity", "application security"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "OWASP Top 10",
        url: "https://owasp.org/www-project-top-ten/",
      },
      {
        type: "VIDEO",
        title: "Web Security Crash Course",
        url: "https://youtu.be/pG2wDIG3Kww?si=qBQfLjtvPLI9cbkp",
      },
    ],
  },

  // ---------- Mobile Development ----------

  {
    name: "React Native",
    aliases: ["react native", "reactnative"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "React Native Documentation",
        url: "https://reactnative.dev/docs/getting-started",
      },
      {
        type: "VIDEO",
        title: "React Native Full Course",
        url: "https://youtu.be/0-S5a0eXPoc",
      },
    ],
  },
  {
    name: "Flutter",
    aliases: ["flutter"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Flutter Documentation",
        url: "https://docs.flutter.dev/",
      },
      {
        type: "VIDEO",
        title: "Flutter Full Course",
        url: "https://youtu.be/VPvVD8t02U8",
      },
    ],
  },
  {
    name: "Android Development",
    aliases: ["android", "android development"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Android Developers Documentation",
        url: "https://developer.android.com/docs",
      },
      {
        type: "VIDEO",
        title: "Android Development Full Course",
        url: "https://youtu.be/fis26HvvDII",
      },
    ],
  },
  {
    name: "iOS Development",
    aliases: ["ios", "ios development", "iphone development"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Apple iOS Developer Documentation",
        url: "https://developer.apple.com/documentation/",
      },
      {
        type: "VIDEO",
        title: "iOS Development Course",
        url: "https://youtu.be/CwA1VWP0Ldw",
      },
    ],
  },
  {
    name: "Swift",
    aliases: ["swift", "swift language"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Swift Documentation",
        url: "https://www.swift.org/documentation/",
      },
      {
        type: "VIDEO",
        title: "Swift Programming Course",
        url: "https://youtu.be/comQ1-x2a1Q",
      },
    ],
  },
  {
    name: "SwiftUI",
    aliases: ["swiftui", "swift ui"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "SwiftUI Documentation",
        url: "https://developer.apple.com/xcode/swiftui/",
      },
      {
        type: "VIDEO",
        title: "SwiftUI Tutorial",
        url: "https://youtu.be/b1oC7sLIgpI",
      },
    ],
  },
  {
    name: "Kotlin",
    aliases: ["kotlin"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Kotlin Documentation",
        url: "https://kotlinlang.org/docs/home.html",
      },
      {
        type: "VIDEO",
        title: "Kotlin Full Course",
        url: "https://youtu.be/EExSSotojVI",
      },
    ],
  },
  {
    name: "Android SDK",
    aliases: ["android sdk", "sdk android"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Android SDK Documentation",
        url: "https://developer.android.com/tools",
      },
      {
        type: "VIDEO",
        title: "Android SDK Tutorial",
        url: "https://youtu.be/Vw1zT6vV9KQ",
      },
    ],
  },
  {
    name: "Firebase Mobile",
    aliases: ["firebase mobile", "firebase android", "firebase ios"],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Firebase Documentation",
        url: "https://firebase.google.com/docs",
      },
      {
        type: "VIDEO",
        title: "Firebase Mobile Course",
        url: "https://youtu.be/9kRgVxULbag",
      },
    ],
  },
  {
    name: "UI/UX Design",
    aliases: [
      "ui/ux",
      "ux research",
      "user testing",
      "visual hierarchy",
      "typography",
      "user experience",
      "user interface",
      "design theory",
      "advanced ux research",
      "visual hierarchy and typography",
      "typography theory",
      "visual hierarchy and typography theory",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Interaction Design Foundation",
        url: "https://www.interaction-design.org/literature",
      },
      {
        type: "VIDEO",
        title: "UI/UX Design Full Course - freeCodeCamp",
        url: "https://youtu.be/c9Wg6Ry_OMY",
      },
    ],
  },
  {
    name: "Figma",
    aliases: [
      "figma",
      "figma mastery",
      "figma prototyping",
      "figma design",
      "professional figma",
      "prototyping & design",
      "professional figma mastery",
    ],
    resources: [
      {
        type: "DOCUMENTATION",
        title: "Figma Help Center",
        url: "https://help.figma.com/hc/en-us",
      },
      {
        type: "VIDEO",
        title: "Figma UI/UX Design Tutorial - freeCodeCamp",
        url: "https://youtu.be/Ft-FtV-bHkE",
      },
    ],
  },
];

async function seedSkill(skillData) {
  const { resources, ...skillFields } = skillData;
  const skill = await prisma.skill.upsert({
    where: { name: skillFields.name },
    update: { aliases: skillFields.aliases },
    create: skillFields,
  });

  // Wipe and recreate resources each run so re-seeding after editing
  // URLs above never leaves stale/duplicate rows behind.
  await prisma.learningResource.deleteMany({ where: { skillId: skill.id } });
  await prisma.learningResource.createMany({
    data: resources.map((r) => ({ ...r, skillId: skill.id })),
  });

  console.log(`Seeded: ${skill.name} (${resources.length} resources)`);
}

async function main() {
  const CONCURRENCY_LIMIT = 10;
  const chunks = [];
  
  for (let i = 0; i < skills.length; i += CONCURRENCY_LIMIT) {
    chunks.push(skills.slice(i, i + CONCURRENCY_LIMIT));
  }

  console.log(`Starting seeding of ${skills.length} skills in chunks of ${CONCURRENCY_LIMIT}...`);
  for (const chunk of chunks) {
    await Promise.all(chunk.map((skill) => seedSkill(skill)));
  }
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  