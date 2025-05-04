import { ItineraryActivity, ItineraryDay } from "@/types";
import ActivityList from "./ActivityList";
import { Button } from "../ui/button";
import CustomizableDialog from "../shared/CustomizableDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DayList {
  days: ItineraryDay[];
  // called from day list
  onAddDay: () => void;
  onAddActivity: (
    dayIndex: number,
    itineraryActivity: ItineraryActivity
  ) => void;
  onDeleteDay: (dayIndex: number) => void;
  onRegenerateDay: () => void;
  // passed to individual activities
  onEditActivity: () => void;
  onDeleteActivity: (dayIndex: number, activityIndex: number) => void;
  onRegenerateActivity?: () => void;
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
}: DayList) => {
  const { toast } = useToast();
  // used to open a dialog for a specific day index (we know which day's dialog is opened)
  const [openDialogForDayIndex, setOpenDialogForDayIndex] = useState<
    number | null
  >(null);

  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityDescription, setNewActivityDescription] = useState("");
  const [newActivityLocation, setNewActivityLocation] = useState("");

  const handleAddActivity = (index: number) => {
    if (!newActivityTitle || !newActivityDescription || !newActivityLocation) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    // pass operation to parent
    const newActivity: ItineraryActivity = {
      title: newActivityTitle,
      description: newActivityDescription,
      location: newActivityLocation,
    };
    onAddActivity(index, newActivity);

    // reset
    setOpenDialogForDayIndex(null);
    setNewActivityTitle("");
    setNewActivityDescription("");
    setNewActivityLocation("");
  };

  return (
    <div className="flex-1 overflow-x-visible max-h-[80vh] overflow-y-auto custom-scrollbar space-y-6 p-4 rounded">
      {days.map((day, index) => (
        <div className="flex space-x-2">
          {/* Left: Buttons */}
          <div className="flex flex-col w-16 items-center justify-center space-y-2">
            {/* Add Activity Button with Dialog */}
            <CustomizableDialog
              trigger={
                <Button
                  className="px-2 py-1 bg-green-600 text-white text-xl rounded hover:bg-green-700 w-10 h-10"
                  onClick={() => setOpenDialogForDayIndex(index)}
                >
                  +
                </Button>
              }
              title="Add Activity"
              description={`Add an activity to Day ${index + 1}`}
              actionText="Add"
              isOpen={index === openDialogForDayIndex}
              onConfirm={() => handleAddActivity(index)}
              onClose={() => {
                setNewActivityTitle("");
                setNewActivityDescription("");
                setNewActivityLocation("");
                setOpenDialogForDayIndex(null);
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
                <input
                  type="text"
                  placeholder="Description"
                  value={newActivityDescription}
                  onChange={(e) => setNewActivityDescription(e.target.value)}
                  className="w-full p-2 rounded bg-dm-dark text-dm-light"
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
              onClick={() => onDeleteDay(index)}
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
          <div className="flex-1 rounded p-4 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-2">Day {day.day}</h2>
            <ActivityList
              activities={day.activities}
              dayIndex={index}
              onDeleteActivity={onDeleteActivity}
              onEditActivity={onEditActivity}
              onRegenerateActivity={onRegenerateActivity}
            />
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
