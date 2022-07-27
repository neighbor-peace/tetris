/*
TODO
update font to retro style
track lines
set preview to seperate canvas
-center canvas in stylized div (black background)
update ui 
store session leader board in local memory

Nametris
Leaderboard of names with social security numbers
name points
name level


increase size
position game arena in middle

styling
pause button
let player toggle guidelines on
include line count
animate line clears (inside out, remove one pixel at a time)
flash background on a tetris 
fading popups for when scoring
  -nice <name> clear!
  -<name>tris!
*/
const score = document.getElementById('score');
const level = document.getElementById('level');

let player;
let arena;
let lineCounter = 0;
let gameOver = false;



function initialize() {
  console.log('initializing')
  arena = createMatrix(10, 20);
  player = {
    pos: {x: 3, y: null},
    tetromino: assignTetromino(),
    preview: assignTetromino()
  }
  player.pos.y = player.tetromino.length > 2 ? -1 : 0;
  level.textContent = 1;
  score.textContent = 0;
}
initialize();

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);
const guideLines = arena.map((subArr) => {
  return subArr.map((value, i) => {
    return i % 2 ? -1 : -2;
  })
});
const buttons = document.querySelectorAll('button');
buttons.forEach((button) => {
  button.addEventListener('click', handleButton);
});
const previewArea = createMatrix(7, 20);

function draw() {
  // drawMatrix(previewArea, {x: 10, y: 0})
  context.fillStyle = '#000';
  context.fillRect(0, 0, 10, 20);
  context.fillStyle = '#333';
  context.fillRect(10, 0, 10, 20);
  drawMatrix(player.preview, {x: 12, y: 2});
  // drawMatrix(guideLines);
  drawMatrix(arena);
  drawMatrix(player.tetromino, player.pos)
}


function handleButton(e) {
  const button = e.target;
  switch (button.className) {
    case 'theme-select':
      selectedColor = button.value;
      break;
    case 'retry':
      console.log('retry');
      gameOver = false;
      initialize();
      update();
      break;
  }
}


function drawMatrix(matrix, offset = {x: 0, y: 0}) {
  const colorMatrix = [
    //usa
    [null, '#c15447', '#5250fd', '#fffeff'],
    //blue
    [null, '#5d5dfd', '#7bbafe', '#fcfeff'], 
    //green
    [null, '#299d19', '#9ddb25', '#fcfffb'],
    //soviet
    [null, '#716f73', '#be4438', '#FFD8D8'],
    //purple
    [null, '#ae40d6', '#f277ff', '#fffdff'],
    //cool
    [null, '#504efc', '#74e850', '#fefffd'],
    //pastel
    [null,'#c04192', '#5ee396', '#fdfeff'],
    //pastel cool
    [null, '#a8a6fe', '#61e299', '#fffefd'],
    //gold
    [null, '#c35045', '#eaaa44', '#FFD8D8'],
    //dark cool
    [null, '#7d1e59', '#8640ff', '#b9a3de']
  ]
  const colorArray = colorMatrix[(level.textContent - 1) % 10]
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0 && y + offset.y >= 0) {
        context.fillStyle = colorArray.at(value);
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
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
    player.pos.y = player.tetromino.length > 2 ? -3 : -2;
    player.pos.x = 3;
    dropPlayer();
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

function increaseLevel(lineCount) {
  lineCounter += lineCount;
  if (lineCounter >= 10) {
    level.textContent = +level.textContent + 1;
    dropInterval /= 1.1;
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
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0]
    ],
    [
      [0,1,1],
      [1,1,0]
    ],
    [
      [1,1,0],
      [0,1,1]
    ],
    [
      [0,0,0],
      [1,1,1],
      [0,0,1]
    ],
    [
      [0,0,0],
      [1,1,1],
      [1,0,0]
    ]
  ]
  // return tetrominoArray[2]; //straight piece for testing
  const color = Math.ceil(Math.random() * 3);
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
  console.log('updating')
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
  let offset = 1;
  const pos = player.pos.x;
  while (detectCollision(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.tetromino[0].length) {
      player.pos.x = pos;
      return;
    }
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
      direction = event.code === "PageUp" || event.code === "KeyQ" ? "ccw" : "cw";
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
update();