import { ItineraryActivity } from "@/types";
import ExpandableText from "../shared/ExpandableText";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ActivityListProps {
  activities: ItineraryActivity[];
  dayIndex: number;
  onEditActivity: () => void;
  onDeleteActivity: (dayIndex: number, activityIndex: number) => void;
  onRegenerateActivity?: () => void;
}

const ActivityList = ({
  activities,
  dayIndex,
  onDeleteActivity,
  onEditActivity,
  onRegenerateActivity,
}: ActivityListProps) => {
  const { toast } = useToast();
  // used to open a dialog for a specific activity index (we know which activity's dialog is opened)
  const [openDialogForActivityIndex, setOpenDialogForActivityIndex] = useState<
    number | null
  >(null);

  const [editedActivityTitle, setEditedActivityTitle] = useState("");
  const [editedActivityDescription, setEditedActivityDescription] =
    useState("");
  const [editedActivityLocation, setEditedActivityLocation] = useState("");

  const handleEditActivity = (index: number) => {};

  return (
    <ul className="space-y-2">
      {activities.map((activity, index) => (
        <li className="border p-2 rounded bg-gray-50">
          <div className="font-medium text-dm-dark">{activity.title}</div>
          <div className="text-sm text-gray-600">{activity.description}</div>
          <div className="text-sm text-gray-500">
            Location: {activity.location}
          </div>
          <div className="mt-2 space-x-2">
            <button className="text-blue-600 hover:underline text-sm">
              Edit
            </button>
            <button
              className="text-red hover:underline text-sm"
              onClick={() => onDeleteActivity(dayIndex, index)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ActivityList;
