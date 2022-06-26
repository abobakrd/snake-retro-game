import React, { useContext, useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../../context/auth';

const LoginEmailForm = () => {
   const [formMsg, setFormMsg] = useState('');

   const { AuthContext_SetDbUser } = useContext(AuthContext);

   async function handleSignIn(e) {
      e.preventDefault();

      if (auth['currentUser'] !== null)
         signOut(auth);

      const email = e.target.email.value;
      const password = e.target.password.value;

      await signInWithEmailAndPassword(auth, email, password).then(userCreddentials => {
         console.log('Signed in with email and password, user: ', userCreddentials.user);
         getDoc(doc(db, 'users', userCreddentials.user.uid)).then(userDoc => {
            if (userDoc.exists()) {
               AuthContext_SetDbUser(userDoc.data());
            } else {
               setFormMsg('User not found');
            }
         });
      }).catch(error => {
         console.log('Error signing in with email and password: ', error);
         setFormMsg(error.message);
      });
   }

   useEffect(() => {
      console.log('loginEmail rendered');
   }, []);

   return (
      <React.Fragment>
         <h1>Sign in with email</h1>
         <form onSubmit={handleSignIn}>
            <input type="email" name="email" placeholder="Email" />
            <input type="password" name="password" placeholder="password" />
            <button className="btn-md w-100">Sign In</button>
         </form>
         <span className="error">{formMsg}</span>
      </React.Fragment>
   );
}

export default LoginEmailForm;