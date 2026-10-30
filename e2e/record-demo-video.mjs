import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Hp/.gemini/antigravity-ide/brain/831af7b3-7ad3-48a4-9f1c-5da4a6738fa6';
const RECORDING_DIR = path.join(ARTIFACT_DIR, 'recordings');

if (!fs.existsSync(RECORDING_DIR)) {
  fs.mkdirSync(RECORDING_DIR, { recursive: true });
}

async function safeClick(locator, waitMs = 1500) {
  try {
    await locator.waitFor({ state: 'visible', timeout: 5000 });
    await locator.click({ timeout: 5000 });
    await new Promise(r => setTimeout(r, waitMs));
    return true;
  } catch (err) {
    console.log(`[safeClick notice]: ${err.message?.split('\n')[0]}`);
    return false;
  }
}

async function switchRole(page, roleName) {
  try {
    const roleDropdownTrigger = page.locator('header .w-6.h-6').locator('..');
    await roleDropdownTrigger.click({ timeout: 4000 });
    await page.waitForTimeout(600);

    const targetOption = page.locator('.divide-y button').filter({ hasText: roleName }).first();
    await targetOption.click({ timeout: 4000 });
    await page.waitForTimeout(1000);
    console.log(`Role switched to: ${roleName}`);
  } catch (err) {
    console.log(`Failed to switch role to ${roleName}: ${err.message?.split('\n')[0]}`);
  }
}

async function run() {
  console.log('[1/10] Launching Google Chrome to record clean full-screen demo video...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: RECORDING_DIR,
      size: { width: 1440, height: 860 },
    },
    viewport: { width: 1440, height: 860 },
  });

  const page = await context.newPage();
  console.log('[2/10] Loading ANUPALAN dashboard at http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // -------------------------------------------------------------
  // STEP 1: Rule Pack Editor Demo
  // -------------------------------------------------------------
  console.log('[3/10] Step 1: Rule Pack Editor Demo...');
  await safeClick(page.locator('button:has-text("Rule Pack Editor (Step 1)")'), 1500);

  // Click Edit Rule Pack
  await safeClick(page.locator('button:has-text("Edit Rule Pack")'), 1000);

  // Modify EVC SLA value
  const numInput = page.locator('input[type="number"]').first();
  if (await numInput.isVisible().catch(() => false)) {
    await numInput.fill('25');
    await page.waitForTimeout(800);
  }

  // Publish changes
  await safeClick(page.locator('button:has-text("Publish Changes")'), 2000);

  // -------------------------------------------------------------
  // STEP 2 & 3: Workflows, Invariant Protection & Return
  // -------------------------------------------------------------
  console.log('[4/10] Step 2 & 3: Workflows, Invariant Protection & Return...');
  await safeClick(page.locator('button:has-text("Application Workflows (Steps 2-5)")'), 1500);

  // Attempt Illegal Jump on DEMO-001 (triggers Invariant Refusal modal)
  const forwardBtn = page.locator('button:has-text("Forward (Step 2)")').first();
  if (await forwardBtn.isVisible().catch(() => false)) {
    await safeClick(forwardBtn, 2000);
    // Acknowledge refusal modal and close
    await safeClick(page.locator('button:has-text("Acknowledge & Close")'), 1200);
  }

  // Step 3: Return with Deficiency Memo
  const returnBtn = page.locator('button:has-text("Return (Step 3)")').first();
  if (await returnBtn.isVisible().catch(() => false)) {
    await safeClick(returnBtn, 1000);

    // Empty click -> test invariant validation (empty reason rejected)
    await safeClick(page.locator('button:has-text("Sign & Issue Deficiency Memo")'), 1200);

    // Enter valid deficiency reason
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill('Deficient faculty cadre ratio in Computer Science Dept (Cadre 1:2:6 deficit per APH Ch 6).');
      await page.waitForTimeout(1000);
    }

    // Confirm Return and close modal
    await safeClick(page.locator('button:has-text("Sign & Issue Deficiency Memo")'), 2000);
  }

  // -------------------------------------------------------------
  // STEP 4: Role Switch to Institution & Resubmit
  // -------------------------------------------------------------
  console.log('[5/10] Step 4: Role Switch to Institution & Resubmit...');
  await switchRole(page, 'Dr. Anand Kulkarni');

  // Click Resubmit Clarification
  const resubmitBtn = page.locator('button:has-text("Resubmit Clarification (Step 4)")').first();
  if (await resubmitBtn.isVisible().catch(() => false)) {
    await safeClick(resubmitBtn, 2000);
  }

  // Switch back to Scrutiny Officer
  await switchRole(page, 'Dr. Ramesh Sharma');

  // -------------------------------------------------------------
  // STEP 5: Time Machine +20 Days & Escalation Alerts
  // -------------------------------------------------------------
  console.log('[6/10] Step 5: Time Machine +20 Days & Escalation Alerts...');
  await safeClick(page.locator('button:has-text("+20 Days")'), 2000);

  // Open Alerts Panel
  const alertBell = page.locator('button[title*="Statutory Alerts"]');
  if (await alertBell.isVisible().catch(() => false)) {
    await safeClick(alertBell, 1500);

    // Click "Why did this fire?"
    const whyBtn = page.locator('button:has-text("Why did this fire?")').first();
    if (await whyBtn.isVisible().catch(() => false)) {
      await safeClick(whyBtn, 2000);
      // Close Why explanation modal
      await safeClick(page.locator('button:has-text("Close Explanation")'), 1000);
    }

    // Close Alerts drawer
    await safeClick(page.locator('button:has-text("Close")').first(), 1200);
  }

  // -------------------------------------------------------------
  // STEP 6: Advisory Readiness Gate
  // -------------------------------------------------------------
  console.log('[7/10] Step 6: Advisory Readiness Gate...');
  await safeClick(page.locator('button:has-text("Application Workflows (Steps 2-5)")'), 1000);

  // Switch to Competent Authority for Decision
  await switchRole(page, 'Prof. T. G. Sitharam');

  // Open Readiness Gate
  const gateBtn = page.locator('button:has-text("Assess Readiness Gate (Step 6)")').first();
  if (await gateBtn.isVisible().catch(() => false)) {
    await safeClick(gateBtn, 2000);

    // Click Conditional Approval
    await safeClick(page.locator('button:has-text("Conditional Approval")'), 1000);

    const condTextarea = page.locator('textarea[placeholder*="Specify conditions"]').first();
    if (await condTextarea.isVisible().catch(() => false)) {
      await condTextarea.fill('Conditional approval granted. Mandatory recruitment order submission required within 6 months.');
      await page.waitForTimeout(1000);
    }

    // Record Decision
    await safeClick(page.locator('button:has-text("Record Decision")'), 2000);

    // Explicitly Close Modal so screen is clean!
    await safeClick(page.locator('button:has-text("Close & Return to Workflows")'), 1500);
  }

  // -------------------------------------------------------------
  // STEP 7 & 8: Obligation Ledger & Proof Verification
  // -------------------------------------------------------------
  console.log('[8/10] Step 7 & 8: Obligation Ledger & Proof Verification...');
  await safeClick(page.locator('button:has-text("Obligation Ledger (Step 8)")'), 2000);

  // Switch to Institution to submit proof
  await switchRole(page, 'Dr. Anand Kulkarni');

  const submitProofBtn = page.locator('button:has-text("Submit Proof")').first();
  if (await submitProofBtn.isVisible().catch(() => false)) {
    await safeClick(submitProofBtn, 1000);
    await safeClick(page.locator('button:has-text("Confirm Submission")'), 2000);
  }

  // Switch back to Scrutiny Officer to verify proof
  await switchRole(page, 'Dr. Ramesh Sharma');

  const verifyProofBtn = page.locator('button:has-text("Verify Proof")').first();
  if (await verifyProofBtn.isVisible().catch(() => false)) {
    await safeClick(verifyProofBtn, 1000);
    // Click Approve & Close inside verification modal
    await safeClick(page.locator('button:has-text("Approve & Close")'), 2000);
  }

  // -------------------------------------------------------------
  // STEP 8: Compliance Index View
  // -------------------------------------------------------------
  console.log('[9/10] Compliance Index View...');
  await safeClick(page.locator('button:has-text("Compliance Index (Pillar 6)")'), 3000);

  // -------------------------------------------------------------
  // STEP 9: Cryptographic Audit & Tamper Simulation
  // -------------------------------------------------------------
  console.log('[10/10] Step 9: Cryptographic Audit & Tamper Simulation...');
  await safeClick(page.locator('button:has-text("Cryptographic Audit (Step 9)")'), 2000);

  // Initial Chain Verification -> Valid (Green)
  await safeClick(page.locator('button:has-text("Verify Chain Integrity")'), 3000);

  // Simulate Row Tamper
  await safeClick(page.locator('button:has-text("Simulate Row Tamper")'), 2500);

  // Re-verify -> Tamper detected! (Red Alert)
  await safeClick(page.locator('button:has-text("Verify Chain Integrity")'), 3500);

  // Back to Main Overview for Closing Shot
  await safeClick(page.locator('button:has-text("Application Workflows (Steps 2-5)")'), 2500);

  console.log('Finalizing clean video recording...');
  await page.close();
  await context.close();
  await browser.close();

  // Locate the generated video
  const videoFiles = fs.readdirSync(RECORDING_DIR).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    videoFiles.sort((a, b) => {
      return fs.statSync(path.join(RECORDING_DIR, b)).mtimeMs - fs.statSync(path.join(RECORDING_DIR, a)).mtimeMs;
    });
    const latestVideo = path.join(RECORDING_DIR, videoFiles[0]);
    const rootVideo = 'D:/anupalan-1/anupalan_demo_walkthrough.webm';
    fs.copyFileSync(latestVideo, rootVideo);

    const artifactVideo = path.join(ARTIFACT_DIR, 'anupalan_demo_walkthrough.webm');
    fs.copyFileSync(latestVideo, artifactVideo);

    const stats = fs.statSync(rootVideo);
    console.log(`\n============================================================`);
    console.log(`🎉 SUCCESS! Clean, Full-Screen Demo Walkthrough Video Created!`);
    console.log(`Location: ${rootVideo}`);
    console.log(`Resolution: 1440x860`);
    console.log(`Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`============================================================\n`);
  }
}

run().catch((err) => {
  console.error('Fatal error during video recording:', err);
  process.exit(1);
});
