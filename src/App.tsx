import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { IonReactRouter } from '@ionic/react-router';
import HomePage from './pages/HomePage';
import ConfigPage from './pages/ConfigPage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import { authEnabled } from './auth/authConfig';
import { useIsAuthenticated } from '@azure/msal-react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './App.css';

setupIonicReact();

const LandingWithAuth: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <HomePage />;
};

const LandingRoute: React.FC = () => {
  if (!authEnabled) {
    return <HomePage />;
  }

  return <LandingWithAuth />;
};

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/" component={LandingRoute} />
          <Route exact path="/login" component={LoginPage} />
          <ProtectedRoute exact path="/config" component={ConfigPage} />
          <ProtectedRoute exact path="/chat" component={ChatPage} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
