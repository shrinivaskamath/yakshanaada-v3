# Yakshanaada (web)

A browser version of the Yakshanaada app (Yaksha Shruthi, Tanpura, Bhagavatha,
and a microphone pitch detector). It is a standalone Vite + React + TypeScript
app that reuses the audio assets and raaga data from the React Native app. It is
an installable PWA and is hosted free on GitHub Pages, so iOS users can use it in
Safari without an App Store / Apple Developer account.

## Develop

```bash
cd web
npm install
npm run dev
```

## Build / preview

```bash
npm run build      # outputs to web/dist
npm run preview    # serves the production build at /yakshanaada-v3/
```

## Deploy to GitHub Pages

Deployment is automated by [.github/workflows/deploy-web.yml](../.github/workflows/deploy-web.yml),
which builds `web/` and publishes `web/dist` on every push to `main`/`master`.

One-time setup in the GitHub repo:

1. Go to **Settings -> Pages**.
2. Under **Build and deployment -> Source**, choose **GitHub Actions**.
3. Push to `main` (or run the workflow manually). The site goes live at:
   `https://shrinivaskamath.github.io/yakshanaada-v3/`

If you ever rename the repo or use a custom domain, update `base` in
[vite.config.ts](vite.config.ts) (and the `start_url`/`scope` in the PWA
manifest) to match.

## Visit analytics (Firebase / GA4)

Site visits are tracked with Firebase Analytics reusing the existing
`yakshanaadav3` project (the same dashboard as the Android app). No backend is
needed - Google stores and reports the data.

One-time setup:

1. Firebase console -> **Project settings -> Your apps -> Add app -> Web (`</>`)**.
   Register a web app (e.g. "Yakshanaada Web").
2. Copy the generated config, especially `appId` and `measurementId` (the
   `G-XXXX` id - this is what enables Google Analytics).
3. Put the values either in [src/firebase.ts](src/firebase.ts) or in a `.env`
   file (copy [.env.example](.env.example)). For CI deploys, add them as repo
   secrets and pass them as `VITE_FIREBASE_*` env vars in the build step.
4. In the Firebase console, make sure **Google Analytics is enabled** for the
   project. Visit counts appear under Analytics -> Realtime / Events
   (`page_view`), and per-feature usage under the `screen_view` event.

Until `appId`/`measurementId` are filled in, analytics is skipped silently and
the app still works normally. Note that ad/tracking blockers can block GA4, so
counts are a slight undercount.

## Notes

- Audio (`.mp3`, `.m4a`) plays in modern Safari/Chrome. Playback and the mic
  must be started by a tap (browser autoplay rule); the app handles this.
- **iOS limitation:** unlike the Android app, web playback pauses when the
  screen locks or the tab is backgrounded on iPhone. Foreground playback works
  normally. Adding the app to the Home Screen (PWA install) gives the best
  experience.
- The microphone pitch detector requires HTTPS (GitHub Pages provides it) and a
  one-time microphone permission.
