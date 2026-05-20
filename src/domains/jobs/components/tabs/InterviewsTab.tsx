import React, { useState } from 'react';
import { Calendar, MapPin, User, Trash2, Plus } from 'lucide-react';
import { useInterviews } from '../../hooks/useInterviews';
import { useCreateInterview, useDeleteInterview } from '../../hooks/useMutations';

interface InterviewsTabProps {
  jobId: string;
}

interface Interview {
  id: string;
  type: 'phone_screen' | 'technical' | 'system_design' | 'behavioral' | 'final_round' | 'offer_discussion';
  date: string;
  time: string;
  interviewer?: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const INTERVIEW_TYPES = {
  phone_screen: 'Phone Screen',
  technical: 'Technical Interview',
  system_design: 'System Design',
  behavioral: 'Behavioral Interview',
  final_round: 'Final Round',
  offer_discussion: 'Offer Discussion',
};

export default function InterviewsTab({ jobId }: InterviewsTabProps) {
  const { data: interviews = [], isLoading } = useInterviews(jobId);
  const { mutate: createInterview, isPending: isCreating } = useCreateInterview();
  const { mutate: deleteInterview, isPending: isDeleting } = useDeleteInterview();
  const [isAddingInterview, setIsAddingInterview] = useState(false);
  const [formData, setFormData] = useState({
    type: 'phone_screen' as Interview['type'],
    date: '',
    time: '',
    interviewer: '',
    location: '',
    meetingLink: '',
    notes: '',
  });

  const handleAddInterview = async () => {
    if (!formData.date || !formData.time) {
      return; // Validation
    }

    createInterview(
      {
        jobId,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        interviewer: formData.interviewer || undefined,
        location: formData.location || undefined,
        meetingLink: formData.meetingLink || undefined,
        notes: formData.notes || undefined,
      },
      {
        onSuccess: () => {
          setIsAddingInterview(false);
          setFormData({
            type: 'phone_screen',
            date: '',
            time: '',
            interviewer: '',
            location: '',
            meetingLink: '',
            notes: '',
          });
        },
      }
    );
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      deleteInterview(interviewId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const now = new Date();
  const upcomingInterviews = interviews.filter((int: Interview) => {
    const intDate = new Date(`${int.date}T${int.time}`);
    return intDate > now;
  });
  const pastInterviews = interviews.filter((int: Interview) => {
    const intDate = new Date(`${int.date}T${int.time}`);
    return intDate <= now;
  });

  return (
    <div className="p-12">
      {/* Add Interview Form */}
      {isAddingInterview && (
        <div data-testid="interview-form" className="mb-12 bg-blue-50 border border-blue-200 rounded-lg p-8 space-y-6">
          <h3 className="text-sm font-semibold text-gray-900">Schedule Interview</h3>

          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as Interview['type'] })}
            data-testid="interview-type-select"
            className="w-full px-6 py-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(INTERVIEW_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              data-testid="interview-date"
              className="px-6 py-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              data-testid="interview-time"
              className="px-6 py-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            type="text"
            placeholder="Interviewer name"
            value={formData.interviewer}
            onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
            data-testid="interview-interviewer"
            className="w-full px-6 py-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Location or meeting link"
            value={formData.location || formData.meetingLink}
            onChange={(e) => setFormData({ ...formData, location: e.target.value, meetingLink: e.target.value })}
            data-testid="interview-location"
            className="w-full px-6 py-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            data-testid="interview-notes"
            className="w-full px-6 py-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />

          <div className="flex gap-4">
            <button
              onClick={handleAddInterview}
              disabled={isCreating}
              data-testid="schedule-submit-btn"
              className="flex-1 px-6 py-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
            >
              {isCreating ? 'Scheduling...' : 'Schedule'}
            </button>
            <button
              onClick={() => setIsAddingInterview(false)}
              disabled={isCreating}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Schedule Button */}
      {!isAddingInterview && (
        <button
          onClick={() => setIsAddingInterview(true)}
          data-testid="schedule-interview-btn"
          aria-label="Schedule a new interview"
          className="w-full mb-12 flex items-center justify-center gap-4 px-6 py-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
        >
          <Plus size={16} />
          Schedule Interview
        </button>
      )}

      {/* Upcoming Interviews */}
      <div className="mb-12" data-testid="upcoming-interviews-section">
        <h3 className="text-sm font-semibold text-gray-900 mb-6">Upcoming</h3>
        {upcomingInterviews.length > 0 ? (
          <div className="space-y-6">
            {upcomingInterviews.map((interview: Interview) => (
              <div
                key={interview.id}
                data-testid="interview-item"
                className="bg-green-50 border border-green-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-900" data-testid="interview-type-badge">
                    {INTERVIEW_TYPES[interview.type]}
                  </p>
                  <button
                    onClick={() => handleDeleteInterview(interview.id)}
                    disabled={isDeleting}
                    data-testid="interview-delete-btn"
                    className="p-2 hover:bg-red-100 disabled:bg-gray-100 disabled:cursor-not-allowed rounded transition"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-4" data-testid="interview-date">
                    <Calendar size={14} />
                    {new Date(`${interview.date}T${interview.time}`).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                  {interview.interviewer && (
                    <div className="flex items-center gap-4" data-testid="interview-interviewer">
                      <User size={14} />
                      {interview.interviewer}
                    </div>
                  )}
                  {interview.meetingLink && (
                    <div className="flex items-center gap-4" data-testid="interview-location">
                      <MapPin size={14} />
                      <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {interview.meetingLink}
                      </a>
                    </div>
                  )}
                  {interview.location && !interview.meetingLink && (
                    <div className="flex items-center gap-4" data-testid="interview-location">
                      <MapPin size={14} />
                      {interview.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No upcoming interviews</p>
        )}
      </div>

      {/* Past Interviews */}
      <div data-testid="past-interviews-section">
        <h3 className="text-sm font-semibold text-gray-900 mb-6">Past</h3>
        {pastInterviews.length > 0 ? (
          <div className="space-y-6">
            {pastInterviews.map((interview: Interview) => (
              <div key={interview.id} data-testid="interview-item" className="bg-gray-50 border border-gray-200 rounded-lg p-6 opacity-75">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-900" data-testid="interview-type-badge">
                    {INTERVIEW_TYPES[interview.type]}
                  </p>
                  <button
                    onClick={() => handleDeleteInterview(interview.id)}
                    disabled={isDeleting}
                    data-testid="interview-delete-btn"
                    className="p-2 hover:bg-red-100 disabled:bg-gray-100 disabled:cursor-not-allowed rounded transition"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-4">
                    <Calendar size={14} />
                    {new Date(`${interview.date}T${interview.time}`).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No past interviews</p>
        )}
      </div>
    </div>
  );
}
