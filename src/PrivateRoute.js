import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from './context/auth';

const PrivateRoute = ({ component: RouteComponent, ...rest }) => {
   console.log('promp: ', RouteComponent, rest, 'hei');
   const { dbUser } = useContext(AuthContext);
   console.log('db user:::::::::::::::::::', dbUser);
   return (
      <Route {...rest} render={routeProps =>
         dbUser
            ? (<RouteComponent {...routeProps} />)
            : (<Redirect to={'/'} />)} />
   );
};

export default PrivateRoute;