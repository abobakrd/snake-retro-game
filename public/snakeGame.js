// board config
let bw = 500;
let bh = 500;
let cSize = 10;
let sqrB = (bw / cSize) * (bh / cSize);

let board = document.createElement('div');
board.id = 'board';
board.style.width = bw + 'px';
board.style.height = bh + 'px';

let snake = document.createElement('div');
snake.className = 'snake';
snake.id = 'n-1';
board.appendChild(snake);
document.body.appendChild(board);
snake = document.querySelectorAll('.snake');

let snakeDir = 'right';
let snakePos = [{ x: 0, y: 0 }];

window.onkeydown = e => {
   e.preventDefault();
   switch (e.key) {
      case 'ArrowUp' || 'w':
         snakeDir = 'up';
         break;
      case 'ArrowDown' || 's':
         snakeDir = 'down';
         break;
      case 'ArrowLeft' || 'a':
         snakeDir = 'left';
         break;
      case 'ArrowRight' || 'd':
         snakeDir = 'right';
         break;
   }
}


let foodPos = [];
function GenerateFood() {

   let maxFood = Math.floor(sqrB - (sqrB / 3));
   let minFood = Math.floor(sqrB / 4);
   let foodCount = Math.floor(Math.random() * (maxFood - minFood) + minFood);
   foodCount = 500;

   function RndPos() {
      let x = Math.floor(Math.random() * (bw / cSize)) * 10;
      let y = Math.floor(Math.random() * (bh / cSize)) * 10;
      return { x, y };
   }

   function m(pos) {
      return pos.x + pos.y;
   }

   let r = 0;
   let maxTries = 10;
   Array(foodCount).fill(0).forEach((_, i) => {
      let np = RndPos();
      let checkDone = false;
      let cellTaken = false;

      let medianI = 0;

      if (i > 1) {
         medianI = foodPos[Math.floor(foodPos.length / 2)];
         if (m(medianI) < m(np)) medianI = 0;
      }

      while (!checkDone && i > 0) {
         r++;
         if (r > maxTries) break;
         console.log('r', r);
         for (let j = medianI; j < foodPos.length; j++) {

            if (i === foodCount && j - 2 === i) debugger;

            let p = foodPos[j];
            if (p.x === np.x && p.y === np.y) {
               cellTaken = true;
               np = RndPos();
               break;
            }
         }
         if (!cellTaken) checkDone = true;
      }

      foodPos.push(np);

      // min to max sort
      if (i > 0) {
         foodPos.sort((a, b) => m(a) - m(b));
      }

      let food = document.createElement('div');
      food.style.left = np.x + 'px';
      food.style.top = np.y + 'px';
      food.className = 'food';
      board.appendChild(food);
   });
}

GenerateFood();

setInterval(() => {
   let x = snakePos[0].x;
   let y = snakePos[0].y;

   switch (snakeDir) {
      case 'up':
         y -= cSize;
         break;
      case 'down':
         y += cSize;
         break;
      case 'left':
         x -= cSize;
         break;
      case 'right':
         x += cSize;
         break;
   }

   if (x < 0 || x > bw || y < 0 || y > bh) {
      x = 0;
      y = 0;
   }

   snakePos[0] = { x, y };

   function ExtendSnake() {
      let newSnakeNode = document.createElement('div');
      newSnakeNode.className = 'snake';
      newSnakeNode.id = 'n-' + (snake.length + 1);
      board.appendChild(newSnakeNode);
      snake = board.querySelectorAll('.snake');
      console.log(snake);
   }

   function IsEating(pos) {
      return pos.x === x && pos.y === y;
   }

   // check if snake is colliding with food positions
   for (let i = 0; i < foodPos.length; i++) {
      if (IsEating(foodPos[i])) {
         ExtendSnake();
         debugger;
         document.querySelectorAll('.food')[i].remove();
         foodPos.splice(i, 1);
         snakePos.push(snakePos[snakePos.length - 1]);
         break;
      }
   }

   snake.forEach((_, i) => {
      debugger;
      let p = snakePos[i];
      snake[i].style.left = p.x + 'px';
      snake[i].style.top = p.y + 'px';
   });
}, 500);