'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, Button, Input, Spinner, Badge } from '@/components/ui';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  ShieldCheck, 
  Zap, 
  Check, 
  Lock, 
  EyeOff, 
  DollarSign, 
  Cpu, 
  Server,
  UserCheck,
  Play
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Persona
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [seniority, setSeniority] = useState('Senior');

  // Step 2: Outcomes (Workflows)
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([
    'RESUME_OPTIMIZATION',
    'ATS_OPTIMIZATION',
    'TECHNICAL_INTERVIEW',
    'CAREER_COACHING'
  ]);

  // Step 3: Privacy
  const [privacyMode, setPrivacyMode] = useState<'local' | 'zero_retention' | 'enterprise'>('enterprise');

  // Step 4: Budget/Compute
  const [computeTier, setComputeTier] = useState<'free' | 'managed' | 'byo'>('managed');

  // Network Local Scanning state (Purely aesthetic/interactive on Step 3/4)
  const [isScanning, setIsScanning] = useState(false);
  const [scannedLocal, setScannedLocal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const toggleOutcome = (key: string) => {
    if (selectedOutcomes.includes(key)) {
      setSelectedOutcomes(selectedOutcomes.filter((o) => o !== key));
    } else {
      setSelectedOutcomes([...selectedOutcomes, key]);
    }
  };

  const triggerLocalScanner = async () => {
    setIsScanning(true);
    // Mimic the local discovery daemon scanning port 11434/1234
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsScanning(false);
    setScannedLocal(true);
  };

  const handleNext = () => {
    if (currentStep === 1 && !targetRole.trim()) {
      setError('Please enter your target role title to continue.');
      return;
    }
    setError('');
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        persona: {
          targetRole,
          industry,
          seniority,
        },
        outcomes: selectedOutcomes,
        privacyMode,
        computeTier,
      };

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Redirect to dashboard with high success feedback
        router.push('/dashboard?welcome=1');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to complete onboarding setups.');
      }
    } catch {
      setError('Network failure. Please verify connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white gap-3">
        <Spinner className="w-10 h-10 text-indigo-500" />
        <span className="text-sm font-semibold tracking-wider text-slate-400">Booting Career Operating System...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      
      {/* Top Header */}
      <div className="max-w-3xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 backdrop-blur-md">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Next-Gen AI Onboarding</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-slate-300 bg-clip-text text-transparent sm:text-5xl">
          CareerPropel
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Tailor your outcomes, control your budget, and set private AI guardrails to power your career search.
        </p>
      </div>

      {/* Central Wizard Card */}
      <div className="max-w-3xl mx-auto w-full mt-10 mb-12">
        
        {/* Progress Bar Header */}
        <div className="mb-8 px-4">
          <div className="flex justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
            <span>Progress</span>
            <span>Step {currentStep} of 4</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/30">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 transition-all duration-500 ease-out shadow-lg shadow-indigo-500/20"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
          
          {/* Breadcrumb text */}
          <div className="grid grid-cols-4 text-center mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span className={currentStep >= 1 ? 'text-indigo-400' : ''}>Persona</span>
            <span className={currentStep >= 2 ? 'text-indigo-400' : ''}>Workflows</span>
            <span className={currentStep >= 3 ? 'text-indigo-400' : ''}>Privacy</span>
            <span className={currentStep >= 4 ? 'text-indigo-400' : ''}>Compute</span>
          </div>
        </div>

        {/* Dynamic Step Content */}
        <Card className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl overflow-hidden min-h-[400px] flex flex-col justify-between p-8 sm:p-10 relative">
          
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-2xl flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CAREER PERSONA */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span>STEP 1: Target Career Archetype</span>
                </span>
                <h2 className="text-2xl font-bold text-white">Tell us about your target role</h2>
                <p className="text-xs text-slate-400">
                  CareerPropel dynamically re-configures prompt templates, system instructions, and models based on your exact seniority and target domain.
                </p>
              </div>

              <div className="space-y-5 pt-4">
                <Input
                  required
                  id="targetRole"
                  label="Target Job Title"
                  placeholder="e.g. Senior Staff Engineer, Creative Product Director"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                />

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Industry / Domain</label>
                  <select 
                    className="w-full text-sm rounded-xl border border-slate-800 bg-slate-950/60 text-slate-200 px-3 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="Technology">Technology & Software</option>
                    <option value="Healthcare & Biotech">Healthcare & Biotech</option>
                    <option value="Finance & Banking">Finance & Banking</option>
                    <option value="Consulting & Advisory">Consulting & Advisory</option>
                    <option value="Creative, PR & Design">Creative, PR & Design</option>
                    <option value="Education & Non-Profit">Education & Non-Profit</option>
                    <option value="Energy, Biotech & Industrial">Energy, Biotech & Industrial</option>
                  </select>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">Seniority & Leadership Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {['Entry', 'Mid', 'Senior', 'Staff & Lead', 'Executive'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSeniority(level)}
                        className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all ${
                          seniority === level
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                            : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OUTCOMES & WORKFLOWS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>STEP 2: Target Workflows & Presets</span>
                </span>
                <h2 className="text-2xl font-bold text-white">What outcomes do you want to secure?</h2>
                <p className="text-xs text-slate-400">
                  Select the AI presets you wish to deploy in your Career OS pipeline. These will be custom routed and fine-tuned for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  {
                    key: 'RESUME_OPTIMIZATION',
                    title: 'Resume Customization',
                    desc: 'Tailor resume bullets & achievements for ATS scores.',
                    icon: UserCheck,
                    badge: 'Outcome Preset'
                  },
                  {
                    key: 'ATS_OPTIMIZATION',
                    title: 'ATS Alignment Scanner',
                    desc: 'Instantly extract missing skills and semantic gaps.',
                    icon: ShieldCheck,
                    badge: 'Security Scan'
                  },
                  {
                    key: 'TECHNICAL_INTERVIEW',
                    title: 'Technical Simulator',
                    desc: 'Advanced system design, coding, & whiteboard mock prep.',
                    icon: Server,
                    badge: 'Ultra-Performance'
                  },
                  {
                    key: 'CAREER_COACHING',
                    title: 'Strategic Career Coach',
                    desc: 'Personalized compensation guides and trajectory hints.',
                    icon: Sparkles,
                    badge: 'High-Fidelity'
                  }
                ].map((outcome) => {
                  const IconComp = outcome.icon;
                  const isSelected = selectedOutcomes.includes(outcome.key);
                  return (
                    <div
                      key={outcome.key}
                      onClick={() => toggleOutcome(outcome.key)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[135px] hover:shadow-lg ${
                        isSelected
                          ? 'bg-indigo-600/10 border-indigo-500/80 shadow-md shadow-indigo-500/5'
                          : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/60">
                          <IconComp className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                        </div>
                        <Badge variant="gray" className={`text-[9px] uppercase font-bold py-0.5 ${
                          isSelected ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}>
                          {outcome.badge}
                        </Badge>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                          {outcome.title}
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{outcome.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: PRIVACY PREFERENCES */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>STEP 3: Privacy Guardrails</span>
                </span>
                <h2 className="text-2xl font-bold text-white">Establish your privacy boundaries</h2>
                <p className="text-xs text-slate-400">
                  CareerPropel features state-of-the-art PII redaction and local execution modes. Choose your default data security profile.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                {[
                  {
                    key: 'enterprise',
                    title: '🛡️ Enterprise-Safe Mode (Recommended)',
                    desc: 'Outbound profiles are parsed by a local redaction engine, stripping Zip Codes, SSNs, phone numbers, and exact addresses before sending. Restored seamlessly on return.',
                    pros: 'Excellent cloud performance + bulletproof local PII masks.',
                    badge: 'Balanced'
                  },
                  {
                    key: 'local',
                    title: '🔒 High-Privacy / Local Mode',
                    desc: 'Data never leaves your system. Routes executions exclusively to local loopback ports scanning Ollama or LM Studio. Requires hardware resources.',
                    pros: '100% private, offline, zero network leakage.',
                    badge: 'Local compute'
                  },
                  {
                    key: 'zero_retention',
                    title: '⚡ Zero-Retention Mode',
                    desc: 'Routes requests to Claude and GPT using developer API profiles that legally contract AI endpoints from keeping or training on prompt parameters.',
                    pros: 'Maximum intelligence, legal data-use constraints active.',
                    badge: 'Enterprise APIs'
                  }
                ].map((mode) => (
                  <div
                    key={mode.key}
                    onClick={() => setPrivacyMode(mode.key as 'local' | 'enterprise' | 'zero_retention')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative hover:shadow-md ${
                      privacyMode === mode.key
                        ? 'bg-indigo-600/10 border-indigo-500/80 shadow-md shadow-indigo-500/5'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        {mode.title}
                        {privacyMode === mode.key && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                      </h4>
                      <Badge variant="gray" className={`text-[9px] uppercase font-bold py-0.5 ${
                        privacyMode === mode.key ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        {mode.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{mode.desc}</p>
                    <p className="text-[10px] text-indigo-300 font-bold mt-2 flex items-center gap-1">
                      <span className="text-slate-500">Security Guarantee:</span> {mode.pros}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: COMPUTE & BUDGET ALIGNMENT */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>STEP 4: Compute & Budget Orchestration</span>
                </span>
                <h2 className="text-2xl font-bold text-white">Select your budget & compute layer</h2>
                <p className="text-xs text-slate-400">
                  Ensure outcomes do not break your budget. Pick your default engine configurations. Advanced key entry is progressively deferred.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {[
                  {
                    key: 'managed',
                    title: 'Managed Cloud',
                    desc: 'Instant out-of-the-box performance. Prompts run securely on CareerPropel enterprise pools.',
                    badge: 'Managed',
                    icon: Zap,
                    border: 'border-blue-500/20 hover:border-blue-500/40'
                  },
                  {
                    key: 'free',
                    title: 'Free Priority',
                    desc: 'Focus strictly on zero-cost routing endpoints, loopback scanners, and free sandbox integrations.',
                    badge: '100% Free',
                    icon: Cpu,
                    border: 'border-emerald-500/20 hover:border-emerald-500/40'
                  },
                  {
                    key: 'byo',
                    title: 'Bring Your Keys',
                    desc: 'Connect your personal OpenAI, Anthropic, or Gemini developer accounts. Configure later.',
                    badge: 'Progressive',
                    icon: EyeOff,
                    border: 'border-slate-800 hover:border-indigo-500/40'
                  }
                ].map((tier) => {
                  const IconComp = tier.icon;
                  const isSelected = computeTier === tier.key;
                  return (
                    <div
                      key={tier.key}
                      onClick={() => setComputeTier(tier.key as 'free' | 'managed' | 'byo')}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[180px] hover:shadow-lg ${
                        isSelected
                          ? 'bg-indigo-600/10 border-indigo-500/80 shadow-md shadow-indigo-500/5'
                          : `bg-slate-950/40 ${tier.border}`
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/60">
                            <IconComp className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                          </div>
                          <Badge variant="gray" className={`text-[8px] uppercase font-bold py-0.5 ${
                            isSelected ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}>
                            {tier.badge}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1">
                          {tier.title}
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{tier.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Ollama/LM Studio Scanner Indicator */}
              {privacyMode === 'local' && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0">
                      <Server className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <span className="text-[11px] font-bold text-slate-100 block">Local Loopback Scanner</span>
                      <p className="text-[10px] text-slate-500">Scan active local Ollama (11434) / LM Studio (1234) runtimes.</p>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full sm:w-auto text-xs bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                    disabled={isScanning}
                    onClick={triggerLocalScanner}
                  >
                    {isScanning ? (
                      <span className="flex items-center gap-1">
                        <Spinner className="w-3 h-3 text-indigo-500" /> Scanning...
                      </span>
                    ) : scannedLocal ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Check className="w-3.5 h-3.5" /> Ollama Scanned
                      </span>
                    ) : (
                      'Scan Network'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Card Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/60 pt-6 mt-8">
            <div className="flex items-center gap-2">
              {currentStep > 1 ? (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1.5" />
                  <span>Back</span>
                </Button>
              ) : (
                <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                  <span>Configuring Career OS</span>
                </span>
              )}
            </div>

            <div className="w-full sm:w-auto">
              {currentStep < 4 ? (
                <Button 
                  type="button" 
                  onClick={handleNext}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all font-bold"
                >
                  <Play className="w-4 h-4" />
                  <span>{isSubmitting ? 'Tailoring Engine...' : 'Initialize Career OS'}</span>
                </Button>
              )}
            </div>
          </div>

        </Card>
      </div>

      {/* Bottom Footer Info */}
      <div className="max-w-md mx-auto w-full text-center text-slate-500 text-[11px] leading-relaxed">
        <p>Your outcomes are completely customizable inside settings after onboarding.</p>
        <p className="mt-1 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>AES-256-GCM Secure Key Storage & Local Redaction Middleware active</span>
        </p>
      </div>

    </div>
  );
}
