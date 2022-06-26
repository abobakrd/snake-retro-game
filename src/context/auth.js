import React, { useEffect, useState, useRef } from 'react';

import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

export const AuthContext = React.createContext();
export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [dbUser, setDbUser] = useState(null);
   const hasMounted = useRef(false);

   useEffect(() => {
      onAuthStateChanged(auth, async user => {
         console.log('user state changed: ', user);
         setUser(user);

         if (!hasMounted.current) {
            //console.log(('auth mounting first time, user: ', user));
            hasMounted.current = true;
         }

         if (user) {
            if (!dbUser) {
               //console.log(('auth mounting first time, user: ', user));
               getDoc(doc(db, 'users', user.uid)).then(r => setDbUser(r.data()));
            }
         } else {
            console.log(('no user'));
            if (dbUser) {
               setDbUser(null);
            }
         }

      }, error => console.log('auth error: ', error), () => console.log('auth observer unmounted'));
   }, []);

   return (
      <AuthContext.Provider value={{ user: user, dbUser: dbUser, AuthContext_SetDbUser: setDbUser }}>
         <div>
            {
               children
            }
         </div>
      </AuthContext.Provider>
   );
};

