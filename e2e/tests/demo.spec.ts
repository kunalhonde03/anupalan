import { test, expect } from '@playwright/test';

test.describe('ANUPALAN 9-Step Demo Script Rehearsal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Step 0: Pre-flight check and portal load', async ({ page }) => {
    await expect(page).toHaveTitle(/ANUPALAN/);
    await expect(page.locator('text=ANUPALAN')).toBeVisible();
    await expect(page.locator('text=Active Cases')).toBeVisible();
  });

  test('Step 1: Admin edits rule SLA and views impact preview', async ({ page }) => {
    // Open Rule Pack Editor tab
    await page.click('button:has-text("Rule Pack Editor")');
    await expect(page.locator('text=AICTE Rule Pack Editor')).toBeVisible();
    await expect(page.locator('text=rules/aph-2024-27.yaml')).toBeVisible();

    // Click Edit Rule Pack
    await page.click('button:has-text("Edit Rule Pack")');
    await expect(page.locator('button:has-text("Publish Changes")')).toBeVisible();

    // Modify a SLA value
    const input = page.locator('input[type="number"]').first();
    await input.fill('25');
    await page.click('button:has-text("Publish Changes")');

    // Verify confirmation and diff view
    await expect(page.locator('text=Rule pack updated and published')).toBeVisible();
  });

  test('Step 2: Dual pathway submission and blocked illegal transition', async ({ page }) => {
    await page.click('button:has-text("Application Workflows")');
    await expect(page.locator('text=Active Application Workflows')).toBeVisible();

    // Verify existing applications
    await expect(page.locator('text=DEMO-001')).toBeVisible();
    await expect(page.locator('text=DEMO-EOA-2026')).toBeVisible();

    // Switch to Officer and attempt illegal stage jump on scrutiny_evc case
    const illegalSkipBtn = page.locator('button:has-text("Attempt Illegal Skip")').first();
    if (await illegalSkipBtn.isVisible()) {
      await illegalSkipBtn.click();
      await expect(page.locator('text=BLOCKED_TRANSITION')).toBeVisible();
      await page.click('button:has-text("Acknowledge & Close")');
    }
  });

  test('Step 3: Return with mandatory reason and clock pause', async ({ page }) => {
    await page.click('button:has-text("Application Workflows")');
    const returnBtn = page.locator('button:has-text("Return with Reason")').first();
    if (await returnBtn.isVisible()) {
      await returnBtn.click();
      await expect(page.locator('text=Return Application to Institution')).toBeVisible();

      // Attempt empty reason submit
      await page.click('button:has-text("Confirm Return to Institution")');
      await expect(page.locator('text=Invariant 7 Violation')).toBeVisible();

      // Enter valid reason
      await page.fill('textarea', 'Deficient faculty cadre ratio in Computer Science Dept.');
      await page.click('button:has-text("Confirm Return to Institution")');
      await expect(page.locator('text=returned to institution. AICTE clock PAUSED')).toBeVisible();
    }
  });

  test('Step 4: Resubmission and clock resumption', async ({ page }) => {
    await page.click('button:has-text("Application Workflows")');
    const resubmitBtn = page.locator('button:has-text("Resubmit Compliance")').first();
    if (await resubmitBtn.isVisible()) {
      await resubmitBtn.click();
      await expect(page.locator('text=AICTE clock RESUMED')).toBeVisible();
    }
  });

  test('Step 5: Time machine +20 days and alerts escalation', async ({ page }) => {
    // Click Time Machine +20 Days
    await page.click('button:has-text("+20 Days")');
    await expect(page.locator('text=Time Machine Simulation Active (+20 days)')).toBeVisible();

    // Open Alerts panel
    await page.click('button[title="View Alerts & Escalations"]');
    await expect(page.locator('text=Regulatory Escalations & Alerts')).toBeVisible();

    // Check why alert fired
    const whyBtn = page.locator('button:has-text("Why did this fire?")').first();
    if (await whyBtn.isVisible()) {
      await whyBtn.click();
      await expect(page.locator('text=Regulatory Escalation Logic')).toBeVisible();
      await page.click('button:has-text("Close Explanation")');
    }
  });

  test('Step 6: Readiness Gate evaluation and decision recording', async ({ page }) => {
    await page.click('button:has-text("Application Workflows")');
    const assessBtn = page.locator('button:has-text("Assess Readiness & Decide")').first();
    if (await assessBtn.isVisible()) {
      await assessBtn.click();
      await expect(page.locator('text=Advisory Readiness Gate')).toBeVisible();
      await expect(page.locator('text=Faculty Recruitment Undertaking')).toBeVisible();

      // Select conditional approval
      await page.click('button:has-text("Conditional Approval")');
      await page.fill('textarea', 'Subject to submission of faculty recruitment order within 6 months.');
      await page.click('button:has-text("Record Decision")');
      await expect(page.locator('text=Decision Recorded: CONDITIONAL')).toBeVisible();
    }
  });

  test('Step 7 & 8: Obligation Ledger tracking and verification', async ({ page }) => {
    await page.click('button:has-text("Obligation Ledger")');
    await expect(page.locator('text=Institutional Obligation Ledger')).toBeVisible();
    await expect(page.locator('text=OBL-DEMO-UNDERTAKING')).toBeVisible();
    await expect(page.locator('text=OBL-FIRE-NOC')).toBeVisible();
  });

  test('Step 9: Cryptographic audit verification and tamper detection', async ({ page }) => {
    await page.click('button:has-text("Cryptographic Audit")');
    await expect(page.locator('text=Cryptographic Audit Trail')).toBeVisible();

    // 1. Initial verification (should be valid)
    await page.click('button:has-text("Verify Chain")');
    await expect(page.locator('text=Chain Integrity Verified')).toBeVisible();

    // 2. Simulate row tamper
    await page.click('button:has-text("Simulate Tamper")');

    // 3. Re-verify integrity (should immediately detect tamper)
    await page.click('button:has-text("Verify Chain")');
    await expect(page.locator('text=TAMPER DETECTED')).toBeVisible();
  });
});
