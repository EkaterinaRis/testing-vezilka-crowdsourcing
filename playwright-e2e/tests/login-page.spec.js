import { test, expect } from '@playwright/test';

test('login page loads and shows the expected form', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveTitle(/Најава/i);
  await expect(page.getByRole('heading', { name: /Добредојде назад/i })).toBeVisible();
  await expect(page.locator('input#email')).toBeVisible();
  await expect(page.locator('input#password')).toBeVisible();
  await expect(page.getByRole('button', { name: /Најави се/i })).toBeVisible();
});
