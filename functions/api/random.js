export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const category = (url.searchParams.get("category") || "").trim();
  const countRaw = Number.parseInt(url.searchParams.get("count") || "1", 10);
  const count = Number.isNaN(countRaw) ? 1 : Math.min(Math.max(countRaw, 1), 5);

  let rows;
  if (category) {
    const result = await env.DB.prepare(
      "SELECT id, category, content, used_count, submitter_nickname, submit_time FROM keywords WHERE category = ? ORDER BY RANDOM() LIMIT ?"
    )
      .bind(category, count)
      .all();
    rows = result.results || [];
  } else {
    const result = await env.DB.prepare(
      "SELECT id, category, content, used_count, submitter_nickname, submit_time FROM keywords ORDER BY RANDOM() LIMIT ?"
    )
      .bind(count)
      .all();
    rows = result.results || [];
  }

  return Response.json(rows);
}
