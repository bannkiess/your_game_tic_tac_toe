const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const modeBtns = { "2p": document.getElementById("mode-2p"), cpu: document.getElementById("mode-cpu") };
const scoreEls = { X: document.getElementById("score-x"), O: document.getElementById("score-o"), D: document.getElementById("score-d") };

let board, current, gameOver, mode = "2p";
const scores = { X: 0, O: 0, D: 0 };

// build the 9 cells once
const cells = Array.from({ length: 9 }, (_, i) => {
  const btn = document.createElement("button");
  btn.className = "cell";
  btn.setAttribute("aria-label", `Cell ${i + 1}`);
  btn.addEventListener("click", () => handleMove(i));
  boardEl.appendChild(btn);
  return btn;
});

function startRound() {
  board = Array(9).fill(null);
  current = "X";
  gameOver = false;
  cells.forEach(c => {
    c.textContent = "";
    c.disabled = false;
    c.className = "cell";
  });
  setStatus(`${current}'s turn`);
}

function setStatus(msg) { statusEl.textContent = msg; }

function getWinner(b) {
  for (const line of WIN_LINES) {
    const [a, b2, c] = line;
    if (b[a] && b[a] === b[b2] && b[a] === b[c]) return { player: b[a], line };
  }
  return null;
}

function place(i) {
  board[i] = current;
  cells[i].textContent = current;
  cells[i].classList.add(current.toLowerCase());
  cells[i].disabled = true;

  const result = getWinner(board);
  if (result) {
    gameOver = true;
    result.line.forEach(idx => cells[idx].classList.add("win"));
    scores[result.player]++;
    scoreEls[result.player].textContent = scores[result.player];
    setStatus(`${result.player} wins!`);
    cells.forEach(c => (c.disabled = true));
    return;
  }
  if (board.every(Boolean)) {
    gameOver = true;
    scores.D++;
    scoreEls.D.textContent = scores.D;
    setStatus("It's a draw");
    return;
  }
  current = current === "X" ? "O" : "X";
  setStatus(`${current}'s turn`);
}

function handleMove(i) {
  if (gameOver || board[i]) return;
  place(i);
  if (mode === "cpu" && !gameOver && current === "O") {
    cells.forEach(c => (c.disabled = true));
    setTimeout(() => {
      place(bestMove());
      if (!gameOver) cells.forEach((c, idx) => (c.disabled = !!board[idx]));
    }, 350);
  }
}

// minimax so the computer never loses
function minimax(b, player) {
  const w = getWinner(b);
  if (w) return { score: w.player === "O" ? 1 : -1 };
  if (b.every(Boolean)) return { score: 0 };

  let best = { score: player === "O" ? -Infinity : Infinity, move: null };
  b.forEach((v, i) => {
    if (v) return;
    b[i] = player;
    const { score } = minimax(b, player === "O" ? "X" : "O");
    b[i] = null;
    if (player === "O" ? score > best.score : score < best.score) best = { score, move: i };
  });
  return best;
}

function bestMove() {
  return minimax([...board], "O").move;
}

function setMode(m) {
  mode = m;
  modeBtns["2p"].classList.toggle("active", m === "2p");
  modeBtns.cpu.classList.toggle("active", m === "cpu");
  Object.keys(scores).forEach(k => { scores[k] = 0; scoreEls[k].textContent = 0; });
  startRound();
}

modeBtns["2p"].addEventListener("click", () => setMode("2p"));
modeBtns.cpu.addEventListener("click", () => setMode("cpu"));
restartBtn.addEventListener("click", startRound);

startRound();
