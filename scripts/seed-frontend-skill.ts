/**
 * Seed Script: Create Frontend Development skill with 60+ MCQ questions
 *
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-frontend-skill.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const frontendQuestions = [
  // HTML Questions
  {
    question: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink Text Module Language", "Home Tool Markup Language"],
    correctAnswer: 0,
    explanation: "HTML stands for Hyper Text Markup Language."
  },
  {
    question: "Which HTML tag is used to define an internal style sheet?",
    options: ["<css>", "<style>", "<script>", "<link>"],
    correctAnswer: 1,
    explanation: "The <style> tag is used to define internal CSS styles."
  },
  {
    question: "Which HTML attribute is used to define inline styles?",
    options: ["class", "styles", "style", "font"],
    correctAnswer: 2,
    explanation: "The style attribute is used for inline CSS."
  },
  {
    question: "Which tag is used to create a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    correctAnswer: 1,
    explanation: "The <a> (anchor) tag creates hyperlinks."
  },
  {
    question: "What is the correct HTML for creating a checkbox?",
    options: ["<input type='check'>", "<input type='checkbox'>", "<checkbox>", "<check>"],
    correctAnswer: 1,
    explanation: "type='checkbox' creates a checkbox input."
  },
  {
    question: "Which HTML element defines the title of a document?",
    options: ["<meta>", "<head>", "<title>", "<header>"],
    correctAnswer: 2,
    explanation: "The <title> tag defines the document title shown in browser tabs."
  },
  {
    question: "What is the correct HTML for inserting an image?",
    options: ["<img href='image.gif'>", "<img src='image.gif'>", "<image src='image.gif'>", "<img>image.gif</img>"],
    correctAnswer: 1,
    explanation: "The src attribute specifies the image source."
  },
  {
    question: "Which HTML element is used to specify a footer for a document?",
    options: ["<bottom>", "<footer>", "<section>", "<foot>"],
    correctAnswer: 1,
    explanation: "The semantic <footer> tag defines a footer."
  },
  {
    question: "What is the purpose of the <meta> tag in HTML?",
    options: ["To create links", "To provide metadata about the document", "To style the page", "To add scripts"],
    correctAnswer: 1,
    explanation: "Meta tags provide metadata like character set, viewport, description."
  },
  {
    question: "Which attribute specifies an alternate text for an image?",
    options: ["title", "alt", "src", "description"],
    correctAnswer: 1,
    explanation: "The alt attribute provides alternative text for accessibility."
  },

  // CSS Questions
  {
    question: "What does CSS stand for?",
    options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
    correctAnswer: 1,
    explanation: "CSS stands for Cascading Style Sheets."
  },
  {
    question: "Which CSS property controls the text size?",
    options: ["font-style", "text-size", "font-size", "text-style"],
    correctAnswer: 2,
    explanation: "font-size controls the size of text."
  },
  {
    question: "How do you select an element with id 'demo'?",
    options: [".demo", "#demo", "demo", "*demo"],
    correctAnswer: 1,
    explanation: "The # symbol selects elements by ID."
  },
  {
    question: "How do you select elements with class name 'test'?",
    options: [".test", "#test", "test", "*test"],
    correctAnswer: 0,
    explanation: "The . (dot) selects elements by class name."
  },
  {
    question: "Which property is used to change the background color?",
    options: ["bgcolor", "color", "background-color", "bg-color"],
    correctAnswer: 2,
    explanation: "background-color sets the background color."
  },
  {
    question: "How do you make text bold in CSS?",
    options: ["font-weight: bold", "text-style: bold", "font: bold", "style: bold"],
    correctAnswer: 0,
    explanation: "font-weight: bold makes text bold."
  },
  {
    question: "Which CSS property controls the space between elements?",
    options: ["spacing", "margin", "padding", "border"],
    correctAnswer: 1,
    explanation: "margin controls space outside an element's border."
  },
  {
    question: "What is the default value of the position property?",
    options: ["relative", "fixed", "absolute", "static"],
    correctAnswer: 3,
    explanation: "Elements are positioned static by default."
  },
  {
    question: "Which property is used to create a flex container?",
    options: ["display: block", "display: flex", "flex: container", "position: flex"],
    correctAnswer: 1,
    explanation: "display: flex creates a flex container."
  },
  {
    question: "What is the CSS box model order from inside to outside?",
    options: ["content, margin, border, padding", "content, padding, border, margin", "margin, border, padding, content", "padding, content, border, margin"],
    correctAnswer: 1,
    explanation: "The order is: content → padding → border → margin."
  },

  // JavaScript Questions
  {
    question: "Which company developed JavaScript?",
    options: ["Microsoft", "Netscape", "Google", "Apple"],
    correctAnswer: 1,
    explanation: "JavaScript was developed by Brendan Eich at Netscape."
  },
  {
    question: "How do you declare a JavaScript variable?",
    options: ["variable x", "v x", "let x", "declare x"],
    correctAnswer: 2,
    explanation: "let, const, and var are used to declare variables."
  },
  {
    question: "Which operator is used for strict equality comparison?",
    options: ["==", "===", "=", "!="],
    correctAnswer: 1,
    explanation: "=== checks both value and type equality."
  },
  {
    question: "How do you write an IF statement in JavaScript?",
    options: ["if i = 5 then", "if (i == 5)", "if i == 5", "if i = 5"],
    correctAnswer: 1,
    explanation: "Correct syntax: if (condition) { }"
  },
  {
    question: "How do you create a function in JavaScript?",
    options: ["function = myFunc()", "function:myFunc()", "function myFunc()", "create myFunc()"],
    correctAnswer: 2,
    explanation: "Functions are declared with the function keyword."
  },
  {
    question: "What is the output of typeof []?",
    options: ["array", "object", "undefined", "null"],
    correctAnswer: 1,
    explanation: "Arrays in JavaScript are objects."
  },
  {
    question: "Which method adds an element to the end of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correctAnswer: 0,
    explanation: "push() adds elements to the end of an array."
  },
  {
    question: "What does JSON stand for?",
    options: ["JavaScript Object Notation", "Java Source Object Notation", "JavaScript Oriented Notation", "Java Standard Object Notation"],
    correctAnswer: 0,
    explanation: "JSON = JavaScript Object Notation."
  },
  {
    question: "Which method converts a JSON string to a JavaScript object?",
    options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.toObject()"],
    correctAnswer: 1,
    explanation: "JSON.parse() parses a JSON string into an object."
  },
  {
    question: "What is the purpose of the 'this' keyword?",
    options: ["Refers to the current function", "Refers to the object it belongs to", "Refers to the global object", "Creates a new object"],
    correctAnswer: 1,
    explanation: "'this' refers to the object the function is a method of."
  },

  // React Questions
  {
    question: "What is React?",
    options: ["A database", "A JavaScript library for building UIs", "A programming language", "A CSS framework"],
    correctAnswer: 1,
    explanation: "React is a JavaScript library for building user interfaces."
  },
  {
    question: "What is JSX?",
    options: ["A database query language", "JavaScript XML - syntax extension", "A styling language", "A testing framework"],
    correctAnswer: 1,
    explanation: "JSX allows writing HTML-like code in JavaScript."
  },
  {
    question: "Which hook is used to manage state in functional components?",
    options: ["useEffect", "useState", "useContext", "useReducer"],
    correctAnswer: 1,
    explanation: "useState is the primary hook for state management."
  },
  {
    question: "What is the virtual DOM?",
    options: ["A browser feature", "A lightweight copy of the real DOM", "A database", "A CSS framework"],
    correctAnswer: 1,
    explanation: "Virtual DOM is a JavaScript representation of the actual DOM."
  },
  {
    question: "How do you pass data from parent to child component?",
    options: ["Using state", "Using props", "Using context only", "Using refs only"],
    correctAnswer: 1,
    explanation: "Props are used to pass data from parent to child."
  },
  {
    question: "What is the purpose of useEffect hook?",
    options: ["To manage state", "To handle side effects", "To create context", "To memoize values"],
    correctAnswer: 1,
    explanation: "useEffect handles side effects like API calls, subscriptions."
  },
  {
    question: "What is the key prop used for in React lists?",
    options: ["Styling elements", "Helping React identify changed items", "Sorting elements", "Filtering elements"],
    correctAnswer: 1,
    explanation: "Keys help React identify which items have changed."
  },
  {
    question: "What is a React fragment?",
    options: ["A broken component", "A way to group elements without extra DOM nodes", "A performance tool", "An error boundary"],
    correctAnswer: 1,
    explanation: "Fragments let you group children without adding extra nodes."
  },
  {
    question: "What does React.memo do?",
    options: ["Creates notes", "Memoizes a component to prevent unnecessary re-renders", "Stores data", "Creates documentation"],
    correctAnswer: 1,
    explanation: "React.memo is a higher-order component for memoization."
  },
  {
    question: "What is prop drilling?",
    options: ["A debugging technique", "Passing props through many component layers", "A performance optimization", "A testing method"],
    correctAnswer: 1,
    explanation: "Prop drilling is passing props through multiple levels."
  },

  // Web Concepts
  {
    question: "What does DOM stand for?",
    options: ["Document Object Model", "Data Object Method", "Digital Output Module", "Document Order Management"],
    correctAnswer: 0,
    explanation: "DOM = Document Object Model."
  },
  {
    question: "What is the purpose of localStorage?",
    options: ["Temporary session storage", "Persistent client-side storage", "Server-side database", "Cookie replacement only"],
    correctAnswer: 1,
    explanation: "localStorage provides persistent key-value storage."
  },
  {
    question: "What is CORS?",
    options: ["Cross-Origin Resource Sharing", "Client-Origin Request System", "Common Object Resource Standard", "Cross-Object Reference System"],
    correctAnswer: 0,
    explanation: "CORS is a security mechanism for cross-origin requests."
  },
  {
    question: "What HTTP method is used to retrieve data?",
    options: ["POST", "PUT", "GET", "DELETE"],
    correctAnswer: 2,
    explanation: "GET is used to retrieve/fetch data from a server."
  },
  {
    question: "What is a REST API?",
    options: ["A programming language", "An architectural style for APIs using HTTP methods", "A database", "A frontend framework"],
    correctAnswer: 1,
    explanation: "REST is an architectural style using HTTP methods."
  },
  {
    question: "What is responsive web design?",
    options: ["Fast loading websites", "Design that adapts to different screen sizes", "Interactive animations", "Dark mode support"],
    correctAnswer: 1,
    explanation: "Responsive design adapts layouts to different devices."
  },
  {
    question: "What is a media query in CSS?",
    options: ["A database query", "A technique to apply styles based on device characteristics", "A JavaScript function", "An image format"],
    correctAnswer: 1,
    explanation: "Media queries apply styles based on viewport size, etc."
  },
  {
    question: "What is the purpose of npm?",
    options: ["Node Package Manager - manages JavaScript packages", "A programming language", "A database", "A CSS framework"],
    correctAnswer: 0,
    explanation: "npm is used to manage project dependencies."
  },
  {
    question: "What is webpack?",
    options: ["A database", "A module bundler for JavaScript applications", "A CSS framework", "A testing tool"],
    correctAnswer: 1,
    explanation: "Webpack bundles JavaScript modules and assets."
  },
  {
    question: "What is the difference between == and === in JavaScript?",
    options: ["No difference", "=== checks type and value, == only value", "== checks type and value, === only value", "=== is faster"],
    correctAnswer: 1,
    explanation: "=== is strict equality (type + value), == is loose."
  },

  // More Advanced
  {
    question: "What is event bubbling?",
    options: ["Creating new events", "Events propagating from child to parent elements", "Removing events", "Styling events"],
    correctAnswer: 1,
    explanation: "Event bubbling is when events propagate up the DOM tree."
  },
  {
    question: "What is debouncing?",
    options: ["A CSS technique", "Limiting how often a function can fire", "A React hook", "A testing method"],
    correctAnswer: 1,
    explanation: "Debouncing delays function execution until after a pause."
  },
  {
    question: "What is the purpose of async/await?",
    options: ["To create loops", "To handle asynchronous operations cleanly", "To style components", "To create classes"],
    correctAnswer: 1,
    explanation: "async/await provides cleaner syntax for Promises."
  },
  {
    question: "What is a closure in JavaScript?",
    options: ["A way to close the browser", "A function with access to its outer scope", "A CSS property", "A type of loop"],
    correctAnswer: 1,
    explanation: "A closure is a function that remembers its outer variables."
  },
  {
    question: "What is the spread operator (...)?",
    options: ["A comparison operator", "Expands iterables into individual elements", "A logical operator", "A loop construct"],
    correctAnswer: 1,
    explanation: "The spread operator expands arrays/objects."
  },
  {
    question: "What is destructuring in JavaScript?",
    options: ["Deleting objects", "Extracting values from arrays/objects into variables", "Creating objects", "Styling elements"],
    correctAnswer: 1,
    explanation: "Destructuring extracts values into distinct variables."
  },
  {
    question: "What is a Promise in JavaScript?",
    options: ["A guarantee", "An object representing eventual completion of an async operation", "A loop", "A variable type"],
    correctAnswer: 1,
    explanation: "Promises represent the eventual result of async operations."
  },
  {
    question: "What is the purpose of the useCallback hook?",
    options: ["To call functions", "To memoize callback functions", "To create callbacks", "To handle errors"],
    correctAnswer: 1,
    explanation: "useCallback returns a memoized version of a callback."
  },
  {
    question: "What is CSS Grid?",
    options: ["A JavaScript library", "A two-dimensional layout system", "A database", "A testing framework"],
    correctAnswer: 1,
    explanation: "CSS Grid is a 2D layout system for rows and columns."
  },
  {
    question: "What is the difference between null and undefined?",
    options: ["No difference", "null is intentional absence, undefined is uninitialized", "undefined is intentional, null is uninitialized", "Both mean zero"],
    correctAnswer: 1,
    explanation: "null is intentionally empty; undefined means not assigned."
  }
];

async function seedFrontendSkill() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
    if (!mongoUri) {
      console.error('❌ No MongoDB URI found');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected');

    const { Skill } = await import('../src/models/skillModel');

    // Check if skill already exists
    const existing = await Skill.findOne({ key: 'frontend-development' });

    if (existing) {
      // Update with new questions
      existing.mcqQuestions = frontendQuestions;
      await existing.save();
      console.log(`✅ Updated "Frontend Development" skill with ${frontendQuestions.length} questions`);
    } else {
      // Create new skill
      await Skill.create({
        key: 'frontend-development',
        title: 'Frontend Development',
        description: 'Master HTML, CSS, JavaScript, and React fundamentals',
        mcqQuestions: frontendQuestions
      });
      console.log(`✅ Created "Frontend Development" skill with ${frontendQuestions.length} questions`);
    }

    console.log('🎉 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedFrontendSkill();
