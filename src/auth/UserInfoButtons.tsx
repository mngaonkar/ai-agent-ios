import React from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { logOutOutline, personCircleOutline } from 'ionicons/icons';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { authEnabled } from './authConfig';

const UserInfoButtonsWithAuth: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();

  if (!isAuthenticated) {
    return null;
  }

  const activeAccount = instance.getActiveAccount() || accounts[0];
  const displayName = activeAccount?.name || activeAccount?.username || 'Signed in';

  const handleLogout = async () => {
    await instance.logoutRedirect();
  };

  return (
    <>
      <IonButton fill="clear" disabled className="user-info-button">
        <IonIcon icon={personCircleOutline} slot="start" />
        <IonText className="user-info-text">{displayName}</IonText>
      </IonButton>
      <IonButton fill="clear" onClick={handleLogout}>
        <IonIcon icon={logOutOutline} slot="start" />
        Logout
      </IonButton>
    </>
  );
};

const UserInfoButtons: React.FC = () => {
  if (!authEnabled) {
    return null;
  }

  return <UserInfoButtonsWithAuth />;
};

export default UserInfoButtons;
