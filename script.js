const boardEl = document.getElementById("board");
const playerListEl = document.getElementById("player-list");
const turnInfoEl = document.getElementById("turn-info");
const diceResultEl = document.getElementById("dice-result");
const winnerInfoEl = document.getElementById("winner-info");
const rollBtn = document.getElementById("roll-btn");
const resetBtn = document.getElementById("reset-game-btn");
const playerCountEl = document.getElementById("player-count");
const taskDialog = document.getElementById("task-dialog");
const taskContentEl = document.getElementById("task-content");
const closeTaskBtn = document.getElementById("close-task-btn");
const toastEl = document.getElementById("toast");
const loaderEl = document.getElementById("loader");

const form = document.getElementById("submit-form");
const colors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];
const BOARD_SIZE = 28;
const SAFE_CELLS = new Set([0, 7, 14, 21]);
const EVENT_CELLS = new Set([3, 6, 10, 13, 17, 20, 24, 26]);

const gameState = {
  players: [],
  currentPlayerIndex: 0,
  gameOver: false
};

function showToast(text, type = "success") {
  toastEl.textContent = text;
  toastEl.className = `toast ${type}`;
  toastEl.classList.add("show");
  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2000);
}

function showLoader() {
  loaderEl.classList.add("show");
}

function hideLoader() {
  loaderEl.classList.remove("show");
}

function createPlayers(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `玩家 ${index + 1}`,
    color: colors[index],
    position: -1,
    finished: false
  }));
}

function initGame() {
  const count = Number.parseInt(playerCountEl.value, 10);
  gameState.players = createPlayers(count);
  gameState.currentPlayerIndex = 0;
  gameState.gameOver = false;
  winnerInfoEl.classList.add("hidden");
  winnerInfoEl.textContent = "";
  diceResultEl.textContent = "准备开始甜蜜回合";
  renderBoard();
  renderSideInfo();
}

function renderBoard() {
  boardEl.innerHTML = "";
  for (let index = 0; index <= BOARD_SIZE; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";

    if (index === BOARD_SIZE) {
      cell.classList.add("finish");
    } else if (EVENT_CELLS.has(index)) {
      cell.classList.add("event");
    } else if (SAFE_CELLS.has(index)) {
      cell.classList.add("safe");
    }

    const title = document.createElement("div");
    title.className = "cell-index";
    title.textContent = index === BOARD_SIZE ? "终点" : `格 ${index}`;

    const tokenWrap = document.createElement("div");
    tokenWrap.className = "token-wrap";

    const playersInCell = gameState.players.filter((player) => player.position === index);
    for (const player of playersInCell) {
      const token = document.createElement("span");
      token.className = "token";
      token.style.backgroundColor = player.color;
      token.title = player.name;
      tokenWrap.appendChild(token);
    }

    cell.appendChild(title);
    cell.appendChild(tokenWrap);
    boardEl.appendChild(cell);
  }
}

function renderSideInfo() {
  if (gameState.gameOver) return;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  turnInfoEl.innerHTML = `当前回合：<strong style="color:${currentPlayer.color}">${currentPlayer.name}</strong>`;

  playerListEl.innerHTML = "";
  for (const player of gameState.players) {
    const li = document.createElement("li");
    li.className = "rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700";
    const posText = player.finished ? "已到终点" : player.position < 0 ? "起点" : `第 ${player.position} 格`;
    li.innerHTML = `<span style="color:${player.color}">●</span> ${player.name} - ${posText}`;
    playerListEl.appendChild(li);
  }
}

function nextTurn() {
  let index = gameState.currentPlayerIndex;
  for (let i = 0; i < gameState.players.length; i += 1) {
    index = (index + 1) % gameState.players.length;
    if (!gameState.players[index].finished) {
      gameState.currentPlayerIndex = index;
      break;
    }
  }
}

async function fetchRandomTask() {
  const placeholders = ["想想抽哪个～", "甜蜜加载中✨", "马上就好啦～"];
  let index = 0;
  taskContentEl.textContent = placeholders[0];
  const timer = setInterval(() => {
    taskContentEl.textContent = placeholders[index % placeholders.length];
    index += 1;
  }, 120);

  showLoader();
  try {
    const response = await fetch("/api/random?count=1");
    if (!response.ok) return "事件触发，但暂时拉取任务失败。";
    const list = await response.json();
    if (!Array.isArray(list) || list.length === 0) return "暂无甜蜜指令～快去提交一个吧❤️";
    const item = list[0];
    return `【${item.category}】${item.content}`;
  } finally {
    clearInterval(timer);
    hideLoader();
  }
}

async function handleRoll() {
  if (gameState.gameOver) return;

  rollBtn.disabled = true;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const dice = Math.floor(Math.random() * 6) + 1;
  diceResultEl.textContent = `${currentPlayer.name} 掷出 ${dice} 点`;

  const base = currentPlayer.position < 0 ? 0 : currentPlayer.position;
  let next = base + dice;
  if (next >= BOARD_SIZE) {
    next = BOARD_SIZE;
    currentPlayer.finished = true;
  }
  currentPlayer.position = next;

  renderBoard();
  renderSideInfo();

  if (currentPlayer.finished) {
    gameState.gameOver = true;
    winnerInfoEl.textContent = `恭喜 ${currentPlayer.name} 获胜！终极甜蜜王者诞生啦～`;
    winnerInfoEl.classList.remove("hidden");
    showToast("本局结束，快开启下一局吧✨");
    rollBtn.disabled = false;
    return;
  }

  if (EVENT_CELLS.has(currentPlayer.position)) {
    const task = await fetchRandomTask();
    taskContentEl.textContent = task;
    taskContentEl.classList.add("result-highlight");
    setTimeout(() => taskContentEl.classList.remove("result-highlight"), 800);
    taskDialog.showModal();
    showToast("触发事件格，甜蜜任务来了～❤️");
  }

  if (dice !== 6) {
    nextTurn();
  }
  renderSideInfo();
  rollBtn.disabled = false;
}

closeTaskBtn.addEventListener("click", () => {
  taskDialog.close();
});

rollBtn.addEventListener("click", handleRoll);
resetBtn.addEventListener("click", initGame);
playerCountEl.addEventListener("change", initGame);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const category = document.getElementById("category").value;
  const content = document.getElementById("content").value.trim();
  const nickname = document.getElementById("nickname").value.trim();

  if (!content) {
    showToast("请输入想和TA玩的小指令～", "error");
    return;
  }

  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let okCount = 0;
  showLoader();
  try {
    for (const line of lines) {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, content: line, nickname })
      });
      if (response.ok) okCount += 1;
    }
  } finally {
    hideLoader();
  }

  if (okCount === lines.length) {
    showToast("指令已加入甜蜜池～❤️");
  } else {
    showToast(`提交成功 ${okCount}/${lines.length} 条`, "error");
  }
  document.getElementById("content").value = "";
});

window.addEventListener("load", () => {
  hideLoader();
});

initGame();
