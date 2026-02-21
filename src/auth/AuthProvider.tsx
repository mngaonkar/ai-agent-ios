import React from 'react';
import { MsalProvider } from '@azure/msal-react';
import { authEnabled } from './authConfig';
import { msalInstance } from './msalInstance';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authEnabled) {
    return <>{children}</>;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

export default AuthProvider;
