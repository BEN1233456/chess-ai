const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const newGameButton = document.getElementById('new-game');

const game = new Chess();
let selectedSquare = null;

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
    statusEl.textContent = game.inCheck() ? 'Bot đang bị chiếu...' : 'Bot đang suy nghĩ...';
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

      if (square === selectedSquare) {
        squareEl.classList.add('selected');
      }
      if (hints.includes(square)) {
        squareEl.classList.add('hint');
      }

      squareEl.addEventListener('click', () => onSquareClick(square));
      boardEl.appendChild(squareEl);
    }
  }

  setStatus();
}

function botMove() {
  if (game.game_over()) {
    renderBoard();
    return;
  }

  const legalMoves = game.moves({ verbose: true });
  const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  game.move(randomMove);
  selectedSquare = null;
  renderBoard();
}

function onSquareClick(square) {
  if (game.turn() !== 'w' || game.game_over()) {
    return;
  }

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

  selectedSquare = null;
  renderBoard();
  window.setTimeout(botMove, 450);
}

newGameButton.addEventListener('click', () => {
  game.reset();
  selectedSquare = null;
  renderBoard();
});

renderBoard();
