import React, { useContext, useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { signInAnonymously, signOut } from "firebase/auth";
import { setDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../../context/auth';

const LoginAnonymouslyForm = () => {
   const [username, setUsername] = useState('');
   const [usernameExists, setUsernameExists] = useState(true);
   const [formMsg, setFormMsg] = useState('');
   const [usernameFormStatus, setUsernameFormStatus] = useState({ msg: '', className: '' });

   const { AuthContext_SetDbUser } = useContext(AuthContext);

   async function handleAddUser(e) {
      e.preventDefault();

      if (!username) {
         setFormMsg('Please set a username');
         return;
      }

      if (usernameExists) {
         setFormMsg('Username is not available');
         return;
      }

      let userCredentials = null;

      try {
         userCredentials = await signInAnonymously(auth);
      } catch (error) {
         console.log('couldnt create user: ', error);
         return;
      }

      console.log('signed in:', userCredentials);

      let data = {
         username: username,
         createdAt: serverTimestamp(),
         uid: userCredentials.user.uid,
      }

      try {
         // set username in usernames collection
         await setDoc(doc(db, 'usernames', username), data);
      } catch (error) {
         console.log('couldnt set username: ', error);
         signOut(auth);
         return;
      }

      // set user in users collection
      delete data.uid;

      try {
         await setDoc(doc(db, 'users', userCredentials.user.uid), data);
      } catch (error) {
         console.log('couldnt set user: ', error);
         signOut(auth);
         return;
      }

      // set user in AuthContext
      AuthContext_SetDbUser(data);
   }

   function handleUsername(e, s) {
      if(s === undefined) e.preventDefault();

      console.log('ok');

      const _username = e.target.value;
      setUsername(prevUsername => {
         console.log('hello');
         if (_username === prevUsername) {
            return prevUsername;
         }

         if (_username.length > 5) {
            console.log('e');
            getDoc(doc(db, 'usernames', _username)).then(doc => {
               if (!doc.exists()) {
                  setUsernameExists(false);
                  setUsernameFormStatus({ msg: 'Available!', className: 'is-valid' });
               } else {
                  setUsernameExists(true);
                  setUsernameFormStatus({ msg: 'Username already exists', className: 'warning' })
               }
            });
         } else {
            setUsernameFormStatus({ msg: '', className: '' });
         }

         return _username;
      });
   }

   useEffect(() => {
      console.log('loginAnonymosuly rendered');
      handleUsername({ target: { value: 'test' } }, 'test');
   }, []);

   return (
      <div>
         <h1>Sign in anonymously</h1>
         <div>Anonymous login expires when you restart your browser.</div>
         <form onSubmit={handleAddUser}>
            <div className="inputContainerStatus">
               <input style={{ borderRadius: usernameFormStatus.msg === '' ? '6px' : '6px 6px 0 0' }} type="text" name="username" placeholder="username" onChange={handleUsername} value={username} />
               {usernameFormStatus.msg && <div className={usernameFormStatus.className + ' badge-sm'}>{usernameFormStatus.msg}</div>}
            </div>
            <div className="badge-info-sm">Username must be longer then 5 characters and only consist of characters, numbers and/or underscores.</div>
            <button className="btn-md w-100">Start playing</button>
         </form>
         <div className="error">{formMsg}</div>
      </div>
   );
}

export default LoginAnonymouslyForm;