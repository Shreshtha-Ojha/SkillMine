/**
 * Seed script to create DBMS Roadmap
 * Run with: node scripts/seed-dbms-roadmap.mjs
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

const dbmsRoadmap = {
  title: "Database Management Systems (DBMS)",
  description: "Master database concepts from basics to advanced topics. Learn SQL, normalization, transactions, indexing, and prepare for technical interviews with comprehensive DBMS knowledge.",
  createdBy: "SkillMine",
  phases: [
    {
      title: "Phase 1: Introduction to DBMS",
      tasks: [
        { title: "What is DBMS? Introduction & Applications", link: "https://www.geeksforgeeks.org/introduction-of-dbms-database-management-system-set-1/" },
        { title: "DBMS vs File System", link: "https://www.geeksforgeeks.org/difference-between-file-system-and-dbms/" },
        { title: "DBMS Architecture (1-tier, 2-tier, 3-tier)", link: "https://www.geeksforgeeks.org/dbms-architecture-2-level-3-level/" },
        { title: "Data Models - ER, Relational, Hierarchical", link: "https://www.geeksforgeeks.org/data-models-in-dbms/" },
        { title: "Database Schema & Instance", link: "https://www.geeksforgeeks.org/difference-between-schema-and-instance-in-dbms/" },
        { title: "Data Independence - Logical vs Physical", link: "https://www.geeksforgeeks.org/data-independence-in-dbms/" },
      ],
      assignments: [
        { title: "Quiz: DBMS Basics", link: "https://www.geeksforgeeks.org/dbms-gq/introduction-gq/" },
      ],
    },
    {
      title: "Phase 2: Entity-Relationship Model",
      tasks: [
        { title: "ER Model - Entities, Attributes, Relationships", link: "https://www.geeksforgeeks.org/introduction-of-er-model/" },
        { title: "Types of Attributes in ER Model", link: "https://www.geeksforgeeks.org/types-of-attributes-in-er-model/" },
        { title: "Cardinality & Participation Constraints", link: "https://www.geeksforgeeks.org/cardinality-in-er-diagram/" },
        { title: "Weak Entity & Strong Entity", link: "https://www.geeksforgeeks.org/difference-between-strong-and-weak-entity/" },
        { title: "Extended ER Features - Specialization, Generalization", link: "https://www.geeksforgeeks.org/generalization-specialization-and-aggregation-in-er-model/" },
        { title: "ER to Relational Model Conversion", link: "https://www.geeksforgeeks.org/mapping-from-er-model-to-relational-model/" },
      ],
      assignments: [
        { title: "Practice: Design ER Diagram for Library System", link: "https://www.geeksforgeeks.org/er-diagram-for-library-management-system/" },
        { title: "Practice: Design ER Diagram for E-commerce", link: "https://www.geeksforgeeks.org/er-diagram-for-online-shopping-website/" },
      ],
    },
    {
      title: "Phase 3: Relational Model & SQL Basics",
      tasks: [
        { title: "Relational Model - Concepts & Terminology", link: "https://www.geeksforgeeks.org/introduction-of-relational-model-and-codd-rules-in-dbms/" },
        { title: "Keys - Primary, Foreign, Candidate, Super Keys", link: "https://www.geeksforgeeks.org/types-of-keys-in-relational-model-candidate-super-primary-alternate-and-foreign/" },
        { title: "Relational Algebra - Selection, Projection, Join", link: "https://www.geeksforgeeks.org/introduction-of-relational-algebra-in-dbms/" },
        { title: "SQL - DDL Commands (CREATE, ALTER, DROP)", link: "https://www.geeksforgeeks.org/sql-ddl-dql-dml-dcl-tcl-commands/" },
        { title: "SQL - DML Commands (INSERT, UPDATE, DELETE)", link: "https://www.geeksforgeeks.org/sql-dml-commands/" },
        { title: "SQL - SELECT Query & WHERE Clause", link: "https://www.geeksforgeeks.org/sql-select-query/" },
        { title: "SQL - GROUP BY, HAVING, ORDER BY", link: "https://www.geeksforgeeks.org/sql-group-by/" },
      ],
      assignments: [
        { title: "Practice: SQL Queries on HackerRank", link: "https://www.hackerrank.com/domains/sql" },
        { title: "Practice: SQL on LeetCode", link: "https://leetcode.com/problemset/database/" },
      ],
    },
    {
      title: "Phase 4: Advanced SQL",
      tasks: [
        { title: "SQL Joins - INNER, LEFT, RIGHT, FULL", link: "https://www.geeksforgeeks.org/sql-join-set-1-inner-left-right-and-full-joins/" },
        { title: "SQL Subqueries - Nested & Correlated", link: "https://www.geeksforgeeks.org/sql-subquery/" },
        { title: "SQL Views - Creating & Managing Views", link: "https://www.geeksforgeeks.org/sql-views/" },
        { title: "SQL Aggregate Functions - COUNT, SUM, AVG, MIN, MAX", link: "https://www.geeksforgeeks.org/aggregate-functions-in-sql/" },
        { title: "SQL Set Operations - UNION, INTERSECT, EXCEPT", link: "https://www.geeksforgeeks.org/sql-set-operation/" },
        { title: "SQL Triggers & Stored Procedures", link: "https://www.geeksforgeeks.org/sql-trigger-student-database/" },
      ],
      assignments: [
        { title: "Practice: Advanced SQL on StrataScratch", link: "https://www.stratascratch.com/" },
      ],
    },
    {
      title: "Phase 5: Normalization",
      tasks: [
        { title: "Functional Dependencies", link: "https://www.geeksforgeeks.org/functional-dependency-and-attribute-closure/" },
        { title: "Armstrong's Axioms & Attribute Closure", link: "https://www.geeksforgeeks.org/armstrongs-axioms-in-functional-dependency-in-dbms/" },
        { title: "Canonical Cover", link: "https://www.geeksforgeeks.org/canonical-cover-of-functional-dependencies-in-dbms/" },
        { title: "First Normal Form (1NF)", link: "https://www.geeksforgeeks.org/first-normal-form-1nf/" },
        { title: "Second Normal Form (2NF)", link: "https://www.geeksforgeeks.org/second-normal-form-2nf/" },
        { title: "Third Normal Form (3NF)", link: "https://www.geeksforgeeks.org/third-normal-form-3nf/" },
        { title: "Boyce-Codd Normal Form (BCNF)", link: "https://www.geeksforgeeks.org/boyce-codd-normal-form-bcnf/" },
        { title: "4NF & 5NF (Multi-valued Dependencies)", link: "https://www.geeksforgeeks.org/fourth-normal-form-4nf/" },
        { title: "Lossless Join & Dependency Preserving Decomposition", link: "https://www.geeksforgeeks.org/lossless-join-and-dependency-preserving-decomposition/" },
      ],
      assignments: [
        { title: "Quiz: Normalization Problems", link: "https://www.geeksforgeeks.org/dbms-gq/normalization-gq/" },
      ],
    },
    {
      title: "Phase 6: Transactions & Concurrency Control",
      tasks: [
        { title: "Transaction Concepts & ACID Properties", link: "https://www.geeksforgeeks.org/acid-properties-in-dbms/" },
        { title: "Transaction States", link: "https://www.geeksforgeeks.org/transaction-states-in-dbms/" },
        { title: "Schedules - Serial, Non-serial, Serializable", link: "https://www.geeksforgeeks.org/types-of-schedules-in-dbms/" },
        { title: "Conflict Serializability", link: "https://www.geeksforgeeks.org/conflict-serializability/" },
        { title: "View Serializability", link: "https://www.geeksforgeeks.org/view-serializability-in-dbms-transactions/" },
        { title: "Recoverability of Schedules", link: "https://www.geeksforgeeks.org/recoverability-in-dbms/" },
        { title: "Lock-based Protocols (2PL)", link: "https://www.geeksforgeeks.org/two-phase-locking-protocol/" },
        { title: "Deadlock - Detection & Prevention", link: "https://www.geeksforgeeks.org/deadlock-in-dbms/" },
        { title: "Timestamp Ordering Protocol", link: "https://www.geeksforgeeks.org/timestamp-ordering-protocol-in-dbms/" },
      ],
      assignments: [
        { title: "Quiz: Transactions & Concurrency", link: "https://www.geeksforgeeks.org/dbms-gq/transaction-and-concurrency-control-gq/" },
      ],
    },
    {
      title: "Phase 7: Indexing & Query Processing",
      tasks: [
        { title: "Indexing - Introduction & Types", link: "https://www.geeksforgeeks.org/indexing-in-databases-set-1/" },
        { title: "Primary vs Secondary Index", link: "https://www.geeksforgeeks.org/difference-between-primary-and-secondary-index-in-database/" },
        { title: "Dense vs Sparse Index", link: "https://www.geeksforgeeks.org/difference-between-dense-index-and-sparse-index/" },
        { title: "B-Tree & B+ Tree Indexing", link: "https://www.geeksforgeeks.org/introduction-of-b-tree-2/" },
        { title: "Hashing - Static & Dynamic", link: "https://www.geeksforgeeks.org/hashing-in-dbms/" },
        { title: "Query Processing & Optimization", link: "https://www.geeksforgeeks.org/query-processing-in-dbms/" },
        { title: "Query Execution Plans", link: "https://www.geeksforgeeks.org/execution-plan-in-sql/" },
      ],
      assignments: [
        { title: "Quiz: File Organization & Indexing", link: "https://www.geeksforgeeks.org/dbms-gq/file-organization-gq/" },
      ],
    },
    {
      title: "Phase 8: Recovery & Backup",
      tasks: [
        { title: "Database Recovery - Introduction", link: "https://www.geeksforgeeks.org/database-recovery-techniques-in-dbms/" },
        { title: "Log-based Recovery", link: "https://www.geeksforgeeks.org/log-based-recovery-in-dbms/" },
        { title: "ARIES Recovery Algorithm", link: "https://www.geeksforgeeks.org/aries-algorithm-for-recovery-in-database/" },
        { title: "Checkpointing", link: "https://www.geeksforgeeks.org/checkpoint-in-dbms/" },
        { title: "Shadow Paging", link: "https://www.geeksforgeeks.org/shadow-paging-in-dbms/" },
      ],
      assignments: [],
    },
    {
      title: "Phase 9: NoSQL & Modern Databases",
      tasks: [
        { title: "SQL vs NoSQL Databases", link: "https://www.geeksforgeeks.org/difference-between-sql-and-nosql/" },
        { title: "Types of NoSQL - Document, Key-Value, Graph, Column", link: "https://www.geeksforgeeks.org/types-of-nosql-databases/" },
        { title: "MongoDB Basics", link: "https://www.geeksforgeeks.org/mongodb-an-introduction/" },
        { title: "CAP Theorem", link: "https://www.geeksforgeeks.org/cap-theorem-in-dbms/" },
        { title: "ACID vs BASE", link: "https://www.geeksforgeeks.org/acid-properties-in-dbms/" },
        { title: "Database Sharding", link: "https://www.geeksforgeeks.org/database-sharding-in-dbms/" },
      ],
      assignments: [],
    },
    {
      title: "Phase 10: Interview Preparation",
      tasks: [
        { title: "Top 50 DBMS Interview Questions", link: "https://www.geeksforgeeks.org/commonly-asked-dbms-interview-questions/" },
        { title: "Top SQL Interview Questions", link: "https://www.geeksforgeeks.org/sql-interview-questions/" },
        { title: "DBMS GATE Previous Year Questions", link: "https://www.geeksforgeeks.org/dbms-gq/" },
        { title: "Practice: DBMS MCQs", link: "https://www.sanfoundry.com/1000-database-management-system-questions-answers/" },
      ],
      assignments: [
        { title: "Final Assessment: Complete DBMS Quiz", link: "https://www.geeksforgeeks.org/dbms-gq/" },
      ],
    },
  ],
};

async function seedDBMSRoadmap() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGO_URL not found in environment variables. Make sure .env.local exists.');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if DBMS roadmap already exists
    const existing = await Roadmap.findOne({ title: dbmsRoadmap.title });
    if (existing) {
      console.log('DBMS Roadmap already exists with ID:', existing._id);
      console.log('Updating existing roadmap...');
      await Roadmap.findByIdAndUpdate(existing._id, dbmsRoadmap);
      console.log('Roadmap updated successfully!');
      console.log('\n========================================');
      console.log('ROADMAP ID:', existing._id);
      console.log('========================================\n');
    } else {
      const roadmap = new Roadmap(dbmsRoadmap);
      await roadmap.save();
      console.log('DBMS Roadmap created successfully!');
      console.log('\n========================================');
      console.log('ROADMAP ID:', roadmap._id);
      console.log('========================================\n');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding DBMS roadmap:', error);
    process.exit(1);
  }
}

seedDBMSRoadmap();
