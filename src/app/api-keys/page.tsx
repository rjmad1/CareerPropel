'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Plus, Trash2, Copy, Eye, EyeOff, RefreshCw, Key } from 'lucide-react';

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
  const [showCreateForm, setShowCreateForm] = useState(false);
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
      setShowCreateForm(false);
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

  return (
    <NavLayout
      title="API Keys"
      subtitle="Manage programmatic access to your CareerPropel data"
    >
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Security Warning */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <strong>Security notice:</strong> API keys grant full access to your account data. Store them securely and never share them. Rotate keys regularly and revoke any that are no longer needed.
        </div>

        {/* Newly Created Key — one-time display */}
        {newlyCreated && (
          <div className="p-5 bg-green-50 border border-green-300 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-green-600" />
              <h3 className="font-semibold text-green-900">New API Key Created: {newlyCreated.name}</h3>
            </div>
            <p className="text-xs text-green-700">
              Copy this key now. You will not be able to see it again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-green-300 rounded px-3 py-2 text-sm font-mono overflow-x-auto">
                {keyVisible ? newlyCreated.key : newlyCreated.key.replace(/./g, '•').slice(0, 40)}
              </code>
              <button
                onClick={() => setKeyVisible(!keyVisible)}
                className="p-2 text-green-700 hover:text-green-900 hover:bg-green-100 rounded-lg transition"
                title={keyVisible ? 'Hide key' : 'Show key'}
              >
                {keyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={() => copyToClipboard(newlyCreated.key, 'new')}
                className="p-2 text-green-700 hover:text-green-900 hover:bg-green-100 rounded-lg transition"
                title="Copy key"
              >
                <Copy size={16} />
              </button>
            </div>
            {copiedId === 'new' && (
              <p className="text-xs text-green-600 font-medium">Copied to clipboard!</p>
            )}
            <button
              onClick={() => setNewlyCreated(null)}
              className="text-xs text-green-700 hover:text-green-900 underline"
            >
              I've saved my key — dismiss
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Active Keys{' '}
            <span className="text-gray-400 font-normal">({activeKeys.length})</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={fetchKeys}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={16} />
              New API Key
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Create New API Key</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My App, CI/CD Pipeline"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expires In (days)</label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                  <option value="730">2 years</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {creating ? 'Creating...' : 'Create Key'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Keys List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : activeKeys.length === 0 && !loading ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
            <div className="text-4xl mb-3">🔑</div>
            <h3 className="font-semibold text-gray-900 mb-1">No API keys</h3>
            <p className="text-sm text-gray-500">Create your first key to enable programmatic access.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeKeys.map((key) => (
              <KeyCard
                key={key.id}
                apiKey={key}
                onRevoke={handleRevoke}
                onCopy={(text) => copyToClipboard(text, key.id)}
                copied={copiedId === key.id}
              />
            ))}
          </div>
        )}

        {/* Revoked Keys */}
        {revokedKeys.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold text-gray-500 mb-3 text-sm">
              Revoked Keys ({revokedKeys.length})
            </h2>
            <div className="space-y-2">
              {revokedKeys.map((key) => (
                <div key={key.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between opacity-60">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{key.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{key.prefix}••••</p>
                  </div>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Revoked</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </NavLayout>
  );
}

function KeyCard({ apiKey, onRevoke, onCopy, copied }: {
  apiKey: ApiKey;
  onRevoke: (id: string, name: string) => void;
  onCopy: (text: string) => void;
  copied: boolean;
}) {
  const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();
  const expiresInDays = apiKey.expiresAt
    ? Math.ceil((new Date(apiKey.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={`bg-white border rounded-xl p-5 ${isExpired ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Key size={14} className="text-gray-400 flex-shrink-0" />
            <span className="font-semibold text-gray-900">{apiKey.name}</span>
            {isExpired && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Expired</span>
            )}
            {!isExpired && expiresInDays !== null && expiresInDays <= 30 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                Expires in {expiresInDays}d
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
              {apiKey.prefix}••••••••••••••••••••
            </code>
            <button
              onClick={() => onCopy(apiKey.prefix)}
              className="text-gray-400 hover:text-gray-600 transition"
              title="Copy prefix"
            >
              <Copy size={12} />
            </button>
            {copied && <span className="text-xs text-green-600">Copied!</span>}
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
            <span>Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
            {apiKey.expiresAt && (
              <span className={isExpired ? 'text-red-500' : ''}>
                Expires {new Date(apiKey.expiresAt).toLocaleDateString()}
              </span>
            )}
            {apiKey.lastUsedAt && (
              <span>Last used {new Date(apiKey.lastUsedAt).toLocaleDateString()}</span>
            )}
            <span>{apiKey.usageCount} uses</span>
          </div>
        </div>
        <button
          onClick={() => onRevoke(apiKey.id, apiKey.name)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 text-xs font-medium rounded-lg transition"
        >
          <Trash2 size={12} />
          Revoke
        </button>
      </div>
    </div>
  );
}
