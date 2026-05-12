'use client';

import React, { useState } from 'react';
import { useCreateJob } from '@/domains/jobs/hooks';
import { JobStage } from '@/types/job';

interface JobInputFormProps {
  onSuccess?: (jobId: string) => void;
  onCancel?: () => void;
}

export default function JobInputForm({ onSuccess, onCancel }: JobInputFormProps) {
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    jobUrl: '',
    notes: '',
  });

  const createJobMutation = useCreateJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role || !formData.company) {
      alert('Please fill in Role and Company');
      return;
    }

    try {
      const result = await createJobMutation.mutateAsync({
        role: formData.role,
        company: formData.company,
        jobUrl: formData.jobUrl || undefined,
        notes: formData.notes,
        stage: 'interested' as JobStage,
        matchScore: 0,
        applicationDate: new Date(),
        interviewStatus: 'not_started',
        resumeVersion: 'v1',
        recruiterStatus: 'not_contacted',
        priority: 'medium',
        aiConfidence: 0.5,
        risks: [],
        blockers: [],
        appliedVia: 'direct',
      });

      setFormData({ role: '', company: '', jobUrl: '', notes: '' });
      onSuccess?.(result.id);
    } catch (error) {
      alert(`Error creating job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
      <h2 className="text-lg font-bold text-gray-900">Add a Job</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role *
        </label>
        <input
          type="text"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          placeholder="e.g., Senior Software Engineer"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={createJobMutation.isPending}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company *
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          placeholder="e.g., TechCorp"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={createJobMutation.isPending}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job URL
        </label>
        <input
          type="url"
          value={formData.jobUrl}
          onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={createJobMutation.isPending}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any notes about this job..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={createJobMutation.isPending}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={createJobMutation.isPending}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {createJobMutation.isPending ? 'Creating...' : 'Add Job'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={createJobMutation.isPending}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {createJobMutation.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {createJobMutation.error.message}
        </div>
      )}
    </form>
  );
}
