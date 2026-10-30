import { ShieldCheck, Clock, GitMerge, FileCheck, Lock, Activity, RefreshCw, Layers } from 'lucide-react';
import { clock, TIMEZONE } from '@anupalan/engine';

export default function HomePage() {
  const currentTime = clock.now().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: TIMEZONE,
  });

  const pillars = [
    {
      title: 'Configurable Pathway Engine',
      desc: 'Versioned YAML rule packs. Application types dynamically route through Scrutiny, EVC, SHC/SAC, and Decision.',
      icon: GitMerge,
      tag: 'Pillar 1',
    },
    {
      title: 'Dual-Clock SLA Engine',
      desc: 'Working-day math with holiday skips. Attributed intervals isolating AICTE delay vs. Institution delay.',
      icon: Clock,
      tag: 'Pillar 2',
    },
    {
      title: 'Obligation Ledger',
      desc: 'Tracks post-approval promises: 6-month deficiency compliance, undertakings, NOCs, and lease validity.',
      icon: FileCheck,
      tag: 'Pillar 3',
    },
    {
      title: 'Advisory Readiness Gate',
      desc: 'Surfaces all unclosed obligations and lease margins directly to the deciding officer. Never auto-approves.',
      icon: ShieldCheck,
      tag: 'Pillar 4',
    },
    {
      title: 'Cryptographic Audit Trail',
      desc: 'SHA-256 hash-chained transactions with external daily Ed25519 digital seals for instant tamper detection.',
      icon: Lock,
      tag: 'Pillar 5',
    },
    {
      title: 'Transparent Compliance Index',
      desc: 'Itemized 0–100 institutional health score driving a risk-prioritized verification queue for Regional Directors.',
      icon: Activity,
      tag: 'Pillar 6',
    },
    {
      title: 'Time Machine & Impact Simulator',
      desc: 'Deterministic multi-week virtual fast-forward and dry-run policy simulator assessing impact before publishing.',
      icon: RefreshCw,
      tag: 'Pillar 7',
    },
    {
      title: 'Multi-Role Dashboards',
      desc: '3-click drilldown from All-India to Region to Officer to Case, plus an Institution Compliance Passport.',
      icon: Layers,
      tag: 'Pillar 8',
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Top National Header Bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              अ
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider text-indigo-700 uppercase">
                SIH 2026 · PS 26262
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                ANUPALAN <span className="font-normal text-slate-500 text-sm">| अनुपालन</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-slate-500">Virtual Clock ({TIMEZONE})</span>
              <span className="text-xs font-mono font-medium text-slate-800">{currentTime}</span>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Phase 0 Scaffold Active
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-medium mb-4">
              <span>All-India Council for Technical Education (AICTE)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              The Obligation-Aware Approval & Compliance Platform
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Every AICTE approval creates promises. ANUPALAN closes the regulatory loop by tracking obligations
              (deficiencies, undertakings, NOCs, and lease validity) across their full lifecycle and surfacing them to
              the deciding official via the advisory Readiness Gate.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded px-2.5 py-1 shadow-sm">
                Strict Human-Only Decisions
              </span>
              <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded px-2.5 py-1 shadow-sm">
                Dual-Clock SLA Attribution
              </span>
              <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded px-2.5 py-1 shadow-sm">
                Cryptographically Sealed Audit Log
              </span>
              <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded px-2.5 py-1 shadow-sm">
                9-Step Verified Demo Rehearsal
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The 8 Pillars Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">System Architecture: The 8 Pillars</h3>
          <p className="text-sm text-slate-600 mt-1">
            Engineered around verifiable regulatory invariants defined in <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">CLAUDE.md</code> and <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">docs/ANUPALAN.md</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {p.tag}
                  </span>
                </div>
                <h4 className="text-base font-semibold text-slate-900 mb-2">{p.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Definition of Done Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              Definition of Done
            </span>
            <h3 className="text-2xl font-bold mt-2">The 9-Step End-to-End Demo Script</h3>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              Every workflow transition, dual-clock pause/resume segment, advisory gate evaluation, and tamper detection
              in ANUPALAN is mapped to <code className="text-indigo-300">docs/demo-script.md</code> and verified through
              Playwright regression tests.
            </p>
            <div className="mt-6 flex items-center space-x-4 text-xs text-slate-400">
              <span>✓ Phase 0 Monorepo Scaffolded</span>
              <span>•</span>
              <span>Next: Phase 1 Engine Core</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
