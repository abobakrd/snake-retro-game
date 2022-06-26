import RegisterEmailForm from './registerEmail';
import LoginEmailForm from './loginEmail';
import LoginAnonymouslyForm from './loginAnonymously';

import React, { useState } from 'react';

const LOGIN_METHOD = {
   EMAIL: 1,
   ANONYMOUS: 2,
   REGISTER: 3
};

const Login = ({ history }) => {
   const [loginMethod, setLoginMethod] = useState(LOGIN_METHOD.REGISTER);

   const RegisterBtn = () => (
      <button className="btn-text" onClick={() => setLoginMethod(LOGIN_METHOD.REGISTER)}>Sign up</button>
   );

   const LoginBtn = () => (
      <button className="btn-text" onClick={() => setLoginMethod(LOGIN_METHOD.EMAIL)}>Sign in</button>
   );

   const LoginAnonymouslyBtn = () => (
      <button className="btn-text" onClick={() => setLoginMethod(LOGIN_METHOD.ANONYMOUS)}>Sign in anonymously</button>
   );

   const LoginForm = () => {
      switch (loginMethod) {
         case LOGIN_METHOD.EMAIL:
            return (
               <React.Fragment>
                  <LoginEmailForm />
                  <div className="d-flex-sb">
                     <LoginAnonymouslyBtn />
                     <RegisterBtn />
                  </div>
               </React.Fragment>
            );
         case LOGIN_METHOD.ANONYMOUS:
            return (
               <React.Fragment>
                  <LoginAnonymouslyForm />
                  <div className="d-flex-sb">
                     <RegisterBtn />
                     <LoginBtn />
                  </div>
               </React.Fragment>
            );
         case LOGIN_METHOD.REGISTER:
            return (
               <React.Fragment>
                  <RegisterEmailForm />
                  <div className="d-flex-sb">
                     <LoginBtn />
                     <LoginAnonymouslyBtn />
                  </div>
               </React.Fragment>
            );
         default:
            return <div>Error</div>;
      }
   }

   return (
      <div className="loginContainer">
         <LoginForm  />
      </div>

   );
}

export default Login;