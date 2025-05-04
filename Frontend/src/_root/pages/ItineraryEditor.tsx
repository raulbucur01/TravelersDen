import { useGetGeneratedItineraryById } from "@/api/tanstack-query/queriesAndMutations";
import DayList from "@/components/itinerary-editor/DayList";
import { GeneratedItinerary, ItineraryActivity, ItineraryDay } from "@/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ItineraryEditor = () => {
  const { id } = useParams();
  const { data: itinerary, isPending: isGettingItinerary } =
    useGetGeneratedItineraryById(id || "");
  const [editedItinerary, setEditedItinerary] = useState<
    GeneratedItinerary | undefined
  >(undefined);

  // Sync fetched itinerary into local state when it arrives
  useEffect(() => {
    if (itinerary) {
      setEditedItinerary(itinerary);
    }
  }, [itinerary]);

  if (isGettingItinerary)
    return <div className="p-4">Loading itinerary...</div>;
  if (!editedItinerary)
    return <div className="p-4 text-red-600">Itinerary not found.</div>;

  // done by parent
  const handleDeleteItinerary = () => {};
  const handleSaveItinerary = () => {};
  const handleTurnIntoPost = () => {};

  // operations inside day list
  const handleAddDay = () => {
    const newDay: ItineraryDay = {
      day: editedItinerary.days.length + 1,
      activities: [],
    };

    setEditedItinerary({
      ...editedItinerary,
      days: [...editedItinerary.days, newDay],
    });
  };

  const handleDeleteDay = (dayIndex: number) => {
    const updatedDays = editedItinerary.days.filter(
      (_, index) => index !== dayIndex
    );

    // Optionally re-number days if you rely on `day.day`
    const renumberedDays = updatedDays.map((day, idx) => ({
      ...day,
      day: idx + 1,
    }));

    setEditedItinerary({
      ...editedItinerary,
      days: renumberedDays,
    });
  };

  const handleRegenerateDay = () => {};
  const handleAddActivity = (dayIndex: number, activity: ItineraryActivity) => {
    const updatedDays = editedItinerary.days.map((day, idx) => {
      if (idx !== dayIndex) return day;

      return {
        ...day,
        activities: [...day.activities, activity],
      };
    });

    setEditedItinerary({
      ...editedItinerary,
      days: updatedDays,
    });
  };

  // operations inside activity, passed to day list then to activity item
  const handleEditActivity = () => {};

  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    const updatedDays = editedItinerary!.days.map((day, idx) => {
      if (idx !== dayIndex) return day;

      const updatedActivities = day.activities.filter(
        (_, actIdx) => actIdx !== activityIndex
      );
      return {
        ...day,
        activities: updatedActivities,
      };
    });

    setEditedItinerary({
      ...editedItinerary!,
      days: updatedDays,
    });
  };

  const handleRegenerateActivity = () => {};

  const handleRevertAllChanges = () => {
    setEditedItinerary(itinerary);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Destination Title */}
      <h1 className="text-3xl font-bold mb-4">Itinerary Editor</h1>
      <h2 className="text-2xl font-bold mb-8 text-dm-dark-4">
        Destination: {editedItinerary.destination}
      </h2>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: Itinerary Editor */}
        <DayList
          days={editedItinerary.days}
          onAddDay={handleAddDay}
          onAddActivity={handleAddActivity}
          onDeleteDay={handleDeleteDay}
          onRegenerateDay={handleRegenerateDay}
          // passed to activity item
          onEditActivity={handleEditActivity}
          onDeleteActivity={handleDeleteActivity}
          onRegenerateActivity={handleRegenerateActivity}
        />

        {/* Right: Action Buttons */}
        <div className="w-1/4 flex flex-col justify-between h-[80vh]">
          {/* Top buttons */}
          <div className="space-y-4">
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Save Changes
            </button>
            <button
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={handleRevertAllChanges}
            >
              Revert all changes
            </button>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Turn Into Post
            </button>
          </div>

          {/* Bottom button */}
          <button className="w-full px-4 py-2 bg-dm-red text-white rounded hover:bg-dm-red-2 mt-4">
            Delete Itinerary
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryEditor;
