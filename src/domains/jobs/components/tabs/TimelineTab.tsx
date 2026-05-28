import {
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Calendar,
  Zap,
} from 'lucide-react';
import { useJobActivities } from '../../hooks/useJobActivities';

interface TimelineTabProps {
  jobId: string;
}

interface Activity {
  id: string;
  type: 'stage_changed' | 'applied' | 'interview_scheduled' | 'interview_completed' | 'rejected' | 'offered' | 'note_added' | 'agent_action';
  timestamp: string;
  description: string;
  metadata?: Record<string, unknown>;
}

const getActivityIcon = (type: Activity['type']) => {
  const iconProps = { size: 16, className: 'flex-shrink-0' };
  switch (type) {
    case 'stage_changed':
      return <MapPin {...iconProps} className="text-blue-600 flex-shrink-0" />;
    case 'applied':
      return <CheckCircle {...iconProps} className="text-green-600 flex-shrink-0" />;
    case 'interview_scheduled':
      return <Calendar {...iconProps} className="text-purple-600 flex-shrink-0" />;
    case 'interview_completed':
      return <CheckCircle {...iconProps} className="text-green-600 flex-shrink-0" />;
    case 'rejected':
      return <AlertCircle {...iconProps} className="text-red-600 flex-shrink-0" />;
    case 'offered':
      return <Zap {...iconProps} className="text-yellow-600 flex-shrink-0" />;
    case 'note_added':
      return <MessageSquare {...iconProps} className="text-gray-600 flex-shrink-0" />;
    case 'agent_action':
      return <Zap {...iconProps} className="text-blue-600 flex-shrink-0" />;
    default:
      return <Clock {...iconProps} className="text-gray-600 flex-shrink-0" />;
  }
};

const getActivityLabel = (type: Activity['type']) => {
  const labels: Record<Activity['type'], string> = {
    stage_changed: 'Stage Changed',
    applied: 'Applied',
    interview_scheduled: 'Interview Scheduled',
    interview_completed: 'Interview Completed',
    rejected: 'Rejected',
    offered: 'Offered',
    note_added: 'Note Added',
    agent_action: 'Agent Action',
  };
  return labels[type];
};

const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function TimelineTab({ jobId }: TimelineTabProps) {
  const { data: activities = [], isLoading, error } = useJobActivities(jobId);

  if (isLoading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || activities.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-gray-600" data-testid="empty-timeline-message">No activities yet</p>
      </div>
    );
  }

  return (
    <div className="p-12" data-testid="activity-timeline">
      <div className="space-y-8">
        {activities.map((activity: Activity, index: number) => (
          <div key={activity.id} className="flex gap-8" data-testid="activity-item">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div
                className="rounded-full p-3 bg-gray-100"
                data-testid={`activity-icon-${activity.type}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              {index < activities.length - 1 && (
                <div className="w-0.5 h-24 bg-gray-200 mt-4"></div>
              )}
            </div>

            {/* Activity Content */}
            <div className="flex-1 pt-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {getActivityLabel(activity.type)}
                  </p>
                  <p className="text-xs text-gray-600 mt-2" data-testid="activity-description">
                    {activity.description}
                  </p>
                </div>
                <p className="text-xs text-gray-500 ml-4" data-testid="activity-timestamp">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>

              {/* Activity Metadata */}
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="mt-4 bg-gray-50 rounded p-4 text-xs text-gray-600" data-testid="activity-metadata">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <div key={key} data-testid="activity-metadata-item">
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
