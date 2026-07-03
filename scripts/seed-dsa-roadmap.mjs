/**
 * Seed script to create Data Structures & Algorithms Roadmap
 * Run with: node scripts/seed-dsa-roadmap.mjs
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

const dsaRoadmap = {
  title: "Data Structures & Algorithms (DSA)",
  description: "Build a strong foundation in data structures and algorithms, from arrays to dynamic programming, and prepare for technical coding interviews at top tech companies.",
  createdBy: "SkillMine",
  phases: [
    {
      title: "Phase 1: Complexity Analysis & Arrays",
      tasks: [
        { title: "Big-O Notation & Time/Space Complexity", link: "https://www.geeksforgeeks.org/analysis-of-algorithms-set-1-asymptotic-analysis/" },
        { title: "Arrays - Basics & Operations", link: "https://www.geeksforgeeks.org/array-data-structure/" },
        { title: "Two Pointer Technique", link: "https://www.geeksforgeeks.org/two-pointers-technique/" },
        { title: "Sliding Window Technique", link: "https://www.geeksforgeeks.org/window-sliding-technique/" },
        { title: "Prefix Sum Arrays", link: "https://www.geeksforgeeks.org/prefix-sum-array-implementation-applications-competitive-programming/" },
      ],
      assignments: [
        { title: "Practice: Array Problems on LeetCode", link: "https://leetcode.com/tag/array/" },
      ],
    },
    {
      title: "Phase 2: Strings",
      tasks: [
        { title: "String Basics & Manipulation", link: "https://www.geeksforgeeks.org/string-data-structure/" },
        { title: "Pattern Matching - Naive & KMP", link: "https://www.geeksforgeeks.org/kmp-algorithm-for-pattern-searching/" },
        { title: "Anagrams & Palindromes", link: "https://www.geeksforgeeks.org/check-whether-two-strings-are-anagram-of-each-other/" },
        { title: "String Hashing", link: "https://www.geeksforgeeks.org/string-hashing-using-polynomial-rolling-hash-function/" },
      ],
      assignments: [
        { title: "Practice: String Problems on LeetCode", link: "https://leetcode.com/tag/string/" },
      ],
    },
    {
      title: "Phase 3: Recursion & Backtracking",
      tasks: [
        { title: "Recursion Basics & Recursion Tree", link: "https://www.geeksforgeeks.org/recursion/" },
        { title: "Backtracking - Introduction", link: "https://www.geeksforgeeks.org/backtracking-algorithms/" },
        { title: "N-Queens & Sudoku Solver", link: "https://www.geeksforgeeks.org/n-queen-problem-backtracking-3/" },
        { title: "Subsets, Permutations & Combinations", link: "https://www.geeksforgeeks.org/print-all-possible-permutations-of-a-given-string/" },
      ],
      assignments: [
        { title: "Practice: Recursion & Backtracking on LeetCode", link: "https://leetcode.com/tag/backtracking/" },
      ],
    },
    {
      title: "Phase 4: Linked Lists",
      tasks: [
        { title: "Singly & Doubly Linked Lists", link: "https://www.geeksforgeeks.org/data-structures/linked-list/" },
        { title: "Reversing a Linked List", link: "https://www.geeksforgeeks.org/reverse-a-linked-list/" },
        { title: "Detecting & Removing Cycles (Floyd's Algorithm)", link: "https://www.geeksforgeeks.org/detect-loop-in-a-linked-list/" },
        { title: "Merge Two Sorted Linked Lists", link: "https://www.geeksforgeeks.org/merge-two-sorted-linked-lists/" },
      ],
      assignments: [
        { title: "Practice: Linked List Problems on LeetCode", link: "https://leetcode.com/tag/linked-list/" },
      ],
    },
    {
      title: "Phase 5: Stacks & Queues",
      tasks: [
        { title: "Stack - Implementation & Applications", link: "https://www.geeksforgeeks.org/stack-data-structure/" },
        { title: "Queue & Deque", link: "https://www.geeksforgeeks.org/queue-data-structure/" },
        { title: "Monotonic Stack Pattern", link: "https://www.geeksforgeeks.org/introduction-to-monotonic-stack/" },
        { title: "Implement Queue using Stacks & Vice Versa", link: "https://www.geeksforgeeks.org/implement-queue-using-stack/" },
      ],
      assignments: [
        { title: "Practice: Stack & Queue Problems on LeetCode", link: "https://leetcode.com/tag/stack/" },
      ],
    },
    {
      title: "Phase 6: Trees",
      tasks: [
        { title: "Binary Trees - Traversals (Inorder, Preorder, Postorder)", link: "https://www.geeksforgeeks.org/binary-tree-data-structure/" },
        { title: "Binary Search Trees (BST)", link: "https://www.geeksforgeeks.org/binary-search-tree-data-structure/" },
        { title: "Balanced Trees - AVL & Red-Black Trees", link: "https://www.geeksforgeeks.org/introduction-to-avl-tree/" },
        { title: "Lowest Common Ancestor (LCA)", link: "https://www.geeksforgeeks.org/lowest-common-ancestor-binary-tree-set-1/" },
        { title: "Tries", link: "https://www.geeksforgeeks.org/trie-insert-and-search/" },
      ],
      assignments: [
        { title: "Practice: Tree Problems on LeetCode", link: "https://leetcode.com/tag/tree/" },
      ],
    },
    {
      title: "Phase 7: Heaps & Graphs",
      tasks: [
        { title: "Heaps & Priority Queues", link: "https://www.geeksforgeeks.org/heap-data-structure/" },
        { title: "Graph Representation - Adjacency List/Matrix", link: "https://www.geeksforgeeks.org/graph-and-its-representations/" },
        { title: "BFS & DFS Traversal", link: "https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/" },
        { title: "Shortest Path - Dijkstra's Algorithm", link: "https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/" },
        { title: "Union-Find (Disjoint Set) & Minimum Spanning Tree", link: "https://www.geeksforgeeks.org/union-find/" },
        { title: "Topological Sort", link: "https://www.geeksforgeeks.org/topological-sorting/" },
      ],
      assignments: [
        { title: "Practice: Graph Problems on LeetCode", link: "https://leetcode.com/tag/graph/" },
      ],
    },
    {
      title: "Phase 8: Sorting & Searching",
      tasks: [
        { title: "Sorting Algorithms - Merge Sort, Quick Sort", link: "https://www.geeksforgeeks.org/sorting-algorithms/" },
        { title: "Binary Search & Variants", link: "https://www.geeksforgeeks.org/binary-search/" },
        { title: "Binary Search on Answer", link: "https://www.geeksforgeeks.org/binary-search-on-answer-competitive-programming/" },
        { title: "Greedy Algorithms", link: "https://www.geeksforgeeks.org/greedy-algorithms/" },
      ],
      assignments: [
        { title: "Practice: Sorting & Searching on LeetCode", link: "https://leetcode.com/tag/binary-search/" },
      ],
    },
    {
      title: "Phase 9: Dynamic Programming",
      tasks: [
        { title: "DP Introduction - Memoization vs Tabulation", link: "https://www.geeksforgeeks.org/dynamic-programming/" },
        { title: "1D DP - Fibonacci, Climbing Stairs, House Robber", link: "https://www.geeksforgeeks.org/climbing-stairs-to-reach-at-the-top/" },
        { title: "2D DP - Knapsack, LCS, Edit Distance", link: "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/" },
        { title: "DP on Trees & Graphs", link: "https://www.geeksforgeeks.org/tree-diameter-based-on-tree-dp/" },
        { title: "Bitmask DP", link: "https://www.geeksforgeeks.org/tag/bitmasking-dp/" },
      ],
      assignments: [
        { title: "Practice: DP Problems on LeetCode", link: "https://leetcode.com/tag/dynamic-programming/" },
      ],
    },
    {
      title: "Phase 10: Interview Preparation",
      tasks: [
        { title: "Top 75 LeetCode Interview Questions", link: "https://leetcode.com/studyplan/top-interview-150/" },
        { title: "System Design Basics for Interviews", link: "https://github.com/donnemartin/system-design-primer" },
        { title: "Company-wise DSA Question Banks", link: "https://www.geeksforgeeks.org/company-wise-interview-preparation/" },
        { title: "Mock Interview Practice", link: "https://www.geeksforgeeks.org/mock-interview/" },
      ],
      assignments: [
        { title: "Final Assessment: Timed Mock Contest", link: "https://leetcode.com/contest/" },
      ],
    },
  ],
};

async function seedDSARoadmap() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL not found in environment variables. Make sure .env.local exists.');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const existing = await Roadmap.findOne({ title: dsaRoadmap.title });
    if (existing) {
      console.log('DSA Roadmap already exists with ID:', existing._id);
      console.log('Updating existing roadmap...');
      await Roadmap.findByIdAndUpdate(existing._id, dsaRoadmap);
      console.log('Roadmap updated successfully!');
      console.log('\n========================================');
      console.log('ROADMAP ID:', existing._id);
      console.log('========================================\n');
    } else {
      const roadmap = new Roadmap(dsaRoadmap);
      await roadmap.save();
      console.log('DSA Roadmap created successfully!');
      console.log('\n========================================');
      console.log('ROADMAP ID:', roadmap._id);
      console.log('========================================\n');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding DSA roadmap:', error);
    process.exit(1);
  }
}

seedDSARoadmap();
