'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ProfileEditorProps {
  candidateId: string;
  onSave?: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
}

const tabs = [
  { id: 'overview', label: 'Overview', emoji: '👤' },
  { id: 'resume', label: 'Resume', emoji: '📄' },
  { id: 'skills', label: 'Skills', emoji: '🛠️' },
  { id: 'achievements', label: 'Achievements', emoji: '⭐' },
  { id: 'education', label: 'Education', emoji: '🎓' },
  { id: 'certifications', label: 'Certifications', emoji: '📜' },
  { id: 'languages', label: 'Languages', emoji: '🗣️' },
  { id: 'documents', label: 'Documents', emoji: '📁' },
];

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  candidateId,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({});
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-12 py-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Profile Editor</h2>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded text-sm font-medium transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-2 px-12 py-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-8 py-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-12">
        {activeTab === 'overview' && (
          <OverviewTab
            candidateId={candidateId}
            onChangesMade={() => setHasUnsavedChanges(true)}
          />
        )}
        {activeTab === 'resume' && (
          <ResumeTab
            candidateId={candidateId}
            onChangesMade={() => setHasUnsavedChanges(true)}
          />
        )}
        {activeTab === 'skills' && (
          <SkillsTab
            candidateId={candidateId}
            onChangesMade={() => setHasUnsavedChanges(true)}
          />
        )}
        {activeTab === 'achievements' && (
          <AchievementsTab
            candidateId={candidateId}
            onChangesMade={() => setHasUnsavedChanges(true)}
          />
        )}
        {activeTab === 'education' && (
          <EducationTab
            candidateId={candidateId}
            onChangesMade={() => setHasUnsavedChanges(true)}
          />
        )}
        {activeTab === 'certifications' && (
          <CertificationsTab
            candidateId={candidateId}
            onChangesMade={() => setHasUnsavedChanges(true)}
          />
        )}
        {activeTab === 'languages' && (
          <LanguagesTab
            candidateId={candidateId}
            onChangesMade={() => setHasUnsavedChanges(true)}
          />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab
            candidateId={candidateId}
            onChangesMade={() => setHasUnsavedChanges(true)}
          />
        )}
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab: React.FC<{ candidateId: string; onChangesMade: () => void }> = ({
  onChangesMade,
}) => (
  <div className="max-w-2xl space-y-8">
    <FormField
      label="Full Name"
      type="text"
      placeholder="Your full name"
      onChange={onChangesMade}
    />
    <FormField
      label="Email"
      type="email"
      placeholder="your@email.com"
      onChange={onChangesMade}
    />
    <FormField
      label="Phone"
      type="tel"
      placeholder="+1 (555) 123-4567"
      onChange={onChangesMade}
    />
    <FormField
      label="Location"
      type="text"
      placeholder="City, State"
      onChange={onChangesMade}
    />
    <FormField
      label="Professional Summary"
      type="textarea"
      placeholder="Brief overview of your professional background..."
      onChange={onChangesMade}
    />
    <div className="grid grid-cols-2 gap-8">
      <FormField
        label="Visa Status"
        type="select"
        options={['Citizen', 'Green Card', 'Visa Sponsorship Required']}
        onChange={onChangesMade}
      />
      <FormField
        label="Notice Period (days)"
        type="number"
        placeholder="30"
        onChange={onChangesMade}
      />
    </div>
  </div>
);

const ResumeTab: React.FC<{ candidateId: string; onChangesMade: () => void }> = ({
  onChangesMade,
}) => (
  <div className="max-w-4xl">
    <div className="mb-12 p-8 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-900 font-semibold mb-4">💡 Tips for better resume visibility:</p>
      <ul className="text-xs text-blue-800 space-y-2 ml-8">
        <li>• Include relevant keywords from job descriptions</li>
        <li>• Use action verbs (Led, Designed, Implemented)</li>
        <li>• Quantify achievements with metrics</li>
        <li>• Keep it to one page if possible</li>
      </ul>
    </div>
    <FormField
      label="Resume Content"
      type="textarea"
      placeholder="Paste your resume text here..."
      rows={20}
      onChange={onChangesMade}
    />
  </div>
);

const SkillsTab: React.FC<{ candidateId: string; onChangesMade: () => void }> = ({
  onChangesMade,
}) => (
  <div className="max-w-2xl">
    <div className="mb-8 flex gap-4">
      <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium">
        + Add Skill
      </button>
    </div>
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
          <input
            type="text"
            placeholder="Skill name"
            className="flex-1 px-6 py-4 border border-gray-300 rounded text-sm"
            onChange={onChangesMade}
          />
          <select
            className="px-6 py-4 border border-gray-300 rounded text-sm"
            onChange={onChangesMade}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Proficient</option>
            <option>Expert</option>
          </select>
          <button className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
        </div>
      ))}
    </div>
  </div>
);

const AchievementsTab: React.FC<{ candidateId: string; onChangesMade: () => void }> = ({
  onChangesMade,
}) => (
  <div className="max-w-3xl">
    <div className="mb-8 flex gap-4">
      <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium">
        + Add Achievement
      </button>
      <button className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded text-sm font-medium">
        Extract from Resume
      </button>
    </div>
    <div className="space-y-8">
      {[1].map((i) => (
        <div key={i} className="p-8 border border-gray-200 rounded-lg space-y-6">
          <input
            type="text"
            placeholder="Achievement title"
            className="w-full px-6 py-4 border border-gray-300 rounded text-sm"
            onChange={onChangesMade}
          />
          <textarea
            placeholder="Description"
            className="w-full px-6 py-4 border border-gray-300 rounded text-sm"
            rows={2}
            onChange={onChangesMade}
          />
          <div className="grid grid-cols-3 gap-4">
            <input type="text" placeholder="Metric" className="px-6 py-4 border border-gray-300 rounded text-sm" onChange={onChangesMade} />
            <input type="text" placeholder="Value" className="px-6 py-4 border border-gray-300 rounded text-sm" onChange={onChangesMade} />
            <input type="text" placeholder="Unit" className="px-6 py-4 border border-gray-300 rounded text-sm" onChange={onChangesMade} />
          </div>
          <div className="flex justify-end">
            <button className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EducationTab: React.FC<{ candidateId: string; onChangesMade: () => void }> = ({
  onChangesMade,
}) => (
  <div className="max-w-2xl">
    <div className="mb-8">
      <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium">
        + Add Education
      </button>
    </div>
    <FormField label="School/University" type="text" onChange={onChangesMade} />
    <FormField label="Degree" type="text" onChange={onChangesMade} />
    <FormField label="Field of Study" type="text" onChange={onChangesMade} />
    <FormField label="Graduation Date" type="date" onChange={onChangesMade} />
  </div>
);

const CertificationsTab: React.FC<{ candidateId: string; onChangesMade: () => void }> = ({
  onChangesMade,
}) => (
  <div className="max-w-2xl">
    <div className="mb-8">
      <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium">
        + Add Certification
      </button>
    </div>
    <FormField label="Certification Name" type="text" onChange={onChangesMade} />
    <FormField label="Issuer" type="text" onChange={onChangesMade} />
    <FormField label="Issue Date" type="date" onChange={onChangesMade} />
    <FormField label="Credential ID" type="text" onChange={onChangesMade} />
  </div>
);

const LanguagesTab: React.FC<{ candidateId: string; onChangesMade: () => void }> = ({
  onChangesMade,
}) => (
  <div className="max-w-2xl">
    <div className="mb-8">
      <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium">
        + Add Language
      </button>
    </div>
    <FormField label="Language" type="text" onChange={onChangesMade} />
    <FormField
      label="Proficiency"
      type="select"
      options={['Elementary', 'Limited', 'Professional', 'Full Professional', 'Native']}
      onChange={onChangesMade}
    />
  </div>
);

const DocumentsTab: React.FC<{ candidateId: string; onChangesMade: () => void }> = () => (
  <div className="max-w-2xl">
    <div className="mb-12 p-12 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer">
      <p className="text-gray-600 font-medium">📁 Drag and drop files here</p>
      <p className="text-sm text-gray-500 mt-2">or click to browse (PDF, DOCX, TXT)</p>
    </div>
    <div className="space-y-4">
      <div className="flex items-center justify-between p-6 bg-gray-50 rounded border border-gray-200">
        <span className="text-sm text-gray-900">Resume_v2.pdf</span>
        <button className="text-red-500 hover:text-red-700 text-sm">Delete</button>
      </div>
    </div>
  </div>
);

// Helper component
const FormField: React.FC<{
  label: string;
  type?: string;
  placeholder?: string;
  rows?: number;
  options?: string[];
  onChange: () => void;
}> = ({ label, type = 'text', placeholder, rows, options, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-4">{label}</label>
    {type === 'textarea' ? (
      <textarea
        placeholder={placeholder}
        rows={rows || 4}
        className="w-full px-6 py-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={onChange}
      />
    ) : type === 'select' ? (
      <select
        className="w-full px-6 py-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={onChange}
      >
        <option>Select...</option>
        {options?.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-6 py-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={onChange}
      />
    )}
  </div>
);

export default ProfileEditor;
