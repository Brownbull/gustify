import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'
import path from 'path'

// Load .env file explicitly so shell env vars don't override staging config
const envFile = config({ path: path.resolve('.env') })
const stagingEnv = envFile.parsed ?? {}

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: './playwright-artifacts',

  timeout: 30_000,
  expect: { timeout: 10_000 },

  // 1 retry always — WSL2 Chromium can SEGV on first browser launch
  retries: 1,

  // Sequential execution — tests share staging Firebase backend
  fullyParallel: false,
  workers: 1,

  reporter: [
    ['html', { outputFolder: './playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:5175',
    viewport: { width: 375, height: 667 },
    locale: 'es-CL',
    timezoneId: 'America/Santiago',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        locale: 'es-CL',
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5175',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    // Override shell env vars with .env file values to ensure staging config
    env: stagingEnv,
  },
})
