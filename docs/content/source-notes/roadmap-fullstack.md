# Roadmap source notes: Full Stack MERN (11 Nov 2026)

Facts are restated in our own words. All pages below loaded (HTTP 200) on 11 Nov 2026 and `npm run check:links` showed no broken link for this roadmap. Where a fetch tool gave only a summary of a long page, the claim is marked in `SOURCES.md` as "summary". Time ranges, goals and checkpoints are our estimates and opinions, not facts from the pages.
Status: read by us; two AI reviewers (not an outside reader) read the steps against this file. Written for a non-technical reader (owner rule, 11 Nov 2026).

## Steps (topics follow the headings and sections of the pages listed under each step)

### frontend-development: Frontend Development
- Pages used: Quick Start – React docs <https://react.dev/learn>; Getting Started – Vite <https://vite.dev/guide/>; Full Stack Open <https://fullstackopen.com/en/>
- In-app practice: cn:cn-http-https-tls
- Time 55 to 85 hours: our estimate
- Project: MERN Stack

### backend-api: Backend API
- Pages used: Routing – Express docs <https://expressjs.com/en/guide/routing.html>; Using middleware – Express docs <https://expressjs.com/en/guide/using-middleware.html>; Error handling – Express docs <https://expressjs.com/en/guide/error-handling.html>
- In-app practice: cn:cn-http-https-tls
- Time 25 to 35 hours: our estimate
- Project: MERN Stack

### database-layer: Database Layer
- Pages used: Data modeling – MongoDB manual <https://www.mongodb.com/docs/manual/data-modeling/>; Schemas – Mongoose docs <https://mongoosejs.com/docs/guide.html>; Aggregation – MongoDB manual <https://www.mongodb.com/docs/manual/aggregation/>
- In-app practice: dbms:dbms-sql, dbms:dbms-indexing-file-organization
- Time 25 to 35 hours: our estimate
- Project: MERN Stack

### full-stack-authentication: Full Stack Authentication
- Pages used: Session Management Cheat Sheet – OWASP <https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html>; Using HTTP cookies – MDN <https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies>; Using OAuth 2.0 to access Google APIs – Google <https://developers.google.com/identity/protocols/oauth2>
- In-app practice: cn:cn-http-https-tls
- Time 25 to 35 hours: our estimate
- Project: MERN Stack

### state-management: State Management
- Pages used: Getting Started with Redux Toolkit – Redux <https://redux.js.org/toolkit/introduction/getting-started>; Zustand – GitHub <https://github.com/pmndrs/zustand>; Scaling Up with Reducer and Context – React docs <https://react.dev/learn/scaling-up-with-reducer-and-context>
- Time 15 to 25 hours: our estimate
- Project: MERN Stack

### file-storage-media: File Storage & Media
- Pages used: <input type="file"> – MDN <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file>; What is Amazon S3? – AWS docs <https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html>; Upload – Cloudinary docs <https://cloudinary.com/documentation/upload_images>
- Time 10 to 20 hours: our estimate
- Project: MERN Stack

### testing-debugging: Testing & Debugging
- Pages used: React Testing Library – Testing Library docs <https://testing-library.com/docs/react-testing-library/intro/>; Getting Started – Vitest <https://vitest.dev/guide/>; Get started in Postman – Postman docs <https://learning.postman.com/docs/getting-started/overview/>
- In-app practice: cn:cn-http-https-tls
- Time 15 to 25 hours: our estimate
- Project: MERN Stack

### deployment-scaling: Deployment & Scaling
- Pages used: Your First Render Deploy – Render docs <https://render.com/docs/your-first-deploy>; Vercel Documentation <https://vercel.com/docs>; What is Amazon EC2? – AWS docs <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html>
- In-app practice: cn:cn-system-design-concepts
- Time 20 to 30 hours: our estimate
- Project: MERN Stack

### security-performance: Security & Performance
- Pages used: OWASP Top 10 <https://owasp.org/www-project-top-ten/>; HTTP caching – MDN <https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching>; Web Vitals – web.dev <https://web.dev/articles/vitals>
- In-app practice: cn:cn-devices-routing-security, cn:cn-system-design-concepts
- Time 20 to 30 hours: our estimate
- Project: MERN Stack

## Not read, unverified, or removed
- Fullstack Open: the last part of the page was not read; part names after Part 2 come from a fetch summary. Licence CC BY-NC-SA 3.0.
- OWASP Top 10 index page does not list the ten items (the 2025 list page was not fetched), so the step says "the most common web security risks" without naming items. MDN cookies, caching and input-file pages: article bodies read, tails by summary.
- Removed: jwt.io, YouTube videos, Cloudinary/AWS S3 landing pages other than the ones linked, RisingStack checklist, AWS EC2 getting-started page, Heroku. Redux Toolkit docs moved to redux.js.org (old URL redirects).
- Load balancing and rate limiting are covered by our own CN notes and the backend roadmap sources, not by new pages here.

## Terms of use
MDN: Creative Commons. Wikipedia: CC BY-SA 4.0. OWASP: CC BY-SA 4.0. Python docs: PSF licence. scikit-learn: BSD. FastAPI: MIT. Other sites: copyright notices with no open licence; we restate and link, we do not copy.
