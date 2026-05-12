import React, { useState, useEffect } from 'react';
import { ExternalLink, MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { Job } from '../../types';
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

  const formattedDate = new Date(job.appliedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="p-6 space-y-6">
      {/* Job Description */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Job Description</h3>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-40 overflow-y-auto">
          {job.description}
        </div>
      </div>

      {/* Key Details Grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={16} className="text-gray-500" />
              <p className="text-xs text-gray-600">Location</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{job.location || 'Remote'}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={16} className="text-gray-500" />
              <p className="text-xs text-gray-600">Job Type</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{job.jobType || 'Full-time'}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={16} className="text-gray-500" />
              <p className="text-xs text-gray-600">Salary Range</p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              ${job.salaryMin}-${job.salaryMax}k
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} className="text-gray-500" />
              <p className="text-xs text-gray-600">Applied</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Recruiter Info */}
      {job.recruiter && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recruiter</h3>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm font-medium text-gray-900">{job.recruiter}</p>
            {job.recruiterEmail && (
              <p className="text-xs text-blue-600 mt-1">{job.recruiterEmail}</p>
            )}
            {job.recruiterPhone && (
              <p className="text-xs text-blue-600">{job.recruiterPhone}</p>
            )}
          </div>
        </div>
      )}

      {/* External Links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Links</h3>
        <div className="space-y-2">
          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <ExternalLink size={16} className="text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Job Listing</span>
            </a>
          )}
          {job.companyUrl && (
            <a
              href={job.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <ExternalLink size={16} className="text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Company Website</span>
            </a>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
          <button
            onClick={() => {
              if (isEditingNotes) {
                setIsSaving(true);
                updateNotes(
                  { jobId: job.id, notes },
                  {
                    onSuccess: () => {
                      setIsSaving(false);
                      setIsEditingNotes(false);
                    },
                    onError: () => {
                      setIsSaving(false);
                    },
                  }
                );
              } else {
                setIsEditingNotes(true);
              }
            }}
            disabled={isSaving}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isSaving ? 'Saving...' : isEditingNotes ? 'Save' : 'Edit'}
          </button>
        </div>
        {isEditingNotes ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSaving}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Add notes about this job..."
          />
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 min-h-20">
            {notes || 'No notes yet. Click Edit to add notes.'}
          </div>
        )}
      </div>
    </div>
  );
}
