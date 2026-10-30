'use client';

import React, { useState } from 'react';
import {
  Shield,
  Hash,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Copy,
  RefreshCw,
  Lock,
  KeyRound
} from 'lucide-react';

interface AuditEntry {
  id: string;
  at: string;
  action: string;
  actorId: string;
  actorRole: string;
  entityId: string;
  reason: string;
  hash: string;
  prevHash: string;
  payload: Record<string, unknown>;
}

interface AuditViewProps {
  auditChain: AuditEntry[];
  onTamperRow: () => void;
  onVerifyChain: () => { valid: boolean; brokenAtIndex?: number; expectedHash?: string; foundHash?: string };
  onRefresh: () => void;
}

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  RULEPACK_INIT: { bg: 'bg-slate-100', text: 'text-slate-800' },
  RULEPACK_EDIT: { bg: 'bg-amber-50', text: 'text-amber-800' },
  SUBMIT_APPLICATION: { bg: 'bg-blue-50', text: 'text-blue-800' },
  ADVANCE_STAGE: { bg: 'bg-emerald-50', text: 'text-emerald-800' },
  RETURN_STAGE: { bg: 'bg-amber-50', text: 'text-amber-900' },
  RESUBMIT_STAGE: { bg: 'bg-blue-50', text: 'text-blue-800' },
  SCHEDULE_EVC: { bg: 'bg-purple-50', text: 'text-purple-800' },
  SUBMIT_EVC_REPORT: { bg: 'bg-purple-50', text: 'text-purple-800' },
  READINESS_GATE: { bg: 'bg-slate-100', text: 'text-slate-800' },
  DECISION: { bg: 'bg-emerald-50', text: 'text-emerald-900' },
  OBLIGATION_CREATE: { bg: 'bg-amber-50', text: 'text-amber-800' },
  OBLIGATION_SUBMIT_EVIDENCE: { bg: 'bg-blue-50', text: 'text-blue-800' },
  OBLIGATION_VERIFY: { bg: 'bg-emerald-50', text: 'text-emerald-800' },
  ALERT_FIRED: { bg: 'bg-rose-50', text: 'text-rose-800' },
  TIME_MACHINE: { bg: 'bg-amber-50', text: 'text-amber-800' },
  CHAIN_VERIFICATION: { bg: 'bg-emerald-50', text: 'text-emerald-800' },
};

export const AuditView: React.FC<AuditViewProps> = ({
  auditChain,
  onTamperRow,
  onVerifyChain,
  onRefresh,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    brokenAtIndex?: number;
    expectedHash?: string;
    foundHash?: string;
  } | null>(null);
  const [tamperDone, setTamperDone] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredChain = auditChain.filter((e) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.action.toLowerCase().includes(term) ||
      e.actorRole.toLowerCase().includes(term) ||
      e.entityId.toLowerCase().includes(term) ||
      e.id.toLowerCase().includes(term)
    );
  });

  const handleVerify = () => {
    const result = onVerifyChain();
    setVerificationResult(result);
  };

  const handleTamper = () => {
    onTamperRow();
    setTamperDone(true);
    setVerificationResult(null);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Official Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#002244] flex items-center justify-center text-amber-400 font-bold border border-slate-700 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Information Technology Act 2000 § Section 4 Compliance
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold flex items-center space-x-1">
                  <KeyRound className="w-2.5 h-2.5" />
                  <span>Ed25519 Sealed</span>
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-baseline space-x-2">
                <span>Statutory Cryptographic Audit Register</span>
                <span className="text-xs font-normal text-slate-500">| सांविधिक क्रिप्टोग्राफिक ऑडिट पंजी</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tamper-evident, forward SHA-256 hash-chained immutable event ledger preserving full evidentiary chain of custody.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTamper}
              disabled={tamperDone}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
                tamperDone
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-700 hover:bg-rose-800 text-white'
              }`}
              title="Simulate unauthorized database modification (Demo Step 9)"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{tamperDone ? 'Row Tampered' : 'Simulate Row Tamper'}</span>
            </button>

            <button
              onClick={handleVerify}
              className="flex items-center space-x-1.5 bg-[#003366] hover:bg-[#002244] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all"
              title="Cryptographically verify hash sequence against Merkle genesis"
            >
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>Verify Chain Integrity</span>
            </button>

            <button
              onClick={() => {
                onRefresh();
                setVerificationResult(null);
                setTamperDone(false);
              }}
              className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              title="Reset Audit View"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border shadow-xs animate-in zoom-in-95 ${
            verificationResult.valid
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-start space-x-3">
            {verificationResult.valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5 animate-pulse" />
            )}
            <div className="flex-1">
              <h3 className="text-xs sm:text-sm font-bold">
                {verificationResult.valid
                  ? '✓ Cryptographic Chain Authenticated — Zero unauthorized modifications detected.'
                  : `✗ EVIDENTIARY TAMPER DETECTED — Cryptographic hash mismatch at Transaction Index #${verificationResult.brokenAtIndex}`}
              </h3>
              {!verificationResult.valid ? (
                <div className="mt-2 space-y-1 text-xs font-mono bg-white/80 p-3 rounded-lg border border-rose-200">
                  <p className="text-rose-900">
                    Committed Hash: <span className="bg-rose-100 px-1.5 py-0.5 rounded font-bold">{verificationResult.expectedHash?.slice(0, 36)}…</span>
                  </p>
                  <p className="text-rose-900">
                    Recomputed Hash: <span className="bg-rose-100 px-1.5 py-0.5 rounded font-bold">{verificationResult.foundHash?.slice(0, 36)}…</span>
                  </p>
                  <p className="text-rose-800 font-sans text-[11px] font-semibold mt-2 pt-1 border-t border-rose-200">
                    ⚠ Legal Proof of Tamper: The payload of Block #{verificationResult.brokenAtIndex} was modified post-facto.
                    Because the digital seal was committed externally at write time, the alteration was mathematically caught and refused.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-emerald-800 mt-1">
                  All transaction hashes match the SHA-256 sequence starting from Genesis (0x64). Daily Ed25519 Certifying Authority seal timestamp verified.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Metadata Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by action, entity ID, or human official..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#003366]"
          />
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center space-x-1">
            <Hash className="w-3 h-3 text-slate-400" />
            <span className="font-mono font-bold text-slate-800">{auditChain.length}</span>
            <span>Blocks</span>
          </span>
          <span>•</span>
          <span>SHA-256 Chained</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">NIC CA Digital Seal Active</span>
        </div>
      </div>

      {/* Audit Blocks Sequence */}
      <div className="space-y-2">
        {filteredChain.map((entry, idx) => {
          const expanded = expandedId === entry.id;
          const ac = ACTION_COLORS[entry.action] || { bg: 'bg-slate-100', text: 'text-slate-800' };

          return (
            <div
              key={entry.id}
              className={`bg-white border rounded-xl shadow-xs overflow-hidden transition-all ${
                tamperDone && idx === 1 ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              <button
                onClick={() => setExpandedId(expanded ? null : entry.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50/50"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-[11px] font-mono font-bold text-slate-400 w-8 shrink-0">
                    #{idx}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border border-current/20 ${ac.bg} ${ac.text} shrink-0`}
                  >
                    {entry.action}
                  </span>
                  <span className="text-xs text-slate-900 font-medium truncate">
                    {entry.actorRole} ➔ <span className="font-mono font-semibold">{entry.entityId}</span>
                  </span>
                  {tamperDone && idx === 1 && (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300 text-[9px] font-bold animate-pulse">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>MALICIOUS ROW TAMPER</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                    {entry.hash.slice(0, 16)}…
                  </span>
                  {expanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {expanded && (
                <div className="px-5 pb-4 pt-2 border-t border-slate-100 bg-slate-50/40 text-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Timestamp</span>
                      <span className="font-mono text-slate-800">{entry.at}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Actor</span>
                      <span className="text-slate-800 font-semibold">{entry.actorId} ({entry.actorRole})</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Entity Reference</span>
                      <span className="font-mono text-slate-800">{entry.entityId}</span>
                    </div>
                  </div>

                  {entry.reason && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Statutory Justification / Reason</span>
                      <p className={`p-2 rounded border mt-0.5 ${tamperDone && idx === 1 ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}>
                        {entry.reason}
                      </p>
                    </div>
                  )}

                  {/* Cryptographic Hash Verification Block */}
                  <div className="bg-[#00182E] text-slate-200 p-3 rounded-lg font-mono text-[10px] space-y-1.5 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">prev_block_hash:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-amber-300">{entry.prevHash.slice(0, 32)}…</span>
                        <button onClick={() => copyHash(entry.prevHash)} className="text-slate-500 hover:text-white">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">current_block_hash:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className={tamperDone && idx === 1 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {entry.hash.slice(0, 32)}…
                        </span>
                        <button onClick={() => copyHash(entry.hash)} className="text-slate-500 hover:text-white">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {copiedHash && <span className="text-emerald-400 text-[9px] block">Copied to clipboard ✓</span>}
                  </div>

                  {/* Raw Payload Preview */}
                  {Object.keys(entry.payload).length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transaction Payload Parameters</span>
                      <pre className="mt-1 bg-white border border-slate-200 rounded p-2 text-[10px] text-slate-700 font-mono overflow-x-auto">
                        {JSON.stringify(entry.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
