/*
TODO
grid background
update ui 
  -leaderboard
  -buttons for retry, theme select.
game over when reach the top
store session leader board in local memory
*/

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);
// context.fillStyle = '#000';
// context.fillRect(0, 0, canvas.width, canvas.height);
const score = document.getElementById('score');
const level = document.getElementById('level');
const player = {
  pos: {x: 3, y: 0},
  tetromino: assignTetromino(),
  preview: assignTetromino()
}
const arena = createMatrix(10, 20)

const background = arena.map((subArr) => {
  return subArr.map((value, i) => {
    return i % 2 ? -1 : -2;
  })
});

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, 10, 20);
  context.fillStyle = '#000';
  context.fillRect(10, 0, 7, 20);
  context.fillStyle = '#000';
  context.fillRect(11, 1, 5, 6);
  drawMatrix(player.preview, {x: 12, y: 2});
  drawMatrix(background);
  drawMatrix(arena);
  drawMatrix(player.tetromino, player.pos)
}

function drawMatrix(matrix, offset = {x: 0, y: 0}) {
  const colorArray = [null, '#FFC700', '#E86C0C', '#FF0000', '#AD0CE8', '#1224FF', '#353535', '#303030']
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0 && y + offset.y >= 0) {
        context.fillStyle = colorArray.at(value);
        context.fillRect(x + offset.x, y + offset.y, 1, 1)
      }
    })
  })
}

function dropPlayer() {
  if (gameOver) return;
  player.pos.y++;
  if (detectCollision(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    clearLines();
    player.tetromino = player.preview;
    player.preview = assignTetromino();
    player.pos.y = -(player.tetromino.length);
    player.pos.x = 3;
    dropPlayer();
  }
  dropCounter = 0;
}

function clearLines() {
  if (!arena.some(row => row.every(el => el !== 0))) return;
  let lineCount = 0;
  //check if any row is all 1s
  for (let y = arena.length - 1; y >= 0; y--) {
    if (arena[y].every(el => el !== 0)) {
      lineCount++;
      arena.splice(y, 1);
    }
  }
  for (let i = 1; i <= lineCount; i++) {
    arena.unshift(new Array(arena[0].length).fill(0));
  }
  increaseScore(lineCount);
  increaseLevel(lineCount);
}

let lineCounter = 0;
function increaseLevel(lineCount) {
  if (+level.textContent >= 15) return;
  lineCounter += lineCount;
  if (lineCounter >= 10) {
    level.textContent = +level.textContent + 1;
    dropInterval /= 1.25;
  }
  lineCounter = lineCounter % 10;
}

function increaseScore(lineCount) {
  const scoreTable = [0, 100, 300, 500, 800];
  score.textContent = +score.textContent + (scoreTable[lineCount] * +level.textContent);
}

function assignTetromino() {
  const tetrominoArray = [
    [
      [0,0,0],
      [1,1,1],
      [0,1,0]
    ],
    [
      [1,1],
      [1,1]
    ],
    [
      [0,1,0],
      [0,1,0],
      [0,1,0],
      [0,1,0],
    ],
    [
      [0,1,0,0],
      [0,1,1,0],
      [0,0,1,0]
    ],
    [
      [0,0,1,0],
      [0,1,1,0],
      [0,1,0,0]
    ],
    [
      [0,1,0],
      [0,1,0],
      [1,1,0],
    ],
    [
      [0,1,0],
      [0,1,0],
      [0,1,1],
    ]
  ]
  // return tetrominoArray[2]; //straight piece for testing
  const color = Math.ceil(Math.random() * 5);
  const template = tetrominoArray[Math.floor(Math.random() * tetrominoArray.length)];
  output = template.map(row => row.map(value => value === 1 ? color : 0));
  return output;
}

function createMatrix(x, y) {
  const matrix = [];
  for (let i = 0; i < y; i++) {
    matrix.push(new Array(x).fill(0))
  }
  return matrix;
}

function merge(arena, player) {
  player.tetromino.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        if (y + player.pos.y < 0) {
          endGame();
          return;
        }
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
}

let gameOver = false;
function endGame() {
  console.log('game over')
  gameOver = true;
}



function detectCollision(arena, player) {
  const [t, p] = [player.tetromino, player.pos];
  for (let y = 0; y < t.length; y++) {
    for (let x = 0; x < t[y].length; x++) {
      if (y + p.y >= 0 && t[y][x] !== 0 &&
        (arena[y + p.y] &&
        arena[y + p.y][x + p.x]) !== 0) {
        return true
        }
    }
  }
  return false;
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    dropPlayer();
  }
  draw();
  if (!gameOver) requestAnimationFrame(update);
}

function rotateTetromino(count) {
  while (count--) {
    const newTetromino = [];
    for (let y = 0; y < player.tetromino[0].length; y++) {
      newTetromino.push([]);
    }
    for (let y = player.tetromino.length - 1; y >= 0; y--) {
      for (let x = 0; x < player.tetromino[y].length; x++) {
        newTetromino[x].push(player.tetromino[y][x]);
      }
    }
    player.tetromino = newTetromino;
  }
}

document.addEventListener('keydown', event => {
  switch (event.code) {
    case "ArrowLeft":
    case "KeyA":
      player.pos.x--;
      if (detectCollision(arena, player)) {
        player.pos.x++;
      }
      break;
    case "ArrowRight":
    case "KeyD":
      player.pos.x++;
      if (detectCollision(arena, player)) {
        player.pos.x--;
      }
      break;
    case "ArrowDown":
    case "KeyS":
      dropPlayer();
      break;
    case "KeyQ":
    case "PageUp": //counter clockwise
    case "KeyE":
    case "PageDown": {//clockwise
      let direction;
      if (event.code === "PageUp" || event.code === "KeyQ") {
        direction = "ccw";
      } else {
        direction = "cw"
      }
      direction === "ccw" ? rotateTetromino(3) : rotateTetromino(1);
      if (detectCollision(arena, player)) {
        direction === "ccw" ? rotateTetromino(1) : rotateTetromino(3);
      }
      break;
    }
    case "Space":
    case "ArrowUp":
    case "KeyW":
      while (!detectCollision(arena, player)) {
        player.pos.y++;
      };
      player.pos.y--;
      dropPlayer(); 
      break;
  }
});

update()