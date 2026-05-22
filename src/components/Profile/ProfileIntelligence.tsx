'use client';

import React, { useState, useMemo } from 'react';

let _fragIdCounter = 0;
import { ProfileSummary, Achievement, ResumeFragment, ProfileEntity } from '@/types/profile';
import { buildProfileKnowledgeGraph } from '@/lib/profile/knowledge-builder';
import { DocumentUpload } from './DocumentUpload';
import { AchievementLibrary } from './AchievementLibrary';
import { ResumeFragments } from './ResumeFragments';

// Realistic Mock Data for immediately beautiful visualization
const MOCK_PROFILE_SCORE = {
  id: 'score_1',
  candidateId: 'temp_candidate',
  totalScore: 84,
  personalInfoScore: 90,
  resumeScore: 80,
  skillsScore: 88,
  experienceScore: 85,
  educationScore: 95,
  goalsScore: 75,
  portfolioScore: 80,
  completeness: 84,
  lastUpdated: new Date()
};

const MOCK_RECENT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_1',
    title: 'Dashboard Telemetry Refactor',
    description: 'Refactored lagging legacy dashboard architectures and decoupled telemetry state synchronization blocks.',
    metrics: [
      { metric: 'Dashboard Latency', value: 320, unit: 'ms' },
      { metric: 'Render Rate', value: 24, unit: 'FPS' }
    ],
    context: 'TechCorp Solutions',
    impact: 'Drastically improved frontend responsive rates and eliminated page-load thread freeze occurrences.',
    date: new Date('2025-11-12'),
    relevantSkills: ['typescript', 'react', 'next.js']
  },
  {
    id: 'ach_2',
    title: 'E2E Testing Standardization',
    description: 'Configured automated end-to-end Cypress verification plans spanning across multi-tier client directories.',
    metrics: [
      { metric: 'Test Coverage', value: 98, unit: '%' },
      { metric: 'Regressions Prevented', value: 14, unit: 'releases' }
    ],
    context: 'Internal Tooling Suite',
    impact: 'Increased operational deployment cycles and built a robust QA baseline schema.',
    date: new Date('2026-02-05'),
    relevantSkills: ['typescript', 'system design']
  },
  {
    id: 'ach_3',
    title: 'Edge Server Component Optimization',
    description: 'Designed edge-caching routers and mapped Redis clusters to offload heavy server telemetry computations.',
    metrics: [
      { metric: 'Response Latency', value: 45, unit: '%' },
      { metric: 'Resource Costs', value: 12000, unit: 'USD/yr' }
    ],
    context: 'Cloud Staging Stack',
    impact: 'Boosted candidate scaling models and maximized core routing efficiency.',
    date: new Date('2026-04-18'),
    relevantSkills: ['next.js', 'graphql', 'postgresql']
  }
];

const MOCK_RESUME_FRAGMENTS: ResumeFragment[] = [
  {
    id: 'frag_1',
    candidateId: 'temp_candidate',
    section: 'experience',
    content: 'Engineered high-concurrency React telemetry layers and decoupled UI rendering pipelines, decreasing dashboard interaction latency by 320ms and saving 24% memory footprint.',
    sourceDocument: 'Imported Resume v1.pdf',
    jobRelevance: ['Senior UI Engineer', 'Netflix Staff Engineer'],
    createdAt: new Date()
  },
  {
    id: 'frag_2',
    candidateId: 'temp_candidate',
    section: 'achievement',
    content: 'Pioneered custom Cypress E2E automation structures spanning 3 principal repositories, elevating testing code coverage from 64% to 98% and removing high-priority hotfixes.',
    sourceDocument: 'LinkedIn Profile Export.json',
    jobRelevance: ['QA Lead', 'Fullstack Architect'],
    createdAt: new Date()
  },
  {
    id: 'frag_3',
    candidateId: 'temp_candidate',
    section: 'project',
    content: 'Architected scalable edge caching strategies with Next.js Server Components and Redis cache caches, facilitating 45% request acceleration under high traffic.',
    sourceDocument: 'Imported Resume v1.pdf',
    jobRelevance: ['Solutions Architect', 'Backend Developer'],
    createdAt: new Date()
  }
];

const MOCK_SUMMARY: ProfileSummary = {
  candidateId: 'temp_candidate',
  completenessScore: MOCK_PROFILE_SCORE,
  topSkills: [
    { name: 'TypeScript', category: 'technical', proficiency: 'expert', marketDemand: 'high' },
    { name: 'React', category: 'technical', proficiency: 'expert', marketDemand: 'high' },
    { name: 'Next.js', category: 'technical', proficiency: 'expert', marketDemand: 'high' },
    { name: 'System Design', category: 'domain', proficiency: 'proficient', marketDemand: 'high' },
    { name: 'GraphQL', category: 'technical', proficiency: 'intermediate', marketDemand: 'medium' },
    { name: 'PostgreSQL', category: 'technical', proficiency: 'proficient', marketDemand: 'medium' }
  ],
  recentAchievements: MOCK_RECENT_ACHIEVEMENTS,
  recommendations: [],
  extractionQuality: {
    totalEntities: 14,
    averageConfidence: 0.92,
    documentCount: 2,
    lastExtraction: new Date()
  },
  careerNarrative: 'Senior engineering specialist dedicated to high-performance web systems and automated orchestration frameworks.'
};

export const ProfileIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'graph' | 'upload' | 'star' | 'fragments'>('graph');
  const [summary, setSummary] = useState<ProfileSummary>(MOCK_SUMMARY);
  const [achievements, setAchievements] = useState<Achievement[]>(MOCK_RECENT_ACHIEVEMENTS);
  const [fragments, setFragments] = useState<ResumeFragment[]>(MOCK_RESUME_FRAGMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive SVG graph node states
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Re-build semantic graph coordinates when topSkills or recentAchievements change
  const knowledgeGraph = useMemo(() => {
    return buildProfileKnowledgeGraph({
      ...summary,
      recentAchievements: achievements
    });
  }, [summary, achievements]);

  // Determine connections of the hovered/selected node
  const activeConnections = useMemo(() => {
    const activeId = hoveredNodeId || selectedNodeId;
    if (!activeId) return new Set<string>();

    const connections = new Set<string>();
    connections.add(activeId);

    knowledgeGraph.edges.forEach((edge) => {
      if (edge.sourceId === activeId) {
        connections.add(edge.targetId);
      } else if (edge.targetId === activeId) {
        connections.add(edge.sourceId);
      }
    });

    return connections;
  }, [hoveredNodeId, selectedNodeId, knowledgeGraph]);

  // Handler for parsing document output
  const handleEntitiesExtracted = (entities: ProfileEntity[]) => {
    // 1. Separate skills vs achievements
    const newSkillsMap = new Map<string, string>();
    const newAchs: Achievement[] = [];

    entities.forEach((entity) => {
      if (entity.type === 'skill') {
        newSkillsMap.set(entity.content.toLowerCase(), entity.content);
      } else if (entity.type === 'achievement') {
        newAchs.push({
          id: entity.id,
          title: entity.content.split(/[.,]/)[0] || 'Extracted Milestone',
          description: entity.content,
          metrics: [
            { metric: 'Confidence Metric', value: Math.round(entity.confidence * 100), unit: '%' }
          ],
          context: 'Extracted Staging Context',
          impact: 'Refined from resume documents parsing.',
          date: new Date(),
          relevantSkills: entity.tags
        });
      }
    });

    // 2. Merge unique skills
    const mergedSkills = [...summary.topSkills];
    newSkillsMap.forEach((name) => {
      if (!mergedSkills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
        mergedSkills.push({
          name,
          category: 'technical',
          proficiency: 'proficient',
          marketDemand: 'high'
        });
      }
    });

    // 3. Add accomplishments
    const mergedAchs = [...newAchs, ...achievements];
    setAchievements(mergedAchs);

    // 4. Create resume fragments for new achievements
    const newFrags: ResumeFragment[] = newAchs.map((ach) => ({
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `frag_${crypto.randomUUID()}`
        : `frag_${Date.now()}-${++_fragIdCounter}-${Math.random().toString(36).slice(2, 9)}`,
      candidateId: summary.candidateId,
      section: 'achievement' as const,
      content: ach.description,
      sourceDocument: 'Imported Resume Parsing',
      jobRelevance: ['General Application'],
      achievementId: ach.id,
      createdAt: new Date()
    }));
    setFragments([...newFrags, ...fragments]);

    // 5. Update complete summary state
    setSummary((prev) => ({
      ...prev,
      topSkills: mergedSkills,
      recentAchievements: mergedAchs,
      extractionQuality: {
        totalEntities: prev.extractionQuality.totalEntities + entities.length,
        averageConfidence: 0.94,
        documentCount: prev.extractionQuality.documentCount + 1,
        lastExtraction: new Date()
      }
    }));
  };

  const handleAddAchievement = (newAch: Achievement) => {
    setAchievements([newAch, ...achievements]);
    // Inject automatically into fragments library
    const newFrag: ResumeFragment = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `frag_${crypto.randomUUID()}`
        : `frag_${Date.now()}-${++_fragIdCounter}-${Math.random().toString(36).slice(2, 9)}`,
      candidateId: summary.candidateId,
      section: 'achievement',
      content: newAch.description,
      sourceDocument: 'Manual Achievement Entry',
      jobRelevance: newAch.relevantSkills,
      achievementId: newAch.id,
      createdAt: new Date()
    };
    setFragments([newFrag, ...fragments]);
  };

  const handleDeleteAchievement = (id: string) => {
    setAchievements(achievements.filter((a) => a.id !== id));
    setFragments(fragments.filter((f) => f.achievementId !== id));
  };

  const handleAddFragment = (newFrag: Omit<ResumeFragment, 'id' | 'createdAt'>) => {
    const fragId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? `manual_frag_${crypto.randomUUID()}`
      : `manual_frag_${Date.now()}-${++_fragIdCounter}-${Math.random().toString(36).slice(2, 9)}`;
    setFragments([
      {
        ...newFrag,
        id: fragId,
        createdAt: new Date()
      },
      ...fragments
    ]);
  };

  // Node styles configuration helper
  const getNodeColor = (type: string, isDimmed: boolean, isHighlighted: boolean) => {
    if (isDimmed) return 'fill-slate-900 border-slate-800 text-slate-700 opacity-20';
    
    switch (type) {
      case 'skill':
        return isHighlighted 
          ? 'fill-indigo-500/20 stroke-indigo-400 stroke-2 [filter:drop-shadow(0_0_8px_rgba(99,102,241,0.6))]'
          : 'fill-slate-950/60 stroke-indigo-500/40 hover:stroke-indigo-400 hover:fill-indigo-500/10';
      case 'achievement':
        return isHighlighted
          ? 'fill-emerald-500/20 stroke-emerald-400 stroke-2 [filter:drop-shadow(0_0_8px_rgba(52,211,153,0.6))]'
          : 'fill-slate-950/60 stroke-emerald-500/40 hover:stroke-emerald-400 hover:fill-emerald-500/10';
      default: // central hub
        return isHighlighted
          ? 'fill-sky-500/20 stroke-sky-400 stroke-2 [filter:drop-shadow(0_0_12px_rgba(56,189,248,0.7))]'
          : 'fill-slate-950 stroke-sky-500/60 hover:stroke-sky-400';
    }
  };

  const getEdgeStyle = (edge: any) => {
    const activeId = hoveredNodeId || selectedNodeId;
    const isEdgeConnected = activeId && (edge.sourceId === activeId || edge.targetId === activeId);
    
    if (activeId) {
      return isEdgeConnected
        ? 'stroke-indigo-400 stroke-2 opacity-100 [filter:drop-shadow(0_0_4px_rgba(99,102,241,0.6))]'
        : 'stroke-slate-800 stroke-[0.5px] opacity-10';
    }
    
    return 'stroke-slate-800 stroke-1 opacity-40';
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 antialiased p-6 md:p-10" data-cy="profile-intelligence-dashboard">
      {/* Dashboard Super Header */}
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                Executive Core Intelligence
              </span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-indigo-200 to-sky-200">
              Profile Intelligence Workspace
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Construct a semantic **Knowledge Graph** linking top competencies to real-world impact. Tailor and copy resume fragments seamlessly.
            </p>
          </div>

          {/* Quick Metrics display */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-950/40 border border-slate-900 rounded-2xl p-4">
            <div className="px-4 border-r border-slate-900">
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Integrity score</span>
              <span className="text-lg font-black text-emerald-400">{summary.completenessScore.totalScore}%</span>
            </div>
            <div className="px-4 border-r border-slate-900">
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Total Nodes</span>
              <span className="text-lg font-black text-indigo-400">{knowledgeGraph.nodes.length}</span>
            </div>
            <div className="px-4">
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Parsed Files</span>
              <span className="text-lg font-black text-sky-400">{summary.extractionQuality.documentCount}</span>
            </div>
          </div>
        </div>

        {/* Primary Bento Tab Menu */}
        <div className="flex flex-wrap gap-2.5 border-b border-slate-900/60 pb-4">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all duration-200 active:scale-95 ${
              activeTab === 'graph'
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-bold'
                : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
            }`}
            data-cy="tab-graph"
          >
            <span>🧠</span> Semantic Connection Graph
          </button>
          
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all duration-200 active:scale-95 ${
              activeTab === 'upload'
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-bold'
                : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
            }`}
            data-cy="tab-upload"
          >
            <span>📥</span> Document Parsing Console
          </button>

          <button
            onClick={() => setActiveTab('star')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all duration-200 active:scale-95 ${
              activeTab === 'star'
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-bold'
                : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
            }`}
            data-cy="tab-star"
          >
            <span>🏆</span> STAR Milestones Library
          </button>

          <button
            onClick={() => setActiveTab('fragments')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all duration-200 active:scale-95 ${
              activeTab === 'fragments'
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-bold'
                : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
            }`}
            data-cy="tab-fragments"
          >
            <span>📁</span> Resume Fragments Library
          </button>
        </div>

        {/* Tab Workspaces */}
        <div className="min-h-[500px]">
          {/* SEMANTIC GRAPH TAB */}
          {activeTab === 'graph' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-cy="graph-workspace">
              {/* Interactive SVG Render Frame */}
              <div className="lg:col-span-2 bg-slate-950/50 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <span>🔗</span> Dynamic Node-Link Visualization
                    </h3>
                    <p className="text-[11px] text-slate-500">Hover over nodes to trace demonstrated competencies and STAR highlights.</p>
                  </div>

                  {/* Graph search input */}
                  <div className="relative w-full md:w-60">
                    <input
                      type="text"
                      placeholder="Search entities in graph..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-1.5 pl-8 bg-slate-900/60 border border-slate-800/80 rounded-xl text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                      data-cy="graph-search-input"
                    />
                    <span className="absolute left-2.5 top-2 text-[10px] text-slate-500">🔍</span>
                  </div>
                </div>

                {/* SVG CANVAS */}
                <div className="w-full aspect-[4/3] min-h-[350px] md:min-h-[420px] bg-[#090b10] border border-slate-900/60 rounded-2xl mt-6 flex items-center justify-center relative overflow-hidden">
                  <svg
                    viewBox="0 0 600 400"
                    className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                    data-cy="interactive-svg-canvas"
                  >
                    {/* Render Edge Connection lines */}
                    <g>
                      {knowledgeGraph.edges.map((edge) => (
                        <line
                          key={edge.id}
                          x1={knowledgeGraph.nodes.find((n) => n.id === edge.sourceId)?.x || 300}
                          y1={knowledgeGraph.nodes.find((n) => n.id === edge.sourceId)?.y || 200}
                          x2={knowledgeGraph.nodes.find((n) => n.id === edge.targetId)?.x || 300}
                          y2={knowledgeGraph.nodes.find((n) => n.id === edge.targetId)?.y || 200}
                          className={`transition-all duration-300 ${getEdgeStyle(edge)}`}
                        />
                      ))}
                    </g>

                    {/* Render Graph Nodes */}
                    <g>
                      {knowledgeGraph.nodes.map((node) => {
                        const isHovered = hoveredNodeId === node.id;
                        const isSelected = selectedNodeId === node.id;
                        const activeId = hoveredNodeId || selectedNodeId;
                        
                        const isNodeConnected = activeConnections.has(node.id);
                        const isDimmed = activeId ? !isNodeConnected : false;
                        const isHighlighted = isHovered || isSelected || isNodeConnected;

                        // Check search query filter
                        const matchesSearch = !!searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
                        const isQueryDimmed = !!searchQuery && !matchesSearch;

                        const finalDimmed = isDimmed || isQueryDimmed;
                        const finalHighlight = isHighlighted || matchesSearch;

                        // Scale size based on node importance
                        const baseRadius = Boolean(node.metadata?.isCenter) ? 18 : node.type === 'skill' ? 10 : 8;
                        const finalRadius = finalHighlight ? baseRadius + 3 : baseRadius;

                        return (
                          <g
                            key={node.id}
                            transform={`translate(${node.x || 300}, ${node.y || 200})`}
                            onMouseEnter={() => setHoveredNodeId(node.id)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                            onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)}
                            className="cursor-pointer"
                            data-cy={`graph-node-${node.id}`}
                          >
                            {/* Outer Glow ring when active */}
                            {finalHighlight && (
                              <circle
                                r={finalRadius + 6}
                                className="fill-none stroke-indigo-500/20 stroke-1 animate-pulse"
                              />
                            )}

                            {/* Node Core */}
                            <circle
                              r={finalRadius}
                              className={`transition-all duration-300 ${getNodeColor(node.type, finalDimmed, finalHighlight)}`}
                            />

                            {/* Label */}
                            <text
                              y={finalRadius + 14}
                              textAnchor="middle"
                              className={`font-sans font-bold text-[9px] transition-all duration-300 pointer-events-none ${
                                finalDimmed ? 'fill-slate-700 opacity-20' :
                                finalHighlight ? 'fill-indigo-300 font-extrabold' : 'fill-slate-400'
                              }`}
                            >
                              {node.label}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>

                  {/* Visual legends panel */}
                  <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-900 rounded-xl p-3 flex gap-4 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-sky-500/60" />
                      <span className="text-slate-400">Main Hub</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-indigo-500/60" />
                      <span className="text-slate-400">Top Skill</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-emerald-500/60" />
                      <span className="text-slate-400">STAR Milestone</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info Cards */}
              <div className="space-y-6">
                {/* Dynamic Metadata Panel */}
                <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 shadow-2xl backdrop-blur-md min-h-[280px] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block mb-2">Entity Metadata Inspector</span>
                    
                    {/* Hovered/Selected details */}
                    {(hoveredNodeId || selectedNodeId) ? (
                      (() => {
                        const targetId = hoveredNodeId || selectedNodeId;
                        const node = knowledgeGraph.nodes.find((n) => n.id === targetId);
                        if (!node) return null;

                        return (
                          <div className="space-y-4 animate-in fade-in duration-200" data-cy="graph-node-details">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                node.type === 'skill' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                node.type === 'achievement' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              }`}>
                                {node.type}
                              </span>
                              <h4 className="font-extrabold text-sm text-slate-200">{node.label}</h4>
                            </div>

                            {/* Node Metadata specifics */}
                            {node.type === 'skill' && (
                              <div className="space-y-3 bg-slate-950/60 border border-slate-900 rounded-2xl p-4">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-[9px] text-slate-500 block">Proficiency</span>
                                    <span className="text-slate-300 font-bold capitalize">{typeof node.metadata?.proficiency === 'string' ? node.metadata.proficiency : 'expert'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-500 block">Market Demand</span>
                                    <span className="text-indigo-400 font-bold capitalize">{typeof node.metadata?.demand === 'string' ? node.metadata.demand : 'high'}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {node.type === 'achievement' && (
                              <div className="space-y-3 bg-slate-950/60 border border-slate-900 rounded-2xl p-4">
                                <div>
                                  <span className="text-[9px] text-slate-500 block">Full Description</span>
                                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{typeof node.metadata?.description === 'string' ? node.metadata.description : undefined}</p>
                                </div>
                                {typeof node.metadata?.context === 'string' && node.metadata.context && (
                                  <div>
                                    <span className="text-[9px] text-slate-500 block">Accomplished Context</span>
                                    <span className="text-xs text-slate-400 font-semibold block mt-0.5">{node.metadata.context}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center py-12" data-cy="graph-node-details-empty">
                        <span className="text-3xl block mb-2 opacity-50">🧭</span>
                        <h4 className="text-xs font-bold text-slate-400">No node selected</h4>
                        <p className="text-[10px] text-slate-600 mt-1">Hover over nodes inside the canvas to inspect semantic metadata connections.</p>
                      </div>
                    )}
                  </div>

                  {/* Center Node narrative snippet */}
                  <div className="border-t border-slate-900/60 pt-4 mt-6">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">AI Narrative Context</span>
                    <p className="text-[11px] text-indigo-300/80 leading-relaxed italic mt-1.5">
                      &ldquo;{summary.careerNarrative}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Recommendations checklist */}
                <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                  <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <span>💡</span> Competency Gaps & Action Items
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-3 bg-slate-950/60 border border-indigo-500/10 rounded-2xl p-3.5">
                      <span className="text-xs">✅</span>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Leadership Milestone Active</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Link a key mentorship achievement to demonstrate Leadership.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 bg-slate-950/60 border border-slate-900 rounded-2xl p-3.5">
                      <span className="text-xs">🔄</span>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Quantifiable Metrics Missing</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Refine your React skill bullet with the polish quantifier to raise integrity.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PARSING CONSOLE TAB */}
          {activeTab === 'upload' && (
            <div className="bg-slate-950/50 border border-slate-900 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl backdrop-blur-md animate-in fade-in duration-300">
              <div className="border-b border-slate-900 pb-6 mb-8">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Upload Pipeline</span>
                <h3 className="text-lg font-bold text-slate-200">Semantic Document Parsing Console</h3>
                <p className="text-xs text-slate-500 mt-1">Upload raw resumes or LinkedIn profiles. Our parsing pipeline decomposes text blocks into skills and accomplishments in real-time.</p>
              </div>
              <DocumentUpload
                onEntitiesExtracted={handleEntitiesExtracted}
                candidateId="temp_candidate"
              />
            </div>
          )}

          {/* STAR LIBRARY TAB */}
          {activeTab === 'star' && (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
              <AchievementLibrary
                achievements={achievements}
                onAddAchievement={handleAddAchievement}
                onDeleteAchievement={handleDeleteAchievement}
              />
            </div>
          )}

          {/* FRAGMENTS TAB */}
          {activeTab === 'fragments' && (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
              <ResumeFragments
                fragments={fragments}
                onAddFragment={handleAddFragment}
                candidateId={summary.candidateId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileIntelligence;
