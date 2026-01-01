/**
 * Seed Script: Add sample MCQ questions to roadmap certification tests
 *
 * Usage: npx ts-node scripts/seed-test-questions.ts
 *
 * This script adds 100+ sample questions for common roadmap topics.
 * Questions are appended (duplicates are automatically skipped).
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Sample questions for different roadmap topics
const sampleQuestions: Record<string, Array<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}>> = {
  // Web Development / Full Stack questions
  "web": [
    {
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink Text Module Language", "Home Tool Markup Language"],
      correctAnswer: 0,
      explanation: "HTML stands for Hyper Text Markup Language, the standard markup language for creating web pages."
    },
    {
      question: "Which CSS property is used to change the text color?",
      options: ["font-color", "text-color", "color", "foreground-color"],
      correctAnswer: 2,
      explanation: "The 'color' property is used to set the color of text in CSS."
    },
    {
      question: "What is the correct way to declare a JavaScript variable?",
      options: ["variable x = 5;", "let x = 5;", "v x = 5;", "declare x = 5;"],
      correctAnswer: 1,
      explanation: "In JavaScript, 'let' is used to declare variables with block scope."
    },
    {
      question: "Which HTTP method is used to submit form data?",
      options: ["GET", "PUT", "POST", "SUBMIT"],
      correctAnswer: 2,
      explanation: "POST is commonly used to submit form data to a server."
    },
    {
      question: "What does CSS stand for?",
      options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
      correctAnswer: 1,
      explanation: "CSS stands for Cascading Style Sheets."
    },
    {
      question: "Which tag is used to create a hyperlink in HTML?",
      options: ["<link>", "<a>", "<href>", "<url>"],
      correctAnswer: 1,
      explanation: "The <a> (anchor) tag is used to create hyperlinks in HTML."
    },
    {
      question: "What is the purpose of the 'use strict' directive in JavaScript?",
      options: ["Makes code run faster", "Enables strict mode for catching errors", "Disables all warnings", "Compiles to TypeScript"],
      correctAnswer: 1,
      explanation: "'use strict' enables strict mode which helps catch common coding mistakes and unsafe actions."
    },
    {
      question: "Which CSS property controls the space between elements?",
      options: ["spacing", "margin", "padding", "gap"],
      correctAnswer: 1,
      explanation: "The 'margin' property controls the space outside an element's border."
    },
    {
      question: "What is the DOM in web development?",
      options: ["Document Object Model", "Data Object Method", "Digital Output Module", "Document Order Management"],
      correctAnswer: 0,
      explanation: "DOM stands for Document Object Model, a programming interface for HTML documents."
    },
    {
      question: "Which method is used to select an element by ID in JavaScript?",
      options: ["getElement()", "selectById()", "getElementById()", "findElement()"],
      correctAnswer: 2,
      explanation: "document.getElementById() is used to select an element by its ID attribute."
    },
    {
      question: "What is the default display value of a <div> element?",
      options: ["inline", "block", "inline-block", "flex"],
      correctAnswer: 1,
      explanation: "The <div> element has a default display value of 'block'."
    },
    {
      question: "Which HTTP status code indicates a successful response?",
      options: ["404", "500", "200", "301"],
      correctAnswer: 2,
      explanation: "HTTP 200 OK indicates that the request has succeeded."
    },
    {
      question: "What is localStorage in web browsers?",
      options: ["Temporary memory", "Persistent client-side storage", "Server-side database", "Cookie replacement"],
      correctAnswer: 1,
      explanation: "localStorage provides persistent key-value storage in the browser that persists even after closing."
    },
    {
      question: "Which CSS property is used to make a flex container?",
      options: ["display: grid", "display: flex", "flex: container", "position: flex"],
      correctAnswer: 1,
      explanation: "display: flex makes an element a flex container."
    },
    {
      question: "What does API stand for?",
      options: ["Application Programming Interface", "Advanced Protocol Integration", "Automated Program Instruction", "Application Process Integration"],
      correctAnswer: 0,
      explanation: "API stands for Application Programming Interface."
    },
    {
      question: "Which method converts a JSON string to a JavaScript object?",
      options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.toObject()"],
      correctAnswer: 1,
      explanation: "JSON.parse() converts a JSON string to a JavaScript object."
    },
    {
      question: "What is the purpose of the async/await keywords in JavaScript?",
      options: ["To make code run faster", "To handle asynchronous operations", "To create threads", "To compile TypeScript"],
      correctAnswer: 1,
      explanation: "async/await provides a cleaner way to work with Promises and asynchronous code."
    },
    {
      question: "Which CSS unit is relative to the root element's font size?",
      options: ["em", "rem", "px", "%"],
      correctAnswer: 1,
      explanation: "rem (root em) is relative to the root element's (html) font size."
    },
    {
      question: "What is CORS in web development?",
      options: ["Cross-Origin Resource Sharing", "Client-Origin Request System", "Common Object Resource Standard", "Cross-Object Reference System"],
      correctAnswer: 0,
      explanation: "CORS is a security mechanism that allows or restricts resources on a web page from another domain."
    },
    {
      question: "Which event occurs when a user clicks on an HTML element?",
      options: ["onchange", "onmouseclick", "onclick", "onpress"],
      correctAnswer: 2,
      explanation: "The onclick event occurs when a user clicks on an element."
    }
  ],
  // React questions
  "react": [
    {
      question: "What is JSX in React?",
      options: ["A JavaScript library", "JavaScript XML syntax extension", "A CSS framework", "A testing tool"],
      correctAnswer: 1,
      explanation: "JSX is a syntax extension that allows writing HTML-like code in JavaScript."
    },
    {
      question: "Which hook is used to manage state in functional components?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correctAnswer: 1,
      explanation: "useState is the primary hook for managing state in functional components."
    },
    {
      question: "What is the virtual DOM in React?",
      options: ["A browser feature", "A lightweight copy of the actual DOM", "A database", "A testing environment"],
      correctAnswer: 1,
      explanation: "The virtual DOM is a lightweight JavaScript representation of the actual DOM."
    },
    {
      question: "Which lifecycle method is called after a component renders?",
      options: ["componentWillMount", "componentDidMount", "componentWillUpdate", "componentDidUpdate"],
      correctAnswer: 1,
      explanation: "componentDidMount is called immediately after a component is mounted."
    },
    {
      question: "What is the purpose of useEffect hook?",
      options: ["To manage state", "To handle side effects", "To create context", "To optimize rendering"],
      correctAnswer: 1,
      explanation: "useEffect is used to handle side effects like data fetching, subscriptions, or DOM manipulation."
    },
    {
      question: "How do you pass data from parent to child component?",
      options: ["Using state", "Using props", "Using context", "Using refs"],
      correctAnswer: 1,
      explanation: "Props are used to pass data from parent to child components."
    },
    {
      question: "What is the key prop used for in React lists?",
      options: ["Styling elements", "Helping React identify changed items", "Creating unique IDs", "Sorting elements"],
      correctAnswer: 1,
      explanation: "Keys help React identify which items have changed, been added, or removed."
    },
    {
      question: "Which hook provides access to the context value?",
      options: ["useState", "useEffect", "useContext", "useMemo"],
      correctAnswer: 2,
      explanation: "useContext is used to consume values from a React context."
    },
    {
      question: "What does React.memo do?",
      options: ["Creates a memo", "Memoizes a component to prevent unnecessary re-renders", "Stores data in memory", "Creates documentation"],
      correctAnswer: 1,
      explanation: "React.memo is a higher-order component that memoizes functional components."
    },
    {
      question: "What is the correct way to update state in React?",
      options: ["state.value = newValue", "setState(newValue)", "this.state = newValue", "updateState(newValue)"],
      correctAnswer: 1,
      explanation: "State should be updated using the setter function from useState or this.setState()."
    },
    {
      question: "What is a React fragment?",
      options: ["A broken component", "A way to group elements without adding extra DOM nodes", "A performance tool", "A debugging feature"],
      correctAnswer: 1,
      explanation: "Fragments let you group children without adding extra nodes to the DOM."
    },
    {
      question: "Which hook should you use for expensive calculations?",
      options: ["useState", "useEffect", "useMemo", "useCallback"],
      correctAnswer: 2,
      explanation: "useMemo memoizes expensive calculations to avoid recalculating on every render."
    },
    {
      question: "What is prop drilling in React?",
      options: ["A debugging technique", "Passing props through many component layers", "A performance optimization", "A testing method"],
      correctAnswer: 1,
      explanation: "Prop drilling is passing props through multiple levels of components."
    },
    {
      question: "What is the purpose of useRef hook?",
      options: ["To create references to DOM elements or persist values", "To manage state", "To handle side effects", "To create context"],
      correctAnswer: 0,
      explanation: "useRef returns a mutable ref object that persists across renders."
    },
    {
      question: "How do you conditionally render elements in React?",
      options: ["Using if statements in JSX", "Using ternary operators or &&", "Using switch statements", "Using for loops"],
      correctAnswer: 1,
      explanation: "Ternary operators and && are commonly used for conditional rendering in JSX."
    },
    {
      question: "What is a controlled component in React?",
      options: ["A component with many props", "A form element whose value is controlled by React state", "A component with no state", "A memoized component"],
      correctAnswer: 1,
      explanation: "A controlled component has its form data controlled by React state."
    },
    {
      question: "What does useCallback hook do?",
      options: ["Calls a function", "Memoizes a callback function", "Creates a callback", "Handles events"],
      correctAnswer: 1,
      explanation: "useCallback returns a memoized version of a callback function."
    },
    {
      question: "What is React Router used for?",
      options: ["State management", "Client-side routing", "Data fetching", "Testing"],
      correctAnswer: 1,
      explanation: "React Router is used for client-side routing in React applications."
    },
    {
      question: "What is the purpose of the children prop?",
      options: ["To define child components", "To pass content between component tags", "To create nested routes", "To manage child state"],
      correctAnswer: 1,
      explanation: "The children prop contains elements passed between component's opening and closing tags."
    },
    {
      question: "How do you handle forms in React?",
      options: ["Using document.forms", "Using controlled or uncontrolled components", "Using jQuery", "Using form libraries only"],
      correctAnswer: 1,
      explanation: "React forms can be handled using controlled components (state-driven) or uncontrolled components (refs)."
    }
  ],
  // Node.js / Backend questions
  "node": [
    {
      question: "What is Node.js?",
      options: ["A web browser", "A JavaScript runtime built on Chrome's V8 engine", "A database", "A CSS framework"],
      correctAnswer: 1,
      explanation: "Node.js is a JavaScript runtime that allows running JavaScript on the server."
    },
    {
      question: "Which module is used to create a web server in Node.js?",
      options: ["fs", "path", "http", "url"],
      correctAnswer: 2,
      explanation: "The http module is used to create HTTP servers and clients."
    },
    {
      question: "What is npm?",
      options: ["Node Package Manager", "New Programming Module", "Network Protocol Manager", "Node Process Monitor"],
      correctAnswer: 0,
      explanation: "npm stands for Node Package Manager, used to manage project dependencies."
    },
    {
      question: "What is Express.js?",
      options: ["A database", "A web application framework for Node.js", "A testing tool", "A frontend library"],
      correctAnswer: 1,
      explanation: "Express.js is a minimal and flexible Node.js web application framework."
    },
    {
      question: "What is middleware in Express?",
      options: ["Database connection", "Functions that have access to request and response objects", "Frontend components", "CSS styles"],
      correctAnswer: 1,
      explanation: "Middleware functions can access and modify request/response objects and call the next middleware."
    },
    {
      question: "What does the 'require' function do in Node.js?",
      options: ["Creates a new file", "Imports a module", "Defines a function", "Exports a module"],
      correctAnswer: 1,
      explanation: "require() is used to import modules in Node.js (CommonJS syntax)."
    },
    {
      question: "What is the purpose of package.json?",
      options: ["To store passwords", "To define project metadata and dependencies", "To compile code", "To create databases"],
      correctAnswer: 1,
      explanation: "package.json contains project metadata, scripts, and dependency information."
    },
    {
      question: "Which method is used to read a file asynchronously in Node.js?",
      options: ["fs.readFile()", "fs.readFileSync()", "file.read()", "read.file()"],
      correctAnswer: 0,
      explanation: "fs.readFile() reads a file asynchronously without blocking."
    },
    {
      question: "What is the event loop in Node.js?",
      options: ["A for loop", "A mechanism that handles asynchronous operations", "A debugging tool", "A package manager"],
      correctAnswer: 1,
      explanation: "The event loop allows Node.js to perform non-blocking I/O operations."
    },
    {
      question: "What is REST API?",
      options: ["A programming language", "An architectural style for designing networked applications", "A database", "A testing framework"],
      correctAnswer: 1,
      explanation: "REST is an architectural style that uses HTTP methods for API design."
    },
    {
      question: "What is MongoDB?",
      options: ["A SQL database", "A NoSQL document database", "A web server", "A JavaScript framework"],
      correctAnswer: 1,
      explanation: "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents."
    },
    {
      question: "What is JWT?",
      options: ["JavaScript Web Tool", "JSON Web Token", "Java Web Technology", "JavaScript Work Thread"],
      correctAnswer: 1,
      explanation: "JWT (JSON Web Token) is a compact way to securely transmit information."
    },
    {
      question: "What is the purpose of environment variables?",
      options: ["To style the application", "To store configuration and secrets", "To compile code", "To create tests"],
      correctAnswer: 1,
      explanation: "Environment variables store configuration values and sensitive data like API keys."
    },
    {
      question: "What is CRUD?",
      options: ["A database type", "Create, Read, Update, Delete operations", "A testing method", "A security protocol"],
      correctAnswer: 1,
      explanation: "CRUD stands for the four basic database operations: Create, Read, Update, Delete."
    },
    {
      question: "What is bcrypt used for?",
      options: ["Encrypting files", "Hashing passwords", "Compressing data", "Validating emails"],
      correctAnswer: 1,
      explanation: "bcrypt is a password hashing function designed to be slow and secure."
    },
    {
      question: "What does 'async' keyword do in JavaScript?",
      options: ["Makes a function synchronous", "Makes a function return a Promise", "Creates a new thread", "Stops execution"],
      correctAnswer: 1,
      explanation: "async makes a function return a Promise and allows using await inside it."
    },
    {
      question: "What is the purpose of try-catch in JavaScript?",
      options: ["To create loops", "To handle errors gracefully", "To define variables", "To import modules"],
      correctAnswer: 1,
      explanation: "try-catch is used for error handling to catch and handle exceptions."
    },
    {
      question: "What is a callback function?",
      options: ["A function that calls itself", "A function passed as an argument to another function", "A return statement", "An error handler"],
      correctAnswer: 1,
      explanation: "A callback is a function passed to another function to be called later."
    },
    {
      question: "What is process.env in Node.js?",
      options: ["A method to end processes", "An object containing environment variables", "A debugging tool", "A file system module"],
      correctAnswer: 1,
      explanation: "process.env is an object that contains the user environment."
    },
    {
      question: "What is the difference between SQL and NoSQL databases?",
      options: ["No difference", "SQL uses tables, NoSQL uses documents/key-value pairs", "NoSQL is faster", "SQL is newer"],
      correctAnswer: 1,
      explanation: "SQL databases use structured tables while NoSQL databases use flexible document structures."
    }
  ],
  // Data Structures & Algorithms
  "dsa": [
    {
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: 1,
      explanation: "Binary search has O(log n) time complexity as it halves the search space each iteration."
    },
    {
      question: "Which data structure uses LIFO (Last In First Out)?",
      options: ["Queue", "Stack", "Array", "Linked List"],
      correctAnswer: 1,
      explanation: "A stack follows LIFO - the last element added is the first one removed."
    },
    {
      question: "What is the time complexity of accessing an element in an array by index?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: 3,
      explanation: "Array access by index is O(1) constant time."
    },
    {
      question: "Which sorting algorithm has the best average case time complexity?",
      options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"],
      correctAnswer: 1,
      explanation: "Quick Sort has O(n log n) average time complexity."
    },
    {
      question: "What data structure uses FIFO (First In First Out)?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      correctAnswer: 1,
      explanation: "A queue follows FIFO - the first element added is the first one removed."
    },
    {
      question: "What is a linked list?",
      options: ["An array of links", "A linear data structure with nodes connected by pointers", "A type of hash table", "A tree structure"],
      correctAnswer: 1,
      explanation: "A linked list consists of nodes where each node contains data and a reference to the next node."
    },
    {
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      correctAnswer: 2,
      explanation: "QuickSort's worst case is O(n²) when the pivot selection is poor."
    },
    {
      question: "What is a hash table?",
      options: ["A sorting algorithm", "A data structure that maps keys to values using a hash function", "A type of tree", "A linked list variant"],
      correctAnswer: 1,
      explanation: "A hash table uses a hash function to compute an index for storing key-value pairs."
    },
    {
      question: "What is the height of a balanced binary search tree with n nodes?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: 1,
      explanation: "A balanced BST has height O(log n)."
    },
    {
      question: "What is recursion?",
      options: ["A loop structure", "A function that calls itself", "A sorting method", "A data type"],
      correctAnswer: 1,
      explanation: "Recursion is when a function calls itself to solve smaller subproblems."
    },
    {
      question: "What is DFS in graph traversal?",
      options: ["Data First Search", "Depth First Search", "Direct First Search", "Distance First Search"],
      correctAnswer: 1,
      explanation: "DFS (Depth First Search) explores as far as possible along each branch before backtracking."
    },
    {
      question: "What is BFS in graph traversal?",
      options: ["Best First Search", "Breadth First Search", "Binary First Search", "Base First Search"],
      correctAnswer: 1,
      explanation: "BFS (Breadth First Search) explores all neighbors at the current depth before moving deeper."
    },
    {
      question: "What is the time complexity of inserting at the beginning of a linked list?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: 3,
      explanation: "Inserting at the beginning of a linked list is O(1) constant time."
    },
    {
      question: "What is a binary tree?",
      options: ["A tree with exactly two nodes", "A tree where each node has at most two children", "A tree with binary data", "A tree with two roots"],
      correctAnswer: 1,
      explanation: "A binary tree is a tree structure where each node has at most two children (left and right)."
    },
    {
      question: "What is dynamic programming?",
      options: ["Programming that changes at runtime", "Breaking problems into subproblems and storing solutions", "A programming language", "Real-time programming"],
      correctAnswer: 1,
      explanation: "Dynamic programming solves problems by breaking them into overlapping subproblems and caching results."
    },
    {
      question: "What is the space complexity of merge sort?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      correctAnswer: 2,
      explanation: "Merge sort requires O(n) extra space for the temporary arrays during merging."
    },
    {
      question: "What is a priority queue?",
      options: ["A FIFO queue", "A queue where elements are dequeued based on priority", "A sorted array", "A stack variant"],
      correctAnswer: 1,
      explanation: "A priority queue serves elements based on their priority rather than insertion order."
    },
    {
      question: "What is the time complexity of finding an element in an unsorted array?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      correctAnswer: 2,
      explanation: "Linear search through an unsorted array is O(n)."
    },
    {
      question: "What is a heap data structure?",
      options: ["A sorted array", "A complete binary tree satisfying the heap property", "A hash table", "A linked list"],
      correctAnswer: 1,
      explanation: "A heap is a complete binary tree where parent nodes satisfy a specific ordering property with children."
    },
    {
      question: "What is Big O notation used for?",
      options: ["Measuring code size", "Describing algorithm time/space complexity", "Naming variables", "Testing code"],
      correctAnswer: 1,
      explanation: "Big O notation describes the upper bound of an algorithm's time or space complexity."
    }
  ]
};

// Generate generic programming questions
const genericQuestions = [
  {
    question: "What is version control?",
    options: ["A way to manage code versions and history", "A debugging tool", "A testing framework", "A deployment system"],
    correctAnswer: 0,
    explanation: "Version control systems like Git track changes to code over time."
  },
  {
    question: "What is Git?",
    options: ["A programming language", "A distributed version control system", "A database", "A web framework"],
    correctAnswer: 1,
    explanation: "Git is a distributed version control system for tracking code changes."
  },
  {
    question: "What does 'git commit' do?",
    options: ["Uploads code to the server", "Saves staged changes to the local repository", "Deletes changes", "Creates a new branch"],
    correctAnswer: 1,
    explanation: "git commit saves the staged snapshot to the local repository."
  },
  {
    question: "What is a pull request?",
    options: ["Downloading code", "A request to merge code changes into a branch", "A type of commit", "A deployment action"],
    correctAnswer: 1,
    explanation: "A pull request proposes changes and requests they be reviewed and merged."
  },
  {
    question: "What is debugging?",
    options: ["Writing new code", "Finding and fixing errors in code", "Deploying applications", "Testing user interfaces"],
    correctAnswer: 1,
    explanation: "Debugging is the process of identifying and removing errors from code."
  },
  {
    question: "What is an IDE?",
    options: ["Internet Development Environment", "Integrated Development Environment", "Internal Data Editor", "Interactive Debug Engine"],
    correctAnswer: 1,
    explanation: "An IDE is a software application providing comprehensive facilities for software development."
  },
  {
    question: "What is code refactoring?",
    options: ["Writing new features", "Restructuring code without changing its behavior", "Deleting old code", "Adding comments"],
    correctAnswer: 1,
    explanation: "Refactoring improves code structure and readability without changing functionality."
  },
  {
    question: "What is unit testing?",
    options: ["Testing the entire application", "Testing individual units/components in isolation", "Testing user interfaces", "Testing databases"],
    correctAnswer: 1,
    explanation: "Unit testing verifies individual components work correctly in isolation."
  },
  {
    question: "What is CI/CD?",
    options: ["Code Integration/Code Deployment", "Continuous Integration/Continuous Deployment", "Central Integration/Central Deployment", "Computer Interface/Computer Design"],
    correctAnswer: 1,
    explanation: "CI/CD automates the integration, testing, and deployment of code changes."
  },
  {
    question: "What is agile development?",
    options: ["Fast coding", "An iterative approach to software development", "A programming language", "A testing method"],
    correctAnswer: 1,
    explanation: "Agile is an iterative approach emphasizing flexibility and continuous improvement."
  }
];

async function seedQuestions() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ No MongoDB URI found in environment variables');
      console.log('Please set MONGODB_URI or MONGO_URI in .env.local');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Import models
    const Roadmap = (await import('../src/models/roadmapModel')).default;
    const { RoadmapTest } = await import('../src/models/roadmapTestModel');

    // Get all roadmaps
    const roadmaps = await Roadmap.find({});
    console.log(`📚 Found ${roadmaps.length} roadmaps`);

    if (roadmaps.length === 0) {
      console.log('⚠️  No roadmaps found. Create roadmaps first via admin panel.');
      process.exit(0);
    }

    for (const roadmap of roadmaps) {
      console.log(`\n📖 Processing: ${roadmap.title}`);

      // Determine which questions to use based on roadmap title
      const title = roadmap.title.toLowerCase();
      let questions: typeof genericQuestions = [...genericQuestions];

      if (title.includes('web') || title.includes('full') || title.includes('frontend') || title.includes('html') || title.includes('css') || title.includes('javascript')) {
        questions = [...sampleQuestions.web, ...genericQuestions];
      }
      if (title.includes('react') || title.includes('next')) {
        questions = [...sampleQuestions.react, ...questions];
      }
      if (title.includes('node') || title.includes('backend') || title.includes('express') || title.includes('api')) {
        questions = [...sampleQuestions.node, ...questions];
      }
      if (title.includes('dsa') || title.includes('algorithm') || title.includes('data structure')) {
        questions = [...sampleQuestions.dsa, ...questions];
      }

      // Check if test already exists
      let test = await RoadmapTest.findOne({ roadmapId: roadmap._id.toString() });

      if (test) {
        // Append questions (API handles deduplication)
        const existingCount = test.mcqQuestions?.length || 0;
        const existingSet = new Set(test.mcqQuestions?.map((q: any) => q.question.toLowerCase().trim()) || []);

        const newQuestions = questions.filter(q => !existingSet.has(q.question.toLowerCase().trim()));

        if (newQuestions.length > 0) {
          test.mcqQuestions = [...(test.mcqQuestions || []), ...newQuestions];
          await test.save();
          console.log(`   ✅ Added ${newQuestions.length} new questions (${existingCount} existed, now ${test.mcqQuestions.length} total)`);
        } else {
          console.log(`   ⏭️  All ${questions.length} questions already exist, skipping`);
        }
      } else {
        // Create new test
        test = await RoadmapTest.create({
          roadmapId: roadmap._id.toString(),
          roadmapTitle: roadmap.title,
          mcqQuestions: questions,
          duration: 60,
          totalMarks: 60,
          passingPercentage: 60,
        });
        console.log(`   ✅ Created test with ${questions.length} questions`);
      }
    }

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    process.exit(1);
  }
}

seedQuestions();
