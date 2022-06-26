import React, {
   useEffect,
   useState,
   useRef
} from 'react';
import useInterval from './useInterval';

let c = 0;

const isMobile = window.screen.width < 600;
// game specs
let cSize = 20;
const rndNum = () => Math.floor(Math.random() * cSize);
export const maxBw = isMobile ? 380 : 540;
export const maxBh = isMobile ? 380 : 400;
let bw = maxBw;
let bh = maxBh;

let mobileBoardSizes = [{ h: 200, w: 200 }, { h: 260, w: 400 }, { h: 360, w: 600 }];
let desktopBoardSizes = [{ h: 200, w: 200 }, { h: 300, w: 300 }, { h: 400, w: 400 }];

// Game status enums
export const GAME_STATUS = {
   GAMEOVER: 'gameover',
   RUNNING: 'running',
   PAUSED: 'paused',
   WON: 'won',
   STOPPED: 'stopped',
   NEWGAME: 'newgame',
   SELECT_MODE: 'selectmode'
};

let startTime = new Date();
let prevFrameTime = 0;
let clockIntervalId = 0;
let gameClock = 0;
export const maxTries = 3;

let gameObstacles = {
   foods: [],
   speeders: [],
   bombs: [],
   emptyCells: []
}

let snakeDir = 'right';
let snakePositions = [{ left: 0, top: 0 }];

const handleKeyDown = e => {
   e.preventDefault();
   //console.log(('before', e.key, snakeDir));

   //switch stement setting the direction of the snake
   switch (e.key) {
      case 'ArrowUp':
         if (snakeDir !== 'down') snakeDir = 'up';
         break;
      case 'ArrowDown':
         if (snakeDir !== 'up') snakeDir = 'down';
         break;
      case 'ArrowLeft':
         if (snakeDir !== 'right') snakeDir = 'left';
         break;
      case 'ArrowRight':
         if (snakeDir !== 'left') snakeDir = 'right';
         break;
   }
};

function Game({ gameSess, setGameSess }) {

   const isMountedRef = useRef(false);
   const gameStartedRef = useRef(false);

   const [FPS, setFPS] = useState(.1);
   const [frameUpdate, setFrameUpdate] = useState(0);

   const [score, setScore] = useState(0);

   useInterval(() => {
      setFrameUpdate(prevState => {
         return prevState + 1;
      });
   }, gameSess.status === GAME_STATUS.RUNNING ? FPS * 1000 : null);

   function changeGameSess(newSess) {
      console.log('runed');
      if (gameSess.tries >= maxTries && newSess.status === GAME_STATUS.GAMEOVER)
         resetGame();

      setGameSess(
         {
            ...gameSess,
            status: newSess.hasOwnProperty('status') ? newSess.status : gameSess.status,
            score: score,
            level: gameSess.tries >= maxTries && newSess.status === GAME_STATUS.GAMEOVER ? 1 : newSess.status === GAME_STATUS.WON ? gameSess.level + 1 : gameSess.level,
            tries: gameSess.tries >= maxTries ? 0 : newSess.status === GAME_STATUS.GAMEOVER ? gameSess.tries + 1 : gameSess.tries,
            timeStarted: newSess.status === GAME_STATUS.NEWGAME ? new Date() : gameSess.timeStarted,
            time: gameClock,
         }
      );
   }






   ////////////////////////////////////
   ////////////////////////////////////
   ////////////////////////////////////
   // GAME FUNCTIONS
   ////////////////////////////////////
   ////////////////////////////////////
   ////////////////////////////////////

   function handleFrameUpdate() {
      if (gameSess.status !== GAME_STATUS.RUNNING) return;

         if (gameObstacles.foods.length === 0) {
         console.log(('game won!!!!'));
         changeGameSess({ status: GAME_STATUS.WON });
         return;
      }

      let prevPositions = snakePositions;
      let nextPositions = [];

      let x = prevPositions[0].left;
      let y = prevPositions[0].top;

      let foods = gameObstacles.foods;
      if (gameSess.mode === 'classic') {
         let foodPos = foods[0];
         if (x === foodPos.left && y === foodPos.top) {
            gameObstacles.foods[0] = getRandomAvailableCellPos();
            prevPositions.push({ left: x, top: y });
            setScore(score + 1 * gameSess.level);
         }
      } else if (gameSess.mode === 'modern') {
         for (let i = 0; i < foods.length; i++) {
            let fX = foods[i].left;
            let fY = foods[i].top;
            if (x === fX && y === fY) {
               foods.splice(i, 1);
               setScore(score + 1 * gameSess.level);
               gameObstacles.foods = foods;
               // setFPS(prevFPS => (FPS - 0.0002).toFixed(3));
               prevPositions.push({ left: x, top: y });

               break;
            }
         }
      }

      // check if collided with bomb positions
      let bombs = gameObstacles.bombs;
      for (let i = 0; i < bombs.length; i++) {
         let bX = bombs[i].left;
         let bY = bombs[i].top;
         if (x === bX && y === bY) {
            bombs.splice(i, 1);
            gameObstacles.bombs = bombs;
            //console.log(('stepped on landmine'));
            changeGameSess({ status: GAME_STATUS.GAMEOVER });
            return;
         }
      }

      // check if collided with speed positions
      let speeders = gameObstacles.speeders;
      for (let i = 0; i < speeders.length; i++) {
         let sX = speeders[i].left;
         let sY = speeders[i].top;
         if (x === sX && y === sY) {
            speeders.splice(i, 1);
            gameObstacles.speeders = speeders;
            // setFPS(0.1);
            //console.log(('collided with speed increase'));
            break;
         }
      }



      // y0 = top, y1 = bottom, x0 = left, x1 = right
      //update snake direction
      switch (snakeDir) {
         case 'up':
            if (y === 0) {
               if (gameSess.invertPosAtBoundMode) {
                  y = bh - cSize;
               } else {
                  changeGameSess({ status: GAME_STATUS.GAMEOVER });
               }
            } else {
               y -= cSize;
            }
            break;
         case 'down':
            if (y === bh - cSize) {
               if (gameSess.invertPosAtBoundMode) {
                  y = 0;
               } else {
                  changeGameSess({ status: GAME_STATUS.GAMEOVER });
               }
            } else {
               y += cSize;
            }
            break;
         case 'left':
            if (x === 0) {
               if (gameSess.invertPosAtBoundMode) {
                  x = bw - cSize;
               } else {
                  changeGameSess({ status: GAME_STATUS.GAMEOVER });
               }
            } else {
               x -= cSize;
            }
            break;
         case 'right':
            if (x === bw - cSize) {
               if (gameSess.invertPosAtBoundMode) {
                  x = 0;
               } else {
                  changeGameSess({ status: GAME_STATUS.GAMEOVER });
               }
            } else {
               x += cSize;
            }
            break;
      }

      // update snake positions according to next direction
      for (let i = 0; i < prevPositions.length; i++) {
         let np;
         (i === 0)
            ? np = { left: x, top: y }
            : np = { left: prevPositions[i - 1].left, top: prevPositions[i - 1].top };
         nextPositions.push(np);
      }

      if (nextPositions.length > 3) {
         for (let i = 2; i < nextPositions.length; i++) {
            if (nextPositions[0].left === nextPositions[i].left && nextPositions[0].top === nextPositions[i].top) {
               changeGameSess({ status: GAME_STATUS.GAMEOVER });
               return;
            }
         }
      }

      snakePositions = nextPositions;
   }

   function initGameObstacles() {
      console.log('iniiiiit', gameSess);
      if (gameSess.mode === 'classic') {
         console.log('sup');
         gameObstacles.foods = [getRandomAvailableCellPos()];
         return;
      }

      gameObstacles.foods = [];
      gameObstacles.speeders = [];
      gameObstacles.bombs = [];
      gameObstacles.emptyCells = [];

      //log bw, bh and cSize
      // console.log(('bw', bw, 'bh', bh, 'cSize', cSize));

      let numList = new Array(gameSess.level).fill(0).map((x, i) => i);
      let difficulty = {
         foods: numList,
         speeders: numList.splice(0, numList.length / 4),
         bombs: numList.splice(0, numList.length / 3)
      };

      Array(bh / cSize).fill().map((_, row) => {
         Array(bw / cSize).fill().map((_, col) => {
            gameObstacles.emptyCells.push({ left: col * cSize, top: row * cSize });
            if (row <= 0) return;

            if (difficulty.speeders.includes(rndNum())) {
               gameObstacles.speeders.push({ left: col * cSize, top: row * cSize });
            } else if (difficulty.bombs.includes(rndNum())) {
               gameObstacles.bombs.push({ left: col * cSize, top: row * cSize });
            } else if (difficulty.foods.includes(rndNum())) {
               gameObstacles.foods.push({ left: col * cSize, top: row * cSize });
            }
         });
      });
   }





   ////////////////////////////////////
   ////////////////////////////////////
   ////////////////////////////////////
   // STATE UPDATES
   ////////////////////////////////////
   ////////////////////////////////////
   ////////////////////////////////////

   useEffect(() => {
      if (!isMountedRef.current) {
         isMountedRef.current = true;
         window.onkeydown = handleKeyDown;
      }
   }, []);

   useEffect(() => {
      if (frameUpdate === 0) {
         startTime = new Date();
         prevFrameTime = startTime;
      } else {
         //console.log(('time since last frame: ', (new Date() - prevFrameTime) / 1000, ' ms'));
         prevFrameTime = new Date();
      }

      handleFrameUpdate();
   }, [frameUpdate]);

   useEffect(() => {
      // console.log('game c: ', c, 'gameSess: ', gameSess, 'bw: ', bw, 'bh: ', bh, 'cSize: ', cSize);

      handleGameClock();
      handleLevelUpgrade();

      if (gameSess.status === GAME_STATUS.NEWGAME) {
         newGame();
      }
   }, [gameSess]);



   function handleGameClock() {
      if (gameSess.status === GAME_STATUS.RUNNING) {
         if (!clockIntervalId) {
            clockIntervalId = setInterval(() => {
               gameClock += 1;
            }, 1000);
         }
      } else if (gameSess.status === GAME_STATUS.PAUSED) {
         clearInterval(clockIntervalId);
         clockIntervalId = undefined;
      } else {
         clearInterval(clockIntervalId);
         clockIntervalId = undefined;
         gameClock = 0;
      }
   }

   function handleLevelUpgrade() {

      return;
      let boardSizeIndex = gameSess.level > mobileBoardSizes.length
         ? mobileBoardSizes.length - 1
         : gameSess.level - 1;

      if (bw < maxBw && bh < maxBh) {
         bw = isMobile ? mobileBoardSizes[boardSizeIndex].w : desktopBoardSizes[boardSizeIndex].h;
         bh = isMobile ? mobileBoardSizes[boardSizeIndex].w : desktopBoardSizes[boardSizeIndex].h;
      }
   }




   ////////////////////////////////////
   ////////////////////////////////////
   ////////////////////////////////////
   // HELPER FUNCTIONS
   ////////////////////////////////////
   ////////////////////////////////////
   ////////////////////////////////////
   function newGame() {
      console.log('new game');
      if (!gameStartedRef.current) gameStartedRef.current = true;
      setScore(0);
      initGameObstacles();
      snakePositions = [{ left: 0, top: 0 }];
      snakeDir = 'right';
      setGameSess(prevState => ({ ...prevState, status: GAME_STATUS.RUNNING }));
   }

   function resetGame() {
      snakePositions = [{ left: 0, top: 0 }];
      startTime = new Date();
      prevFrameTime = 0;
      clockIntervalId = 0;
      gameClock = 0;
      bw = maxBw;
      bh = maxBh;
   }

   function formatGameTime() {
      let s = gameClock;
      let m = Math.floor(s / 60);
      let r = s % 60;
      return `${m < 10 ? '0' + m : m}:${r < 10 ? '0' + r : r}`;
   }

   function getRandomAvailableCellPos() {
      // create array with cSize range of numbers from 0 to bw
      let cellPositionsKeys = {};
      for (let i = 0; i < bw; i += cSize) {
         for (let j = 0; j < bh; j += cSize) {
            cellPositionsKeys[`${i}${j}`] = { x: i, y: j };
         }
      }

      snakePositions.forEach(pos => {
         delete cellPositionsKeys[`${pos.left}${pos.top}`];
      });

      let keys = Object.keys(cellPositionsKeys);
      let randomKey = keys[Math.floor(Math.random() * keys.length)];
      let randomCellPos = { left: cellPositionsKeys[randomKey].x, top: cellPositionsKeys[randomKey].y };

      return randomCellPos;
   }





   ////////////////////////////////////
   ////////////////////////////////////
   ////////////////////////////////////
   /*          COMPONENTS            */
   ////////////////////////////////////
   ////////////////////////////////////
   ////////////////////////////////////
   function Snake() {
      let snakeHeadRot;
      switch (snakeDir) {
         case 'up':
            snakeHeadRot = 270;
            break;
         case 'down':
            snakeHeadRot = 90;
            break;
         case 'left':
            snakeHeadRot = 180;
            break;
         case 'right':
            snakeHeadRot = 0;
            break;
      }
      //console.log(('snakeDir (inside snake comp): ', snakeDir));
      return (
         <React.Fragment>
            {snakePositions.map((snake, i) => {
               let i0 = i === 0;
               return (
                  <div
                     className="snake"
                     key={Math.random().toString()}
                     style={{
                        left: snake.left + 'px',
                        top: snake.top + 'px',
                        width: cSize + 'px',
                        height: cSize + 'px',
                        background: i0 ? '#353735' : 'black',
                        transform: i0 ? 'rotate(' + snakeHeadRot + 'deg)' : 'none',
                        WebkitTransform: i0 ? 'rotate(' + snakeHeadRot + 'deg)' : 'none'
                     }}>{i === 0 ? '>' : ''}</div>
               );
            })}
         </React.Fragment>
      );
   }

   function Cell({ classname, pos, innerText }) {
      return (
         <div className={classname ? 'cell ' + classname : 'cell'} style={{ left: pos.left + 'px', top: pos.top + 'px', width: cSize + 'px', height: cSize + 'px' }}>{innerText}</div>
      );
   }

   function Gameboard() {
      return (
         <div className="gameboard" style={{ position: 'relative', marginTop: '50px', margin: 'auto', width: bw + 'px', height: bh + 'px' }}>
            <Snake />
            {/* {gameObstacles.emptyCells.map(pos => <Cell key={Math.random().toString()} pos={pos} innerText={''} />)} */}
            {gameObstacles.foods.map(pos => <Cell key={Math.random().toString()} pos={pos} classname="food" innerText={'🐭'} />)}
            {gameObstacles.bombs.map(pos => <Cell key={Math.random().toString()} pos={pos} classname='bomb' innerText={'💣'} />)}
            {gameObstacles.speeders.map(pos => <Cell key={Math.random().toString()} pos={pos} classname='bomb' innerText={'⏩'} />)}
         </div>
      );
   }

   const TopBar = () => (
      <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', textAlign: 'center' }}>
         <div className='d-flex-cc' style={{ background: '#00d0b3' }}>
            <h3>Score: {score}</h3>
         </div>
         <div className='d-flex-cc' style={{ background: 'lightgreen' }}>
            <h2>{formatGameTime()}</h2>
         </div>
         <div className="other-info" style={{ background: '#aad3ff' }}>
            <div>
               <h6>Level: {gameSess.level}</h6>
            </div>
            <div>
               <h6>{Array(3 - gameSess.tries).fill(null).map(e => {
                  return <span key={Math.random().toString()}>❤️</span>
               })}</h6>
            </div>
            <div>
               <h6><span>{gameSess.mode}</span> Mode</h6>
            </div>
            <div>
               <h6>Wallhack {gameSess.invertPosAtBoundMode ? 'ON' : 'OFF'}</h6>
            </div>
         </div>
      </div >
   );



   return (
      <React.Fragment>
         {
            gameSess.status === GAME_STATUS.RUNNING || gameSess.status === GAME_STATUS.PAUSED
               ?
               <React.Fragment>
                  <TopBar />
                  <div className="game-board-container" style={{ width: maxBw + 'px', height: maxBh + 'px' }}>
                     <Gameboard />
                  </div>
               </React.Fragment>
               : null

         }
      </React.Fragment>
   );
}

export default Game;