import { useGetGeneratedItineraryById } from "@/api/tanstack-query/queriesAndMutations";
import DayList from "@/components/itinerary-editor/DayList";
import { GeneratedItinerary, ItineraryActivity, ItineraryDay } from "@/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { nanoid } from "nanoid";

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
      // Add ids to activities and days for UI dnd
      const itineraryWithIds = {
        ...itinerary,
        days: itinerary.days.map((day) => ({
          ...day,
          dayId: nanoid(),
          activities: day.activities.map((activity) => ({
            ...activity,
            activityId: nanoid(),
          })),
        })),
      };
      setEditedItinerary(itineraryWithIds);
    }
  }, [itinerary]);

  if (isGettingItinerary)
    return <div className="p-4">Loading itinerary...</div>;
  if (!editedItinerary)
    return <div className="p-4 text-red-600">Itinerary not found.</div>;

  // done by parent
  const handleDeleteItinerary = () => {
    console.log("NOT IMPLEMENTED");
  };

  const handleSaveItinerary = () => {
    console.log("NOT IMPLEMENTED");
  };

  const handleTurnIntoPost = () => {
    console.log("NOT IMPLEMENTED");
  };

  // operations inside day list
  const handleAddDay = () => {
    const newDay: ItineraryDay = {
      dayId: nanoid(),
      day: editedItinerary.days.length + 1,
      activities: [],
    };

    setEditedItinerary({
      ...editedItinerary,
      days: [...editedItinerary.days, newDay],
    });
  };

  const handleDeleteDay = (dayId: string) => {
    const updatedDays = editedItinerary.days.filter(
      (day) => day.dayId !== dayId
    );

    // // Optionally re-number days if you rely on `day.day`
    // const renumberedDays = updatedDays.map((day, idx) => ({
    //   ...day,
    //   day: idx + 1,
    // }));

    setEditedItinerary({
      ...editedItinerary,
      days: updatedDays,
    });
  };

  const handleRegenerateDay = () => {
    console.log("NOT IMPLEMENTED");
  };

  const handleAddActivity = (dayId: string, activity: ItineraryActivity) => {
    const newActivity = {
      ...activity,
      activityId: nanoid(),
    };

    const updatedDays = editedItinerary.days.map((day) => {
      if (day.dayId !== dayId) return day;

      return {
        ...day,
        activities: [...day.activities, newActivity],
      };
    });

    setEditedItinerary({
      ...editedItinerary,
      days: updatedDays,
    });
  };

  // operations inside activity, passed to day list then to activity item
  const handleEditActivity = (
    dayId: string,
    activityId: string,
    editedActivity: ItineraryActivity
  ) => {
    const updatedDays = editedItinerary.days.map((day) => {
      if (day.dayId !== dayId) return day;

      const updatedActivities = day.activities.map((act) => {
        if (act.activityId !== activityId) return act;

        return editedActivity;
      });

      return {
        ...day,
        activities: updatedActivities,
      };
    });

    setEditedItinerary({
      ...editedItinerary,
      days: updatedDays,
    });
  };

  const handleDeleteActivity = (dayId: string, activityId: string) => {
    const updatedDays = editedItinerary.days.map((day) => {
      if (day.dayId !== dayId) return day;

      const updatedActivities = day.activities.filter(
        (act) => act.activityId !== activityId
      );

      return {
        ...day,
        activities: updatedActivities,
      };
    });

    setEditedItinerary({
      ...editedItinerary,
      days: updatedDays,
    });
  };

  const handleRegenerateActivity = () => {
    console.log("NOT IMPLEMENTED");
  };

  const handleRevertAllChanges = () => {
    if (!itinerary) return;

    // Add ids to activities and days for UI dnd
    const itineraryWithIds = {
      ...itinerary,
      days: itinerary.days.map((day) => ({
        ...day,
        dayId: nanoid(),
        activities: day.activities.map((activity) => ({
          ...activity,
          activityId: nanoid(),
        })),
      })),
    };
    setEditedItinerary(itineraryWithIds);
  };

  // dnd
  const handleReorderActivities = (
    dayId: string,
    newActivities: ItineraryActivity[]
  ) => {
    const updatedDays = editedItinerary.days.map((day) =>
      day.dayId === dayId ? { ...day, activities: newActivities } : day
    );

    setEditedItinerary({
      ...editedItinerary,
      days: updatedDays,
    });
  };

  console.log(editedItinerary.days[0]);
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
          // for dnd
          onReorderActivities={handleReorderActivities}
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
