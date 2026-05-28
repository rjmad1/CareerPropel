import { useState, useEffect } from 'react';
import { TelemetryApiClient } from '@/observability-platform/packages/api-client/client';
import { AuditLog } from '@/observability-platform/packages/telemetry-sdk/types';
import { 
  ShieldCheck, 
  Database, 
  UserCheck
} from 'lucide-react';

const client = new TelemetryApiClient();

export default function GovernanceConsole() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    async function loadLogs() {
      const data = await client.getAuditLogs();
      setLogs(data);
    }

    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Governance & Audit Dashboard</h2>
          <p className="text-slate-400 text-sm">Monitor enterprise-grade PII compliance scrubbing, tenant isolation rules, and logs retention policies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Indicators */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#090e1c]/60 border border-slate-900 rounded-xl p-5 backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Compliance Health
            </h3>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-slate-500">PII Redaction Engine</span>
                <span className="font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">Active</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-slate-500">GDPR Compliance Scope</span>
                <span className="font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">Passed</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-slate-500">SOC-2 Audit Readiness</span>
                <span className="font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">100% compliant</span>
              </div>
            </div>
          </div>

          <div className="bg-[#090e1c]/60 border border-slate-900 rounded-xl p-5 backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-400" />
              Data Retention Settings
            </h3>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-slate-500">Production Log Retention</span>
                <span className="font-bold text-slate-350">30 Days</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-slate-500">Dev Sandbox Retention</span>
                <span className="font-bold text-slate-350">7 Days</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-slate-500">Archival Backup Schedule</span>
                <span className="font-bold text-slate-350">Daily Incremental</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="lg:col-span-2 bg-[#080d1a]/50 border border-slate-900 rounded-xl p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-purple-400" />
            Security Redaction Audit Logs
          </h3>

          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Log ID</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Details</th>
                  <th className="pb-3">Scrubbed Fields</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 text-slate-400 font-semibold">{log.id}</td>
                    <td className="py-3.5 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded bg-purple-950/40 text-purple-400 border border-purple-900/40 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-300">{log.details}</td>
                    <td className="py-3.5 text-slate-450 font-bold text-indigo-400">
                      {log.piiScrubbedFields.join(', ') || 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
