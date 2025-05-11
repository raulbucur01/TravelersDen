import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CustomizableDialog from "../shared/CustomizableDialog";
import { ItineraryActivity } from "@/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SortableActivityItemProps {
  activity: ItineraryActivity;
  dayId: string;
  isPlaceholder?: boolean;
  onEditActivity: (
    dayId: string,
    activityId: string,
    editedActivity: ItineraryActivity
  ) => void;
  onDeleteActivity: (dayId: string, activityId: string) => void;
  onRegenerateActivity: () => void;
}

const SortableActivityItem = ({
  activity,
  dayId,
  isPlaceholder,
  onEditActivity,
  onDeleteActivity,
  onRegenerateActivity,
}: SortableActivityItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: activity.activityId!,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { toast } = useToast();

  const [openEdit, setOpenEdit] = useState(false);
  const [editedTitle, setEditedTitle] = useState(activity.title);
  const [editedDescription, setEditedDescription] = useState(
    activity.description
  );
  const [editedLocation, setEditedLocation] = useState(activity.location);

  const handleEditConfirm = () => {
    if (!editedTitle || !editedDescription || !editedLocation) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    onEditActivity(dayId, activity.activityId!, {
      ...activity,
      title: editedTitle,
      description: editedDescription,
      location: editedLocation,
    });
    setOpenEdit(false);
  };

  if (isPlaceholder) {
    return (
      <li
        ref={setNodeRef}
        style={style}
        className="py-6 text-sm text-center italic text-dm-light border border-dashed rounded pointer-events-none"
        {...attributes}
        {...listeners}
      >
        Drop activity here
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="p-2 rounded bg-dm-dark-2 flex justify-between items-start"
      key={activity.activityId}
    >
      {/* Draggable area (added drag listener only for this element) */}
      <div className="flex-1 cursor-grab" {...attributes} {...listeners}>
        <div className="font-medium text-dm-light">{activity.title}</div>
        <div className="text-sm text-dm-light">{activity.description}</div>
        <div className="text-sm text-dm-light">
          Location: {activity.location}
        </div>
      </div>

      {/* Edit and Delete buttons*/}
      <div className="flex flex-col gap-2 ml-4">
        <CustomizableDialog
          trigger={
            <button className="h-8 w-8" onClick={() => setOpenEdit(true)}>
              <img
                src="/assets/icons/edit.svg"
                alt="edit"
                className="h-6 w-6"
              />
            </button>
          }
          title="Edit Activity"
          actionText="Update"
          isOpen={openEdit}
          onConfirm={handleEditConfirm}
          onClose={() => setOpenEdit(false)}
        >
          <div className="space-y-2">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2 rounded bg-dm-dark text-dm-light"
            />
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Description"
              className="w-full h-24 p-2 rounded bg-dm-dark text-dm-light"
            />
            <input
              type="text"
              value={editedLocation}
              onChange={(e) => setEditedLocation(e.target.value)}
              placeholder="Location"
              className="w-full p-2 rounded bg-dm-dark text-dm-light"
            />
          </div>
        </CustomizableDialog>

        <button
          className="h-8 w-8"
          onClick={() => onDeleteActivity(dayId, activity.activityId!)}
        >
          <img
            src="/assets/icons/delete.svg"
            alt="delete"
            className="h-6 w-6"
          />
        </button>
      </div>
    </li>
  );
};

export default SortableActivityItem;
