import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { logInOutline } from 'ionicons/icons';
import { Redirect } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { authEnabled, authConfig, isAuthConfigured, loginRequest } from '../auth/authConfig';

const LoginPageWithAuth: React.FC = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = async () => {
    await instance.loginRedirect(loginRequest);
  };

  React.useEffect(() => {
    if (accounts.length > 0 && !instance.getActiveAccount()) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [accounts, instance]);

  if (isAuthenticated || accounts.length > 0) {
    return <Redirect to="/" />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sign in</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Microsoft Entra SSO</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {isAuthConfigured ? (
              <>
                <p>Sign in with your Microsoft Entra account to continue.</p>
                <IonButton expand="block" onClick={handleLogin}>
                  <IonIcon icon={logInOutline} slot="start" />
                  Sign in with Entra
                </IonButton>
              </>
            ) : (
              <>
                <p>
                  Authentication is enabled but not configured. Add the Entra settings in your
                  environment variables and reload.
                </p>
                <ul>
                  <li>VITE_ENTRA_CLIENT_ID</li>
                  <li>VITE_ENTRA_TENANT_ID</li>
                  <li>VITE_ENTRA_REDIRECT_URI</li>
                </ul>
              </>
            )}
          </IonCardContent>
        </IonCard>

        {authConfig.scopes.length > 0 && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Requested scopes</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>{authConfig.scopes.join(', ')}</p>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

const LoginPage: React.FC = () => {
  if (!authEnabled) {
    return <Redirect to="/" />;
  }

  return <LoginPageWithAuth />;
};

export default LoginPage;
