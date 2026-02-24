# Test Results Registry

Persistent screenshots captured by E2E specs at key UI states.
Each folder corresponds to a spec file and is overwritten on every test run.

Playwright auto-artifacts (traces, failure screenshots, videos) live separately in `playwright-artifacts/`.

## Auth Critical Path

| Folder | Spec | Description |
|--------|------|-------------|
| `auth-login/` | `e2e/tests/auth/login.spec.ts` | Login page branding, custom-token auth, avatar display |
| `auth-logout/` | `e2e/tests/auth/logout.spec.ts` | Sign-out flow — authenticated state → login page |
| `auth-protected-routes/` | `e2e/tests/auth/protected-route.spec.ts` | Route protection, unauthenticated redirect, all 4 tier logins |

## Future Critical Paths

| Folder | Spec | Description |
|--------|------|-------------|
| `pantry/` | `e2e/tests/pantry/*.spec.ts` | Pantry view, ingredient display, expiry badges |
| `recipes/` | `e2e/tests/recipes/*.spec.ts` | Recipe suggestions, detail modal |
| `explore/` | `e2e/tests/explore/*.spec.ts` | 4 discovery modes, novelty guarantee |
| `cooking-log/` | `e2e/tests/cooking-log/*.spec.ts` | "Cooked it!" flow, ratings |
| `shopping-list/` | `e2e/tests/shopping-list/*.spec.ts` | Shopping list with "Para explorar" section |
