import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar } from 'lucide-react';
import { Job } from '@/types/job';
import { useUpdateJobNotes } from '../../hooks/useMutations';

interface OverviewTabProps {
  job: Job;
}

export default function OverviewTab({ job }: OverviewTabProps) {
  const [notes, setNotes] = useState(job.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { mutate: updateNotes } = useUpdateJobNotes();

  useEffect(() => {
    setNotes(job.notes || '');
  }, [job.notes]);

  const formattedDate = new Date(job.appliedAt || job.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleSaveNotes = () => {
    if (isSaving) return;
    setIsSaving(true);
    updateNotes(
      { jobId: job.id, notes },
      {
        onSuccess: () => {
          setIsEditingNotes(false);
          setIsSaving(false);
        },
        onError: () => {
          setIsSaving(false);
        },
      }
    );
  };

  return (
    <div className="p-12 space-y-12">
      {/* Key Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-6">Position Details</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-2">
              <Briefcase size={16} className="text-gray-500" />
              <p className="text-xs text-gray-600">Role</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{job.title}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-2">
              <Briefcase size={16} className="text-gray-500" />
              <p className="text-xs text-gray-600">Company</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{job.company}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-2">
              <Calendar size={16} className="text-gray-500" />
              <p className="text-xs text-gray-600">Applied</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-xs text-gray-600 mb-2">Stage</p>
            <p className="text-sm font-medium text-gray-900 capitalize">{job.stage.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
          {!isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              aria-label="Edit notes"
              data-testid="notes-edit-btn"
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Edit
            </button>
          )}
        </div>
        {isEditingNotes ? (
          <div className="space-y-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="notes-textarea"
              className="w-full px-6 py-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Add notes about this opportunity..."
            />
            <div className="flex gap-4">
              <button
                onClick={handleSaveNotes}
                disabled={isSaving}
                data-testid="notes-save-btn"
                className="px-6 py-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditingNotes(false);
                  setNotes(job.notes || '');
                }}
                data-testid="notes-cancel-btn"
                className="px-6 py-4 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            data-testid="notes-content"
            className="bg-gray-50 rounded-lg p-6 text-sm text-gray-700 whitespace-pre-wrap"
          >
            {notes || 'No notes yet'}
          </div>
        )}
      </div>

      {/* Job Description */}
      {job.description && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Description</h3>
          <div
            data-testid="job-description"
            className="bg-gray-50 rounded-lg p-6 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto"
          >
            {job.description}
          </div>
        </div>
      )}

      {/* Job URL if available */}
      {job.url && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Job Listing</h3>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            View Job Posting
          </a>
        </div>
      )}
    </div>
  );
}
