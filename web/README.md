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

## Notes

- Audio (`.mp3`, `.m4a`) plays in modern Safari/Chrome. Playback and the mic
  must be started by a tap (browser autoplay rule); the app handles this.
- **iOS limitation:** unlike the Android app, web playback pauses when the
  screen locks or the tab is backgrounded on iPhone. Foreground playback works
  normally. Adding the app to the Home Screen (PWA install) gives the best
  experience.
- The microphone pitch detector requires HTTPS (GitHub Pages provides it) and a
  one-time microphone permission.
