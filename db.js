import pkg from "pg";
// import Database from "better-sqlite3";

const { Pool } = pkg;

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },})

// const db = new Database("study.db");

// db.exec(`
//   CREATE TABLE IF NOT EXISTS study(
//     id TEXT PRIMARY KEY,
//     subject TEXT NOT NULL,
//     minutes INTEGER NOT NULL CHECK (minutes >= 0),
//     memo TEXT NOT NULL DEFAULT ''
//   )
// `);



export default pool;
