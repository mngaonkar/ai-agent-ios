export const authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true';

const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID || '';
const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID || 'common';
const redirectUri = import.meta.env.VITE_ENTRA_REDIRECT_URI || `${window.location.origin}/`;
const postLogoutRedirectUri =
  import.meta.env.VITE_ENTRA_POST_LOGOUT_REDIRECT_URI || `${window.location.origin}/`;
const scopes = (import.meta.env.VITE_ENTRA_SCOPES || 'openid profile email')
  .split(' ')
  .map((s) => s.trim())
  .filter(Boolean);

export const authConfig = {
  clientId,
  tenantId,
  redirectUri,
  postLogoutRedirectUri,
  scopes,
};

export const isAuthConfigured = authEnabled && !!authConfig.clientId;

export const msalConfig = {
  auth: {
    clientId: authConfig.clientId || '00000000-0000-0000-0000-000000000000',
    authority: `https://login.microsoftonline.com/${authConfig.tenantId}`,
    redirectUri: authConfig.redirectUri,
    postLogoutRedirectUri: authConfig.postLogoutRedirectUri,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: authConfig.scopes,
};
