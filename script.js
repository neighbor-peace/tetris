/*
TODO
edge detection
shape rotation function (page up, page down)
new shape after collision
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

const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

const player = {
  pos: {x: 5, y: 0},
  matrix: matrix,
}

const arena = createMatrix(12, 20);

function createMatrix(x, y) {
  const matrix = [];
  for (let i = 0; i < y; i++) {
    matrix.push(new Array(x).fill(0))
  }
  return matrix;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
}

function detectCollision(arena, player) {
  const [m, o] = [player.matrix, player.pos];
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
  drawMatrix(player.matrix, player.pos)
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
  }
  dropCounter = 0;
}

function isOffScreen(player, arena) {
  console.log('test');
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      //if value is 1, check that it's in bounds
      //if not, return false
      if (m[y][x] && (o.x + x < 0 || o.x + x >= arena[0].length)) return true;
    }
  }
  
  return false;
}

document.addEventListener('keydown', event => {
  switch (event.code) {
    case "ArrowLeft":
      player.pos.x--;
      if (isOffScreen(player, arena)) {
        player.pos.x++;
      }
      break;
    case "ArrowRight":
      player.pos.x++;
      if (isOffScreen(player, arena)) {
        player.pos.x--;
      }
      break;
    case "ArrowDown":
      dropPlayer();
      break;
  }
})

update()