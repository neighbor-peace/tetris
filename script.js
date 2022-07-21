/*
TODO
game over when reach the top
clear row when filled
  -delete row
  -unshift new row
score display
increase speed with score
instant drop (space bar)

new color for each shape
square outlines
theme select
*/

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);
context.fillStyle = '#000';
context.fillRect(0, 0, canvas.width, canvas.height);

const player = {
  pos: {x: 5, y: 0},
  tetromino: assignTetromino(),
}

const arena = createMatrix(12, 20);

function assignTetromino() {
  //create array of tetrominos
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
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0],
      [0,0,1,0,0]
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
  //return tetromino from random index
  return tetrominoArray[Math.floor(Math.random() * tetrominoArray.length)];
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
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
}

function detectCollision(arena, player) {
  const [m, o] = [player.tetromino, player.pos];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 &&
        (arena[y + o.y] &&
        arena[y + o.y][x + o.x]) !== 0) {
        return true
        }
    }
  }
  return false;
}

function drawMatrix(matrix, offset = {x: 0, y: 0}) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = 'red';
        context.fillRect(x + offset.x, y + offset.y, 1, 1)
      }
    })
  })
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena);
  drawMatrix(player.tetromino, player.pos)
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
  requestAnimationFrame(update);
}

function dropPlayer() {
  player.pos.y++;
  if (detectCollision(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    player.pos.y = 0;
    player.pos.x = 5;
    player.tetromino = assignTetromino();
  }
  dropCounter = 0;
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
      player.pos.x--;
      if (detectCollision(arena, player)) {
        player.pos.x++;
      }
      break;
    case "ArrowRight":
      player.pos.x++;
      if (detectCollision(arena, player)) {
        player.pos.x--;
      }
      break;
    case "ArrowDown":
      dropPlayer();
      break;
    case "PageUp": //counter clockwise
    case "PageDown": //clockwise
      event.code === "PageUp" ? rotateTetromino(3) : rotateTetromino(1);
      if (detectCollision(arena, player)) {
        event.code === "PageUp" ? rotateTetromino(1) : rotateTetromino(3);
      }
      break;
  }
});

update()