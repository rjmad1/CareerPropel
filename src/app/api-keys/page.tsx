'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import {
  Button,
  Card,
  Input,
  Select,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui';
import {
  Plus,
  Copy,
  Trash2,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  revokedAt?: string;
  usageCount: number;
}

interface NewlyCreatedKey {
  id: string;
  key: string;
  name: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [expiresIn, setExpiresIn] = useState('365');
  const [creating, setCreating] = useState(false);
  const [newlyCreated, setNewlyCreated] = useState<NewlyCreatedKey | null>(null);
  const [keyVisible, setKeyVisible] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      setLoading(true);
      const res = await fetch('/api/api-keys');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      const data = json.data ?? json;
      setKeys(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      setCreating(true);
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          expiresIn: parseInt(expiresIn || '365'),
        }),
      });
      if (!res.ok) throw new Error('Failed to create API key');
      const json = await res.json();
      const data = json.data ?? json;
      setNewlyCreated({ id: data.id, key: data.key, name: data.name });
      setNewKeyName('');
      setExpiresIn('365');
      setShowCreateDialog(false);
      setKeyVisible(false);
      await fetchKeys();
    } catch {
      setError('Failed to create API key');
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(keyId: string, name: string) {
    if (!window.confirm(`Revoke API key "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/api-keys?keyId=${keyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke');
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      if (newlyCreated?.id === keyId) setNewlyCreated(null);
    } catch {
      setError('Failed to revoke API key');
    }
  }

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  }

  const activeKeys = keys.filter((k) => !k.revokedAt);
  const revokedKeys = keys.filter((k) => k.revokedAt);

  const expiresOptions = [
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' },
    { value: '180', label: '180 days' },
    { value: '365', label: '1 year' },
    { value: '730', label: '2 years' },
  ];

  return (
    <NavLayout
      title="API Keys"
      subtitle="Manage programmatic access to your CareerPropel data"
    >
      <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
        {error && (
          <div className="flex items-center justify-between p-4 text-sm text-red-800 border border-red-100 bg-red-50/50 rounded-xl dark:bg-red-950/20 dark:text-red-400 dark:border-red-900" role="alert">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-650 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Security Warning Banner */}
        <div className="flex items-start gap-3 p-4 text-sm text-amber-800 border border-amber-100 bg-amber-50/50 rounded-xl dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold block mb-0.5">Security notice:</strong>
            API keys grant full access to your account data. Store them securely and never share them. Rotate keys regularly and revoke any that are no longer needed.
          </div>
        </div>

        {/* Newly Created Key Display */}
        {newlyCreated && (
          <div className="flex flex-col gap-3 p-5 text-sm text-green-800 border border-green-150 bg-green-50/50 rounded-2xl dark:bg-green-950/20 dark:text-green-400 dark:border-green-900 shadow-sm relative">
            <button
              onClick={() => setNewlyCreated(null)}
              className="absolute top-4 right-4 p-1 hover:bg-green-100 dark:hover:bg-green-900/50 rounded text-green-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-green-605 shrink-0 mt-0.5" />
              <div className="flex-1 pr-6">
                <span className="text-sm font-bold block mb-1">
                  New API Key Created: {newlyCreated.name}
                </span>
                <span className="text-xs text-green-700 dark:text-green-400 block mb-3.5 leading-normal">
                  Copy this key now. You will not be able to see it again.
                </span>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-800/60 rounded-xl px-4 py-2.5 shadow-2xs">
                  <code className="flex-1 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
                    {keyVisible ? newlyCreated.key : newlyCreated.key.replace(/./g, '•').slice(0, 40)}
                  </code>
                  <button
                    onClick={() => setKeyVisible(!keyVisible)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    title={keyVisible ? 'Hide key' : 'Show key'}
                  >
                    {keyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(newlyCreated.key, 'new')}
                    className="p-1.5 text-slate-550 hover:text-slate-800 dark:hover:text-slate-250 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    title="Copy key"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copiedId === 'new' && (
                  <span className="text-2xs font-bold text-green-700 dark:text-green-400 block mt-2 animate-fade-in">
                    Copied to clipboard!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mt-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Active Keys
            <span className="text-xs font-semibold text-slate-450 bg-slate-50 px-2.5 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-400">
              {activeKeys.length}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchKeys}
              disabled={loading}
              className="p-2 text-slate-550 hover:text-slate-800 dark:hover:text-slate-250 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Button
              variant="primary"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4" />
              <span>New API Key</span>
            </Button>
          </div>
        </div>

        {/* Keys Table / Card */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                <Key className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                No API keys
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Create your first key to enable programmatic access.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Prefix
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {activeKeys.map((key) => {
                    const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();
                    const expiresInDays = key.expiresAt
                      ? Math.ceil((new Date(key.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;
                    return (
                      <tr key={key.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                              {key.name}
                            </span>
                            {isExpired && (
                              <span className="px-2 py-0.5 text-3xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                Expired
                              </span>
                            )}
                            {!isExpired && expiresInDays !== null && expiresInDays <= 30 && (
                              <span className="px-2 py-0.5 text-3xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                {expiresInDays}d left
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <code className="font-mono text-xs bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-700 text-slate-700 dark:text-slate-350 select-all">
                              {key.prefix}••••
                            </code>
                            <button
                              onClick={() => copyToClipboard(key.prefix, key.id)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-450 hover:text-slate-700 dark:hover:text-slate-250 transition-colors"
                              title="Copy prefix"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {copiedId === key.id && (
                              <span className="text-3xs font-bold text-green-600 dark:text-green-400">Copied!</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-550 dark:text-slate-400">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-xs ${isExpired ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-550 dark:text-slate-400'}`}>
                          {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-550 dark:text-slate-400">
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button
                            variant="danger"
                            size="xs"
                            className="flex items-center gap-1.5 ml-auto"
                            onClick={() => handleRevoke(key.id, key.name)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Revoked Keys History */}
        {!loading && revokedKeys.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider pl-1">
              Revoked Keys ({revokedKeys.length})
            </span>
            <Card className="opacity-60 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-sm">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {revokedKeys.map((key) => (
                      <tr key={key.id}>
                        <td className="px-6 py-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                          {key.name}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap font-mono text-xs text-slate-500 dark:text-slate-400">
                          {key.prefix}••••
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          <span className="px-2.5 py-0.5 text-2xs font-semibold rounded-full bg-slate-100 text-slate-500 border border-slate-200/50 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800">
                            Revoked
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Dialog for creating a new Key */}
        <Modal isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} className="max-w-md">
          <ModalHeader onClose={() => setShowCreateDialog(false)}>
            <ModalTitle>Create New API Key</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleCreate}>
            <ModalBody className="p-6 flex flex-col gap-4">
              <Input
                label="Key Name"
                required
                maxLength={100}
                placeholder="e.g. My App, CI/CD Pipeline"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                disabled={creating}
              />
              <Select
                label="Expires In"
                value={expiresIn}
                options={expiresOptions}
                onChange={(e) => setExpiresIn(e.target.value)}
                disabled={creating}
              />
            </ModalBody>
            <ModalFooter className="px-6 py-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={creating}
              >
                {creating ? 'Creating...' : 'Create Key'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </NavLayout>
  );
}
