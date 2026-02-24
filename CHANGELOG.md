# Changelog

All notable changes to Gustify are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.2.0] — 2026-02-24 — Auth: Firebase Auth + Google OAuth (#2)

### Added
- `src/types/user.ts`: TypeScript interfaces for Firestore user document
  - `UserProfile`, `CookingProfile`, `UserSettings`, `UserDocument`
  - `ProficiencyTier` union type matching the four proficiency levels
- `src/services/auth.ts`: Auth service layer
  - `signInWithGoogle()` — Google OAuth popup sign-in
  - `signOutUser()` — Firebase sign-out
  - `ensureUserProfile(user)` — creates `users/{uid}` document on first sign-in with default `CookingProfile` (Principiante tier, Spanish locale, CLP currency)
  - `subscribeToAuth(callback)` — thin wrapper around `onAuthStateChanged`
- `src/stores/authStore.ts`: Zustand `useAuthStore` store
  - Subscribes to auth state at module load; deduplicates `ensureUserProfile` calls via `ensuredUids` set
  - Exposes `user`, `loading`, `error`, `signIn()`, `signOut()`
- `src/components/ProtectedRoute.tsx`: Route guard component
  - Shows full-screen spinner while auth state resolves
  - Renders `LoginPage` when unauthenticated; renders children when authenticated
- `src/pages/LoginPage.tsx`: Sign-in page (Spanish)
  - "Iniciar sesión con Google" button with inline SVG Google logo
  - Displays error message in Spanish on sign-in failure
- `src/test/setup.ts`: Vitest global setup — registers `@testing-library/jest-dom` matchers
- Vitest test infrastructure with 27 tests across auth service, auth store, `ProtectedRoute`, and `LoginPage`
- `zustand` v5 added to production dependencies

### Notes
- Auth state resolves before any protected content renders — no unauthenticated Firestore reads
- `ensureUserProfile` is idempotent; safe to call on every sign-in

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
