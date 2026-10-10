import { test, expect } from '@playwright/test';

test.describe('Checkout Flow E2E', () => {
  test('navigates through cart and checkout', async ({ page }) => {
    await page.goto('/store/bloom-boutique/cart');
  });
});
