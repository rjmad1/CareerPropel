'use client';

import React, { useState, useRef } from 'react';
import { DocumentParsingJob } from '@/types/knowledge-graph';
import { parseDocumentText } from '@/lib/profile/parser';
import { extractProfileEntities } from '@/lib/profile/extractor';
import { ProfileEntity } from '@/types/profile';

interface DocumentUploadProps {
  onEntitiesExtracted: (entities: ProfileEntity[]) => void;
  candidateId: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onEntitiesExtracted,
  candidateId,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [job, setJob] = useState<DocumentParsingJob | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    const newJob: DocumentParsingJob = {
      id: `parsing_job_${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      status: 'uploading',
      progress: 10,
      startedAt: new Date().toISOString(),
      confidenceScore: 0,
      entitiesExtracted: 0,
      logs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `Selected file ${file.name} (${Math.round(file.size / 1024)} KB). Starting upload...`
        }
      ]
    };
    setJob(newJob);

    // 1. Simulate Uploading
    await new Promise((resolve) => setTimeout(resolve, 800));
    setJob((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'parsing',
        progress: 25,
        logs: [
          ...prev.logs,
          {
            timestamp: new Date().toLocaleTimeString(),
            level: 'success',
            message: 'File successfully uploaded to staging bucket.'
          }
        ]
      };
    });

    // 2. Parse text and stream progress logs
    try {
      const parsedText = await parseDocumentText(file.name, (progress, log) => {
        setJob((prev) => {
          if (!prev) return null;
          const updatedLogs = [...prev.logs, log];
          setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          return {
            ...prev,
            progress: Math.min(25 + Math.round(progress * 0.5), 75),
            logs: updatedLogs
          };
        });
      });

      setRawText(parsedText);

      // 3. Extract and normalize semantic entities
      setJob((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'indexing',
          progress: 85,
          logs: [
            ...prev.logs,
            {
              timestamp: new Date().toLocaleTimeString(),
              level: 'info',
              message: 'Initializing semantic entity extraction engine...'
            }
          ]
        };
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      const source = file.name.endsWith('.json') ? 'linkedin' : 'resume';
      const extracted = extractProfileEntities(parsedText, source, candidateId);
      const avgConfidence = parseFloat(
        (extracted.reduce((sum, e) => sum + e.confidence, 0) / Math.max(extracted.length, 1)).toFixed(2)
      );

      setJob((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'completed',
          progress: 100,
          confidenceScore: avgConfidence,
          entitiesExtracted: extracted.length,
          completedAt: new Date().toISOString(),
          logs: [
            ...prev.logs,
            {
              timestamp: new Date().toLocaleTimeString(),
              level: 'success',
              message: `Successfully extracted ${extracted.length} semantic entities! (Average Confidence: ${avgConfidence * 100}%)`
            }
          ]
        };
      });

      onEntitiesExtracted(extracted);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown processing error';
      setJob((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'failed',
          progress: 100,
          logs: [
            ...prev.logs,
            {
              timestamp: new Date().toLocaleTimeString(),
              level: 'error',
              message: `Parsing failure: ${message}`
            }
          ]
        };
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8" data-cy="document-upload-workspace">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 transition duration-300 text-center flex flex-col items-center justify-center min-h-[260px] ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/5'
            : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'
        }`}
        data-cy="drop-zone"
      >
        <input
          type="file"
          id="file-upload-input"
          accept=".pdf,.docx,.json"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-inner">
          <span className="text-2xl text-slate-400">📤</span>
        </div>
        <h3 className="text-slate-200 font-semibold mb-2">Drag and drop your professional documents</h3>
        <p className="text-xs text-slate-500 mb-6">Supports resumes, cover letters, and LinkedIn exports (.pdf, .docx, .json)</p>
        <label
          htmlFor="file-upload-input"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition duration-200"
          data-cy="browse-files-btn"
        >
          Browse Files
        </label>
      </div>

      {/* Progress Monitor */}
      {job && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl backdrop-blur-md" data-cy="parsing-monitor">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Parsing Pipeline Active</span>
              <h4 className="text-slate-100 font-bold text-sm mt-1">{job.fileName}</h4>
            </div>
            <div className="flex items-center gap-6">
              {job.status === 'completed' && (
                <>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Entities</span>
                    <span className="text-emerald-400 font-bold text-sm">{job.entitiesExtracted} parsed</span>
                  </div>
                  <div className="text-right border-l border-slate-800 pl-6">
                    <span className="text-[10px] text-slate-400 block font-semibold">Avg Confidence</span>
                    <span className="text-indigo-400 font-bold text-sm">{Math.round(job.confidenceScore * 100)}%</span>
                  </div>
                </>
              )}
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                job.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse'
              }`}>
                {job.status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Stage Completion</span>
              <span>{job.progress}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                style={{ width: `${job.progress}%` }}
                data-cy="progress-bar"
              />
            </div>
          </div>

          {/* Log Viewer */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 block">Processing Terminal</span>
            <div className="bg-slate-950 rounded-xl p-6 h-48 overflow-y-auto border border-slate-800/80 font-mono text-[11px] leading-relaxed space-y-2" data-cy="terminal-logs">
              {job.logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 ${
                    log.level === 'success' ? 'text-emerald-400' :
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warn' ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* RAW JSON Code Inspector */}
          {job.status === 'completed' && (
            <div className="pt-2">
              <button
                onClick={() => setShowJsonInspector(!showJsonInspector)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-2 transition"
                data-cy="json-toggle"
              >
                {showJsonInspector ? '▼ Close payload inspector' : '▶ Expand raw JSON payload explorer'}
              </button>
              {showJsonInspector && (
                <div className="mt-4 bg-slate-950 rounded-xl border border-slate-800 p-6 overflow-x-auto max-h-60" data-cy="json-inspector">
                  <pre className="font-mono text-[11px] text-slate-400 leading-relaxed">
                    {rawText ? (() => {
                      try {
                        return JSON.stringify(JSON.parse(rawText), null, 2);
                      } catch (e) {
                        return rawText;
                      }
                    })() : 'No raw text payload available.'}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
