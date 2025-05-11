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

  // for dnd
  onReorderActivities: (
    dayId: string,
    newActivities: ItineraryActivity[]
  ) => void;
}

const ActivityList = ({
  activities,
  dayId,
  onDeleteActivity,
  onEditActivity,
  onRegenerateActivity,
  onReorderActivities,
}: ActivityListProps) => {
  return (
    <ul className="space-y-5">
      {activities.map((activity) => (
        <SortableActivityItem
          key={activity.activityId}
          activity={activity}
          dayId={dayId}
          onEditActivity={onEditActivity}
          onDeleteActivity={onDeleteActivity}
          onRegenerateActivity={onRegenerateActivity}
        />
      ))}
    </ul>
  );
};

export default ActivityList;
