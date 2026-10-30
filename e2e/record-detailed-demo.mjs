import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Hp/.gemini/antigravity-ide/brain/831af7b3-7ad3-48a4-9f1c-5da4a6738fa6';
const RECORDING_DIR = path.join(ARTIFACT_DIR, 'recordings');

if (!fs.existsSync(RECORDING_DIR)) {
  fs.mkdirSync(RECORDING_DIR, { recursive: true });
}

async function showNarrative(page, stepNum, title, description, pauseMs = 3500) {
  try {
    await page.evaluate(({ stepNum, title, description }) => {
      let bar = document.getElementById('anupalan-narrative-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'anupalan-narrative-bar';
        bar.style.position = 'fixed';
        bar.style.bottom = '16px';
        bar.style.left = '50%';
        bar.style.transform = 'translateX(-50%)';
        bar.style.width = 'calc(100% - 48px)';
        bar.style.maxWidth = '1120px';
        bar.style.backgroundColor = 'rgba(0, 34, 68, 0.96)';
        bar.style.color = '#ffffff';
        bar.style.padding = '14px 22px';
        bar.style.borderRadius = '14px';
        bar.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.4)';
        bar.style.border = '1.5px solid rgba(255, 193, 7, 0.5)';
        bar.style.zIndex = '999999';
        bar.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        bar.style.backdropFilter = 'blur(10px)';
        bar.style.transition = 'all 0.3s ease';
        bar.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span id="narrative-step" style="background: #ffc107; color: #002244; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;"></span>
              <span id="narrative-title" style="font-weight: 700; font-size: 14px; color: #ffffff;"></span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; font-family: monospace; display: flex; align-items: center; gap: 6px;">
              <span style="display:inline-block; width:7px; height:7px; background:#10b981; border-radius:50%;"></span>
              SIH 2026 · PS 26262 Prototype Tour
            </div>
          </div>
          <div id="narrative-desc" style="margin-top: 8px; font-size: 12px; color: #cbd5e1; line-height: 1.5;"></div>
        `;
        document.body.appendChild(bar);
      }
      document.getElementById('narrative-step').innerText = stepNum;
      document.getElementById('narrative-title').innerText = title;
      document.getElementById('narrative-desc').innerHTML = description;
    }, { stepNum, title, description });
    await page.waitForTimeout(pauseMs);
  } catch (err) {
    console.log(`[Narrative notice]: ${err.message?.split('\n')[0]}`);
  }
}

async function safeClick(locator, waitMs = 2000) {
  try {
    await locator.waitFor({ state: 'visible', timeout: 5000 });
    await locator.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
    await locator.click({ timeout: 5000, force: true });
    await new Promise(r => setTimeout(r, waitMs));
    return true;
  } catch (err) {
    console.log(`[safeClick notice]: ${err.message?.split('\n')[0]}`);
    return false;
  }
}

async function switchRole(page, roleName) {
  try {
    const roleDropdownTrigger = page.locator('header').locator('button').filter({ hasText: 'Dr.' }).or(page.locator('header').locator('button').filter({ hasText: 'Prof.' })).or(page.locator('header').locator('button').filter({ hasText: 'Director' })).first();
    await roleDropdownTrigger.click({ timeout: 4000, force: true });
    await page.waitForTimeout(600);

    const targetOption = page.locator('.divide-y button').filter({ hasText: roleName }).first();
    await targetOption.click({ timeout: 4000, force: true });
    await page.waitForTimeout(1500);
    console.log(`Role successfully switched to: ${roleName}`);
  } catch (err) {
    console.log(`Role switch notice for ${roleName}: ${err.message?.split('\n')[0]}`);
  }
}

async function run() {
  console.log('[1/12] Launching Google Chrome for detailed, in-depth walkthrough video...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: RECORDING_DIR,
      size: { width: 1440, height: 900 },
    },
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  console.log('[2/12] Loading ANUPALAN dashboard at http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // -------------------------------------------------------------
  // SECTION 0: System Architecture & Dashboard Overview (~40s)
  // -------------------------------------------------------------
  console.log('[3/12] System Architecture & Dashboard Overview...');
  await showNarrative(
    page,
    'SYSTEM OVERVIEW',
    'AICTE ANUPALAN — Statutory Approval & Obligation Platform',
    'Welcome to ANUPALAN (अनुपालन). Developed for SIH 2026 PS 26262 to transform AICTE approvals from disconnected one-off approvals into a continuous, obligation-aware compliance ecosystem. The platform enforces 5 Hard Invariants and operates across 6 architectural pillars.',
    6000
  );

  // Highlight KPI Cards
  await showNarrative(
    page,
    'EXECUTIVE KPIS',
    'Autonomous Multi-Dimensional Telemetry Cards',
    'Top KPI cards continuously calculate active application workflows, SLA breach tracking, open post-approval obligations, institutional compliance index, and automated regulatory follow-ups saved counter.',
    5000
  );
  await page.mouse.wheel(0, 220);
  await page.waitForTimeout(2000);
  await page.mouse.wheel(0, -220);
  await page.waitForTimeout(1500);

  // -------------------------------------------------------------
  // STEP 1: Rule Pack Configuration (APH 2024-27) (~50s)
  // -------------------------------------------------------------
  console.log('[4/12] Step 1: Rule Pack Configuration...');
  await showNarrative(
    page,
    'DEMO STEP 1 OF 9',
    'APH 2024-27 Statutory Rule Pack as Versioned DATA',
    '<b>Hard Invariant 5:</b> Approval pathways, SLAs, escalation ladders, and safety margins are stored as versioned DATA (<code>rules/aph-2024-27.yaml</code>), never hardcoded in source code. Changing them is a single screen, not a code deployment.',
    6000
  );

  await safeClick(page.locator('button:has-text("Rule Pack Editor (Step 1)")'), 2500);

  // Scroll through rule fields
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(2000);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(1500);

  await showNarrative(
    page,
    'DEMO STEP 1',
    'Modifying Statutory SLA & Publishing Rule Pack Diff',
    'Now an administrator edits the Expert Visit Committee (EVC) Inspection SLA from 30 calendar days down to 25 days. The platform computes an impact preview and writes <code>RULEPACK_PUBLISHED</code> to the cryptographic audit trail.',
    5000
  );

  await safeClick(page.locator('button:has-text("Edit Rule Pack")'), 1200);

  const numInput = page.locator('input[type="number"]').first();
  if (await numInput.isVisible().catch(() => false)) {
    await numInput.fill('25');
    await page.waitForTimeout(1200);
  }

  await safeClick(page.locator('button:has-text("Publish Changes")'), 3500);

  // -------------------------------------------------------------
  // STEP 2: Dual Pathway Routing & Invariant Enforcement (~55s)
  // -------------------------------------------------------------
  console.log('[5/12] Step 2: Dual Pathway Routing & Invariant Enforcement...');
  await showNarrative(
    page,
    'DEMO STEP 2 OF 9',
    'Dynamic Statutory Pathway Routing & Illegal Stage Skip Prevention',
    'Demonstrating two distinct approval pathways: <code>DEMO-001</code> (New Course, B.Tech AI & Data Science) routes through <code>Scrutiny ➔ EVC ➔ Decision</code>. Meanwhile, <code>DEMO-EOA-2026</code> (Extension of Approval) follows fast-track <code>Scrutiny ➔ Decision</code>.',
    6000
  );

  await safeClick(page.locator('button:has-text("Application Workflows (Steps 2-5)")'), 2500);

  await showNarrative(
    page,
    'DEMO STEP 2',
    'Attempting Unauthorized Stage Skip (Scrutiny Directly to Decision)',
    'A Scrutiny Officer now attempts to skip physical inspection and jump straight to Decision on <code>DEMO-001</code>. The security rule engine intercepts this unlawful transition and records <code>BLOCKED_TRANSITION</code>.',
    5000
  );

  const forwardBtn = page.locator('button:has-text("Forward (Step 2)")').first();
  if (await forwardBtn.isVisible().catch(() => false)) {
    await safeClick(forwardBtn, 3000);
    await showNarrative(
      page,
      'INVARIANT REFUSAL',
      'Statutory Security Interception Confirmed',
      'The platform displays the official statutory refusal memo citing governing AICTE regulations. The unlawful skip was strictly rejected and logged with a tamper-evident digital seal.',
      5000
    );
    await safeClick(page.locator('button:has-text("Acknowledge & Close")'), 1500);
  }

  // -------------------------------------------------------------
  // STEP 3: Return with Deficiency Memo & Dual-Clock SLA (~55s)
  // -------------------------------------------------------------
  console.log('[6/12] Step 3: Return with Deficiency Memo & Dual-Clock SLA...');
  await showNarrative(
    page,
    'DEMO STEP 3 OF 9',
    'Deficiency Return Memo & Statutory Dual-Clock SLA Pausing',
    '<b>Hard Invariant 1 & 7:</b> An officer returning a file must provide a non-empty, legally justified reason. Empty returns are strictly rejected. When issued, the AICTE statutory clock pauses, and the institution response clock begins.',
    6000
  );

  const returnBtn = page.locator('button:has-text("Return (Step 3)")').first();
  if (await returnBtn.isVisible().catch(() => false)) {
    await safeClick(returnBtn, 1500);

    // Test Invariant 7 Violation (empty reason)
    await safeClick(page.locator('button:has-text("Sign & Issue Deficiency Memo")'), 2000);

    // Enter valid deficiency reason
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill('Deficient faculty cadre ratio in Computer Science Dept (Cadre 1:2:6 deficit per APH Ch 6 § 3). Immediate clarification and recruitment roster required.');
      await page.waitForTimeout(2000);
    }

    await safeClick(page.locator('button:has-text("Sign & Issue Deficiency Memo")'), 3500);
  }

  // -------------------------------------------------------------
  // STEP 4: Applicant Resubmission & Clock Resumption (~50s)
  // -------------------------------------------------------------
  console.log('[7/12] Step 4: Applicant Resubmission & Clock Resumption...');
  await showNarrative(
    page,
    'DEMO STEP 4 OF 9',
    'Applicant Compliance Resubmission & Remaining SLA Clock Resumption',
    'Switching actor profile to Institution Principal (<code>Dr. Anand Kulkarni</code>). The applicant reviews the deficiency directive and resubmits compliance evidence. The AICTE clock resumes with <i>remaining</i> SLA days (never a reset count).',
    6000
  );

  await switchRole(page, 'Dr. Anand Kulkarni');

  const resubmitBtn = page.locator('button:has-text("Resubmit Clarification (Step 4)")').first();
  if (await resubmitBtn.isVisible().catch(() => false)) {
    await safeClick(resubmitBtn, 3000);
  }

  // Switch back to Scrutiny Officer
  await switchRole(page, 'Dr. Ramesh Sharma');
  await page.waitForTimeout(2000);

  // -------------------------------------------------------------
  // STEP 5: Time Machine Simulation (+20 Days) & Escalation (~65s)
  // -------------------------------------------------------------
  console.log('[8/12] Step 5: Time Machine Simulation & Escalation...');
  await showNarrative(
    page,
    'DEMO STEP 5 OF 9',
    'Deterministic Virtual Clock (Time Machine) Simulation (+20 Days)',
    '<b>Hard Invariant 2:</b> All time across ANUPALAN is derived strictly from <code>clock.now()</code>. Clicking <b>+20 Days</b> accelerates virtual time to simulate upcoming deadlines, triggering automated escalation ladders without waiting weeks.',
    6000
  );

  await safeClick(page.locator('button:has-text("+20 Days")'), 3000);

  await showNarrative(
    page,
    'ESCALATION LADDER',
    'Automated Multi-Tier Notification Dispatches & Math Panel',
    'With +20 simulated days elapsed, SLA timers breach thresholds. Notice the orange Time Machine indicator, incremented automated follow-ups counter (+12), and active notification alerts.',
    5000
  );

  const alertBell = page.locator('button[title*="Statutory Alerts"]');
  if (await alertBell.isVisible().catch(() => false)) {
    await safeClick(alertBell, 2000);

    // Click "Why did this fire?"
    const whyBtn = page.locator('button:has-text("Why did this fire?")').first();
    if (await whyBtn.isVisible().catch(() => false)) {
      await safeClick(whyBtn, 2000);
      await showNarrative(
        page,
        'REGULATORY EXPLANATION',
        'Mathematical Escalation Transparency Panel',
        'Every automated alert generated by ANUPALAN provides an explicit mathematical justification showing exact virtual clock dates, threshold calculations, and governing APH regulatory clauses.',
        6000
      );
      await safeClick(page.locator('button:has-text("Close Explanation")'), 1200);
    }

    await safeClick(page.locator('button:has-text("Close")').first(), 1500);
  }

  // -------------------------------------------------------------
  // STEP 6: Advisory Readiness Gate & Conditional Approval (~60s)
  // -------------------------------------------------------------
  console.log('[9/12] Step 6: Advisory Readiness Gate & Conditional Approval...');
  await showNarrative(
    page,
    'DEMO STEP 6 OF 9',
    'Advisory Readiness Gate & Human Decision Authority',
    '<b>Hard Invariant 1:</b> The algorithm never grants or denies approval autonomously. Switching actor to Competent Authority / Chairman (<code>Prof. T. G. Sitharam</code>). The Readiness Gate pre-evaluates multi-dimensional compliance as advisory intelligence for human leadership.',
    6000
  );

  await switchRole(page, 'Prof. T. G. Sitharam');

  const gateBtn = page.locator('button:has-text("Assess Readiness Gate (Step 6)")').first();
  if (await gateBtn.isVisible().catch(() => false)) {
    await safeClick(gateBtn, 2500);

    await showNarrative(
      page,
      'HUMAN AGENCY',
      'Granting Conditional Approval with Attached Statutory Terms',
      'The Competent Authority acknowledges advisory warnings regarding open faculty undertakings, records required compliance terms, and grants <b>Conditional Approval</b>. The decision is permanently signed and logged.',
      5000
    );

    // Click Conditional Approval
    const condBtn = page.locator('[data-testid="btn-conditional-approval"]');
    await safeClick(condBtn, 1200);

    const condTextarea = page.locator('[data-testid="textarea-conditions"]');
    if (await condTextarea.isVisible().catch(() => false)) {
      await condTextarea.fill('Conditional Approval granted under SAC jurisdiction. Mandatory submission of faculty cadre appointment orders required within 6 months.');
      await page.waitForTimeout(1500);
    }

    // Record Decision - Auto-closes after 1.8s!
    const recordBtn = page.locator('[data-testid="btn-record-decision"]');
    await safeClick(recordBtn, 2500);

    // Extra safeguard to ensure modal is 100% closed
    await page.waitForTimeout(2000);
    const closeBtn = page.locator('[data-testid="close-readiness-x"]').or(page.locator('button:has-text("Close & Return to Workflows")'));
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true }).catch(() => {});
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }

  // -------------------------------------------------------------
  // STEP 7 & 8: Institutional Obligation Ledger (~55s)
  // -------------------------------------------------------------
  console.log('[10/12] Step 7 & 8: Obligation Ledger...');
  await showNarrative(
    page,
    'DEMO STEP 7 & 8',
    'Post-Approval Obligation Ledger & Compliance Verification',
    'Approvals are not the end of regulation. Conditional approval terms spawn mandatory post-approval obligations into the Obligation Ledger (Pillar 3). Notice the full-screen table tracking all institutional commitments.',
    6000
  );

  await safeClick(page.locator('button:has-text("Obligation Ledger (Step 8)")'), 2500);

  // Scroll through obligation ledger
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(2000);
  await page.mouse.wheel(0, -200);
  await page.waitForTimeout(1500);

  // Switch to Institution to submit proof
  await switchRole(page, 'Dr. Anand Kulkarni');

  const submitProofBtn = page.locator('button:has-text("Submit Proof")').first();
  if (await submitProofBtn.isVisible().catch(() => false)) {
    await safeClick(submitProofBtn, 1200);
    await showNarrative(
      page,
      'EVIDENCE SUBMISSION',
      'Applicant Submits Certified Compliance Proof',
      'The Institution Principal submits statutory appointment gazettes and proof documents. The submission is timestamped with <code>clock.now()</code> and hashed.',
      4000
    );
    await safeClick(page.locator('button:has-text("Confirm Submission")'), 2500);
  }

  // Switch back to Scrutiny Officer to verify proof
  await switchRole(page, 'Dr. Ramesh Sharma');

  const verifyProofBtn = page.locator('button:has-text("Verify Proof")').first();
  if (await verifyProofBtn.isVisible().catch(() => false)) {
    await safeClick(verifyProofBtn, 1200);
    await safeClick(page.locator('button:has-text("Approve & Close")'), 2500);
  }

  // -------------------------------------------------------------
  // PILLAR 6: Institutional Compliance Index (~45s)
  // -------------------------------------------------------------
  console.log('[11/12] Pillar 6: Compliance Index...');
  await showNarrative(
    page,
    'PILLAR 6',
    'Institutional Compliance Index (0–100 Dynamic Health Band)',
    'The Compliance Index continuously scores institutional health across Governance, Timeliness, Obligation Fulfillment, and Infrastructure. Saraswati Institute currently scores 62/100 (Amber Band). Timely verification helps elevate the score toward Green (70+).',
    6000
  );

  await safeClick(page.locator('button:has-text("Compliance Index (Pillar 6)")'), 3000);

  // Scroll through breakdown cards
  await page.mouse.wheel(0, 260);
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, -260);
  await page.waitForTimeout(1500);

  // -------------------------------------------------------------
  // STEP 9: Cryptographic Audit Trail & Tamper Simulation (~70s)
  // -------------------------------------------------------------
  console.log('[12/12] Step 9: Cryptographic Audit Trail & Tamper Detection...');
  await showNarrative(
    page,
    'DEMO STEP 9 OF 9',
    'Cryptographic SHA-256 Hash Chaining & External Ed25519 Seals',
    '<b>Hard Invariant 3:</b> Every single state mutation appends a cryptographically sealed block (SHA-256 forward hash-chain). Any unauthorized alteration of historical records—even by database administrators—is mathematically detectable.',
    6000
  );

  await safeClick(page.locator('button:has-text("Cryptographic Audit (Step 9)")'), 2500);

  // Scroll through audit ledger
  await page.mouse.wheel(0, 240);
  await page.waitForTimeout(2000);
  await page.mouse.wheel(0, -240);
  await page.waitForTimeout(1500);

  // Verify initial chain
  await showNarrative(
    page,
    'CHAIN INTEGRITY',
    'Initial Merkle Verification — All Hashes Valid (Green)',
    'Running the mathematical verification sequence across all historical transactions from Genesis block to current timestamp...',
    4000
  );

  await safeClick(page.locator('button:has-text("Verify Chain Integrity")'), 3500);

  // Simulate Row Tamper
  await showNarrative(
    page,
    'TAMPER SIMULATION',
    'Simulating Malicious Historical Database Modification',
    'Simulating an unauthorized database modification on historical block <code>AUDIT-SUBMIT-001</code> (e.g. injecting fake approval parameters). The data changes, but the cryptographic hash chain remains intact elsewhere.',
    6000
  );

  await safeClick(page.locator('button:has-text("Simulate Row Tamper")'), 2500);

  // Re-verify -> Tamper detected!
  await showNarrative(
    page,
    'TAMPER DETECTED',
    'Immediate Detection: Hash Mismatch at Compromised Row!',
    'The cryptographic verification engine detects that Entry 1 does not produce the expected hash chained to Block 2. The entire evidentiary chain of custody turns <b>RED</b>, identifying the exact tampered row.',
    6000
  );

  await safeClick(page.locator('button:has-text("Verify Chain Integrity")'), 4500);

  // -------------------------------------------------------------
  // CONCLUSION & WRAP-UP (~30s)
  // -------------------------------------------------------------
  await safeClick(page.locator('button:has-text("Application Workflows (Steps 2-5)")'), 2000);

  await showNarrative(
    page,
    'SUMMARY',
    'ANUPALAN: Fully Verified & Production-Ready Prototype',
    '<i>"The system routed, timed, and escalated. Every decision on this screen has a human name next to it."</i><br>SIH 2026 · PS 26262 Prototype Verification Complete.',
    7000
  );

  console.log('Finalizing detailed video recording...');
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
    console.log(`\n========================================================================`);
    console.log(`🎉 SUCCESS! Comprehensive In-Depth Walkthrough Video Created!`);
    console.log(`Location: ${rootVideo}`);
    console.log(`Resolution: 1440x900 (Desktop Presentation Mode)`);
    console.log(`Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`========================================================================\n`);
  }
}

run().catch((err) => {
  console.error('Fatal error during detailed video recording:', err);
  process.exit(1);
});
