'use client';

import React from 'react';
import { FastForward, RotateCcw, Bell, ChevronDown, Calendar, Phone } from 'lucide-react';
import { clock, TIMEZONE } from '@anupalan/engine';

interface NavbarProps {
  currentRole: string;
  onSelectRole: (role: string) => void;
  offsetDays: number;
  onFastForward: (days: number) => void;
  onResetTime: () => void;
  alertCount: number;
  onToggleAlerts: () => void;
  followUpsSaved: number;
}

const ROLES = [
  {
    role: 'SCRUTINY_OFFICER',
    name: 'Dr. Ramesh Sharma',
    designation: 'Director & Scrutiny Officer',
    region: 'Western Regional Office (Mumbai)',
    avatar: 'RS',
    badge: 'Statutory Scrutineer'
  },
  {
    role: 'REGIONAL_DIRECTOR',
    name: 'Dr. Sunita Deshmukh',
    designation: 'Regional Officer & Director',
    region: 'Western Regional Office (Mumbai)',
    avatar: 'SD',
    badge: 'Regional Authority'
  },
  {
    role: 'INSTITUTION',
    name: 'Dr. Anand Kulkarni',
    designation: 'Principal & Authorized Signatory',
    region: 'Saraswati Institute of Tech (PID: 1-100200300)',
    avatar: 'AK',
    badge: 'Institution Applicant'
  },
  {
    role: 'EVC_CONVENER',
    name: 'Prof. Arvind Kelkar',
    designation: 'Convener, Expert Visit Committee',
    region: 'WRO Inspection Panel',
    avatar: 'AK',
    badge: 'EVC Inspection'
  },
  {
    role: 'COMPETENT_AUTHORITY',
    name: 'Prof. T. G. Sitharam',
    designation: 'Chairman / Member Secretary (HQ)',
    region: 'AICTE Headquarters, New Delhi',
    avatar: 'TS',
    badge: 'Deciding Authority'
  },
  {
    role: 'SYSTEM_ADMIN',
    name: 'Director (e-Governance)',
    designation: 'National System Administrator',
    region: 'AICTE HQ e-Gov Cell',
    avatar: 'AD',
    badge: 'System Admin'
  },
  {
    role: 'COMMITTEE_MEMBER',
    name: 'Justice (Retd.) M. K. Rao',
    designation: 'Chairman, Standing Appellate Committee',
    region: 'Appellate Jurisdiction (HQ)',
    avatar: 'MR',
    badge: 'SAC / SHC Member'
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  offsetDays,
  onFastForward,
  onResetTime,
  alertCount,
  onToggleAlerts,
  followUpsSaved,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);
  const activeRoleObj = ROLES.find((r) => r.role === currentRole) || ROLES[0];

  const formattedDate = clock.now().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: TIMEZONE,
  });

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* 1. National Tricolor Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-white to-emerald-700" />

      {/* 2. Official Government of India Top Masthead */}
      <div className="bg-[#002244] text-slate-200 text-[11px] border-b border-slate-800 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-white tracking-wide">
              भारत सरकार | Government of India
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">
              शिक्षा मंत्रालय | Ministry of Education
            </span>
            <span className="text-slate-500 hidden md:inline">|</span>
            <span className="text-emerald-400 font-medium hidden md:inline flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
              <span>NSWS Integrated Gateway</span>
            </span>
          </div>

          <div className="flex items-center space-x-4 text-slate-300">
            <div className="hidden sm:flex items-center space-x-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>Toll Free: 1800-11-2244</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700">
              SIH 2026 · PS 26262
            </span>
          </div>
        </div>
      </div>

      {/* 3. Primary AICTE Branding & Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Official AICTE Crest & Platform Identity */}
          <div className="flex items-center space-x-3.5">
            {/* Government Emblem / Council Crest Representation */}
            <div className="w-12 h-12 rounded-xl bg-[#003366] text-amber-400 font-serif font-black text-2xl flex items-center justify-center border-2 border-amber-400/40 shadow-sm shrink-0">
              अ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold tracking-wider text-[#003366] uppercase">
                  अखिल भारतीय तकनीकी शिक्षा परिषद | AICTE
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                  APH 2024-27
                </span>
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight flex items-baseline space-x-2">
                <span>ANUPALAN</span>
                <span className="text-sm font-medium text-slate-500">| अनुपालन पोर्टल</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">
                Obligation-Aware Statutory Approval & Autonomous Compliance Assurance System
              </p>
            </div>
          </div>

          {/* Right Side Controls: Virtual Time Machine, Follow-ups metric, Alerts, Actor Switcher */}
          <div className="flex items-center space-x-3">
            {/* Automated Follow-ups Counter */}
            <div className="hidden lg:flex flex-col items-end bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Follow-ups Automated
              </span>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {followUpsSaved} notices saved
              </span>
            </div>

            {/* Virtual Simulation Clock (Time Machine) */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs shadow-xs">
              <div className="px-2.5 py-1 text-slate-700 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#003366]" />
                <span className="font-mono font-semibold text-slate-900">{formattedDate}</span>
                {offsetDays !== 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                    +{offsetDays}d simulated
                  </span>
                )}
              </div>

              <button
                onClick={() => onFastForward(20)}
                title="Simulate +20 Calendar Days"
                className="flex items-center space-x-1 bg-[#003366] hover:bg-[#002244] text-white font-semibold px-2.5 py-1 rounded transition-colors text-[11px]"
              >
                <FastForward className="w-3 h-3 text-amber-300" />
                <span>+20 Days</span>
              </button>

              {offsetDays !== 0 && (
                <button
                  onClick={onResetTime}
                  title="Reset Virtual Clock to Standard Time"
                  className="p-1 hover:bg-slate-200 text-slate-600 rounded ml-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Regulatory Alerts Bell */}
            <button
              onClick={onToggleAlerts}
              className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors bg-white shadow-xs"
              title="Statutory Alerts & Escalation Notifications"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-rose-600 rounded-full shadow-xs animate-bounce">
                  {alertCount}
                </span>
              )}
            </button>

            {/* Named Human Official / Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors text-slate-800"
              >
                <div className="w-6 h-6 rounded-md bg-[#003366] text-white flex items-center justify-center text-[10px] font-bold">
                  {activeRoleObj.avatar}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-slate-900 font-bold leading-tight">{activeRoleObj.name}</div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight">{activeRoleObj.designation}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Active Human Official Profile</span>
                    <span className="text-emerald-600 font-mono">DSC Active</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {ROLES.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          onSelectRole(r.role);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-start space-x-3 text-xs transition-colors ${
                          r.role === currentRole ? 'bg-indigo-50/70 border-l-4 border-[#003366]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#003366] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 border border-slate-200">
                          {r.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 truncate">{r.name}</span>
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 ml-1">
                              {r.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#003366] font-medium truncate">{r.designation}</div>
                          <div className="text-[10px] text-slate-400 truncate">{r.region}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
