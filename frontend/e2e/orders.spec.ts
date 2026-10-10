import { test, expect } from '@playwright/test';

test.describe('Orders Management E2E', () => {
  test('lists customer orders in admin portal', async ({ page }) => {
    await page.goto('/orders');
  });
});
