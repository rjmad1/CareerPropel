'use client';

import { useState } from 'react';
import { 
  Layout, 
  UploadCloud, 
  Sparkles,
  Cpu,
  Monitor
} from 'lucide-react';


interface RegisteredWidget {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
}

export default function SettingsConsole() {
  const [widgets, setWidgets] = useState<RegisteredWidget[]>([
    {
      id: 'cost-heat-map',
      name: 'Token Cost Heatmap widget',
      version: '1.2.0',
      description: 'Dynamic grid visualizing generative model billing concentrations across agents.',
      enabled: true,
    },
    {
      id: 'agent-throughput-metrics',
      name: 'Agent Concurrency panel',
      version: '1.0.4',
      description: 'Custom renderer listing concurrent agent processes and execution threads.',
      enabled: false,
    }
  ]);

  const [themeColor, setThemeColor] = useState('purple');
  const [platformName, setPlatformName] = useState('CareerPropel AI Observability');

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Console Settings & Custom Plugins</h2>
          <p className="text-slate-400 text-sm">Register custom telemetry widgets, manage white-label branding, and control user scopes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: branding & user controls */}
        <div className="space-y-6 lg:col-span-1">
          {/* White-Label Settings */}
          <div className="bg-[#090e1c]/60 border border-slate-900 rounded-xl p-5 backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-purple-400" />
              White-Label Settings
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-500 block mb-1.5">Dashboard Display Title</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full bg-[#050810] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1.5">Harmonized Accent Palette</label>
                <select
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-full bg-[#050810] border border-slate-800 rounded-lg px-3 py-2 text-slate-350 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="purple">Dynamic HSL Purple / Slate (Enterprise Ops)</option>
                  <option value="emerald">Harmonious Emerald / Mint (FinOps Cost)</option>
                  <option value="amber">Harmonious Amber / Gold (Security Compliance)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Plugin Sandbox Environment */}
          <div className="bg-[#090e1c]/60 border border-slate-900 rounded-xl p-5 backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Sandbox Runtime Engine
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Deploy custom telemetry widgets using standard JavaScript closures inside a rendering frame.
            </p>
            <div className="border border-slate-800 bg-[#050810]/80 p-4 rounded-lg flex flex-col items-center justify-center min-h-[120px] text-center gap-2">
              <Cpu className="w-6 h-6 text-slate-600 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-500">Awaiting custom widget build script...</span>
            </div>
          </div>
        </div>

        {/* Right column: plugins registry list */}
        <div className="lg:col-span-2 bg-[#080d1a]/50 border border-slate-900 rounded-xl p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-purple-400" />
              Dashboard Custom Plugins Registry
            </h3>
            <button className="flex items-center gap-1 text-[10px] font-mono bg-purple-950/40 text-purple-400 border border-purple-900/60 hover:bg-purple-900/40 transition-all px-3 py-1.5 rounded-lg">
              <UploadCloud className="w-3.5 h-3.5" />
              Load custom plugin
            </button>
          </div>

          <div className="space-y-4">
            {widgets.map((widget) => (
              <div 
                key={widget.id} 
                className="bg-slate-950/80 border border-slate-900 p-4 rounded-lg flex items-center justify-between gap-4 font-mono text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{widget.name}</span>
                    <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-500 border border-slate-800">
                      v{widget.version}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed max-w-[420px]">{widget.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                      widget.enabled 
                        ? 'bg-purple-950/40 text-purple-400 border-purple-900/60 hover:bg-purple-900/40' 
                        : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    {widget.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
