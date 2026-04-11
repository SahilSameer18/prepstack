# PrepStack 🚀

PrepStack is a FAANG-ready interview preparation platform built for software engineering job seekers. It unifies AI-powered project ideation, resume building, candidate progress tracking, core computer science notes, and interview readiness workflows in one production-quality web app.

---

## Why PrepStack?

Many candidates prepare in scattered tools: note apps, coding practice sites, and slide decks for resumes. PrepStack connects the entire journey:

- build project ideas recruiters love,
- track DSA progress across popular sheet collections,
- store CS concept notes,
- generate polished resume content,
- and practice behavioral and aptitude questions.

This makes PrepStack a strong showcase for end-to-end product development, from full-stack architecture to AI service integration.

---

## ✨ Core Product Features

- **AI Project Idea Generator**: Create tailored, interview-ready project concepts using Google Gemini AI.
- **Resume Builder Tips**: Draft clean, ATS-friendly resumes with structured sections.
- **DSA Sheet Tracker**: Manage progress across curated sheets like Striver, NeetCode and Blind75.
- **CS Concepts Library**: Access notes for OS, DBMS, Computer Networks, OOPS, and more.
- **Behavioral Prep**: Review high-impact interview questions and model answers for system design and culture-fit rounds.
- **Quiz Engine**: Assess readiness with aptitude and technical quizzes.
- **Persistent User Sessions**: Secure login, progress saving, and stateful user history.

---

## 🧱 Architecture Overview

PrepStack is organized as a clean two-tier full-stack application:

- `client/`: React + Vite frontend
- `server/`: Express + MongoDB backend

```text
client/  -> React 19 + Vite + Tailwind + Context API
server/  -> Node.js + Express + MongoDB + Mongoose + JWT auth
AI       -> Google Gemini via @google/genai
```

---

## 🛠️ Tech Stack

**Frontend**
- React 19
- Vite
- Tailwind CSS 4
- Framer Motion
- React Router 7
- Axios

**Backend**
- Node.js
- Express 5
- MongoDB + Mongoose
- JWT authentication
- cookie-parser + CORS
- Zod validation
- Google Gemini AI (`@google/genai`)

---

## 📁 Project Structure

- `client/`
  - `src/`: app components, pages, hooks, context, services
  - `src/pages/`: Auth, Home, Notes, Sheets, Projects, Roadmaps
- `server/`
  - `src/controllers/`: request handlers
  - `src/models/`: MongoDB schemas
  - `src/routes/`: API endpoints
  - `src/services/ai.service.js`: Gemini AI integration
  - `src/middlewares/`: auth and error middleware
  - `src/seed/`: seed scripts and sample data

---

## 🚀 Local Setup

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

Create `server/.env` with:

```env
PORT=3000
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
GOOGLE_API_KEY=<your_google_gemini_api_key>
```

Run the server:

```bash
npm run dev
```

### 3. Start the frontend

```bash
cd ../client
npm install
npm run dev
```

Open the local Vite URL shown in the terminal and use the app.

---

## 🔧 Environment Variables

Required server environment variables:

- `PORT` – server port (e.g. `3000`)
- `MONGO_URI` – MongoDB connection string
- `JWT_SECRET` – secret key for JWT authentication
- `GOOGLE_API_KEY` – Google Gemini API key

---


## 🧪 Seed Data

To populate the database with sample content:

```bash
cd server
npm run seed:all
```
---

## 📜 License
Add a `LICENSE` file to clarify usage. Recommended: MIT.

