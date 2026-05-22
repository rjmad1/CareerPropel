'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { getNotificationManager } from '@/lib/notifications/manager';
import { NavLayout } from '@/components/Layout/NavLayout';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { 
  Cpu, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Activity, 
  DollarSign, 
  CloudLightning,
  Sparkles,
  RefreshCw,
  Server
} from 'lucide-react';

interface SanitizedConfig {
  providerName: string;
  endpointUrl: string;
  isActive: boolean;
  priority: number;
  hasKey: boolean;
  maskedKey: string;
}

interface CapabilityPresetConfig {
  presetName: string;
  providerName: string;
  modelName: string;
  maxCostLimit: number;
  privacyMode: string;
}

interface LocalScanResult {
  isActive: boolean;
  provider: 'ollama' | 'lmstudio' | null;
  endpoint: string;
  models: string[];
  vramCategory: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export default function AiProvidersSettingsPage() {
  const [configs, setConfigs] = useState<SanitizedConfig[]>([]);
  const [presets, setPresets] = useState<CapabilityPresetConfig[]>([]);
  const [localStatus, setLocalStatus] = useState<LocalScanResult>({
    isActive: false,
    provider: null,
    endpoint: '',
    models: [],
    vramCategory: 'low',
    recommendations: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [savingPreset, setSavingPreset] = useState<string | null>(null);

  // Form State for Key Edits
  const [editingKeys, setEditingKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings/ai-providers');
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
        setPresets(data.presets || []);

        // Initialize key values
        const initialKeys: Record<string, string> = {};
        data.configs?.forEach((c: SanitizedConfig) => {
          if (c.hasKey) {
            initialKeys[c.providerName] = '••••••••••••••••••••';
          }
        });
        setEditingKeys(initialKeys);
      }
    } catch (e) {
      showNotice('error', 'Failed to retrieve provider settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerLocalScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/settings/ai-providers/scan');
      if (res.ok) {
        const data = await res.json();
        setLocalStatus(data);
      }
    } catch {
      // Local runtime scan timed out or inactive
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    triggerLocalScan();
  }, [fetchSettings, triggerLocalScan]);

  function showNotice(type: 'success' | 'error', message: string) {
    if (type === 'success') getNotificationManager().success('Settings Saved', message);
    else getNotificationManager().error('Settings Error', message);
  }

  async function saveProvider(providerName: string, customUrl?: string) {
    setSavingProvider(providerName);
    try {
      const keyVal = editingKeys[providerName] || '';
      
      const payload = {
        action: 'save_provider',
        providerConfig: {
          providerName,
          endpointUrl: customUrl || '',
          apiKey: keyVal,
          isActive: true,
          priority: 1,
        },
      };

      const res = await fetch('/api/settings/ai-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotice('success', `${providerName.toUpperCase()} credentials updated`);
        fetchSettings();
      } else {
        const err = await res.json();
        showNotice('error', err.error || 'Failed to update credentials');
      }
    } catch {
      showNotice('error', 'Network failure during update');
    } finally {
      setSavingProvider(null);
    }
  }

  async function savePreset(presetName: string, provider: string, model: string, costLimit: number, privacy: string) {
    setSavingPreset(presetName);
    try {
      const payload = {
        action: 'save_preset',
        presetConfig: {
          presetName,
          providerName: provider,
          modelName: model,
          maxCostLimit: costLimit,
          privacyMode: privacy,
        },
      };

      const res = await fetch('/api/settings/ai-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotice('success', `Optimized parameters saved for ${presetName.replace('_', ' ')}`);
        fetchSettings();
      } else {
        const err = await res.json();
        showNotice('error', err.error || 'Failed to save preset');
      }
    } catch {
      showNotice('error', 'Network failure during save');
    } finally {
      setSavingPreset(null);
    }
  }

  if (isLoading) {
    return (
      <NavLayout title="AI Providers" subtitle="Configure LLM providers and workflow presets">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Spinner className="w-10 h-10 text-indigo-600" />
          <span className="text-sm text-slate-500 font-medium">Loading orchestrator preferences...</span>
        </div>
      </NavLayout>
    );
  }

  return (
    <NavLayout title="AI Providers" subtitle="Configure LLM providers, API keys, and workflow presets">
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-8 h-8 text-indigo-600" />
            <span>AI Orchestration Center</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure private local LLMs, progressive cloud API keys, and workflow budgets.
          </p>
        </div>
        
        {/* Dynamic status indicators */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={triggerLocalScan} 
            disabled={isScanning}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Scan Local Network'}</span>
          </Button>
          
          {localStatus.isActive ? (
            <Badge variant="success" className="py-1 px-3 flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200">
              <Server className="w-3.5 h-3.5" />
              <span>{localStatus.provider?.toUpperCase()} ONLINE</span>
            </Badge>
          ) : (
            <Badge variant="gray" className="py-1 px-3 flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200">
              <Server className="w-3.5 h-3.5" />
              <span>LOCAL LLM OFFLINE</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Dynamic Preset Governance (2/3 Grid) */}
        <div className="lg:col-span-2 space-y-8">
          
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Outcome Optimization Registry</span>
          </h2>

          {/* Workflow Preset Cards */}
          <div className="space-y-6">
            {Object.entries(presets.length > 0 ? presets : [
              { presetName: 'RESUME_OPTIMIZATION', providerName: 'gemini', modelName: 'gemini-2.5-flash', maxCostLimit: 0.05, privacyMode: 'enterprise' },
              { presetName: 'ATS_OPTIMIZATION', providerName: 'groq', modelName: 'llama-3.1-8b-instant', maxCostLimit: 0.01, privacyMode: 'enterprise' },
              { presetName: 'TECHNICAL_INTERVIEW', providerName: 'anthropic', modelName: 'claude-3-5-sonnet-20241022', maxCostLimit: 0.15, privacyMode: 'enterprise' }
            ]).map(([key, p]: any) => {
              const name = p.presetName || key;
              const title = name.replaceAll('_', ' ');

              return (
                <Card key={name} className="overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider">Outcome Preset</span>
                        <h3 className="text-lg font-bold text-slate-900 capitalize">{title.toLowerCase()}</h3>
                      </div>
                      <Badge variant="gray" className="bg-slate-50 text-slate-700 capitalize flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{p.privacyMode} Privacy</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {/* Provider Select */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Route Provider</label>
                        <select 
                          className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={p.providerName}
                          onChange={(e) => {
                            const newPresets = [...presets];
                            const idx = newPresets.findIndex((x) => x.presetName === name);
                            if (idx >= 0) {
                              newPresets[idx].providerName = e.target.value;
                              setPresets(newPresets);
                            }
                          }}
                        >
                          <option value="gemini">Google Gemini</option>
                          <option value="anthropic">Anthropic Claude</option>
                          <option value="openai">OpenAI GPT</option>
                          <option value="groq">Groq Instant</option>
                          <option value="ollama">Ollama (Offline)</option>
                          <option value="lmstudio">LM Studio (Local)</option>
                        </select>
                      </div>

                      {/* Model Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Target Model</label>
                        <input 
                          type="text" 
                          className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={p.modelName}
                          onChange={(e) => {
                            const newPresets = [...presets];
                            const idx = newPresets.findIndex((x) => x.presetName === name);
                            if (idx >= 0) {
                              newPresets[idx].modelName = e.target.value;
                              setPresets(newPresets);
                            }
                          }}
                        />
                      </div>

                      {/* Cost Limit */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-500" />
                          <span>Max Exec Spend</span>
                        </label>
                        <input 
                          type="number" 
                          step="0.005"
                          className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={p.maxCostLimit}
                          onChange={(e) => {
                            const newPresets = [...presets];
                            const idx = newPresets.findIndex((x) => x.presetName === name);
                            if (idx >= 0) {
                              newPresets[idx].maxCostLimit = parseFloat(e.target.value);
                              setPresets(newPresets);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Dynamic fallovers will failback automatically.</span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        disabled={savingPreset === name}
                        onClick={() => savePreset(name, p.providerName, p.modelName, p.maxCostLimit, p.privacyMode)}
                      >
                        {savingPreset === name ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Side: Progressive Credentials & OOSS Marketplace (1/3 Grid) */}
        <div className="space-y-8">
          
          {/* Progressive Key Configuration Card */}
          <Card className="border border-slate-200/80 shadow-sm p-6 space-y-6 bg-slate-50/50">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CloudLightning className="w-5 h-5 text-indigo-500" />
                <span>Cloud Credentials</span>
              </h3>
              <p className="text-xs text-slate-500">
                Stored locally and encrypted with military-grade AES-GCM tags.
              </p>
            </div>

            {/* Providers Forms */}
            {['openai', 'anthropic', 'gemini', 'groq'].map((provider) => {
              const hasVal = configs.find((c) => c.providerName === provider)?.hasKey;
              return (
                <div key={provider} className="space-y-2 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-slate-600">{provider}</span>
                    {hasVal && (
                      <Badge variant="success" className="py-0.5 px-2 text-[10px] bg-emerald-50 text-emerald-700">
                        Configured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <input 
                        type={showKeys[provider] ? 'text' : 'password'}
                        className="w-full text-xs rounded-xl border border-slate-200 pl-3 pr-8 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        placeholder={hasVal ? '••••••••••••••••••••' : `Enter ${provider} API Key`}
                        value={editingKeys[provider] || ''}
                        onChange={(e) => setEditingKeys({ ...editingKeys, [provider]: e.target.value })}
                      />
                      <button 
                        type="button"
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                        onClick={() => setShowKeys({ ...showKeys, [provider]: !showKeys[provider] })}
                      >
                        {showKeys[provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="px-3"
                      disabled={savingProvider === provider}
                      onClick={() => saveProvider(provider)}
                    >
                      {savingProvider === provider ? '...' : 'Save'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Local / Private Marketplace Panel */}
          <Card className="border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-500" />
                <span>OOSS & Local Marketplace</span>
              </h3>
              <p className="text-xs text-slate-500">
                First-class zero-cost pipeline integrations.
              </p>
            </div>

            {localStatus.isActive ? (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                  <span className="text-xs font-bold text-green-800">
                    Active server found: {localStatus.provider?.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 block">Detected Local Models:</span>
                  {localStatus.models.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {localStatus.models.map((m) => (
                        <Badge key={m} variant="gray" className="text-[10px] bg-slate-50 text-slate-700 py-0.5 border border-slate-200/60">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No downloaded models found in runtime registry.</span>
                  )}
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold text-slate-600 block">VRAM Profile Guidelines:</span>
                  <ul className="space-y-1.5">
                    {localStatus.recommendations.map((rec, i) => (
                      <li key={i} className="text-[10px] text-slate-500 leading-relaxed list-disc list-inside">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-slate-400 leading-relaxed px-2">
                  Launch Ollama on port <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded font-mono">11434</code> or LM Studio on <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded font-mono">1234</code> to unlock 100% free, high-privacy offline career operating workflows.
                </p>
                <Button variant="outline" size="sm" onClick={triggerLocalScan} className="w-full rounded-xl text-xs">
                  Trigger Loopback Scan
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
    </NavLayout>
  );
}
