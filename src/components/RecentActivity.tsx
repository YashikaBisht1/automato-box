import { useAppStore } from '@/lib/store';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const RecentActivity = () => {
  const recentActivity = useAppStore((state) => state.recentActivity);

  if (recentActivity.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent activity yet. Start with an agent above!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentActivity.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-3 animate-fade-in"
        >
          {activity.status === 'completed' && (
            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
          )}
          {activity.status === 'in-progress' && (
            <Clock className="h-5 w-5 text-warning flex-shrink-0 animate-pulse" />
          )}
          {activity.status === 'failed' && (
            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{activity.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
