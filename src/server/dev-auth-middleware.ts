import type { Plugin } from 'vite'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

/** User key → email mapping (shared Boletapp staging accounts) */
const TEST_USER_EMAILS: Record<string, string> = {
  principiante: 'alice@boletapp.test',
  comodo: 'bob@boletapp.test',
  aventurero: 'charlie@boletapp.test',
  avanzado: 'diana@boletapp.test',
}

/** Cache resolved UIDs to avoid repeated Firebase Admin lookups */
const uidCache = new Map<string, string>()

let adminAuth: import('firebase-admin/auth').Auth | null = null

function getAdminAuth(): import('firebase-admin/auth').Auth {
  if (!adminAuth) {
    const { initializeApp, cert, getApps } = require('firebase-admin/app') as typeof import('firebase-admin/app')
    const { getAuth } = require('firebase-admin/auth') as typeof import('firebase-admin/auth')

    // Use process.cwd() — reliable when Vite bundles the config file
    const serviceAccountPath = path.resolve(
      process.cwd(),
      '.keys/gastify/serviceAccountKey.staging.json',
    )

    const existing = getApps().find((a: any) => a.name === 'dev-auth-middleware')
    const app = existing ?? initializeApp(
      { credential: cert(require(serviceAccountPath)) },
      'dev-auth-middleware',
    )
    adminAuth = getAuth(app)
  }
  return adminAuth
}

async function resolveUid(auth: import('firebase-admin/auth').Auth, userKey: string): Promise<string> {
  const cached = uidCache.get(userKey)
  if (cached) return cached

  const email = TEST_USER_EMAILS[userKey]
  const userRecord = await auth.getUserByEmail(email)
  uidCache.set(userKey, userRecord.uid)
  return userRecord.uid
}

/**
 * Vite plugin that exposes a dev-only endpoint for generating Firebase custom tokens.
 * Active during dev server only (configureServer is not called in production builds).
 */
export function devAuthPlugin(): Plugin {
  return {
    name: 'dev-auth-token',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/__dev\/auth-token\/(\w+)$/)
        if (!match) return next()

        const userKey = match[1]
        const email = TEST_USER_EMAILS[userKey]

        if (!email) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            error: `Unknown user key: ${userKey}. Valid keys: ${Object.keys(TEST_USER_EMAILS).join(', ')}`,
          }))
          return
        }

        try {
          const auth = getAdminAuth()
          const uid = await resolveUid(auth, userKey)
          const token = await auth.createCustomToken(uid)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ token }))
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            error: e instanceof Error ? e.message : String(e),
          }))
        }
      })
    },
  }
}
