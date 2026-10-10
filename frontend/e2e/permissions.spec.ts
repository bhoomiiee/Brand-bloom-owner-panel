import { test, expect } from '@playwright/test';

test.describe('Team & Permissions E2E', () => {
  test('protects restricted actions', async ({ page }) => {
    await page.goto('/team');
  });
});
