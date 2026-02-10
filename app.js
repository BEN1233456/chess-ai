const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const newGameButton = document.getElementById('new-game');
const difficultyEl = document.getElementById('difficulty');
const moveListEl = document.getElementById('move-list');

const game = new Chess();
let selectedSquare = null;
let lastMoveSquares = [];

const pieces = {
  p: '♟',
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
  P: '♙',
  R: '♖',
  N: '♘',
  B: '♗',
  Q: '♕',
  K: '♔'
};

const pieceValue = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

function squareColor(file, rank) {
  return (file + rank) % 2 === 0 ? 'light' : 'dark';
}

function getFenPiece(square) {
  const piece = game.get(square);
  if (!piece) return '';
  const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
  return pieces[key];
}

function getMoveHints(from) {
  return game.moves({ square: from, verbose: true }).map((m) => m.to);
}

function evaluateBoard() {
  let score = 0;
  const board = game.board();

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece) continue;

      const value = pieceValue[piece.type];
      score += piece.color === 'b' ? value : -value;
    }
  }

  return score;
}

function minimax(depth, alpha, beta, maximizingPlayer) {
  if (depth === 0 || game.game_over()) {
    return evaluateBoard();
  }

  const moves = game.moves({ verbose: true });

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (const move of moves) {
    game.move(move);
    const evalScore = minimax(depth - 1, alpha, beta, true);
    game.undo();
    minEval = Math.min(minEval, evalScore);
    beta = Math.min(beta, evalScore);
    if (beta <= alpha) break;
  }
  return minEval;
}

function findBestMove(depth) {
  const legalMoves = game.moves({ verbose: true });
  let bestMove = null;
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    game.move(move);
    const score = minimax(depth - 1, -Infinity, Infinity, false);
    game.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove || legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

function updateMoveList() {
  const history = game.history();
  moveListEl.innerHTML = '';

  for (let i = 0; i < history.length; i += 2) {
    const whiteMove = history[i] || '';
    const blackMove = history[i + 1] || '';
    const item = document.createElement('li');
    item.textContent = `${whiteMove}${blackMove ? `  •  ${blackMove}` : ''}`;
    moveListEl.appendChild(item);
  }
}

function setStatus() {
  if (game.isCheckmate()) {
    statusEl.textContent = game.turn() === 'w' ? 'Bạn thua (chiếu bí)!' : 'Bạn thắng (chiếu bí bot)!';
    return;
  }

  if (game.isDraw()) {
    statusEl.textContent = 'Hòa cờ!';
    return;
  }

  if (game.turn() === 'w') {
    statusEl.textContent = game.inCheck() ? 'Bạn đang bị chiếu!' : 'Đến lượt bạn (trắng).';
  } else {
    statusEl.textContent = game.inCheck() ? 'Bot đang bị chiếu, đang tìm nước cứu...' : 'Bot đang tính toán...';
  }
}

function renderBoard() {
  boardEl.innerHTML = '';
  const hints = selectedSquare ? getMoveHints(selectedSquare) : [];

  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = `${String.fromCharCode(97 + file)}${rank}`;
      const squareEl = document.createElement('button');
      squareEl.className = `square ${squareColor(file, rank)}`;
      squareEl.type = 'button';
      squareEl.dataset.square = square;
      squareEl.textContent = getFenPiece(square);

      if (square === selectedSquare) squareEl.classList.add('selected');
      if (hints.includes(square)) squareEl.classList.add('hint');
      if (lastMoveSquares.includes(square)) squareEl.classList.add('last-move');

      squareEl.addEventListener('click', () => onSquareClick(square));
      boardEl.appendChild(squareEl);
    }
  }

  updateMoveList();
  setStatus();
}

function botMove() {
  if (game.game_over()) {
    renderBoard();
    return;
  }

  const depth = Number(difficultyEl.value);
  const bestMove = findBestMove(depth);
  const played = game.move(bestMove);

  if (played) {
    lastMoveSquares = [played.from, played.to];
  }

  selectedSquare = null;
  renderBoard();
}

function onSquareClick(square) {
  if (game.turn() !== 'w' || game.game_over()) return;

  if (!selectedSquare) {
    const piece = game.get(square);
    if (piece && piece.color === 'w') {
      selectedSquare = square;
      renderBoard();
    }
    return;
  }

  if (selectedSquare === square) {
    selectedSquare = null;
    renderBoard();
    return;
  }

  const move = game.move({ from: selectedSquare, to: square, promotion: 'q' });

  if (!move) {
    const piece = game.get(square);
    if (piece && piece.color === 'w') {
      selectedSquare = square;
      renderBoard();
    }
    return;
  }

  lastMoveSquares = [move.from, move.to];
  selectedSquare = null;
  renderBoard();
  window.setTimeout(botMove, 350);
}

newGameButton.addEventListener('click', () => {
  game.reset();
  selectedSquare = null;
  lastMoveSquares = [];
  renderBoard();
});

renderBoard();
