import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  isSupported,
  logEvent,
  type Analytics,
} from 'firebase/analytics';

// Firebase web config for the existing "yakshanaadav3" project.
//
// IMPORTANT: These values come from the Firebase console for a *Web* app, not
// the Android app. In the console go to:
//   Project settings -> Your apps -> Add app -> Web (</>)
// then copy the generated config here. None of these values are secret (they
// ship in every Firebase web client), so committing them is fine.
//
// The two values you MUST replace from the web app config are `appId` and
// `measurementId` (the G-XXXX id is what enables Google Analytics / visit
// counts). The others below already match your project.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyBbGz5q9sSf-l93jpvjqa8yZC-44ZmkvpQ',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'yakshanaadav3.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'yakshanaadav3',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'yakshanaadav3.appspot.com',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_SENDER_ID ?? '720971405897',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? 'YOUR_WEB_APP_ID',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-XXXXXXXXXX',
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

// Initializes Firebase Analytics. GA4 automatically records a page_view (a site
// visit) once analytics is initialized, so calling this on app start is enough
// to count visits. Safe to call even if the config is not filled in yet.
export async function initAnalytics(): Promise<void> {
  const { appId, measurementId } = firebaseConfig;
  if (
    !appId ||
    appId === 'YOUR_WEB_APP_ID' ||
    !measurementId ||
    measurementId === 'G-XXXXXXXXXX'
  ) {
    // Not configured yet (or CI secrets unset); skip silently so the app runs.
    return;
  }
  try {
    if (!(await isSupported())) return;
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
  } catch (e) {
    // Analytics must never break the app (e.g. blocked by an ad blocker).
    // eslint-disable-next-line no-console
    console.warn('Analytics init skipped:', e);
  }
}

// Logs which screen the user opened, so you can see usage per feature in GA4.
export function logScreenView(screenName: string): void {
  if (!analytics) return;
  try {
    // Use the generic string overload (the typed 'screen_view' overload
    // expects a fixed param shape we don't need here).
    const eventName: string = 'screen_view';
    logEvent(analytics, eventName, {
      firebase_screen: screenName,
      firebase_screen_class: screenName,
    });
  } catch {
    // Ignore analytics failures.
  }
}
