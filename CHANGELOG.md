# Changelog

All notable changes to Gustify are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.1.0] — 2026-02-24 — Firebase Setup (#1)

### Added
- Vite 5 + React 18 + TypeScript project scaffold
- Tailwind CSS with custom design tokens (surface, primary, primary-dark colors)
- Firebase SDK v12 configured against shared project `boletapp-d609f`
- `src/config/firebase.ts`: Firebase app, Auth, and Firestore initialization
  - Persistent multi-tab Firestore cache for production
  - Automatic emulator detection via `VITE_E2E_MODE` env var or `import.meta.env.DEV`
  - Auth emulator on port 9099; Firestore emulator on port 8080
- `src/lib/queryClient.ts`: TanStack Query v5 client (5 min stale time, 1 retry)
- `src/main.tsx`: Firebase initialized before React mounts via top-level import
- `firebase.json`: Hosting config (SPA rewrites, asset caching) + emulator ports
- `.firebaserc`: Project alias `default → boletapp-d609f`, hosting target `gustify`
- `firestore.rules`: Emulator-only security rules covering all Phase 1 Firestore paths
- `firestore.indexes.json`: Empty indexes placeholder
- `.env.example`: Required `VITE_FIREBASE_*` environment variables template
- `vite-plugin-pwa` dependency for future PWA manifest (not yet configured)
- `vite-tsconfig-paths` for clean `src/` path aliases

### Notes
- `firestore.rules` is for emulator use only — do not deploy to production
- Emulator project ID is `demo-gustify` (Firebase reserved `demo-` prefix)
