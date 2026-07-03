/**
 * Seed script to create Web Development Roadmap
 * Run with: node scripts/seed-webdev-roadmap.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const roadmapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: String, required: true },
  phases: [{
    title: { type: String, required: true },
    tasks: [{
      title: { type: String, required: true },
      link: { type: String, required: true },
    }],
    assignments: [{
      title: { type: String, required: true },
      link: { type: String, required: true },
    }],
  }],
}, { timestamps: true });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

const webdevRoadmap = {
  title: "Web Development",
  description: "Go from HTML basics to deploying full-stack applications. Learn the modern web platform, React, backend APIs, databases, and the tooling professional web developers use every day.",
  createdBy: "SkillMine",
  phases: [
    {
      title: "Phase 1: HTML & CSS Fundamentals",
      tasks: [
        { title: "HTML Basics - Elements, Attributes, Structure", link: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML" },
        { title: "Semantic HTML & Accessibility Basics", link: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals" },
        { title: "CSS Basics - Selectors, Box Model", link: "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps" },
        { title: "CSS Flexbox", link: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
        { title: "CSS Grid", link: "https://css-tricks.com/snippets/css/complete-guide-grid/" },
        { title: "Responsive Design & Media Queries", link: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design" },
      ],
      assignments: [
        { title: "Build a Responsive Landing Page", link: "https://www.freecodecamp.org/learn/responsive-web-design/" },
      ],
    },
    {
      title: "Phase 2: JavaScript Fundamentals",
      tasks: [
        { title: "JavaScript Basics - Variables, Data Types", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
        { title: "Functions, Scope & Closures", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures" },
        { title: "Arrays & Objects", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections" },
        { title: "DOM Manipulation", link: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction" },
        { title: "Events & Event Delegation", link: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener" },
        { title: "ES6+ Features - Arrow Functions, Destructuring, Spread", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference" },
      ],
      assignments: [
        { title: "Build an Interactive To-Do List", link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/" },
      ],
    },
    {
      title: "Phase 3: Asynchronous JavaScript & APIs",
      tasks: [
        { title: "Callbacks, Promises & Async/Await", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Asynchronous" },
        { title: "Fetch API & Working with REST APIs", link: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" },
        { title: "JSON & Data Serialization", link: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON" },
        { title: "Error Handling in Async Code", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling" },
        { title: "Browser Storage - localStorage, sessionStorage, Cookies", link: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API" },
      ],
      assignments: [
        { title: "Practice: Consume a Public REST API", link: "https://github.com/public-apis/public-apis" },
      ],
    },
    {
      title: "Phase 4: Git & Developer Tooling",
      tasks: [
        { title: "Git Basics - init, commit, branch, merge", link: "https://git-scm.com/book/en/v2/Getting-Started-Git-Basics" },
        { title: "GitHub - Pull Requests & Collaboration", link: "https://docs.github.com/en/pull-requests" },
        { title: "npm & Package Management", link: "https://docs.npmjs.com/about-npm" },
        { title: "Browser DevTools - Debugging & Network Tab", link: "https://developer.chrome.com/docs/devtools/" },
        { title: "Code Formatting & Linting (Prettier, ESLint)", link: "https://eslint.org/docs/latest/use/getting-started" },
      ],
      assignments: [
        { title: "Practice: Resolve a Merge Conflict", link: "https://docs.github.com/en/pull-requests/collaborating-on-pull-requests-with-code-quality-features/addressing-merge-conflicts/resolving-a-merge-conflict-on-github" },
      ],
    },
    {
      title: "Phase 5: React Fundamentals",
      tasks: [
        { title: "React Basics - Components & JSX", link: "https://react.dev/learn" },
        { title: "Props & State", link: "https://react.dev/learn/passing-props-to-a-component" },
        { title: "Hooks - useState, useEffect", link: "https://react.dev/reference/react/hooks" },
        { title: "Conditional Rendering & Lists", link: "https://react.dev/learn/conditional-rendering" },
        { title: "Forms & Controlled Components", link: "https://react.dev/reference/react-dom/components/input" },
        { title: "Component Composition & Reusability", link: "https://react.dev/learn/passing-props-to-a-component" },
      ],
      assignments: [
        { title: "Build a React To-Do App", link: "https://react.dev/learn/tutorial-tic-tac-toe" },
      ],
    },
    {
      title: "Phase 6: Advanced React & State Management",
      tasks: [
        { title: "useContext & Context API", link: "https://react.dev/learn/passing-data-deeply-with-context" },
        { title: "useReducer for Complex State", link: "https://react.dev/reference/react/useReducer" },
        { title: "React Router - Client-side Routing", link: "https://reactrouter.com/en/main/start/tutorial" },
        { title: "Performance - useMemo & useCallback", link: "https://react.dev/reference/react/useMemo" },
        { title: "Custom Hooks", link: "https://react.dev/learn/reusing-logic-with-custom-hooks" },
      ],
      assignments: [
        { title: "Build a Multi-page React App with Routing", link: "https://reactrouter.com/en/main/start/tutorial" },
      ],
    },
    {
      title: "Phase 7: Backend Development with Node.js",
      tasks: [
        { title: "Node.js Basics & the Event Loop", link: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs" },
        { title: "Building REST APIs with Express", link: "https://expressjs.com/en/starter/basic-routing.html" },
        { title: "Middleware & Request/Response Lifecycle", link: "https://expressjs.com/en/guide/using-middleware.html" },
        { title: "Authentication - JWT & Sessions", link: "https://jwt.io/introduction" },
        { title: "Environment Variables & Config Management", link: "https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs" },
        { title: "API Design Best Practices (REST)", link: "https://restfulapi.net/" },
      ],
      assignments: [
        { title: "Build a REST API with Express", link: "https://expressjs.com/en/starter/hello-world.html" },
      ],
    },
    {
      title: "Phase 8: Databases",
      tasks: [
        { title: "SQL vs NoSQL - Choosing a Database", link: "https://www.mongodb.com/resources/basics/databases/nosql-explained/nosql-vs-sql" },
        { title: "MongoDB & Mongoose Basics", link: "https://mongoosejs.com/docs/guide.html" },
        { title: "Schema Design for Web Apps", link: "https://www.mongodb.com/docs/manual/data-modeling/" },
        { title: "CRUD Operations & Data Validation", link: "https://mongoosejs.com/docs/validation.html" },
        { title: "Relational Databases with PostgreSQL", link: "https://www.postgresql.org/docs/current/tutorial.html" },
      ],
      assignments: [
        { title: "Connect Your Express API to MongoDB", link: "https://mongoosejs.com/docs/index.html" },
      ],
    },
    {
      title: "Phase 9: Full-Stack Integration & Testing",
      tasks: [
        { title: "Connecting Frontend to Backend (CORS, Proxies)", link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS" },
        { title: "Unit Testing with Jest/Vitest", link: "https://vitest.dev/guide/" },
        { title: "End-to-End Testing with Cypress", link: "https://docs.cypress.io/app/get-started/why-cypress" },
        { title: "Web Performance & Optimization Basics", link: "https://web.dev/learn/performance" },
        { title: "Web Security Basics - XSS, CSRF, SQL Injection", link: "https://owasp.org/www-project-top-ten/" },
      ],
      assignments: [
        { title: "Write Tests for Your Full-Stack App", link: "https://docs.cypress.io/app/end-to-end-testing/writing-your-first-end-to-end-test" },
      ],
    },
    {
      title: "Phase 10: Deployment & Interview Preparation",
      tasks: [
        { title: "Deploying Frontend Apps (Vercel/Netlify)", link: "https://vercel.com/docs/deployments/overview" },
        { title: "Deploying Backend Services", link: "https://render.com/docs/deploy-node-express-app" },
        { title: "CI/CD Basics with GitHub Actions", link: "https://docs.github.com/en/actions/get-started/quickstart" },
        { title: "Web Development System Design Basics", link: "https://github.com/donnemartin/system-design-primer" },
        { title: "Top Web Development Interview Questions", link: "https://www.geeksforgeeks.org/web-development-interview-questions/" },
      ],
      assignments: [
        { title: "Deploy Your Full-Stack Project End-to-End", link: "https://vercel.com/docs/deployments/overview" },
      ],
    },
  ],
};

async function seedWebDevRoadmap() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL not found in environment variables. Make sure .env.local exists.');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const existing = await Roadmap.findOne({ title: webdevRoadmap.title });
    if (existing) {
      console.log('Web Development Roadmap already exists with ID:', existing._id);
      console.log('Updating existing roadmap...');
      await Roadmap.findByIdAndUpdate(existing._id, webdevRoadmap);
      console.log('Roadmap updated successfully!');
      console.log('\n========================================');
      console.log('ROADMAP ID:', existing._id);
      console.log('========================================\n');
    } else {
      const roadmap = new Roadmap(webdevRoadmap);
      await roadmap.save();
      console.log('Web Development Roadmap created successfully!');
      console.log('\n========================================');
      console.log('ROADMAP ID:', roadmap._id);
      console.log('========================================\n');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding Web Development roadmap:', error);
    process.exit(1);
  }
}

seedWebDevRoadmap();
