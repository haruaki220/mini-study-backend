import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
// import db from "./db.js";

const app = new Hono();

app.use("*", cors());

app.get("/api/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
    status: "success",
  });
});

const studyList = [
  { id: "1", subject: "英語" },
  { id: "2", subject: "数学" },
];

app.get("/api/study", (c) => {
  // const rows = db.prepare("SELECT * FROM study").all();
  return c.json(studyList);
});

app.post("/api/study", async (c) => {
  const body = await c.req.json();

  // db.prepare("INSERT INTO study (id, subject) VALUES ( ?, ?)").run(
  //   body.id,
  //   body.subject,
  // );

  const newRecord = {
    id: body.id,
    subject: body.subject,
  };

  studyList.push(newRecord);
  return c.json(newRecord);
});

app.delete("/api/study/:id", (c) => {
  const id = c.req.param("id");

  const index = studyList.findIndex((record) => record.id === id);
  if (index === -1) {
    return c.json({ message: "Not found" }, 404);
  }

  const deleted = studyList.splice(index, 1);

  return c.json(deleted[0]);
});

app.put("/api/study/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const record = studyList.find((r) => r.id === id);

  if (!record) {
    return c.json({ message: "Not found" }, 404);
  }

  record.subject = body.subject;

  return c.json(record);
  // const index = studyList.findIndex((record) => record.id===id);
  // studyList[index].subject = body.subject;
  // return c.json(studyList[index]);
});

serve({
  fetch: app.fetch,
  port: 3000,
});
