import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import Home from './components/home';
import Game, { GameStatusContext } from './components/game';

import PrivateRoute from './PrivateRoute';

import { AuthProvider } from './context/auth';

const App = () => {
   return (
      <AuthProvider>
         <Router>
            <Route exact path="/" component={Home} />
         </Router>
      </AuthProvider>
   );
}

export default App;