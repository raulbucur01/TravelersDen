import { ItineraryActivity } from "@/types";
import SortableActivityItem from "./SortableActivityItem";

interface ActivityListProps {
  activities: ItineraryActivity[];
  dayId: string;
  onEditActivity: (
    dayId: string,
    activityId: string,
    editedActivity: ItineraryActivity
  ) => void;
  onDeleteActivity: (dayId: string, activityId: string) => void;
  onRegenerateActivity: () => void;
}

const ActivityList = ({
  activities,
  dayId,
  onDeleteActivity,
  onEditActivity,
  onRegenerateActivity,
}: ActivityListProps) => {
  return (
    <ul className="space-y-5">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <SortableActivityItem
            key={activity.activityId}
            activity={activity}
            dayId={dayId}
            onEditActivity={onEditActivity}
            onDeleteActivity={onDeleteActivity}
            onRegenerateActivity={onRegenerateActivity}
          />
        ))
      ) : (
        <SortableActivityItem
          key={`__placeholder__-${dayId}`}
          activity={{
            activityId: `__placeholder__-${dayId}`,
            title: "",
            description: "",
            location: "",
          }}
          dayId={dayId}
          isPlaceholder
          onEditActivity={() => {}}
          onDeleteActivity={() => {}}
          onRegenerateActivity={() => {}}
        />
      )}
    </ul>
  );
};

export default ActivityList;
