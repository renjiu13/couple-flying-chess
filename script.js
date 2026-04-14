const form = document.getElementById("submit-form");
const drawBtn = document.getElementById("draw-btn");
const resultEl = document.getElementById("result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const category = document.getElementById("category").value;
  const content = document.getElementById("content").value.trim();
  const nickname = document.getElementById("nickname").value.trim();

  if (!content) {
    alert("请先输入关键词内容");
    return;
  }

  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let okCount = 0;
  for (const line of lines) {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        content: line,
        nickname
      })
    });
    if (response.ok) okCount += 1;
  }

  alert(`提交完成：${okCount}/${lines.length}`);
  document.getElementById("content").value = "";
});

drawBtn.addEventListener("click", async () => {
  const category = document.getElementById("random-category").value;
  const query = new URLSearchParams({ count: "1" });
  if (category) query.set("category", category);

  const response = await fetch(`/api/random?${query.toString()}`);
  if (!response.ok) {
    resultEl.textContent = "抽取失败，请稍后重试";
    return;
  }

  const list = await response.json();
  if (!Array.isArray(list) || list.length === 0) {
    resultEl.textContent = "历史池暂时为空，先提交几条关键词吧";
    return;
  }

  const item = list[0];
  resultEl.innerHTML = `<p><strong>分类：</strong>${item.category}</p><p><strong>内容：</strong>${item.content}</p>`;
});
