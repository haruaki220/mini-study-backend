import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createSupabaseClient } from "./supabaseClient.js";
import type { Env } from "./types.ts";

const app = new Hono<Env>();

app.use("*", cors({origin: ["http://localhost:5173", "https://mini-study-app.vercel.app"],}),);

// ミドルウェア
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

// 学習記録一覧を取得
app.get("/api/study", async (c) => {
  const supabase = c.get("supabase");

  const { data, error } = await supabase
    .from("study_records")
    .select("id, subject, minutes, memo, created_at")
    .order("created_at",{ascending:false});
  if (error) {
    return c.json({ message: error.message }, 400);
  }
  return c.json(data);
});

// 学習記録を追加
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
});

// 学習記録を削除
app.delete("/api/study/:id", async (c) => {
  const supabase = c.get("supabase");
  const user = c.get("user");
  const id = c.req.param("id");

  const { data, error } = await supabase
    .from("study_records")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return c.json({ message: error.message }, 400);
  }
  return c.json(data);
});

// 学習記録を編集
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
    .eq("user_id", user.id);

  if (error) {
    return c.json({ message: error.message }, 400);
  }

  return c.json(data);
});

// 指定した期間単位で学習時間の合計を集計したデータを取得
app.get("/api/study/summary", async (c) => {
  const supabase = c.get("supabase");
  const span = c.req.query("span");
  let res;
  if (span === "day") {
    res = await supabase.rpc("get_daily_summary");
  } else if (span === "week") {
    res = await supabase.rpc("get_weekly_summary");
  } else if (span === "month") {
    res = await supabase.rpc("get_monthly_summary");
  } else if (span === "year") {
    res = await supabase.rpc("get_yearly_summary");
  } else if (!span) {
    return c.json({ message: "span is required" }, 400);
  }
  if (res) {
    if (res.error) {
      return c.json({ message: res.error.message }, 400);
    } else {
      return c.json(res.data);
    }
  }
});

// 指定した期間の教科別学習時間を取得
app.get("/api/study/subject_summary", async (c) => {
  const supabase = c.get("supabase");
  const start_date = c.req.query("start_date");
  const end_date = c.req.query("end_date");
  const { data, error } = await supabase.rpc("get_subject_summary", {
    start_date: start_date,
    end_date: end_date,
  });
  if (error) {
    return c.json({ message: error.message }, 400);
  }
  return c.json(data);
});

//サーバーを起動
serve({
  fetch: app.fetch,
  port: 3000,
});
