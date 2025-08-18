import { test, expect } from '@playwright/test';

test('home loads and shows key cards', async ({ page, baseURL }) => {
  await page.goto(baseURL!);
  await expect(page).toHaveTitle(/Anesthetist/i);
  await expect(page.getByRole('heading', { name: /Patient/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Relaxant Timers/i })).toBeVisible();
});

test('start Rocuronium and switch to Maintenance', async ({ page, baseURL }) => {
  await page.goto(baseURL!);
  const startBtn = page.getByRole('button', { name: /Start Rocuronium/i });
  await expect(startBtn).toBeVisible();
  await startBtn.click();
  await expect(page.getByText(/Rocuronium — Bolus/)).toBeVisible();

  const restartBtn = page.getByRole('button', { name: /Top up now & Restart/i });
  await expect(restartBtn).toBeVisible();
  await restartBtn.click();
  await expect(page.getByText(/Rocuronium — Maintenance/)).toBeVisible();
});
