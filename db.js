import Database from "better-sqlite3";

const db = new Database("study.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS study(
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    minutes INTEGER NOT NULL CHECK (minutes >= 0),
    memo TEXT NOT NULL DEFAULT ''
  )
`);



export default db;
