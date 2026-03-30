export const behavioralQuestions = [
  {
    id: 1,
    question: "Tell me about yourself.",
    category: "Personal",
    tip: "Use the Present-Past-Future model. Talk about what you're doing now, your relevant past experiences, and why you're excited about this specific role.",
    exampleAnswer: "I am a final year CS student at XYZ University. Currently, I'm focused on full-stack development and have built several projects using MERN. Last summer, I interned at ABC Tech where I optimized their database queries. I'm now looking to apply my skills in a fast-paced environment like yours."
  },
  {
    id: 2,
    question: "What is your greatest strength?",
    category: "Personal",
    tip: "Pick a strength that is highly relevant to the job. Provide a specific example of how you've demonstrated this strength.",
    exampleAnswer: "My greatest strength is my ability to learn quickly. For example, during my last hackathon, our team decided to use GraphQL, which I hadn't used before. Within 4 hours, I was able to set up the basic schema and integrate it with our frontend."
  },
  {
    id: 3,
    question: "What is your greatest weakness?",
    category: "Personal",
    tip: "Choose a real but fixable weakness. Explain how you are actively working to improve it. Avoid cliches like 'I'm a perfectionist'.",
    exampleAnswer: "I sometimes find it difficult to delegate tasks because I want to ensure everything is done perfectly. However, I've realized this can slow down the team. Lately, I've been using Trello to track project progress and learning to trust my teammates' expertise."
  },
  {
    id: 4,
    question: "Describe a time you dealt with a conflict in a team.",
    category: "Teamwork",
    tip: "Focus on the resolution, not the conflict itself. Show your communication skills and ability to remain professional.",
    exampleAnswer: "In a group project, a teammate and I disagreed on which API to use. Instead of arguing, I suggested we list the pros and cons of both. We found that while my choice was faster to implement, theirs was more scalable. We went with theirs, and I helped with the integration."
  },
  {
    id: 5,
    question: "Tell me about a time you failed.",
    category: "Problem Solving",
    tip: "Show that you are self-aware and can learn from mistakes. Pick a failure that happened a while ago and show the growth that followed.",
    exampleAnswer: "In my first year, I underestimated the complexity of a compiler design project and missed the deadline. It was a wake-up call. Since then, I've adopted a strict project management approach, breaking tasks into smaller milestones and setting early deadlines for myself."
  },
  {
    id: 6,
    question: "Why should we hire you?",
    category: "Personal",
    tip: "Summarize your strengths and how they align with the company's needs. Show passion for the company's mission.",
    exampleAnswer: "You should hire me because I have the technical skills in React and Node.js that you're looking for, but also a strong foundation in problem-solving. I've followed your company's growth in the AI space and am eager to contribute to your upcoming projects."
  },
  {
    id: 7,
    question: "Where do you see yourself in five years?",
    category: "Personal",
    tip: "Show ambition but keep it realistic. Align your personal goals with the potential growth opportunities within the company.",
    exampleAnswer: "In five years, I hope to have mastered full-stack development and be in a position where I can lead technical projects. I want to contribute significantly to the company's success and perhaps mentor junior developers."
  },
  {
    id: 8,
    question: "Tell me about a technical challenge you faced.",
    category: "Problem Solving",
    tip: "Use the STAR method (Situation, Task, Action, Result). Focus on your thought process and how you arrived at the solution.",
    exampleAnswer: "While building a real-time chat app, I faced high latency issues. I realized the server was being overwhelmed by requests. I implemented WebSockets and added a caching layer using Redis, which reduced latency by 60%."
  },
  {
    id: 9,
    question: "How do you handle high-pressure situations?",
    category: "Personal",
    tip: "Explain your process for staying calm and organized. Mention tools or techniques like prioritization, deep breathing, or breaking tasks down.",
    exampleAnswer: "When under pressure, I start by breaking the problem into smallest possible tasks. During a production bug fix last month, I kept a calm checklist of steps. This helped me stay focused and resolve the issue in under 30 minutes without panic."
  },
  {
    id: 10,
    question: "Tell me about a time you had to learn a new technology quickly.",
    category: "Problem Solving",
    tip: "Mention the technology, why you needed to learn it, and your learning strategy (docs, tutorials, pair programming).",
    exampleAnswer: "For a project last semester, I had to use Docker. I spent the first two days strictly following official docs and building small test containers. By the third day, I had our entire microservices architecture containerized and running."
  },
  {
    id: 11,
    question: "What motivates you to work?",
    category: "Personal",
    tip: "Focus on both internal motivators (problem-solving, creativity) and external ones (making an impact, team success).",
    exampleAnswer: "I'm deeply motivated by the challenge of solving complex problems and seeing my code actually make life easier for users. There's a great sense of satisfaction in shipping a clean, bug-free feature that people find useful."
  },
  {
    id: 12,
    question: "How do you prioritize your tasks with multiple deadlines?",
    category: "Personal",
    tip: "Mention the Eisenhower Matrix or similar prioritization techniques. Talk about communication with stakeholders.",
    exampleAnswer: "I use a combination of Trello for tracking and the 'Urgent vs Important' matrix. If I see a conflict, I immediately communicate with my lead to clarify priorities rather than trying to do everything and burning out."
  },
  {
    id: 13,
    question: "Describe a time you went above and beyond for a project.",
    category: "Teamwork",
    tip: "Show initiative. Talk about doing something that wasn't strictly in your job description but helped the team.",
    exampleAnswer: "While working on a frontend task, I noticed our API responses were slow. Even though I wasn't assigned to backend, I stayed late to investigate and found a missing index in the database, which ended up speeding up the whole app."
  },
  {
    id: 14,
    question: "What would you do if you disagreed with your manager's decision?",
    category: "Teamwork",
    tip: "Emphasize professional communication, data-driven arguments, and ultimately supporting the final decision ('Disagree and Commit').",
    exampleAnswer: "I would request a brief meeting to present my perspective with data or examples. If they still decide to go their way, I would respect the decision and give it my 100% effort to make it succeed, as the team's goal is what matters most."
  },
  {
    id: 15,
    question: "Tell me about a time you showed leadership.",
    category: "Leadership",
    tip: "Leadership isn't just a title. It's about taking initiative, mentoring others, or taking responsibility.",
    exampleAnswer: "During a group project where the leader was absent, I stepped in to redistribute tasks and set up a daily sync. We were falling behind, but my intervention helped us finish two days ahead of schedule."
  },
  {
    id: 16,
    question: "How do you handle feedback or criticism?",
    category: "Personal",
    tip: "Show growth mindset. View feedback as a tool for improvement rather than a personal attack.",
    exampleAnswer: "I appreciate honest feedback. In my last internship, my mentor pointed out that my variable naming was inconsistent. Instead of being defensive, I asked for their best practices and have since implemented a strict linting process in all my projects."
  },
  {
    id: 17,
    question: "Describe your ideal work environment.",
    category: "Personal",
    tip: "Align it with the company culture you're interviewing for. Usually, mentioning collaboration, growth, and transparency is good.",
    exampleAnswer: "My ideal environment is one that encourages open communication and collaborative problem-solving. I thrive in places where I can learn from experienced mentors while also having the autonomy to take ownership of my tasks."
  },
  {
    id: 18,
    question: "What do you do when you're stuck on a technical problem?",
    category: "Problem Solving",
    tip: "Explain your debugging process: Rubber ducking, checking docs, StackOverflow, and eventually asking for help.",
    exampleAnswer: "I first try to isolate the issue. If I'm still stuck after 30 minutes of searching, I try 'Rubber Ducking'—explaining the code out loud. If that fails, I prepare a clear summary of what I've tried and ask a teammate for a quick 5-minute review."
  },
  {
    id: 19,
    question: "Tell me about a time you explained something complex to a non-technical person.",
    category: "Teamwork",
    tip: "Use analogies and avoid jargon. Show that you can communicate effectively with different stakeholders.",
    exampleAnswer: "I once had to explain 'cloud hosting' to a client. I compared it to a utility service like electricity—you don't need your own generator (server); you just plug into a giant network and pay for what you use. They understood it immediately."
  },
  {
    id: 20,
    question: "Where do you think the future of software engineering is headed?",
    category: "Personal",
    tip: "Show that you follow industry trends (AI, Serverless, Edge Computing, etc.) and have an opinion on them.",
    exampleAnswer: "I believe we're moving towards a more AI-augmented development cycle where tools like Copilot handle boilerplate, allowing engineers to focus more on high-level architecture and solving actual business problems."
  },
  {
    id: 21,
    question: "What's the most interesting project you've ever worked on?",
    category: "Personal",
    tip: "Talk about a project that shows your passion and your technical range. Explain why it was interesting (challenge, impact, tech stack).",
    exampleAnswer: "The most interesting was an AI-powered study planner I built. It used a custom algorithm to schedule tasks based on difficulty. Seeing it actually help my classmates manage their finals was incredibly rewarding."
  },
  {
    id: 22,
    question: "How do you stay updated with the latest trends in technology?",
    category: "Personal",
    tip: "Mention specific resources: newsletters, podcasts, Tech Twitter, or specific blogs like dev.to or Hashnode.",
    exampleAnswer: "I regularly read the 'Daily Dev' feed and follow several engineers on Twitter. I also enjoy listening to podcasts like 'Syntax.fm' during my commute to stay aware of new frameworks and web standards."
  }
];