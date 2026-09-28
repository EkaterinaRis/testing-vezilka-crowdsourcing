import { FileText, Mic, Video, Inbox, Image } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserActivities } from "../api/userApi";
import { formatRelativeTime } from "../utils/formatTime";

const iconMap = {
  text: FileText,
  audio: Mic,
  video: Video,
  image: Image,
};

function SkeletonItem() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="w-2/5 h-3 rounded-md bg-muted" />
        <div className="h-2.5 rounded-md bg-muted w-1/4" />
      </div>
    </div>
  );
}

export default function RecentActivities() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      const data = await getUserActivities();
      setActivities(data);
      setIsLoading(false);
    };

    fetchActivities();
  }, []);

  const isEmpty = !activities || activities.length === 0;

  return (
    <div className="p-6 border bg-card border-border rounded-xl">
      <h2 className="mb-4 text-lg font-semibold">Последни активности</h2>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 mb-3 rounded-full bg-muted">
            <Inbox className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Нема активности сè уште</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Кога ќе започнеш да прикачуваш податоци на страната, тука ќе се
            појави историја од вашите последни активности.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = iconMap[activity.type] || FileText;
            return (
              <div
                key={`${activity.id}-${index}`}
                className="flex items-center gap-4"
              >
                <div className="p-2 rounded-lg bg-muted">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
