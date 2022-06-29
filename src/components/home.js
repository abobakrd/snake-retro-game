import React, { useEffect, useContext } from 'react';
import Login from './login/login'
import GameControls from './gameControls';

// firebase
import { signOut } from '@firebase/auth';
import { auth } from '../firebase';

// context
import { AuthContext } from '../context/auth';

const Home = props => {
   const { user, dbUser, AuthContext_SetDbUser } = useContext(AuthContext);

   const AuthContent = () => {
      return (
         <React.Fragment>
            <header className="d-flex-spc">
               <h1>Retro Snake</h1>
               <img src="/snake-bg.svg"></img>
               <div className="header nav">
                  <div>
                     <p>Welcome {dbUser.username}</p>
                  </div>
                  <div>
                     <button onClick={() => { signOut(auth); }}>Sign Out</button>
                  </div>
               </div>

            </header>
            <GameControls />
         </React.Fragment>
      );
   };

   return (
      <div className="home">
         <AuthContext.Consumer>
            {
               _auth => {
                  if (_auth.user && _auth.dbUser) {
                     return AuthContent();
                  } else {
                     return <Login />;
                  }
               }
            }
         </AuthContext.Consumer>
      </div>
   );
}

export default Home;