import { test, expect } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test('allows merchant to view login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Merchant Login')).toBeVisible();
  });
});
