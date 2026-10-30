import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Hp/.gemini/antigravity-ide/brain/831af7b3-7ad3-48a4-9f1c-5da4a6738fa6';
const RECORDING_DIR = path.join(ARTIFACT_DIR, 'recordings');

if (!fs.existsSync(RECORDING_DIR)) {
  fs.mkdirSync(RECORDING_DIR, { recursive: true });
}

async function run() {
  console.log('[1/10] Launching browser to record demo video...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: RECORDING_DIR,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();
  console.log('[2/10] Loading ANUPALAN dashboard at http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Overview of Dashboard & Masthead
  console.log('[3/10] Step 1: Rule Pack Editor Demo...');
  await page.click('button:has-text("Rule Pack Editor (Step 1)")');
  await page.waitForTimeout(1500);

  // Click Edit Rule Pack
  await page.click('button:has-text("Edit Rule Pack")');
  await page.waitForTimeout(1000);

  // Change EVC SLA value
  const numInput = page.locator('input[type="number"]').first();
  await numInput.click();
  await numInput.fill('25');
  await page.waitForTimeout(1000);

  // Publish changes
  await page.click('button:has-text("Publish Changes")');
  await page.waitForTimeout(2000);

  // Step 2 & 3: Application Workflows & Illegal Jump
  console.log('[4/10] Step 2 & 3: Workflows, Invariant Protection & Return...');
  await page.click('button:has-text("Application Workflows (Steps 2-5)")');
  await page.waitForTimeout(1500);

  // Attempt Illegal Jump on DEMO-001
  const forwardBtn = page.locator('button:has-text("Forward (Step 2)")').first();
  if (await forwardBtn.isVisible()) {
    await forwardBtn.click();
    await page.waitForTimeout(2000);
    // Acknowledge modal
    const ackBtn = page.locator('button:has-text("Acknowledge & Close")').or(page.locator('button:has-text("Acknowledge")'));
    if (await ackBtn.isVisible()) {
      await ackBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // Step 3: Return with Reason
  const returnBtn = page.locator('button:has-text("Return (Step 3)")').first();
  if (await returnBtn.isVisible()) {
    await returnBtn.click();
    await page.waitForTimeout(1000);

    // Empty click -> test invariant validation
    const confirmReturnBtn = page.locator('button:has-text("Confirm Return to Institution")').or(page.locator('button:has-text("Confirm")'));
    if (await confirmReturnBtn.isVisible()) {
      await confirmReturnBtn.click();
      await page.waitForTimeout(1000);
    }

    // Enter valid deficiency reason
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill('Deficient faculty cadre ratio in Computer Science Dept (Cadre 1:2:6 deficit per APH Ch 6).');
      await page.waitForTimeout(1000);
    }

    if (await confirmReturnBtn.isVisible()) {
      await confirmReturnBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Step 4: Role Switch to Institution & Resubmit
  console.log('[5/10] Step 4: Role Switch to Institution & Resubmit...');
  // Click role switcher dropdown
  await page.click('button:has-text("Dr. Ramesh Sharma")').catch(() => {});
  await page.waitForTimeout(500);
  const instRoleBtn = page.locator('button:has-text("Dr. Anand Kulkarni")').or(page.locator('text=Dr. Anand Kulkarni'));
  if (await instRoleBtn.isVisible()) {
    await instRoleBtn.click();
    await page.waitForTimeout(1000);
  }

  // Click Resubmit Clarification
  const resubmitBtn = page.locator('button:has-text("Resubmit Clarification (Step 4)")').first();
  if (await resubmitBtn.isVisible()) {
    await resubmitBtn.click();
    await page.waitForTimeout(2000);
  }

  // Switch back to Scrutiny Officer
  await page.click('button:has-text("Dr. Anand Kulkarni")').catch(() => {});
  await page.waitForTimeout(500);
  const officerRoleBtn = page.locator('button:has-text("Dr. Ramesh Sharma")').or(page.locator('text=Dr. Ramesh Sharma'));
  if (await officerRoleBtn.isVisible()) {
    await officerRoleBtn.click();
    await page.waitForTimeout(1000);
  }

  // Step 5: Time Machine +20 Days & Escalation Alerts
  console.log('[6/10] Step 5: Time Machine +20 Days & Escalation Alerts...');
  const timeMachineBtn = page.locator('button:has-text("+20 Days")');
  if (await timeMachineBtn.isVisible()) {
    await timeMachineBtn.click();
    await page.waitForTimeout(2000);
  }

  // Open Alerts Panel
  const alertBell = page.locator('button[title*="Alerts"]').or(page.locator('header button').nth(3));
  if (await alertBell.isVisible()) {
    await alertBell.click();
    await page.waitForTimeout(1500);

    // Click "Why did this fire?"
    const whyBtn = page.locator('button:has-text("Why did this fire?")').first();
    if (await whyBtn.isVisible()) {
      await whyBtn.click();
      await page.waitForTimeout(2000);
      // Close Why modal
      const closeWhyBtn = page.locator('.fixed button:has-text("✕")').or(page.locator('.fixed button:has(svg)').first());
      if (await closeWhyBtn.isVisible()) {
        await closeWhyBtn.click().catch(() => {});
      }
      await page.waitForTimeout(1000);
    }

    // Close Alerts drawer
    const closeDrawerBtn = page.locator('button:has-text("Close")').or(page.locator('.fixed button:has(svg)').first());
    if (await closeDrawerBtn.isVisible()) {
      await closeDrawerBtn.click().catch(() => {});
    }
  }

  // Step 6: Advisory Readiness Gate
  console.log('[7/10] Step 6: Advisory Readiness Gate...');
  await page.click('button:has-text("Application Workflows (Steps 2-5)")');
  await page.waitForTimeout(1000);

  // Switch to Competent Authority for Decision
  await page.click('button:has-text("Dr. Ramesh Sharma")').catch(() => {});
  await page.waitForTimeout(500);
  const chairmanRole = page.locator('button:has-text("Prof. T. G. Sitharam")').or(page.locator('text=Prof. T. G. Sitharam'));
  if (await chairmanRole.isVisible()) {
    await chairmanRole.click();
    await page.waitForTimeout(1000);
  }

  // Open Readiness Gate
  const gateBtn = page.locator('button:has-text("Assess Readiness Gate (Step 6)")').first();
  if (await gateBtn.isVisible()) {
    await gateBtn.click();
    await page.waitForTimeout(2000);

    // Click Conditional Approval
    const condBtn = page.locator('button:has-text("Conditional Approval")');
    if (await condBtn.isVisible()) {
      await condBtn.click();
      await page.waitForTimeout(1000);

      const condTextarea = page.locator('textarea[placeholder*="Specify conditions"]').first();
      if (await condTextarea.isVisible()) {
        await condTextarea.fill('Conditional approval granted. Mandatory recruitment order submission required within 6 months.');
        await page.waitForTimeout(1000);
      }

      // Record Decision
      const recordBtn = page.locator('button:has-text("Record Decision")');
      if (await recordBtn.isVisible()) {
        await recordBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Close modal
    const closeGateBtn = page.locator('button:has-text("Close")').or(page.locator('.fixed button:has(svg)').first());
    if (await closeGateBtn.isVisible()) {
      await closeGateBtn.click().catch(() => {});
    }
  }

  // Step 7 & 8: Obligation Ledger
  console.log('[8/10] Step 7 & 8: Obligation Ledger & Proof Verification...');
  await page.click('button:has-text("Obligation Ledger (Step 8)")');
  await page.waitForTimeout(2000);

  // Switch to Institution to submit proof
  await page.click('button:has-text("Prof. T. G. Sitharam")').catch(() => {});
  await page.waitForTimeout(500);
  const instRole2 = page.locator('button:has-text("Dr. Anand Kulkarni")').or(page.locator('text=Dr. Anand Kulkarni'));
  if (await instRole2.isVisible()) {
    await instRole2.click();
    await page.waitForTimeout(1000);
  }

  const submitProofBtn = page.locator('button:has-text("Submit Proof")').first();
  if (await submitProofBtn.isVisible()) {
    await submitProofBtn.click();
    await page.waitForTimeout(1000);

    const confirmSubBtn = page.locator('button:has-text("Confirm Submission")');
    if (await confirmSubBtn.isVisible()) {
      await confirmSubBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Switch back to Scrutiny Officer
  await page.click('button:has-text("Dr. Anand Kulkarni")').catch(() => {});
  await page.waitForTimeout(500);
  const officerRole2 = page.locator('button:has-text("Dr. Ramesh Sharma")').or(page.locator('text=Dr. Ramesh Sharma'));
  if (await officerRole2.isVisible()) {
    await officerRole2.click();
    await page.waitForTimeout(1000);
  }

  // Verify Proof
  const verifyProofBtn = page.locator('button:has-text("Verify Proof")').first();
  if (await verifyProofBtn.isVisible()) {
    await verifyProofBtn.click();
    await page.waitForTimeout(1000);
    const approveBtn = page.locator('button:has-text("Approve Evidence")').or(page.locator('button:has-text("Approve")')).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Step 8: Compliance Index View
  console.log('[9/10] Compliance Index View...');
  await page.click('button:has-text("Compliance Index (Pillar 6)")');
  await page.waitForTimeout(2000);

  // Step 9: Cryptographic Audit & Tamper Simulation
  console.log('[10/10] Step 9: Cryptographic Audit & Tamper Simulation...');
  await page.click('button:has-text("Cryptographic Audit (Step 9)")');
  await page.waitForTimeout(1500);

  // Verify initial chain
  await page.click('button:has-text("Verify Chain Integrity")');
  await page.waitForTimeout(2500);

  // Simulate Row Tamper
  await page.click('button:has-text("Simulate Row Tamper")');
  await page.waitForTimeout(2000);

  // Verify again -> Tamper detected!
  await page.click('button:has-text("Verify Chain Integrity")');
  await page.waitForTimeout(3500);

  // Back to Main Overview for Closing
  await page.click('button:has-text("Application Workflows (Steps 2-5)")');
  await page.waitForTimeout(2000);

  console.log('Finalizing video recording...');
  await page.close();
  await context.close();
  await browser.close();

  // Find generated video file
  const videoFiles = fs.readdirSync(RECORDING_DIR).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const latestVideo = path.join(RECORDING_DIR, videoFiles[videoFiles.length - 1]);
    const targetFile = 'D:/anupalan-1/anupalan_demo_walkthrough.webm';
    fs.copyFileSync(latestVideo, targetFile);
    console.log(`\n========================================`);
    console.log(`SUCCESS! Demo video recorded and saved!`);
    console.log(`Video location 1: ${latestVideo}`);
    console.log(`Video location 2: ${targetFile}`);
    console.log(`File size: ${(fs.statSync(targetFile).size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`========================================\n`);
  }
}

run().catch((err) => {
  console.error('Error during video recording:', err);
  process.exit(1);
});
