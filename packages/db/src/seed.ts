import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, UserRole, RegionCode, ApplicationStatus, ObligationSeverity } from '@prisma/client';
import { clock } from '@anupalan/engine';

const prisma = new PrismaClient();

// Deterministic Mulberry32 Seeded PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function runSeed(seedNumber = 2026) {
  const rng = mulberry32(seedNumber);
  console.log(`[ANUPALAN SEED] Initializing deterministic seed with seed value: ${seedNumber}`);

  // 1. Clean existing records in reverse dependency order
  console.log('[ANUPALAN SEED] Resetting database tables...');
  await prisma.auditLog.deleteMany({});
  await prisma.auditSeal.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.evidenceLink.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.obligationEvent.deleteMany({});
  await prisma.obligation.deleteMany({});
  await prisma.override.deleteMany({});
  await prisma.readinessCheck.deleteMany({});
  await prisma.decision.deleteMany({});
  await prisma.evcMember.deleteMany({});
  await prisma.evcVisit.deleteMany({});
  await prisma.stageEvent.deleteMany({});
  await prisma.clockSegment.deleteMany({});
  await prisma.stageInstance.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.complianceScore.deleteMany({});
  await prisma.holiday.deleteMany({});
  await prisma.pathwayStage.deleteMany({});
  await prisma.pathway.deleteMany({});
  await prisma.rulePack.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.institution.deleteMany({});
  await prisma.region.deleteMany({});

  // 2. Seed Regions
  console.log('[ANUPALAN SEED] Seeding 7 official AICTE regions...');
  const regionCodes: RegionCode[] = [
    'CENTRAL',
    'EASTERN',
    'NORTHERN',
    'NORTHWEST',
    'SOUTHERN',
    'SOUTHWEST',
    'WESTERN',
  ];

  const regionMap = new Map<RegionCode, string>();
  for (const code of regionCodes) {
    const reg = await prisma.region.create({
      data: {
        code,
        name: code.charAt(0) + code.slice(1).toLowerCase() + ' Region',
      },
    });
    regionMap.set(code, reg.id);
  }

  // 3. Seed Rule Pack (from rules/aph-2024-27.yaml)
  console.log('[ANUPALAN SEED] Loading starter rule pack aph-2024-27...');
  const rulePackPath = path.resolve(process.cwd(), 'rules', 'aph-2024-27.yaml');
  const rawYaml = fs.existsSync(rulePackPath) ? fs.readFileSync(rulePackPath, 'utf8') : 'pack: aph-2024-27';

  const pack = await prisma.rulePack.create({
    data: {
      name: 'APH 2024-25 to 2026-27',
      version: '0.1.0',
      status: 'PUBLISHED',
      publishedBy: 'System Administrator',
      versionNote: 'Initial baseline approval process rule pack',
      rawYaml,
    },
  });

  // Seed Pathways
  const pathwaysData = [
    {
      code: 'only_scrutiny',
      name: 'Extension of Approval (Standard)',
      stages: [
        { seq: 1, stageCode: 'SCRUTINY', ownerRole: UserRole.SCRUTINY_OFFICER, slaDays: 15, allowedReverts: [] },
        { seq: 2, stageCode: 'DECISION', ownerRole: UserRole.COMPETENT_AUTHORITY, slaDays: 10, allowedReverts: ['SCRUTINY'] },
      ],
    },
    {
      code: 'scrutiny_evc',
      name: 'New Course / Intake Increase',
      stages: [
        { seq: 1, stageCode: 'SCRUTINY', ownerRole: UserRole.SCRUTINY_OFFICER, slaDays: 15, allowedReverts: [] },
        { seq: 2, stageCode: 'EVC', ownerRole: UserRole.EVC_CONVENER, slaDays: 30, allowedReverts: ['SCRUTINY'] },
        { seq: 3, stageCode: 'DECISION', ownerRole: UserRole.COMPETENT_AUTHORITY, slaDays: 10, allowedReverts: ['EVC', 'SCRUTINY'] },
      ],
    },
  ];

  for (const p of pathwaysData) {
    const createdPathway = await prisma.pathway.create({
      data: {
        packId: pack.id,
        code: p.code,
        name: p.name,
      },
    });

    for (const s of p.stages) {
      await prisma.pathwayStage.create({
        data: {
          pathwayId: createdPathway.id,
          seq: s.seq,
          stageCode: s.stageCode,
          ownerRole: s.ownerRole,
          slaDays: s.slaDays,
          calendarMode: 'working',
          allowedReverts: s.allowedReverts,
        },
      });
    }
  }

  // 4. Seed 7 Core Demo Users
  console.log('[ANUPALAN SEED] Creating 7 demo role accounts...');
  const westernId = regionMap.get('WESTERN')!;

  // Demo Institution
  const demoInst = await prisma.institution.create({
    data: {
      aicteId: '1-100200300',
      name: 'Saraswati Institute of Technology & Engineering',
      regionId: westernId,
      institutionType: 'ENGINEERING_COLLEGE',
      contactEmail: 'principal@demo-engg.edu.in',
    },
  });

  const demoUsers = [
    {
      name: 'Administrator',
      email: 'admin@aicte.gov.in',
      role: UserRole.SYSTEM_ADMIN,
    },
    {
      name: 'Dr. Anand Kulkarni (Principal)',
      email: 'principal@demo-engg.edu.in',
      role: UserRole.INSTITUTION,
      institutionId: demoInst.id,
      regionId: westernId,
    },
    {
      name: 'Dr. Ramesh Sharma (Scrutiny Officer)',
      email: 'scrutiny.west@aicte.gov.in',
      role: UserRole.SCRUTINY_OFFICER,
      regionId: westernId,
    },
    {
      name: 'Dr. Sunita Deshmukh (Regional Director)',
      email: 'rd.west@aicte.gov.in',
      role: UserRole.REGIONAL_DIRECTOR,
      regionId: westernId,
    },
    {
      name: 'Prof. Arvind Kelkar (EVC Convener)',
      email: 'evc.convener@aicte.gov.in',
      role: UserRole.EVC_CONVENER,
      regionId: westernId,
    },
    {
      name: 'Justice (Retd.) M. K. Rao (Committee Member)',
      email: 'shc.member@aicte.gov.in',
      role: UserRole.COMMITTEE_MEMBER,
    },
    {
      name: 'Prof. T. G. Sitharam (Competent Authority / HQ)',
      email: 'chairman@aicte.gov.in',
      role: UserRole.COMPETENT_AUTHORITY,
    },
  ];

  for (const u of demoUsers) {
    await prisma.user.create({ data: u });
  }

  // 5. Seed Fixtures: DEMO-001, DEMO-LEASE, DEMO-UNDERTAKING
  console.log('[ANUPALAN SEED] Seeding demo test fixtures (DEMO-001, DEMO-LEASE, DEMO-UNDERTAKING)...');
  const now = clock.now();

  // Fixture: DEMO-001 (Application in Scrutiny)
  const appDemo1 = await prisma.application.create({
    data: {
      caseNumber: 'DEMO-001',
      institutionId: demoInst.id,
      typeCode: 'NEW_COURSE',
      packVersion: '0.1.0',
      currentStage: 'SCRUTINY',
      status: ApplicationStatus.UNDER_REVIEW,
      submittedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  const stageDemo1 = await prisma.stageInstance.create({
    data: {
      applicationId: appDemo1.id,
      stageCode: 'SCRUTINY',
      passNo: 1,
      startedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      dueOn: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
      dueVersion: 1,
    },
  });

  await prisma.clockSegment.create({
    data: {
      stageInstanceId: stageDemo1.id,
      party: 'AICTE',
      startAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // Fixture: DEMO-LEASE (Document with valid_to = today + 30 days)
  await prisma.document.create({
    data: {
      id: 'DOC-DEMO-LEASE',
      institutionId: demoInst.id,
      docType: 'LEASE_AGREEMENT',
      version: 1,
      fileName: 'Registered_Campus_Lease_Deed_2006_2036.pdf',
      fileKey: 'institutions/demo-001/lease_deed_v1.pdf',
      validFrom: new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000),
      validTo: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Exactly 30 days out!
      confirmedBy: 'Dr. Ramesh Sharma',
      status: 'ACTIVE',
    },
  });

  // Fixture: DEMO-UNDERTAKING (Obligation due in near future)
  await prisma.obligation.create({
    data: {
      id: 'OBL-DEMO-UNDERTAKING',
      institutionId: demoInst.id,
      type: 'UNDERTAKING',
      sourceRef: 'AICTE/WRO/2026/DEMO-CONDITIONAL-01',
      clause: 'APH-2024-27-Ch6-Sec3',
      severity: ObligationSeverity.MAJOR,
      title: 'Recruitment of Professor & Associate Professor in AI/ML',
      description: 'Formal undertaking submitted to SAC for completing faculty roster recruitment.',
      dueOn: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      dueVersion: 1,
      status: 'OPEN',
    },
  });

  // 6. Scale Seed: ~40 Synthetic Institutions across regions
  console.log('[ANUPALAN SEED] Seeding synthetic institutions and applications across all regions...');
  const prefixes = ['National', 'Vidyapeeth', 'Bharati', 'Shri Guru', 'Modern', 'Apex', 'Imperial'];
  const disciplines = ['Engineering & Technology', 'Polytechnic', 'Management Studies', 'Pharmaceutical Sciences'];

  for (let i = 1; i <= 35; i++) {
    const regCode = regionCodes[Math.floor(rng() * regionCodes.length)];
    const regId = regionMap.get(regCode)!;
    const instName = `${prefixes[Math.floor(rng() * prefixes.length)]} Institute of ${disciplines[Math.floor(rng() * disciplines.length)]} ${i}`;

    const inst = await prisma.institution.create({
      data: {
        aicteId: `1-${100000000 + i * 137}`,
        name: instName,
        regionId: regId,
        institutionType: 'TECHNICAL_INSTITUTE',
        contactEmail: `contact@inst-${i}.edu.in`,
      },
    });

    // Create an application for each
    const isNew = rng() > 0.5;
    const daysAgo = Math.floor(rng() * 45) + 1;
    const app = await prisma.application.create({
      data: {
        caseNumber: `APP-2026-${regCode.slice(0, 3)}-${1000 + i}`,
        institutionId: inst.id,
        typeCode: isNew ? 'NEW_COURSE' : 'EOA_EXISTING',
        packVersion: '0.1.0',
        currentStage: isNew ? (rng() > 0.5 ? 'EVC' : 'SCRUTINY') : 'SCRUTINY',
        status: ApplicationStatus.UNDER_REVIEW,
        submittedAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });

    const stageInst = await prisma.stageInstance.create({
      data: {
        applicationId: app.id,
        stageCode: app.currentStage,
        passNo: 1,
        startedAt: new Date(now.getTime() - (daysAgo - 5) * 24 * 60 * 60 * 1000),
        dueOn: new Date(now.getTime() + (15 - (daysAgo % 15)) * 24 * 60 * 60 * 1000),
        dueVersion: 1,
      },
    });

    await prisma.clockSegment.create({
      data: {
        stageInstanceId: stageInst.id,
        party: 'AICTE',
        startAt: stageInst.startedAt,
      },
    });

    // Seed obligation
    await prisma.obligation.create({
      data: {
        institutionId: inst.id,
        type: 'DEFICIENCY_COMPLIANCE',
        sourceRef: `EoA-F.No-${regCode}-2026-${i}`,
        clause: 'APH-Ch6',
        severity: rng() > 0.8 ? ObligationSeverity.CRITICAL : ObligationSeverity.MAJOR,
        title: `Rectification of Library Titles / Cadre Ratio (${i})`,
        dueOn: new Date(now.getTime() + (rng() > 0.3 ? 30 : -10) * 24 * 60 * 60 * 1000),
        status: 'OPEN',
      },
    });
  }

  console.log('[ANUPALAN SEED] Deterministic synthetic database seed successfully completed!');
}

if (process.env.NODE_ENV !== 'test') {
  runSeed().catch((e) => {
    console.error('[ANUPALAN SEED] Error seeding database:', e);
    process.exit(1);
  });
}
