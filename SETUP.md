# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd ios-app
npm install
```

## Step 2: Build the Web App

```bash
npm run build
```

## Step 3: Initialize Capacitor iOS

```bash
npx cap add ios
```

This will create the `ios/` folder with the native iOS project.

## Step 4: Sync Capacitor

```bash
npm run sync:ios
```

This syncs the web build with the iOS project.

## Step 5: Open in Xcode

```bash
npm run ios:open
```

Or manually:
```bash
open ios/App/App.xcworkspace
```

## Step 6: Configure in Xcode

1. Select your development team in Xcode (Signing & Capabilities)
2. Choose a simulator or connect a physical device
3. Click Run (▶️) to build and run the app

## Step 7: Configure the App

1. When the app launches, tap "Configuration"
2. Enter your OpenAI API key
3. Optionally add LangSmith API key
4. Tap "Save"
5. Go back and tap "Chat Assistant" to start using the app

## Troubleshooting

### If `npx cap add ios` fails:

Make sure you have:
- Xcode installed
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods`

### If build fails:

1. Clean the build: `npm run build`
2. Sync again: `npm run sync:ios`
3. In Xcode: Product → Clean Build Folder (Shift+Cmd+K)
4. Try building again

### If dependencies fail to install:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

1. Make changes to source files in `src/`
2. Build: `npm run build`
3. Sync: `npm run sync:ios`
4. The changes will appear in Xcode (you may need to refresh)

## Testing in Browser

For faster development, you can test the web version:

```bash
npm run dev
```

Then open `http://localhost:5173` in your browser.

Note: Some features (like Capacitor plugins) will only work in the native app.

## Optional: Microsoft Entra (SAML-backed) SSO for Web

1. Create an Entra App Registration (SPA).
2. Add redirect URI `http://localhost:5173/` (and your production URL).
3. Copy `.env.example` to `.env` and set:
	- `VITE_AUTH_ENABLED=true`
	- `VITE_ENTRA_CLIENT_ID=...`
	- `VITE_ENTRA_TENANT_ID=...`
	- `VITE_ENTRA_REDIRECT_URI=...`
4. Restart `npm run dev`.

If your tenant is federated with a SAML IdP, Entra will complete SAML upstream while the SPA uses OIDC.
