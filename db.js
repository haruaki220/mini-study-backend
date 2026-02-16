import Database from "better-sqlite3";

const db = new Database("study.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS STUDY(
    id TEXT PRIMARY KEY
    subject TEXT NOT NULL
  )
  `);

export default db;
