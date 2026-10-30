'use client';

import React from 'react';
import {
  FileText,
  ClipboardCheck,
  Award,
  Shield,
  BarChart3,
  Clock,
} from 'lucide-react';

interface KPICardProps {
  title: string;
  hindiTitle: string;
  value: string | number;
  subtitle: string;
  statutoryRef: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  statusBadge?: { label: string; ok: boolean };
}

const toneStyles = {
  primary: {
    border: 'border-slate-200 hover:border-slate-300',
    headerBg: 'bg-[#003366] text-white',
    iconColor: 'text-[#003366] bg-slate-100',
    valueColor: 'text-slate-900',
    tagBg: 'bg-slate-100 text-slate-700',
  },
  success: {
    border: 'border-slate-200 hover:border-emerald-300',
    headerBg: 'bg-emerald-800 text-white',
    iconColor: 'text-emerald-700 bg-emerald-50',
    valueColor: 'text-slate-900',
    tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  warning: {
    border: 'border-slate-200 hover:border-amber-300',
    headerBg: 'bg-amber-700 text-white',
    iconColor: 'text-amber-700 bg-amber-50',
    valueColor: 'text-slate-900',
    tagBg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  danger: {
    border: 'border-slate-200 hover:border-rose-300',
    headerBg: 'bg-rose-800 text-white',
    iconColor: 'text-rose-700 bg-rose-50',
    valueColor: 'text-slate-900',
    tagBg: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  neutral: {
    border: 'border-slate-200 hover:border-slate-300',
    headerBg: 'bg-slate-800 text-white',
    iconColor: 'text-slate-700 bg-slate-100',
    valueColor: 'text-slate-900',
    tagBg: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

const OfficialKPICard: React.FC<KPICardProps> = ({
  title,
  hindiTitle,
  value,
  subtitle,
  statutoryRef,
  icon: Icon,
  tone,
  statusBadge,
}) => {
  const styles = toneStyles[tone];

  return (
    <div
      className={`bg-white rounded-xl border ${styles.border} shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between`}
    >
      <div className="p-4">
        {/* Top Hindi / English Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <span>{title}</span>
              <span className="text-slate-400 font-normal">| {hindiTitle}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono tracking-tight">
              {value}
            </div>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${styles.iconColor} border border-slate-200`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-2 font-medium">{subtitle}</p>
      </div>

      {/* Footer bar with statutory citation & status */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px]">
        <span className="text-slate-400 font-mono truncate">{statutoryRef}</span>
        {statusBadge && (
          <span
            className={`font-semibold px-1.5 py-0.2 rounded border ${
              statusBadge.ok
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {statusBadge.label}
          </span>
        )}
      </div>
    </div>
  );
};

interface DashboardKPIsProps {
  pendingApplications: number;
  overdueStages: number;
  openObligations: number;
  complianceScore: number;
  followUpsSaved: number;
  alertsFired: number;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({
  pendingApplications,
  overdueStages,
  openObligations,
  complianceScore,
  followUpsSaved,
  alertsFired,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      <OfficialKPICard
        title="Active Pipeline"
        hindiTitle="सक्रिय आवेदन"
        value={pendingApplications}
        subtitle="Cases under scrutiny / EVC inspection"
        statutoryRef="APH § Ch. I & II"
        icon={FileText}
        tone="primary"
        statusBadge={{ label: 'Queued', ok: true }}
      />

      <OfficialKPICard
        title="Overdue SLAs"
        hindiTitle="विलंबित चरण"
        value={overdueStages}
        subtitle="Breached statutory review deadlines"
        statutoryRef="APH § Calendar SLA"
        icon={Clock}
        tone={overdueStages > 0 ? 'danger' : 'success'}
        statusBadge={{
          label: overdueStages > 0 ? 'T+3 Breached' : 'On Schedule',
          ok: overdueStages === 0,
        }}
      />

      <OfficialKPICard
        title="Obligations Ledger"
        hindiTitle="सांविधिक वचनबद्धताएं"
        value={openObligations}
        subtitle="Conditional undertakings & NOC tracking"
        statutoryRef="Pillar 3 Ledger"
        icon={ClipboardCheck}
        tone={openObligations > 0 ? 'warning' : 'success'}
        statusBadge={{ label: `${openObligations} Active`, ok: openObligations === 0 }}
      />

      <OfficialKPICard
        title="Compliance Index"
        hindiTitle="अनुपालन सूचकांक"
        value={`${complianceScore}/100`}
        subtitle="Institutional governance health score"
        statutoryRef="Pillar 6 Metric"
        icon={BarChart3}
        tone={complianceScore >= 70 ? 'success' : complianceScore >= 40 ? 'warning' : 'danger'}
        statusBadge={{
          label: complianceScore >= 70 ? 'Low Risk' : 'Medium Risk',
          ok: complianceScore >= 70,
        }}
      />

      <OfficialKPICard
        title="Follow-ups Saved"
        hindiTitle="स्वचालित अनुवर्ती"
        value={followUpsSaved}
        subtitle="Automated alerts displacing manual notice"
        statutoryRef="System Velocity"
        icon={Award}
        tone="success"
        statusBadge={{ label: 'Automated', ok: true }}
      />

      <OfficialKPICard
        title="Escalations Active"
        hindiTitle="सक्रिय चेतावनी"
        value={alertsFired}
        subtitle="Multi-tier escalation rungs triggered"
        statutoryRef="T-3, T-0, T+3"
        icon={Shield}
        tone="neutral"
        statusBadge={{ label: `${alertsFired} Rungs`, ok: true }}
      />
    </div>
  );
};
