# Anesthetist PWA Starter (React + Vite + TypeScript + Tailwind + vite-plugin-pwa)

A minimal, production-ready PWA starter. It’s offline-ready, supports Add to Home Screen,
and includes a persisted Timer component as a starting feature.

## Requirements
- Node.js 18+
- npm 9+ (or pnpm/yarn if you prefer)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build & Preview

```bash
npm run build
npm run preview
```

## Deploy (Netlify or Vercel)
- Connect your GitHub repo and use the default **build command**: `npm run build`
- **Publish directory**: `dist`
- Ensure **Service Worker** is allowed (works out-of-the-box).

## PWA Notes
- Uses `vite-plugin-pwa` with `registerType: 'autoUpdate'`.
- Icons live in `/public`. Manifest is configured in `vite.config.ts` (Workbox precaches assets).
- Install prompt button appears when available (Chrome/Edge/Android). iOS shows the native “Add to Home Screen” share menu.

## Where to add your features
- `src/components/Timer.tsx` shows how to persist state locally.
- Add new calculators under `src/components/` and any shared helpers under `src/lib/`.

## Customizing Icons & App Name
- Replace `/public/pwa-*.png` with your own icons.
- Update the `manifest` inside `vite.config.ts`.

---

Made for iterative collaboration with ChatGPT. Describe features in plain English and apply the diffs I provide.
