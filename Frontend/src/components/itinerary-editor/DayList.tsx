import { ItineraryActivity, ItineraryDay } from "@/types";
import ActivityList from "./ActivityList";
import { Button } from "../ui/button";
import CustomizableDialog from "../shared/CustomizableDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface DayList {
  days: ItineraryDay[];
  // called from day list
  onAddDay: () => void;
  onAddActivity: (dayId: string, itineraryActivity: ItineraryActivity) => void;
  onDeleteDay: (dayId: string) => void;
  onRegenerateDay: () => void;
  // passed to individual activities
  onEditActivity: (
    dayId: string,
    activityId: string,
    editedActivity: ItineraryActivity
  ) => void;
  onDeleteActivity: (dayId: string, activityId: string) => void;
  onRegenerateActivity: () => void;
  onReorderActivities: (
    dayId: string,
    newActivities: ItineraryActivity[]
  ) => void;
}

const DayList = ({
  days,
  // called from day section
  onAddDay,
  onAddActivity,
  onDeleteDay,
  onRegenerateDay,
  // passed to individual activities
  onEditActivity,
  onDeleteActivity,
  onRegenerateActivity,
  onReorderActivities,
}: DayList) => {
  const { toast } = useToast();
  // used to open a dialog for a specific day index (we know which day's dialog is opened)
  const [openDialogForDayId, setOpenDialogForDayId] = useState<string | null>(
    null
  );

  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityDescription, setNewActivityDescription] = useState("");
  const [newActivityLocation, setNewActivityLocation] = useState("");

  const handleAddActivity = (dayId: string) => {
    if (!newActivityTitle || !newActivityDescription || !newActivityLocation) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    // create new activity and send to parent
    const newActivity: ItineraryActivity = {
      title: newActivityTitle,
      description: newActivityDescription,
      location: newActivityLocation,
      activityId: undefined, // generated in parent
    };
    onAddActivity(dayId, newActivity);

    setOpenDialogForDayId(null);
  };

  const handleOpenAddDialogSetup = (dayId: string) => {
    setOpenDialogForDayId(dayId);
    setNewActivityTitle("");
    setNewActivityDescription("");
    setNewActivityLocation("");
  };

  return (
    <div className="flex-1 overflow-x-visible max-h-[80vh] overflow-y-auto custom-scrollbar space-y-6 p-4 rounded">
      {days.map((day, index) => (
        <div key={day.dayId} className="flex space-x-2">
          {/* Left: Buttons */}
          <div className="flex flex-col w-16 items-center justify-center space-y-2">
            {/* Add Activity Button with Dialog */}
            <CustomizableDialog
              trigger={
                <Button
                  className="px-2 py-1 bg-green-600 text-white text-xl rounded hover:bg-green-700 w-10 h-10"
                  onClick={() => handleOpenAddDialogSetup(day.dayId!)}
                >
                  +
                </Button>
              }
              title="Add Activity"
              description={`Add an activity to Day ${index + 1}`}
              actionText="Add"
              isOpen={day.dayId === openDialogForDayId}
              onConfirm={() => handleAddActivity(day.dayId!)}
              onClose={() => {
                setOpenDialogForDayId(null);
              }}
            >
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  className="w-full p-2 rounded bg-dm-dark text-dm-light"
                />
                <textarea
                  placeholder="Description"
                  value={newActivityDescription}
                  onChange={(e) => setNewActivityDescription(e.target.value)}
                  className="w-full h-32 custom-scrollbar p-2 rounded bg-dm-dark text-dm-light"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newActivityLocation}
                  onChange={(e) => setNewActivityLocation(e.target.value)}
                  className="w-full p-2 rounded bg-dm-dark text-dm-light"
                />
              </div>
            </CustomizableDialog>
            <Button className="px-2 py-1 bg-blue-600 text-white text-xl rounded hover:bg-blue-700 w-10 h-10">
              🔄
            </Button>
            <Button
              className="px-2 py-1 bg-dm-dark text-white text-xl rounded hover:bg-blue-700 w-10 h-10"
              onClick={() => onDeleteDay(day.dayId!)}
            >
              <img
                src="/assets/icons/delete.svg"
                alt="delete"
                width={20}
                height={20}
              />
            </Button>
          </div>

          {/* Right: Day card */}
          <div className="flex-1 rounded p-4 bg-dm-dark">
            <h2 className="text-xl font-semibold mb-2">Day {day.day}</h2>
            <SortableContext
              id={day.dayId!}
              items={day.activities.map((a) => a.activityId!)}
              strategy={verticalListSortingStrategy}
            >
              <ActivityList
                activities={day.activities}
                dayId={day.dayId!}
                onDeleteActivity={onDeleteActivity}
                onEditActivity={onEditActivity}
                onRegenerateActivity={onRegenerateActivity}
                // for dnd
                onReorderActivities={onReorderActivities}
              />
            </SortableContext>
          </div>
        </div>
      ))}

      {/* Add Day Button */}
      <div className="flex justify-center">
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onAddDay}
        >
          + Add Day
        </button>
      </div>
    </div>
  );
};

export default DayList;
