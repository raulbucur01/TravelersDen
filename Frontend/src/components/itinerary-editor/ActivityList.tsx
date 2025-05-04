import { ItineraryActivity } from "@/types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = activities.findIndex((a) => a.activityId === active.id);
      const newIndex = activities.findIndex((a) => a.activityId === over.id);

      const newActivities = arrayMove(activities, oldIndex, newIndex);
      onReorderActivities(dayId, newActivities);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={activities.map((a) => a.activityId!)}
        strategy={verticalListSortingStrategy}
      >
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
      </SortableContext>
    </DndContext>
  );
};

export default ActivityList;
