/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_AUTH_ENABLED?: string;
	readonly VITE_ENTRA_CLIENT_ID?: string;
	readonly VITE_ENTRA_TENANT_ID?: string;
	readonly VITE_ENTRA_REDIRECT_URI?: string;
	readonly VITE_ENTRA_POST_LOGOUT_REDIRECT_URI?: string;
	readonly VITE_ENTRA_SCOPES?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
