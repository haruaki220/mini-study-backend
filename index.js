import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import db from "./db.js";

const app = new Hono();

app.use("*", cors());

app.get("/api/study", (c) => {
  const rows = db.prepare("SELECT * FROM study").all();
  return c.json(rows);
});

app.post("/api/study", async (c) => {
  const body = await c.req.json();

  db.prepare("INSERT INTO study (id, subject) VALUES ( ?, ?)").run(
    body.id,
    body.subject,
  );

  return c.json(body);
});

app.delete("/api/study/:id", (c) => {
  const id = c.req.param("id");
  
  db.prepare(
    "DELETE FROM study WHERE id = ?"
  ).run(id);

  return c.json({message: "Deleted"});
});

app.put("/api/study/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  db.prepare(
    "UPDATE study SET subject = ? where id = ?"
  ).run(body.subject,id);

  return c.json({id,subject:body.subject});
});

serve({
  fetch: app.fetch,
  port: 3000,
});
