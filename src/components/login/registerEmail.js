import React, { useContext, useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { setDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../../context/auth';

const RegisterEmailForm = () => {
   const [username, setUsername] = useState('');
   const [usernameExists, setUsernameExists] = useState(true);
   const [formMsg, setFormMsg] = useState('');
   const [usernameFormStatus, setUsernameFormStatus] = useState({ msg: '', className: '' });

   const { AuthContext_SetDbUser } = useContext(AuthContext);

   async function handleRegister(e) {
      e.preventDefault();

      if (auth['currentUser'] !== null)
         signOut(auth);

      const email = e.target.email.value;
      const password = e.target.password.value;

      console.log(email, password);

      if (!email || !password || !username || usernameExists) {
         setFormMsg('Some fields are missing and/or username is not available, please check and try again.');
         return;
      }

      try {
         const snapshot = await createUserWithEmailAndPassword(auth, email, password);
         let data = {
            username,
            createdAt: serverTimestamp(),
            user_id: snapshot.user.uid,
         };

         // set username in usernames collection
         await setDoc(doc(db, '/usernames', username), data);

         // set user in users collection
         delete data.user_id;
         await setDoc(doc(db, '/users', snapshot.user.uid), data);

         // set user in AuthContext
         AuthContext_SetDbUser(data);
      } catch (error) {
         console.log('couldnt create user: ', error);
      }
   };

   function handleUsername(e) {
      e.preventDefault();

      const _username = e.target.value;
      setUsername(prevUsername => {
         if (_username === prevUsername) {
            return prevUsername;
         }

         if (_username.length > 5) {
            getDoc(doc(db, 'usernames', _username)).then(doc => {
               if (!doc.exists()) {
                  setUsernameExists(false);
                  setUsernameFormStatus({ msg: 'Available!', className: 'is-valid' });
               } else {
                  setUsernameFormStatus({ msg: 'Username already exists', className: 'warning' })
               }
            });
         } else {
            setUsernameFormStatus({ msg: '', className: '' });
         }

         return _username;
      });
   }

   const [typeBasedOnViewPwOrNot, setTypeBasedOnViewPwOrNot] = useState('password');

   function toggleViewPassword(e) {
      e.preventDefault();
      setTypeBasedOnViewPwOrNot(prevTypeBasedOnViewPwOrNot => {
         if (prevTypeBasedOnViewPwOrNot === 'password') {
            return 'text';
         } else {
            return 'password';
         }
      });
   }

   useEffect(() => {
      console.log('registerEmail rendered');
   }, []);

   return (
      <React.Fragment>
         <h1>Register account</h1>
         <form onSubmit={handleRegister}>
            <div className="inputContainerStatus">
               <input style={{ borderRadius: usernameFormStatus.msg === '' ? '6px' : '6px 6px 0 0' }} type="text" name="username" placeholder="username" onChange={handleUsername} value={username} />
               {usernameFormStatus.msg && <div className={usernameFormStatus.className + ' badge-sm'}>{usernameFormStatus.msg}</div>}
            </div>
            <div className="badge-info-sm">Username must be longer then 5 characters and only consist of characters, numbers and/or underscores.</div>
            <input type="text" name="email" placeholder="Email" />
               <input type={typeBasedOnViewPwOrNot} name="password" placeholder="Password" />
               <button className="btn-sm f-l" onClick={toggleViewPassword}>Hide/View Password</button>
            <button className="btn-md w-100">Register</button>
         </form>
         {formMsg != '' ? <span className="error">{formMsg}</span> : null}
      </React.Fragment>
   );
};

export default RegisterEmailForm;