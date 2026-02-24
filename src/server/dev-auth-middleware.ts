import type { Plugin } from 'vite'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

/** User key → UID mapping (mirrors e2e/fixtures/test-users.ts) */
const TEST_USER_UIDS: Record<string, string> = {
  principiante: 'test-principiante-001',
  comodo: 'test-comodo-001',
  aventurero: 'test-aventurero-001',
  avanzado: 'test-avanzado-001',
}

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
        const uid = TEST_USER_UIDS[userKey]

        if (!uid) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            error: `Unknown user key: ${userKey}. Valid keys: ${Object.keys(TEST_USER_UIDS).join(', ')}`,
          }))
          return
        }

        try {
          const auth = getAdminAuth()
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
