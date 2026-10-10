import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard E2E', () => {
  test('renders step progression', async ({ page }) => {
    await page.goto('/onboarding');
  });
});
