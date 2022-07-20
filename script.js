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
  pos: {x: 5, y: 5},
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
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
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
  }
  dropCounter = 0;
}

document.addEventListener('keydown', event => {
  console.log(event);
  switch (event.code) {
    case "ArrowLeft":
      player.pos.x--;
      break;
    case "ArrowRight":
      player.pos.x++;
      break;
    case "ArrowDown":
      dropPlayer();
      break;
  }
})

update()