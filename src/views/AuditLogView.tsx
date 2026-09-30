import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { fetchAuditLogs } from '../services/api.ts';
import { AuditLogEntry } from '../types.ts';
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  History,
  Lock,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { refreshSignal } = useApp();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs()
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [refreshSignal]);

  const filteredLogs = logs.filter((log) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Immutable Governance Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident logs of all alert escalations, AI recommendations, human officer authorizations, and federated training runs
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographically Verified</span>
          </span>
        </div>
      </div>

      {/* Search & Export */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search audit trail by action, officer, entity ID, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors font-mono"
          />
        </div>

        <button
          onClick={() => {
            const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
            const dl = document.createElement('a');
            dl.setAttribute("href", jsonStr);
            dl.setAttribute("download", "health-nexus-audit-trail.json");
            dl.click();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-semibold transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase text-slate-400 font-bold">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Officer / System User</th>
                <th className="py-3.5 px-4">Action Type</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Outcome</th>
                <th className="py-3.5 px-4">Audit Details & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50">
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white font-sans">{log.user}</div>
                    <span className="text-[10px] text-cyan-400 font-mono">{log.role}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-200">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {log.entityType} ({log.entityId})
                  </td>
                  <td className="py-3.5 px-4">
                    {log.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SUCCESS</span>
                      </span>
                    ) : log.status === 'WARNING' ? (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ALERT</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>REJECTED</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-[11px] max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
