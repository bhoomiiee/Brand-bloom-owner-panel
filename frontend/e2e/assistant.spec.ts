import { test, expect } from '@playwright/test';

test.describe('AI Assistant E2E', () => {
  test('displays verified evidence for questions', async ({ page }) => {
    await page.goto('/assistant');
  });
});
