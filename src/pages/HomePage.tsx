import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { logInOutline, logOutOutline, settingsOutline, chatbubblesOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { storageService } from '../services/storage.service';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { authEnabled, loginRequest } from '../auth/authConfig';
import UserInfoButtons from '../auth/UserInfoButtons';

const HomePageWithAuth: React.FC = () => {
  const history = useHistory();
  const [isConfigured, setIsConfigured] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const savedConfig = await storageService.getConfig();
    setIsConfigured(!!savedConfig?.apiKey);
  };

  const handleLogin = async () => {
    await instance.loginRedirect(loginRequest);
  };

  const handleLogout = async () => {
    await instance.logoutRedirect();
  };

  const activeAccount = instance.getActiveAccount() || accounts[0];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <UserInfoButtons />
          </IonButtons>
          <IonTitle>AI Browser Assistant</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Welcome to AI Browser Assistant</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                An AI-powered assistant that helps you analyze web pages and answer questions
                about their content using LangGraph and OpenAI.
              </p>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Authentication</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {isAuthenticated ? (
                <>
                  <p>Signed in as {activeAccount?.username || 'Unknown user'}.</p>
                  <IonButton expand="block" onClick={handleLogout}>
                    <IonIcon icon={logOutOutline} slot="start" />
                    Sign out
                  </IonButton>
                </>
              ) : (
                <>
                  <p>Sign in with Microsoft Entra to continue.</p>
                  <IonButton expand="block" onClick={handleLogin}>
                    <IonIcon icon={logInOutline} slot="start" />
                    Sign in
                  </IonButton>
                </>
              )}
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Quick Actions</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem button onClick={() => history.push('/config')}>
                <IonIcon icon={settingsOutline} slot="start" />
                <IonLabel>
                  <h2>Configuration</h2>
                  <p>Set up your API keys</p>
                </IonLabel>
              </IonItem>

              <IonItem button onClick={() => history.push('/chat')} disabled={!isConfigured || !isAuthenticated}>
                <IonIcon icon={chatbubblesOutline} slot="start" />
                <IonLabel>
                  <h2>Chat Assistant</h2>
                  <p>Start a conversation with the AI assistant</p>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {!isConfigured && (
            <IonCard color="warning">
              <IonCardHeader>
                <IonCardTitle>Setup Required</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>Please configure your OpenAI API key in the settings to use the assistant.</p>
                <IonButton expand="block" onClick={() => history.push('/config')}>
                  <IonIcon icon={settingsOutline} slot="start" />
                  Go to Settings
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

const HomePageWithoutAuth: React.FC = () => {
  const history = useHistory();
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const savedConfig = await storageService.getConfig();
    setIsConfigured(!!savedConfig?.apiKey);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>AI Browser Assistant</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Welcome to AI Browser Assistant</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                An AI-powered assistant that helps you analyze web pages and answer questions
                about their content using LangGraph and OpenAI.
              </p>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Quick Actions</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem button onClick={() => history.push('/config')}>
                <IonIcon icon={settingsOutline} slot="start" />
                <IonLabel>
                  <h2>Configuration</h2>
                  <p>Set up your API keys</p>
                </IonLabel>
              </IonItem>

              <IonItem button onClick={() => history.push('/chat')} disabled={!isConfigured}>
                <IonIcon icon={chatbubblesOutline} slot="start" />
                <IonLabel>
                  <h2>Chat Assistant</h2>
                  <p>Start a conversation with the AI assistant</p>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {!isConfigured && (
            <IonCard color="warning">
              <IonCardHeader>
                <IonCardTitle>Setup Required</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>Please configure your OpenAI API key in the settings to use the assistant.</p>
                <IonButton expand="block" onClick={() => history.push('/config')}>
                  <IonIcon icon={settingsOutline} slot="start" />
                  Go to Settings
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

const HomePage: React.FC = () => {
  if (!authEnabled) {
    return <HomePageWithoutAuth />;
  }

  return <HomePageWithAuth />;
};

export default HomePage;
