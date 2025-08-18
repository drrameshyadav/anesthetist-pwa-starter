import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL,   // set by the workflow
    trace: 'retain-on-failure',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
