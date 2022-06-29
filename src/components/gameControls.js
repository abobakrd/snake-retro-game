import React, { useEffect, useState, useContext, useRef, useCallback, createContext } from 'react';
import useInterval from './useInterval';

import Game, { GAME_STATUS, maxTries, maxBh, maxBw } from './game';
import Leaderboard from './leaderboard';
import PersonalScoreBoard from './personalScoreboard';

import { onSnapshot, addDoc, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

import { AuthContext } from '../context/auth';

let c = 0;


const GameControls = () => {
   const { user, dbUser } = useContext(AuthContext);

   const isMountedRef = useRef(false);
   const gameStartedRef = useRef(false);
   const clickedPastIntroRef = useRef(false);

   const [gameSession, setGameSession] = useState(
      {
         status: GAME_STATUS.STOPPED,
         level: 1,
         score: 0,
         timeStarted: new Date(),
         time: 0,
         tries: 0,
         mode: '',
         invertPosAtBoundMode: false,
      }
   );
   const [personalScores, setPersonalScores] = useState([]);
   const [leaderboard, setLeaderboard] = useState([]);
   const [personalRecordScore, setPersonalRecordScore] = useState(0);

   const dbGamesListenerRef = useRef(false);
   const dbListener_Leaderboard = useRef(false);



   useEffect(() => {
      if (!isMountedRef.current) {
         isMountedRef.current = true;

         //personal leaderboard
         getDocs(collection(db, 'users', user.uid, 'games')).then(docs => {
            let docsData = [];
            docs.docs.forEach(doc => docsData.push(doc.data()));
            // sort score high to low
            docsData.sort((a, b) => b.score - a.score);
            setPersonalScores(docsData);
         }).catch(err => console.error(err));

         //global leaderboard
         const leaderboardRef = collection(db, 'leaderboard');
         getDocs(leaderboardRef).then(docs => {
            let docsData = [];
            docs.docs.forEach(doc => {
               if (doc.id === user.uid)
                  setPersonalRecordScore(doc.data().score);

               docsData.push(doc.data());
            });

            // sort score high to low
            docsData.sort((a, b) => b.score - a.score);
            setLeaderboard(docsData);
         }).catch(err => console.error(err));

         // listener
         dbListener_Leaderboard.current = onSnapshot(leaderboardRef, (snapshot) => {
            let docsData = [];
            snapshot.forEach(doc => {
               console.log('doc updated: docid: ', doc.id, ' data: ', doc.data());
               if (doc.id === user.uid)
                  setPersonalRecordScore(doc.data().score);

               docsData.push(doc.data());
            });
            // sort score high to low
            docsData.sort((a, b) => b.score - a.score);
            setLeaderboard(docsData);
         });
      }

      return () => {
         // unsubcribe from db path listener
         if (dbGamesListenerRef.current) {
            dbGamesListenerRef.current();
         }
         if (dbListener_Leaderboard.current) {
            dbListener_Leaderboard.current();
         }
      }
   }, []);

   useEffect(() => {
      // window.addEventListener('keydown', e => {
      //    e.preventDefault();
      //    // console.log('keycode:', e.key);
      //    if (e.key === ' ') {
      //       if (gameSession.status === GAME_STATUS.PAUSED) {
      //          setGameSession({ ...gameSession, status: GAME_STATUS.RUNNING });
      //       } else if (gameSession.status === GAME_STATUS.RUNNING) {
      //          setGameSession({ ...gameSession, status: GAME_STATUS.PAUSED });
      //       }
      //    }
      // });

      if (gameSession.status === GAME_STATUS.WON || gameSession.status === GAME_STATUS.GAMEOVER)
         handleGameSaving();
      c++;
      // console.log('gamecontrols c: ', c, 'gameSession: ', gameSession);
   }, [gameSession]);

   function handleGameSaving() {
      let gameData = {
         username: dbUser.username,
         status: gameSession.status,
         time: gameSession.time,
         score: gameSession.score,
         level: gameSession.status === GAME_STATUS.WON ? gameSession.level - 1 : gameSession.level,
      };

      if (gameSession.score > personalRecordScore) {
         console.log('about to save: " ', gameData);
         setPersonalRecordScore(gameSession.score);
         setDoc(doc(db, 'leaderboard', user.uid), gameData).then(() => console.log('personal record updated')).catch(err => console.error(err));
      }

      delete gameData.username;

      console.log('about to save pers dada.t.a.das.da.s', gameData);

      const userGamesColl = collection(db, 'users', user.uid + '/games');
      addDoc(userGamesColl, gameData)
         .then(r => {
            console.log(r);

            if (dbGamesListenerRef.current) return;
            dbGamesListenerRef.current = onSnapshot(userGamesColl, (querySnapshot) => {
               let docsData = [];
               querySnapshot.forEach(doc => docsData.push(doc.data()));
               // sort score high to low
               // docsData.sort((a, b) => b.score - a.score);

               setPersonalScores(docsData);
            }, err => console.error(err));
         }
         ).catch(err => console.error(err));
   }

   const newGame = (mode, invertPosAtBoundMode) => {
      console.log('new_game: ', mode, invertPosAtBoundMode);

      setGameSession(prevState => (
         {
            ...prevState,
            status: GAME_STATUS.NEWGAME,
            prev_status: prevState.status,
            score: 0,
            mode: mode !== undefined ? mode : gameSession.mode !== '' ? gameSession.mode : 'classic',
            invertPosAtBoundMode: invertPosAtBoundMode !== undefined ? invertPosAtBoundMode : gameSession.invertPosAtBoundMode,
         }));
   }

   function MainGameUI({ children }) {
      const GameOverUI = () => {
         return (
            <div className="game-over">
               <h1>Game Over 😔</h1>
               <p className="badge-info">Your score: {gameSession.score}</p>
               {gameSession.tries - maxTries === 0 ? <p className="badge-warning">Last try, make it count!</p> : null}
               <button onClick={() => { newGame(); }} className="bg-green">Play again</button>
            </div >
         )
      }

      const WonGameUI = () => {
         const [countdown, setCountdown] = useState(10);
         const countdownInterval = useInterval(() => {
            setCountdown(prevState => prevState - 1);
         }, 1000);

         useEffect(() => {
            if (countdown === 0) {
               newGame();
            }
         }, [countdown]);

         return (
            <div className="game-won">
               <h1>Good job! 😀</h1>
               <p className="badge-info">Your score: {gameSession.score}</p>
               <p className="badge-info bg-black">Level {gameSession.level} starts in {countdown}</p>
               <button className="bg-green" onClick={() => { setCountdown(0); }}>Next level</button>
            </div>
         )
      }

      const SelectGameModeUI = () => {
         return (
            <div className="select-game-mode">
               <h3>Select gamemode</h3>
               <div className="d-flex-spc">
                  <button onClick={() => {
                     newGame('modern');
                  }}>MODERN</button>
                  <button onClick={() => {
                     newGame();
                  }}>CLASSIC</button>
               </div>
            </div>
         );
      }

      const StartGameUI = () => {
         return (
            <div className="start-game">
               <button className="bg-green" onClick={() => {
                  if (gameSession.mode === '') {
                     setGameSession({ ...gameSession, status: GAME_STATUS.SELECT_MODE });
                  } else {
                     newGame();
                  }
               }}>PLAY</button>
            </div>
         )
      }

      const GameModeBar = () => {

         function changeGameMode() {
            let newMode = gameSession.mode === 'classic' ? 'modern' : 'classic';
            setGameSession({ ...gameSession, mode: newMode, status: GAME_STATUS.SELECT_MODE });
         }

         function changeInvertPosAtBoundMode() {
            setGameSession({ ...gameSession, invertPosAtBoundMode: !gameSession.invertPosAtBoundMode });
         }

         return (
            <div className="game-mode-bar">
               <div className="game-mode-bar-item">
                  <h3>Mode: {gameSession.mode}</h3>
                  <button onClick={changeGameMode}>SWITCH TO {gameSession.mode === 'classic' ? 'modern' : 'classic'} </button>
               </div>
               <div className="game-mode-bar-item">
                  <h3>Wallhack</h3>
                  <button onClick={changeInvertPosAtBoundMode}>{gameSession.invertPosAtBoundMode ? 'turn off' : 'turn on'}</button>
               </div>
            </div >
         );
      };

      return (
         <div className="mainGameUI" style={{ width: maxBw + 'px' }}>
            {gameSession.status === GAME_STATUS.RUNNING || gameSession.status === GAME_STATUS.PAUSED ? null : <GameModeBar/>}
            {gameSession.status === GAME_STATUS.GAMEOVER ? <GameOverUI /> : null}
            {gameSession.status === GAME_STATUS.WON ? <WonGameUI /> : null}
            {gameSession.status === GAME_STATUS.STOPPED ? <StartGameUI /> : null}
            {gameSession.status === GAME_STATUS.SELECT_MODE ? <SelectGameModeUI /> : null}
            {children}
         </div>
      );
   }

   const GameControllersBar = () => (
      <div className="game-controls-bar d-flex-spc">
         {
            gameSession.status === GAME_STATUS.RUNNING || gameSession.status === GAME_STATUS.PAUSED
               ?
               <React.Fragment>
                  <button style={{ background: gameSession.status === GAME_STATUS.PAUSED ? 'green' : 'grey' }} onClick={() => { setGameSession({ ...gameSession, status: gameSession.status === GAME_STATUS.PAUSED ? GAME_STATUS.RUNNING : GAME_STATUS.PAUSED }); }}>{gameSession.status === GAME_STATUS.PAUSED ? 'Resume' : 'Pause'}</button>
                  <button style={{ background: 'red', borderLeft: '4px solid black' }} onClick={() => { setGameSession({ ...gameSession, status: GAME_STATUS.STOPPED }); }}>Stop</button>
               </React.Fragment>
               : null
         }
      </div>
   );

   return (
      <div className="game-controls">
         <div className="game-controls-main">
            <PersonalScoreBoard scores={personalScores} />
            <MainGameUI>
               <Game setGameSess={setGameSession} gameSess={gameSession} />
               <GameControllersBar />
            </MainGameUI>
            <Leaderboard scores={leaderboard} />
         </div>
      </div>
   );
}
export default GameControls;