'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Button, Card, CardBody, Input, Select } from '@/components/ui';
import { RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';

interface AuditLog {
  id: string;
  email: string;
  action: string;
  resource: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900',
  warning: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900',
  error: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900',
  critical: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900',
};

const PAGE_SIZE = 25;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String((page - 1) * PAGE_SIZE),
      });
      if (severityFilter) params.set('severity', severityFilter);
      if (actionFilter) params.set('action', actionFilter);
      if (resourceFilter) params.set('resource', resourceFilter);

      const res = await fetch(`/api/audit-logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const json = await res.json();
      const data = json.data ?? json;
      setLogs(data.logs ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, severityFilter, actionFilter, resourceFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const severityOptions = [
    { value: '', label: 'All severities' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <NavLayout title="Audit Logs" subtitle="Security and activity trail for your account">
      <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
        {error && (
          <div className="flex items-center gap-2.5 p-4 text-sm text-red-800 border border-red-100 bg-red-50/50 rounded-xl dark:bg-red-950/20 dark:text-red-400 dark:border-red-900" role="alert">
            <AlertCircle className="w-4 h-4 text-red-650 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardBody className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-3">
                <Select
                  label="Severity"
                  value={severityFilter}
                  options={severityOptions}
                  onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
                />
              </div>
              <div className="lg:col-span-3">
                <Input
                  label="Action"
                  placeholder="login, create, delete..."
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                />
              </div>
              <div className="lg:col-span-3">
                <Input
                  label="Resource"
                  placeholder="job, offer, profile..."
                  value={resourceFilter}
                  onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
                />
              </div>
              <div className="lg:col-span-3 flex justify-between gap-4 items-center">
                <Button
                  variant="outline"
                  size="md"
                  className="flex items-center gap-1.5 flex-1"
                  onClick={fetchLogs}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap hidden lg:inline">
                  {total} total records
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                <ShieldAlert className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                No audit logs found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Activity will appear here as you use the platform.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {new Date(log.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {log.resource}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 text-2xs font-semibold rounded-full border capitalize inline-block ${
                          SEVERITY_STYLES[log.severity] ?? SEVERITY_STYLES.info
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs text-slate-500 dark:text-slate-400">
                        {log.ipAddress ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2 px-1">
            <span className="text-xs font-medium text-slate-550 dark:text-slate-400">
              Page {page} of {totalPages} ({total} records)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages || loading}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </NavLayout>
  );
}
