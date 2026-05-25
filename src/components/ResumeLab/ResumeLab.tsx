'use client';

import React, { useState, useRef } from 'react';
import { VariantManager, ResumeVariant } from './VariantManager';
import { ResumeEditor } from './ResumeEditor';
import { Sparkles } from 'lucide-react';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { UnsavedChangesModal } from '@/components/Navigation/UnsavedChangesModal';

let _varIdCounter = 0;

const INITIAL_VARIANTS: ResumeVariant[] = [
  {
    id: 'var_1',
    name: 'General UI & Telemetry Specialist',
    description: 'Focused on high-concurrency UI architecture, telemetry decoupled streams, and E2E Cypress coverage.',
    targetRole: 'Senior Frontend Architect',
    matchScore: 88,
    wordCount: 165,
    lastUpdated: '10 min ago',
    content: `# John Doe - Staff UI & Telemetry Architect

## Professional Summary
High-concurrency React UI developer with 8+ years specializing in distributed systems telemetry and E2E automation frameworks. Decoupled telemetry state systems and built modular structures to optimize large-scale analytics performance.

## Core Expertise
- Languages: **TypeScript**, **React**, Next.js, HTML/CSS
- Frameworks: **System Design**, **E2E Testing**, GraphQL
- Systems: **Redis**, **PostgreSQL**, Docker, Git

## Professional Achievements
- Decoupled lagging legacy telemetry states, decreasing dashboard interaction latency by 320ms and cutting memory overhead by 24%.
- Pioneered automated Cypress verification plans, raising test suite code coverage from 64% to 98% and preventing regressions.
- Designed edge-caching routers with Next.js Server Components and Redis clusters, facilitating 45% request acceleration.`,
  },
  {
    id: 'var_2',
    name: 'Backend Caching & Decoupling Focus',
    description: 'Highlights Redis scaling, system design patterns, and heavy pipeline offloading accomplishments.',
    targetRole: 'Principal Backend Engineer',
    matchScore: 78,
    wordCount: 172,
    lastUpdated: '2 hours ago',
    content: `# John Doe - Principal Distributed Systems Architect

## Professional Summary
Backend specialist focused on high-throughput database sharding, memory caching optimization, and microservices decoupling. Decoupled telemetry state architectures and offloaded heavy telemetry pipelines.

## Core Expertise
- Languages: Go, **TypeScript**, **PostgreSQL**, SQL
- Frameworks: **System Design**, **Redis**, Node.js, GraphQL
- Systems: Redis caching, System Design, Decoupling pipelines

## Professional Achievements
- Decoupled lagging legacy dashboard architectures and telemetry states, saving 24% memory and boosting server efficiency.
- Configured Redis caching clusters to offload heavy server telemetry computations, accelerating Edge router responses by 45%.
- Mapped scalable edge Server Component designs, preventing 14 regression failures across multi-tier staging environments.`,
  },
];

export const ResumeLab: React.FC = () => {
  const [variants, setVariants] = useState<ResumeVariant[]>(INITIAL_VARIANTS);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('var_1');
  const savedContentRef = useRef<Record<string, string>>({});

  // Guard — mark dirty whenever content differs from last saved state
  const isDirtyFn = () => {
    return variants.some((v) => {
      const saved = savedContentRef.current[v.id];
      return saved !== undefined && saved !== v.content;
    });
  };

  const {
    showConfirm,
    onConfirmDiscard,
    onCancelDiscard,
  } = useUnsavedChangesGuard({
    message: 'You have unsaved resume changes. Leave without saving?',
    isDirtyExternal: isDirtyFn(),
  });

  // Mark baseline when variant is first loaded
  const handleSelectVariant = (id: string) => {
    const found = variants.find((v) => v.id === id);
    if (found && !(id in savedContentRef.current)) {
      savedContentRef.current[id] = found.content;
    }
    setSelectedVariantId(id);
  };

  const activeVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0];

  const handleContentChange = (newContent: string) => {
    // Dynamic word counting and formatting check
    const words = newContent.trim().split(/\s+/).filter(Boolean).length;
    
    // Simulate dynamic match score changes depending on contents
    const lower = newContent.toLowerCase();
    const KEYWORDS = ['typescript', 'react', 'system design'];
    const matchCount = KEYWORDS.filter(kw => lower.includes(kw)).length;
    const delta = matchCount > 0 ? matchCount : -1;
    const score = Math.max(30, Math.min(100, activeVariant.matchScore + delta));

    setVariants(
      variants.map((v) =>
        v.id === selectedVariantId
          ? {
              ...v,
              content: newContent,
              wordCount: words,
              matchScore: score,
              lastUpdated: 'Just now',
            }
          : v
      )
    );
  };

  const handleCreateVariant = (name: string, description: string, targetRole: string) => {
    const newId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? `var_${crypto.randomUUID()}`
      : `var_${Date.now()}-${++_varIdCounter}-${Math.random().toString(36).slice(2, 9)}`;
    const newVariant: ResumeVariant = {
      id: newId,
      name,
      description,
      targetRole,
      matchScore: 65, // default starting score
      wordCount: activeVariant.wordCount,
      lastUpdated: 'Just now',
      content: activeVariant.content.replace(/^#\s+.*$/m, `# ${name}`), // replace first header with new variant name
    };
    setVariants([...variants, newVariant]);
    setSelectedVariantId(newId);
  };

  const handleDeleteVariant = (id: string) => {
    if (variants.length <= 1) return;
    const remaining = variants.filter((v) => v.id !== id);
    setVariants(remaining);
    if (selectedVariantId === id) {
      setSelectedVariantId(remaining[0].id);
    }
  };

  if (variants.length === 0 || !activeVariant) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 antialiased p-6 md:p-10 flex items-center justify-center">
        <p className="text-slate-400 text-sm">No resume variants available.</p>
      </div>
    );
  }

  return (
    <>
    {/* Unsaved-changes confirmation modal */}
    <UnsavedChangesModal
      open={showConfirm}
      message="You have unsaved resume changes. Leave without saving?"
      onConfirm={onConfirmDiscard}
      onCancel={onCancelDiscard}
    />
    <div className="min-h-screen bg-[#07090e] text-slate-100 antialiased p-6 md:p-10" data-cy="resume-lab-workspace">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> Advanced Tailoring Lab
              </span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-indigo-200 to-sky-200">
              Resume Lab Workspace
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Create, compare, and modify customized resume versions for different tech applications. Side-by-side split screen allows real-time rendering and ATS alignment keywords verification.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/40 border border-slate-900 rounded-2xl p-4">
            <div className="px-4 border-r border-slate-900">
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Active Variants</span>
              <span className="text-lg font-black text-indigo-400">{variants.length}</span>
            </div>
            <div className="px-4 border-r border-slate-900">
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Avg Integrity</span>
              <span className="text-lg font-black text-emerald-400">
                {Math.round(variants.reduce((sum, v) => sum + v.matchScore, 0) / variants.length)}%
              </span>
            </div>
            <div className="px-4">
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Export Format</span>
              <span className="text-lg font-black text-sky-400">MD / PDF</span>
            </div>
          </div>
        </div>

        {/* Workspace Components */}
        <div className="space-y-8">
          {/* Variant Controller & Comparison panel */}
          <VariantManager
            variants={variants}
            selectedVariantId={selectedVariantId}
            onSelectVariant={handleSelectVariant}
            onCreateVariant={handleCreateVariant}
            onDeleteVariant={handleDeleteVariant}
          />

          {/* Interactive Split-Screen editor */}
          <ResumeEditor
            content={activeVariant.content}
            onContentChange={handleContentChange}
            matchScore={activeVariant.matchScore}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default ResumeLab;
