import { clock, computeEntryHash, verifyChain, type AuditLogEntry } from '@anupalan/engine';
import type { Role, StageCode } from '@anupalan/shared';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  regionId?: string;
  regionName?: string;
  institutionId?: string;
  institutionName?: string;
  avatar: string;
}

export interface AppInstitution {
  id: string;
  aicteId: string;
  name: string;
  regionId: string;
  institutionType: string;
  contactEmail: string;
}

export interface AppApplication {
  id: string;
  caseNumber: string;
  institutionId: string;
  institutionName: string;
  regionId: string;
  regionName: string;
  typeCode: string;
  typeName: string;
  pathwayCode: string;
  packVersion: string;
  currentStage: StageCode;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'RETURNED' | 'APPROVED' | 'REJECTED' | 'CONDITIONAL';
  submittedAt: string;
  lastActionAt: string;
  stageInstances: AppStageInstance[];
  evcScheduledOn?: string;
  evcReportDocId?: string;
  decisionOutcome?: string;
  briefHash?: string;
}

export interface AppStageInstance {
  id: string;
  stageCode: StageCode;
  stageName: string;
  passNo: number;
  assigneeName?: string;
  startedAt: string;
  completedAt?: string;
  outcome?: string;
  dueOn: string;
  dueVersion: number;
  clockSegments: {
    party: 'AICTE' | 'INSTITUTION' | 'COMMITTEE';
    startAt: string;
    endAt?: string;
  }[];
}

export interface AppObligation {
  id: string;
  institutionId: string;
  institutionName: string;
  regionId: string;
  decisionId?: string;
  type: string;
  sourceRef: string;
  clause: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  title: string;
  description: string;
  dueOn: string;
  dueVersion: number;
  status: 'OPEN' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED_EVIDENCE' | 'WAIVED' | 'SUPERSEDED';
  evidenceDoc?: {
    id: string;
    fileName: string;
    fileUrl: string;
    submittedAt: string;
  };
  verificationNote?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface AppDocument {
  id: string;
  institutionId: string;
  institutionName: string;
  docType: string;
  version: number;
  fileName: string;
  fileKey: string;
  validFrom: string;
  validTo: string;
  confirmedBy?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUPERSEDED';
  uploadedAt: string;
}

export interface AppAlert {
  id: string;
  itemId: string;
  itemType: 'STAGE' | 'OBLIGATION' | 'DOCUMENT';
  ruleId: string;
  level: string;
  dueVersion: number;
  targetRole: Role;
  recipientName: string;
  title: string;
  message: string;
  firedAt: string;
  whyPanel: {
    ruleId: string;
    level: string;
    calculatedThresholdDate: string;
    dueOn: string;
    offsetDays: number;
    targetRole: Role;
    clause: string;
    explanation: string;
  };
}

export interface RulePackData {
  version: string;
  name: string;
  evcSlaDays: number;
  scrutinySlaDays: number;
  decisionSlaDays: number;
  status: 'PUBLISHED' | 'DRAFT';
  publishedAt: string;
  publishedBy: string;
}

// -----------------------------------------------------------------------------
// IN-MEMORY DATA STORE INITIALIZATION
// -----------------------------------------------------------------------------

class AnupalanStore {
  public currentUser: AppUser;
  public users: AppUser[] = [];
  public institutions: AppInstitution[] = [];
  public applications: AppApplication[] = [];
  public obligations: AppObligation[] = [];
  public documents: AppDocument[] = [];
  public alerts: AppAlert[] = [];
  public auditChain: AuditLogEntry[] = [];
  public rulePack: RulePackData;
  public followUpsSavedCount = 142;

  constructor() {
    this.rulePack = {
      version: '0.1.0',
      name: 'APH 2024-25 to 2026-27',
      evcSlaDays: 30, // Default P value
      scrutinySlaDays: 15,
      decisionSlaDays: 10,
      status: 'PUBLISHED',
      publishedAt: '2026-01-01T00:00:00Z',
      publishedBy: 'System Administrator',
    };

    this.currentUser = {
      id: 'USR-ADMIN',
      name: 'Administrator',
      email: 'admin@aicte.gov.in',
      role: 'SYSTEM_ADMIN',
      avatar: 'AD',
    };

    this.initSeed();
  }

  public initSeed() {
    const now = clock.now();

    // 1. Users
    this.users = [
      {
        id: 'USR-ADMIN',
        name: 'Administrator',
        email: 'admin@aicte.gov.in',
        role: 'SYSTEM_ADMIN',
        avatar: 'AD',
      },
      {
        id: 'USR-INST-01',
        name: 'Dr. Anand Kulkarni (Principal)',
        email: 'principal@demo-engg.edu.in',
        role: 'INSTITUTION',
        institutionId: 'INST-DEMO',
        institutionName: 'Saraswati Institute of Technology & Engineering',
        regionId: 'REG-WEST',
        regionName: 'Western Region',
        avatar: 'AK',
      },
      {
        id: 'USR-OFFICER-01',
        name: 'Dr. Ramesh Sharma (Scrutiny Officer)',
        email: 'scrutiny.west@aicte.gov.in',
        role: 'SCRUTINY_OFFICER',
        regionId: 'REG-WEST',
        regionName: 'Western Region',
        avatar: 'RS',
      },
      {
        id: 'USR-RD-01',
        name: 'Dr. Sunita Deshmukh (Regional Director)',
        email: 'rd.west@aicte.gov.in',
        role: 'REGIONAL_DIRECTOR',
        regionId: 'REG-WEST',
        regionName: 'Western Region',
        avatar: 'SD',
      },
      {
        id: 'USR-EVC-01',
        name: 'Prof. Arvind Kelkar (EVC Convener)',
        email: 'evc.convener@aicte.gov.in',
        role: 'EVC_CONVENER',
        regionId: 'REG-WEST',
        regionName: 'Western Region',
        avatar: 'AK',
      },
      {
        id: 'USR-SHC-01',
        name: 'Justice (Retd.) M. K. Rao (Committee Member)',
        email: 'shc.member@aicte.gov.in',
        role: 'COMMITTEE_MEMBER',
        avatar: 'MR',
      },
      {
        id: 'USR-HQ-01',
        name: 'Prof. T. G. Sitharam (Competent Authority / HQ)',
        email: 'chairman@aicte.gov.in',
        role: 'COMPETENT_AUTHORITY',
        avatar: 'TS',
      },
    ];

    // 2. Institutions
    this.institutions = [
      {
        id: 'INST-DEMO',
        aicteId: '1-100200300',
        name: 'Saraswati Institute of Technology & Engineering',
        regionId: 'REG-WEST',
        institutionType: 'ENGINEERING_COLLEGE',
        contactEmail: 'principal@demo-engg.edu.in',
      },
      {
        id: 'INST-NORTH-01',
        aicteId: '1-200300400',
        name: 'Delhi National Institute of Technology',
        regionId: 'REG-NORTH',
        institutionType: 'POLYTECHNIC',
        contactEmail: 'contact@dnit.edu.in',
      },
      {
        id: 'INST-SOUTH-01',
        aicteId: '1-300400500',
        name: 'Southern Academy of Management & Computing',
        regionId: 'REG-SOUTH',
        institutionType: 'MANAGEMENT_INSTITUTE',
        contactEmail: 'admin@samc.edu.in',
      },
    ];

    // 3. Applications - Seed DEMO-001 (Fixture for Steps 2-5)
    const fourDaysAgo = clock.addDays(now, -4).toISOString();
    const elevenDaysLater = clock.addDays(now, 11).toISOString();

    this.applications = [
      {
        id: 'APP-DEMO-001',
        caseNumber: 'DEMO-001',
        institutionId: 'INST-DEMO',
        institutionName: 'Saraswati Institute of Technology & Engineering',
        regionId: 'REG-WEST',
        regionName: 'Western Region',
        typeCode: 'NEW_COURSE',
        typeName: 'New Course: Artificial Intelligence & Data Science (B.Tech)',
        pathwayCode: 'scrutiny_evc',
        packVersion: '0.1.0',
        currentStage: 'SCRUTINY',
        status: 'UNDER_REVIEW',
        submittedAt: fourDaysAgo,
        lastActionAt: fourDaysAgo,
        stageInstances: [
          {
            id: 'STG-001',
            stageCode: 'SCRUTINY',
            stageName: 'Scrutiny Committee Review',
            passNo: 1,
            assigneeName: 'Dr. Ramesh Sharma',
            startedAt: fourDaysAgo,
            dueOn: elevenDaysLater,
            dueVersion: 1,
            clockSegments: [
              {
                party: 'AICTE',
                startAt: fourDaysAgo,
              },
            ],
          },
        ],
      },
      {
        id: 'APP-DEMO-EOA',
        caseNumber: 'DEMO-EOA-2026',
        institutionId: 'INST-DEMO',
        institutionName: 'Saraswati Institute of Technology & Engineering',
        regionId: 'REG-WEST',
        regionName: 'Western Region',
        typeCode: 'EOA_EXISTING',
        typeName: 'Extension of Approval (EoA) 2026-27',
        pathwayCode: 'only_scrutiny',
        packVersion: '0.1.0',
        currentStage: 'SCRUTINY',
        status: 'UNDER_REVIEW',
        submittedAt: fourDaysAgo,
        lastActionAt: fourDaysAgo,
        stageInstances: [
          {
            id: 'STG-002',
            stageCode: 'SCRUTINY',
            stageName: 'Scrutiny Committee Review',
            passNo: 1,
            assigneeName: 'Dr. Ramesh Sharma',
            startedAt: fourDaysAgo,
            dueOn: elevenDaysLater,
            dueVersion: 1,
            clockSegments: [{ party: 'AICTE', startAt: fourDaysAgo }],
          },
        ],
      },
    ];

    // 4. Documents - Seed DEMO-LEASE (Fixture for Step 7: valid_to = today + 30 days)
    const thirtyDaysLater = clock.addDays(now, 30).toISOString();
    const tenYearsAgo = clock.addDays(now, -3650).toISOString();

    this.documents = [
      {
        id: 'DOC-DEMO-LEASE',
        institutionId: 'INST-DEMO',
        institutionName: 'Saraswati Institute of Technology & Engineering',
        docType: 'LEASE_AGREEMENT',
        version: 1,
        fileName: 'Campus_Land_Registered_Lease_Deed.pdf',
        fileKey: 'institutions/demo-001/lease_v1.pdf',
        validFrom: tenYearsAgo,
        validTo: thirtyDaysLater,
        confirmedBy: 'Dr. Ramesh Sharma (Scrutiny Officer)',
        status: 'ACTIVE',
        uploadedAt: tenYearsAgo,
      },
    ];

    // 5. Obligations - Seed DEMO-UNDERTAKING (Fixture for Step 8: due in 15 days)
    const fifteenDaysLater = clock.addDays(now, 15).toISOString();

    this.obligations = [
      {
        id: 'OBL-DEMO-UNDERTAKING',
        institutionId: 'INST-DEMO',
        institutionName: 'Saraswati Institute of Technology & Engineering',
        regionId: 'REG-WEST',
        type: 'UNDERTAKING',
        sourceRef: 'AICTE/WRO/2026/SAC-UNDERTAKING-01',
        clause: 'APH-2024-27-Ch6-Sec3',
        severity: 'MAJOR',
        title: 'Recruitment of Professor & Associate Professor in Computer Engg',
        description: 'Mandatory faculty appointment compliance as recommended by the Standing Appellate Committee.',
        dueOn: fifteenDaysLater,
        dueVersion: 1,
        status: 'OPEN',
      },
    ];

    // 6. Audit Chain Genesis & Seed Actions
    this.auditChain = [];
    this.appendAudit('SYSTEM', 'SYSTEM', 'RULEPACK_INIT', 'aph-2024-27', {
      version: '0.1.0',
      name: 'APH 2024-25 to 2026-27 Initial Pack',
    });
    this.appendAudit(
      'USR-INST-01',
      'INSTITUTION',
      'SUBMIT_APPLICATION',
      'APP-DEMO-001',
      { caseNumber: 'DEMO-001', type: 'NEW_COURSE' },
      'Initial application submission for B.Tech AI & Data Science'
    );
  }

  /**
   * Appends an entry to the SHA-256 cryptographic hash chain (Invariant 3).
   */
  public appendAudit(
    actorId: string,
    actorRole: Role,
    action: string,
    entityId: string,
    payload: Record<string, unknown> = {},
    reason?: string
  ): AuditLogEntry {
    const prevHash = this.auditChain.length > 0 ? this.auditChain[this.auditChain.length - 1].hash : '0'.repeat(64);
    const now = clock.now();
    const id = `AUDIT-${now.getTime()}-${Math.floor(Math.random() * 10000)}`;

    const entryToHash = {
      id,
      at: now.toISOString(),
      entity: 'SYSTEM',
      entityId,
      action,
      actorId,
      actorRole,
      reason: reason ?? '',
      payload,
    };

    const hash = computeEntryHash(prevHash, entryToHash);

    const fullEntry: AuditLogEntry = {
      ...entryToHash,
      prevHash,
      hash,
    };

    this.auditChain.push(fullEntry);
    return fullEntry;
  }

  /**
   * Verifies cryptographic chain integrity (Demo Step 9).
   */
  public verifyIntegrity() {
    return verifyChain(this.auditChain);
  }

  /**
   * Tamper with an entry mid-chain to demonstrate cryptographic tamper detection (Demo Step 9).
   */
  public tamperOneRow() {
    if (this.auditChain.length >= 2) {
      this.auditChain[1].reason = 'MALICIOUS_TAMPER: Unconditional approval granted without obligations!';
      return { tamperedId: this.auditChain[1].id, index: 1 };
    }
    return null;
  }
}

export const store = new AnupalanStore();
