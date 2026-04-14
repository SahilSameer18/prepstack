# PrepStack 🚀

PrepStack is a full-stack interview preparation platform for software engineering candidates. It combines AI-driven project ideation, resume guidance, DSA progress tracking, CS concept notes, and interview readiness tools into one modern web app.

---

## What PrepStack Solves

Candidates often prepare across many tools, notes, and practice sites. PrepStack centralizes the preparation journey so users can:

- generate recruiter-ready project ideas
- track curated coding sheet progress
- review essential CS fundamentals
- practice behavioral and aptitude skills
- save progress with secure authentication

This project also showcases modern full-stack architecture, AI integration, and product-focused UI design.

---

## Key Features

- **AI Project Ideation**: Generate structured project ideas using Google Gemini.
- **Resume Guidance**: Draft polished project and experience descriptions.
- **DSA Sheet Tracker**: Track progress for curated collections like Striver A2Z, NeetCode, Blind75, and LoveBabbar.
- **CS Notes Library**: Review notes for OS, DBMS, Computer Networks, OOPS, and more.
- **Behavioral & Aptitude Prep**: Practice interview questions and quizzes.
- **Secure Authentication**: Login/signup flow with JWT-based sessions and saved progress.
- **Seeded Demo Data**: Load sample data quickly for testing and demos.

---

## Tech Stack

**Frontend**
- React 19
- Vite
- Tailwind CSS 4
- Framer Motion
- React Router DOM 7
- Axios

**Backend**
- Node.js
- Express 5
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- cookie-parser, CORS
- Zod validation
- Google Gemini AI via `@google/genai`

---

## Architecture

PrepStack is structured as a two-tier app:

- `client/` — React + Vite frontend
- `server/` — Express + MongoDB backend

Important backend folders:
- `src/controllers/` — request handlers
- `src/models/` — Mongoose schemas
- `src/routes/` — API routes
- `src/services/` — AI integration and helper logic
- `src/middlewares/` — auth and error handling
- `src/seed/` — demo data scripts

Important frontend folders:
- `src/pages/` — page views for auth, notes, sheets, projects, roadmaps
- `src/components/` — reusable UI components
- `src/context/` — React context providers
- `src/hooks/` — custom hooks for auth, notes, projects, sheets
- `src/api/services/` — Axios API wrappers

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/SahilSameer18/prepstack.git
cd prepstack
```

### 2. Start the backend

```bash
cd server
npm install
```

Create a `.env` file in `server/` with:

```env
PORT=3000
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
GOOGLE_API_KEY=<your_google_gemini_api_key>
```

Start the backend:

```bash
npm run dev
```

### 3. Start the frontend

```bash
cd ../client
npm install
npm run dev
```

Open the local Vite URL shown in the terminal to use the app.

---

## Available Scripts

### Server
- `npm run dev` — start backend with nodemon
- `npm start` — run production server
- `npm run seed:notes` — seed note data
- `npm run seed:all` — seed full demo data

### Client
- `npm run dev` — start Vite development server
- `npm run build` — build production assets
- `npm run preview` — preview production build
- `npm run lint` — run ESLint checks

---

## Environment Variables

Required server environment variables:

- `PORT` — backend port
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `GOOGLE_API_KEY` — Google Gemini API key

---

## Demo Data

To populate the database with sample content:

```bash
cd server
npm run seed:all
```

---

## Notes for Reviewers

- Demonstrates modern frontend architecture, state management, and API-driven design.
- Backend includes authentication, validation, and seeded demo data.
- AI integration strengthens project ideation and resume support.

---

## License
Add a `LICENSE` file to clarify usage. `MIT` is recommended.



