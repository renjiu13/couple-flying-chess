const ALLOWED_CATEGORIES = new Set([
  "romance",
  "challenge",
  "reward",
  "punish",
  "question"
]);

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const category = String(payload.category || "").trim();
  const content = String(payload.content || "").trim();
  const nickname = String(payload.nickname || "").trim() || "匿名";

  if (!ALLOWED_CATEGORIES.has(category)) {
    return Response.json({ error: "Invalid category" }, { status: 400 });
  }

  if (!content) {
    return Response.json({ error: "Content is required" }, { status: 400 });
  }

  await env.DB.prepare(
    "INSERT INTO keywords (category, content, submitter_nickname) VALUES (?, ?, ?)"
  )
    .bind(category, content, nickname)
    .run();

  return Response.json({ success: true, message: "已加入历史关键词池" });
}
