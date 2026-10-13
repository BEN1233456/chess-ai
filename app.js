const game = new Chess();
let board;
let thinking = false;

const pieceValues = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

function evaluateBoard(chess) {
  const boardState = chess.board();
  let score = 0;

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = boardState[row][col];
      if (!piece) continue;
      const value = pieceValues[piece.type] || 0;
      score += piece.color === "b" ? value : -value;
    }
  }

  return score;
}

function minimax(chess, depth, alpha, beta, maximizingPlayer) {
  if (depth === 0 || chess.game_over()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (const move of moves) {
    chess.move(move);
    const evaluation = minimax(chess, depth - 1, alpha, beta, true);
    chess.undo();
    minEval = Math.min(minEval, evaluation);
    beta = Math.min(beta, evaluation);
    if (beta <= alpha) break;
  }
  return minEval;
}

function findBestMove(depth = 2) {
  const moves = game.moves({ verbose: true });
  let bestValue = -Infinity;
  let bestMove = null;

  for (const move of moves) {
    game.move(move);
    const boardValue = minimax(game, depth - 1, -Infinity, Infinity, false);
    game.undo();

    if (boardValue > bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  }

  return bestMove;
}

function updateMoveHistory() {
  const historyElement = document.getElementById("move-history");
  const history = game.history();
  historyElement.innerHTML = "";

  for (let i = 0; i < history.length; i += 2) {
    const whiteMove = history[i] || "-";
    const blackMove = history[i + 1] || "-";
    const item = document.createElement("li");
    item.textContent = `${Math.floor(i / 2) + 1}. ${whiteMove} ${blackMove}`;
    historyElement.appendChild(item);
  }
}

function updateStatus() {
  const statusElement = document.getElementById("status");
  let statusText = "";

  if (game.in_checkmate()) {
    statusText = game.turn() === "w" ? "Bot thắng (chiếu hết)!" : "Bạn thắng (chiếu hết)!";
  } else if (game.in_draw()) {
    statusText = "Ván đấu hòa.";
  } else {
    statusText = game.turn() === "w" ? "Tới lượt bạn (quân trắng)." : "Bot đang tính...";
    if (game.in_check()) {
      statusText += " Đang bị chiếu!";
    }
  }

  statusElement.textContent = statusText;
  updateMoveHistory();
}

function makeBotMove() {
  if (game.game_over()) {
    updateStatus();
    return;
  }

  thinking = true;
  updateStatus();

  window.setTimeout(() => {
    const bestMove = findBestMove(2);

    if (bestMove) {
      game.move(bestMove);
      board.position(game.fen());
    }

    thinking = false;
    updateStatus();
  }, 250);
}

function onDragStart(source, piece) {
  if (thinking || game.game_over()) return false;
  if (game.turn() !== "w") return false;
  if (piece.search(/^b/) !== -1) return false;
  return true;
}

function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: "q",
  });

  if (move === null) return "snapback";

  updateStatus();
  makeBotMove();
  return undefined;
}

function onSnapEnd() {
  board.position(game.fen());
}

function resetGame() {
  game.reset();
  board.start();
  thinking = false;
  updateStatus();
}

function undoMove() {
  if (thinking) return;
  if (game.history().length === 0) return;

  game.undo();
  if (game.turn() === "b" && game.history().length > 0) {
    game.undo();
  }

  board.position(game.fen());
  updateStatus();
}

function init() {
  board = Chessboard("board", {
    draggable: true,
    position: "start",
    pieceTheme:
      "https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/img/chesspieces/wikipedia/{piece}.png",
    onDragStart,
    onDrop,
    onSnapEnd,
  });

  document.getElementById("new-game").addEventListener("click", resetGame);
  document.getElementById("undo-move").addEventListener("click", undoMove);

  updateStatus();
}

init();
