import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthProvider from './auth/AuthProvider';
import { authEnabled } from './auth/authConfig';
import { msalInstance } from './auth/msalInstance';

if (authEnabled) {
  msalInstance
    .initialize()
    .then(() => msalInstance.handleRedirectPromise())
    .then((response) => {
      if (response?.account) {
        msalInstance.setActiveAccount(response.account);
      } else {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
        }
      }
    })
    .catch((error) => {
      console.error('MSAL redirect handling error:', error);
    });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
