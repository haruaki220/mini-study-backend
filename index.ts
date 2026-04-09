import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createSupabaseClient } from "./supabaseClient.js";
import type { Env } from "./types.ts";

const app = new Hono<Env>();

console.log("URL:", process.env.SUPABASE_URL);

app.use("*", cors({origin:["http://localhost:5173","https://mini-study-app.vercel.app"]}));

app.use("/api/*", async (c, next) => {
  const reqHeader = c.req.header("Authorization");
  if (!reqHeader) {
    return c.json({ error: "No Token" }, 401);
  }

  const token = reqHeader.replace("Bearer ", "");
  const supabase = createSupabaseClient(token);

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
  c.set("supabase", supabase);
  c.set("user", data.user);
  await next();
});

app.get("/api/study", async (c) => {
  const supabase = c.get("supabase");

  const { data, error } = await supabase.from("study_records").select("*");
  if (error) {
    return c.json({ message: error.message }, 400);
  }
  return c.json(data);

  // const result = await db.query("SELECT * FROM study_records");
  // return c.json(result.rows);
});

app.post("/api/study", async (c) => {
  const supabase = c.get("supabase");
  const user = c.get("user");

  const body = await c.req.json();

  const { data, error } = await supabase
    .from("study_records")
    .insert({
      subject: body.subject,
      minutes: body.minutes,
      memo: body.memo,
      user_id: user.id,
    })
    .select();

  if (error) {
    return c.json({ message: error.message }, 400);
  }

  return c.json(data);
  // await db.query("INSERT INTO study_records (subject, minutes, memo) VALUES ( $1, $2, $3 )",
  //   [body.subject, body.minutes, body.memo]
  // );

  // return c.json(body);
});

app.delete("/api/study/:id", async (c) => {
  const supabase = c.get("supabase");
  const user = c.get("user");
  const id = c.req.param("id");

  const { data, error } = await supabase
    .from("study_records")
    .delete()
    .eq("id", id)
    .eq("user_id",user.id);

  if (error) {
    return c.json({ message: error.message }, 400);
  }
  return c.json(data);
  // await db.query("DELETE FROM study_records WHERE id = $1", [id]);

  // return c.json({ message: "Deleted" });
});

app.put("/api/study/:id", async (c) => {
  const supabase = c.get("supabase");
  const user = c.get("user");

  const id = c.req.param("id");
  const body = await c.req.json();

  const { data, error } = await supabase
    .from("study_records")
    .update({
      subject: body.subject,
      minutes: body.minutes,
      memo: body.memo,
      user_id: user.id,
    })
    .eq("id", id)
    .eq("user_id",user.id)

  if (error) {
    return c.json({ message: error.message }, 400);
  }

  return c.json(data);

  // await db.query(
  //   "UPDATE study_records SET subject = $1, minutes = $2, memo = $3 where id = $4",
  //   [body.subject, body.minutes, body.memo, id],
  // );

  // return c.json(body);
});

app.get("/api/study/summary", async (c) => {
  const supabase = c.get("supabase");
  const span = c.req.query("span");
  let res;
  if(span==="day"){
    res = await supabase.rpc("get_daily_summary");
  }
  else if(span==="week"){
    res = await supabase.rpc("get_weekly_summary");
  }
  else if(span==="month"){
    res = await supabase.rpc("get_monthly_summary");
  }
  else if(span==="year"){
    res = await supabase.rpc("get_yearly_summary");
  }
  else if(!span){
    return c.json({message:"span is required"}, 400);
  }
  if(res){
    if(res.error){
      return c.json({message: res.error.message}, 400)
    }
    else{
      return c.json(res.data);
    }
  }
})

app.get("/api/study/subject_summary", async (c) => {
  const supabase = c.get("supabase");
  const start_date = c.req.query("start_date")
  const end_date = c.req.query("end_date")
  const {data, error} = await supabase.rpc("get_subject_summary", {
    start_date:start_date,
    end_date:end_date
  })
  if(error){
    return c.json({message:error.message}, 400)
  }
  return c.json(data);
})

serve({
  fetch: app.fetch,
  port: 3000,
});
