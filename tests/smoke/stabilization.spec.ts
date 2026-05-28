import { test, expect } from '@playwright/test';

test.describe('Stabilization Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Inject __PLAYWRIGHT_TEST__ flag before any script runs on the page
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT_TEST__ = true;
    });

    // 1. Visit sign-in page
    await page.goto('/login');

    // 2. Perform dev bypass login using the seeded candidate's credentials
    await page.fill('input[type="email"]', 'rajajeevankumar@gmail.com');
    await page.fill('input[type="password"]', 'anypassword');
    await page.click('button[type="submit"]');

    // 3. Wait for dashboard redirection
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('dashboard loads and SSE connects', async ({ page }) => {
    // Verify dashboard displays basic components
    await expect(page.locator('text=Integrated Dashboard')).toBeVisible();
    await expect(page.locator('text=Raja Jeevan Kumar Maduri')).toBeVisible();

    // Verify SSE connection indicator shows "Connected"
    const connectionIndicator = page.locator('[data-testid="agent-rail"]');
    await expect(connectionIndicator).toContainText('Connected');
  });

  test('agent execution lifecycle triggers and cancel flow works', async ({ page }) => {
    // Select the "resume-tailor" agent item from the rail
    const agentItem = page.locator('[data-testid="agent-rail-item-resume-tailor"]').first();
    await expect(agentItem).toBeVisible();
    await agentItem.click();

    // Verify agent detail panel loads
    await expect(page.locator('[data-testid="agent-rail"]')).toContainText('Resume Tailor');

    // Trigger agent execution if the button is visible
    const executeButton = page.locator('button:has-text("Execute")');
    if (await executeButton.isVisible()) {
      await executeButton.click();
    } else {
      const startButton = page.locator('button:has-text("Start")');
      await expect(startButton).toBeVisible();
      await startButton.click();
    }

    // Verify progress bar is shown
    const progressBar = page.locator('[data-testid="agent-progress-bar"]');
    await expect(progressBar).toBeVisible();

    // Cancel the execution
    const cancelButton = page.locator('button:has-text("Cancel")');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Verify execution status moves to failed/cancelled
    await expect(page.locator('text=failed').first()).toBeVisible();
  });

  test('reconnect after refresh works and no duplicate SSE streams created', async ({ page }) => {
    // Refresh the page
    await page.reload();

    // Verify indicator connects successfully again
    const connectionIndicator = page.locator('[data-testid="agent-rail"]');
    await expect(connectionIndicator).toContainText('Connected');

    // Verify no duplicate EventSource instances are created
    const hasDuplicates = await page.evaluate(() => {
      return (window as any).__sse_manager_connections_count > 1;
    });
    expect(hasDuplicates).not.toBe(true);
  });
});
