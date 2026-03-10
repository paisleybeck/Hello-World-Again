(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highscoreEl = document.getElementById('highscore');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayMsg = document.getElementById('overlay-msg');

  // Nokia LCD colors
  const BG = '#7b8f4e';
  const FG = '#2b3a1a';
  const FG_LIGHT = '#4a6030';

  // Grid settings — classic Nokia Snake was ~20x20 on a small screen
  const COLS = 20;
  const ROWS = 20;
  const CELL = canvas.width / COLS; // 14px per cell at 280px canvas

  // Game state
  let snake, dir, nextDir, food, score, highscore, speed, gameLoop, state;

  highscore = parseInt(localStorage.getItem('snakeHi') || '0', 10);
  highscoreEl.textContent = highscore;

  function init() {
    const midX = Math.floor(COLS / 2);
    const midY = Math.floor(ROWS / 2);
    snake = [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    speed = 140;
    scoreEl.textContent = score;
    placeFood();
  }

  function placeFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  function drawCell(x, y) {
    // Draw a blocky pixel with a slight inner gap for the LCD grid look
    const gap = 1;
    ctx.fillRect(
      x * CELL + gap,
      y * CELL + gap,
      CELL - gap * 2,
      CELL - gap * 2
    );
  }

  function draw() {
    // Clear with LCD background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border walls
    ctx.fillStyle = FG;
    for (let i = 0; i < COLS; i++) {
      drawCell(i, 0);
      drawCell(i, ROWS - 1);
    }
    for (let i = 1; i < ROWS - 1; i++) {
      drawCell(0, i);
      drawCell(COLS - 1, i);
    }

    // Draw food — a small square
    ctx.fillStyle = FG;
    const fx = food.x * CELL + CELL / 2;
    const fy = food.y * CELL + CELL / 2;
    const fs = CELL * 0.35;
    ctx.fillRect(fx - fs, fy - fs, fs * 2, fs * 2);

    // Draw snake
    ctx.fillStyle = FG;
    snake.forEach((seg) => {
      drawCell(seg.x, seg.y);
    });
  }

  function update() {
    dir = { ...nextDir };

    const head = {
      x: snake[0].x + dir.x,
      y: snake[0].y + dir.y,
    };

    // Wall collision (inside the border)
    if (head.x <= 0 || head.x >= COLS - 1 || head.y <= 0 || head.y >= ROWS - 1) {
      gameOver();
      return;
    }

    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      placeFood();

      // Speed up slightly every 50 points
      if (score % 50 === 0 && speed > 60) {
        speed -= 10;
        clearInterval(gameLoop);
        gameLoop = setInterval(tick, speed);
      }
    } else {
      snake.pop();
    }
  }

  function tick() {
    update();
    if (state === 'playing') {
      draw();
    }
  }

  function startGame() {
    init();
    state = 'playing';
    overlay.classList.add('hidden');
    draw();
    gameLoop = setInterval(tick, speed);
  }

  function gameOver() {
    state = 'over';
    clearInterval(gameLoop);

    if (score > highscore) {
      highscore = score;
      localStorage.setItem('snakeHi', highscore);
      highscoreEl.textContent = highscore;
    }

    overlayTitle.textContent = 'GAME OVER';
    overlayMsg.textContent = `Score: ${score}\nPress any key to retry`;
    overlay.classList.remove('hidden');
  }

  function showMenu() {
    state = 'menu';
    overlayTitle.textContent = 'SNAKE II';
    overlayMsg.textContent = 'Press any key to start';
    overlay.classList.remove('hidden');
    draw();
  }

  // Input handling
  function setDirection(dx, dy) {
    // Prevent reversing into yourself
    if (dir.x === -dx && dir.y === -dy) return;
    nextDir = { x: dx, y: dy };
  }

  function handleInput(action) {
    if (state !== 'playing') {
      startGame();
      return;
    }

    switch (action) {
      case 'up':    setDirection(0, -1); break;
      case 'down':  setDirection(0, 1);  break;
      case 'left':  setDirection(-1, 0); break;
      case 'right': setDirection(1, 0);  break;
    }
  }

  // Keyboard
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key)) {
      e.preventDefault();
    }

    if (state !== 'playing') {
      startGame();
      return;
    }

    switch (key) {
      case 'ArrowUp':    case 'w': case 'W': handleInput('up');    break;
      case 'ArrowDown':  case 's': case 'S': handleInput('down');  break;
      case 'ArrowLeft':  case 'a': case 'A': handleInput('left');  break;
      case 'ArrowRight': case 'd': case 'D': handleInput('right'); break;
    }
  });

  // D-pad buttons
  document.getElementById('btn-up').addEventListener('mousedown',    () => handleInput('up'));
  document.getElementById('btn-down').addEventListener('mousedown',  () => handleInput('down'));
  document.getElementById('btn-left').addEventListener('mousedown',  () => handleInput('left'));
  document.getElementById('btn-right').addEventListener('mousedown', () => handleInput('right'));

  document.getElementById('btn-up').addEventListener('touchstart',    (e) => { e.preventDefault(); handleInput('up'); });
  document.getElementById('btn-down').addEventListener('touchstart',  (e) => { e.preventDefault(); handleInput('down'); });
  document.getElementById('btn-left').addEventListener('touchstart',  (e) => { e.preventDefault(); handleInput('left'); });
  document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('right'); });

  // Swipe controls for mobile
  let touchStartX = 0;
  let touchStartY = 0;

  canvas.addEventListener('touchstart', (e) => {
    if (state !== 'playing') {
      startGame();
      return;
    }
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      handleInput(dx > 0 ? 'right' : 'left');
    } else {
      handleInput(dy > 0 ? 'down' : 'up');
    }
  }, { passive: true });

  // Also allow clicking/tapping the overlay to start
  overlay.addEventListener('click', () => {
    if (state !== 'playing') {
      startGame();
    }
  });

  // Initialize
  init();
  showMenu();
  draw();
})();
