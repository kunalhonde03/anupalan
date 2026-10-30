import type { FastifyPluginAsync } from 'fastify';
import { store } from '../store.js';

export const analyticsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => {
    // 3-Click Hierarchical Drilldown Analytics (All-India -> Region -> Officer -> Case)
    const regions = [
      {
        code: 'WESTERN',
        name: 'Western Region (Mumbai / Pune)',
        totalInstitutions: 78,
        activeApplications: 34,
        overdueCases: 3,
        medianAicteDays: 8.2,
        medianInstitutionDays: 14.5,
        avgComplianceScore: 84,
        director: 'Dr. Sunita Deshmukh',
      },
      {
        code: 'NORTHERN',
        name: 'Northern Region (Kanpur)',
        totalInstitutions: 65,
        activeApplications: 28,
        overdueCases: 1,
        medianAicteDays: 7.1,
        medianInstitutionDays: 12.0,
        avgComplianceScore: 88,
        director: 'Dr. V. K. Saxena',
      },
      {
        code: 'SOUTHERN',
        name: 'Southern Region (Chennai)',
        totalInstitutions: 92,
        activeApplications: 41,
        overdueCases: 4,
        medianAicteDays: 9.0,
        medianInstitutionDays: 16.2,
        avgComplianceScore: 81,
        director: 'Dr. P. Rajendran',
      },
      {
        code: 'EASTERN',
        name: 'Eastern Region (Kolkata)',
        totalInstitutions: 44,
        activeApplications: 19,
        overdueCases: 2,
        medianAicteDays: 6.8,
        medianInstitutionDays: 11.4,
        avgComplianceScore: 86,
        director: 'Dr. S. Bhattacharya',
      },
      {
        code: 'CENTRAL',
        name: 'Central Region (Bhopal)',
        totalInstitutions: 51,
        activeApplications: 22,
        overdueCases: 2,
        medianAicteDays: 8.5,
        medianInstitutionDays: 15.1,
        avgComplianceScore: 83,
        director: 'Dr. M. K. Chouhan',
      },
    ];

    // Bottleneck analysis: AICTE-side vs Institution-side median processing duration
    const bottleneckByStage = [
      { stage: 'Scrutiny', aicteDays: 4.8, institutionDays: 9.2, slaDays: 15 },
      { stage: 'Re-Scrutiny', aicteDays: 3.1, institutionDays: 6.5, slaDays: 10 },
      { stage: 'EVC Inspection', aicteDays: 18.4, institutionDays: 4.2, slaDays: 30 },
      { stage: 'Final Decision', aicteDays: 5.2, institutionDays: 0.0, slaDays: 10 },
    ];

    return {
      allIndiaTotals: {
        totalInstitutions: 330,
        totalApplications: store.applications.length + 144,
        totalObligationsTracked: store.obligations.length + 280,
        totalAlertsFired: store.alerts.length + 84,
        followUpsSavedCount: store.followUpsSavedCount,
      },
      regions,
      bottleneckByStage,
    };
  });
};
