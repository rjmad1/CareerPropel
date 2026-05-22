'use client';

import React, { useState, useMemo } from 'react';
import { Edit3, Eye, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

interface ResumeEditorProps {
  content: string;
  onContentChange: (val: string) => void;
  matchScore: number;
}

// Parse **bold** text using non-greedy regex so unmatched markers are handled safely
function parseBold(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) result.push(text.slice(lastIndex, match.index));
    result.push(<strong key={match.index} className="text-indigo-300 font-extrabold">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) result.push(text.slice(lastIndex));
  return result;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  content,
  onContentChange,
  matchScore,
}) => {
  const [editorMode, setEditorMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copied, setCopied] = useState(false);

  // Real-time keyword alignment analysis (mocking NLP keywords matching)
  const keywords = useMemo(() => {
    const text = content.toLowerCase();
    const list = [
      { word: 'TypeScript', matched: text.includes('typescript') },
      { word: 'React', matched: text.includes('react') },
      { word: 'Next.js', matched: text.includes('next.js') || text.includes('nextjs') },
      { word: 'System Design', matched: text.includes('system design') },
      { word: 'E2E Testing', matched: text.includes('e2e') || text.includes('cypress') },
      { word: 'Redis', matched: text.includes('redis') },
      { word: 'GraphQL', matched: text.includes('graphql') },
      { word: 'PostgreSQL', matched: text.includes('postgresql') || text.includes('postgres') },
    ];
    return list;
  }, [content]);

  const matchedCount = keywords.filter((k) => k.matched).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard write failed:', err);
      setCopied(false);
    }
  };

  // Light-weight custom parser to turn simple markdown into HTML structure for beautiful preview
  const parsedPreview = useMemo(() => {
    if (!content) return <p className="text-slate-500 italic text-xs">Empty resume content...</p>;

    return content.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx} className="text-lg font-black text-slate-100 border-b border-slate-900 pb-1 mb-2 mt-4 first:mt-0">{trimmed.slice(2)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} className="text-sm font-bold text-indigo-400 mt-3 mb-1">{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-xs font-bold text-slate-300 mt-2 mb-1">{trimmed.slice(4)}</h3>;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="text-[10px] text-slate-350 list-disc ml-4 mb-1.5 leading-relaxed">
            {parseBold(trimmed.slice(2))}
          </li>
        );
      }
      if (trimmed === '') return <div key={idx} className="h-2" />;

      return (
        <p key={idx} className="text-[10px] text-slate-400 mb-2 leading-relaxed">
          {parseBold(trimmed)}
        </p>
      );
    });
  }, [content]);

  return (
    <div
      className="bg-[#090d16] border border-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col gap-6"
      data-cy="resume-editor-workspace"
      role="region"
      aria-label="Resume Editor"
    >
      {/* Editor top toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
            Tailoring Lab
          </span>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-400" /> Interactive Resume Editor
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode switch */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 text-xs" role="group" aria-label="Editor view mode">
            <button
              onClick={() => setEditorMode('edit')}
              aria-pressed={editorMode === 'edit'}
              aria-label="Edit mode — full width editor"
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                editorMode === 'edit' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
              data-cy="mode-edit-btn"
            >
              <Edit3 className="w-3.5 h-3.5" /> Editor
            </button>
            <button
              onClick={() => setEditorMode('split')}
              aria-pressed={editorMode === 'split'}
              aria-label="Split view — editor and preview side by side"
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                editorMode === 'split' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
              data-cy="mode-split-btn"
            >
              Split View
            </button>
            <button
              onClick={() => setEditorMode('preview')}
              aria-pressed={editorMode === 'preview'}
              aria-label="Preview mode — rendered paper view"
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                editorMode === 'preview' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
              data-cy="mode-preview-btn"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>

          <button
            onClick={handleCopy}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              copied ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
            }`}
            data-cy="copy-markdown-btn"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Markdown
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Keywords Sidebar - left */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-3.5">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-900 pb-1.5">
              ATS Score & Analysis
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Match score:</span>
              <span className={`text-sm font-black ${
                matchScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
              }`}>{matchScore}%</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  matchScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${matchScore}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-3.5">
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Key Keywords Alignment
              </h4>
              <span className="text-[10px] font-black text-indigo-400">{matchedCount}/{keywords.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {keywords.map((kw) => (
                <div
                  key={kw.word}
                  className={`flex items-center justify-between text-[10px] p-2 rounded-xl border ${
                    kw.matched
                      ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300'
                      : 'bg-slate-900/40 border-slate-900 text-slate-500'
                  }`}
                  data-cy={`keyword-alignment-${kw.word}`}
                >
                  <span>{kw.word}</span>
                  {kw.matched ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-slate-650 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time split panel workspace */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[480px]">
          {/* EDITOR SECTION */}
          {(editorMode === 'edit' || editorMode === 'split') && (
            <div className={`flex flex-col bg-slate-950/40 border border-slate-900 rounded-2xl overflow-hidden ${
              editorMode === 'edit' ? 'col-span-2' : ''
            }`}>
              <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span>Markdown Editor</span>
                <span>{content.length} characters</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className="flex-1 w-full bg-[#05080e] p-4 text-xs font-mono text-slate-300 leading-relaxed focus:outline-none resize-none min-h-[420px] border-none"
                placeholder="# Professional Title..."
                aria-label="Resume markdown content editor"
                aria-multiline="true"
                data-cy="markdown-editor"
              />
            </div>
          )}

          {/* PREVIEW SECTION */}
          {(editorMode === 'preview' || editorMode === 'split') && (
            <div className={`flex flex-col bg-slate-950/40 border border-slate-900 rounded-2xl overflow-hidden ${
              editorMode === 'preview' ? 'col-span-2' : ''
            }`}>
              <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Resume High-Fidelity Paper View</span>
              </div>
              <div className="flex-1 bg-slate-950/80 p-6 min-h-[420px] overflow-y-auto max-h-[60vh] border-none" data-cy="paper-preview">
                {/* Simulated White paper resume styled inside dark theme */}
                <div className="bg-slate-950/40 border border-slate-900 p-6 rounded-xl shadow-inner min-h-full">
                  {parsedPreview}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
