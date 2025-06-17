import {
  useGetGeneratedItineraryById,
  useRegenerateDayActivities,
  useSaveGeneratedItineraryChanges,
} from "@/api/tanstack-query/queriesAndMutations";
import DayList from "@/components/itinerary-editor/DayList";
import {
  GeneratedItinerary,
  GeneratedItineraryActivity,
  GeneratedItineraryDay,
} from "@/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 } from "uuid";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useToast } from "@/hooks/use-toast";

const ItineraryEditor = () => {
  const sensors = useSensors(useSensor(PointerSensor));
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: itinerary, isPending: isGettingItinerary } =
    useGetGeneratedItineraryById(id || "");
  const {
    mutateAsync: regenerateDayActivities,
    isPending: isRegeneratingDayActivities,
  } = useRegenerateDayActivities();
  const {
    mutateAsync: saveGeneratedItineraryChanges,
    isPending: isSavingChanges,
  } = useSaveGeneratedItineraryChanges();

  const [currentItinerary, setCurrentItinerary] = useState<
    GeneratedItinerary | undefined
  >(undefined);
  const [hoveredDayId, setHoveredDayId] = useState<string | null>(null); // for UI
  const [regeneratingDayId, setRegeneratingDayId] = useState<string | null>(
    null
  );

  // Sync fetched itinerary into local state when it arrives
  useEffect(() => {
    if (itinerary && !currentItinerary) {
      setCurrentItinerary(itinerary);
    }
  }, [itinerary, currentItinerary]);

  if (isGettingItinerary)
    return <div className="p-4">Loading itinerary...</div>;
  if (!currentItinerary)
    return <div className="p-4 text-red-600">Itinerary not found.</div>;

  // done by parent
  const handleDeleteItinerary = () => {
    console.log("NOT IMPLEMENTED");
  };

  const handleSaveChanges = async () => {
    try {
      await saveGeneratedItineraryChanges(currentItinerary);

      toast({
        title: "Success",
        description: "Changes saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTurnIntoPost = () => {
    navigate(`/create-post`, {
      state: { generatedItineraryForPrefill: currentItinerary },
    });
  };

  // operations inside day list
  const handleAddDay = () => {
    const newDay: GeneratedItineraryDay = {
      dayId: v4(),
      day: currentItinerary.days.length + 1,
      activities: [],
    };

    setCurrentItinerary({
      ...currentItinerary,
      days: [...currentItinerary.days, newDay],
    });
  };

  const handleDeleteDay = (dayId: string) => {
    const updatedDays = currentItinerary.days.filter(
      (day) => day.dayId !== dayId
    );

    // Optionally re-number days if you rely on `day.day`
    const renumberedDays = updatedDays.map((day, idx) => ({
      ...day,
      day: idx + 1,
    }));

    setCurrentItinerary({
      ...currentItinerary,
      days: renumberedDays,
    });
  };

  const handleRegenerateDay = async (dayId: string) => {
    setRegeneratingDayId(dayId);

    const regeneratedActivities: GeneratedItineraryActivity[] | undefined =
      await regenerateDayActivities({
        itineraryId: id || "",
        dayId: dayId,
      });

    if (!regeneratedActivities) {
      toast({
        title: "Error",
        description: "Failed to regenerate day activities.",
        variant: "destructive",
      });
      return;
    }

    // add activity ids to regenerated activities
    const regeneratedActivitiesWithIds = regeneratedActivities.map(
      (activity) => ({
        ...activity,
        activityId: v4(),
      })
    );

    setCurrentItinerary((prev) => {
      if (!prev) return prev;

      const updatedDays = prev.days.map((day) =>
        day.dayId === dayId
          ? { ...day, activities: regeneratedActivitiesWithIds }
          : day
      );

      return { ...prev, days: updatedDays };
    });

    toast({
      title: "Success",
      description: "Day activities regenerated successfully.",
    });

    setRegeneratingDayId(null);
  };

  const handleAddActivity = (
    dayId: string,
    activity: GeneratedItineraryActivity
  ) => {
    const newActivity = {
      ...activity,
      activityId: v4(),
    };

    const updatedDays = currentItinerary.days.map((day) => {
      if (day.dayId !== dayId) return day;

      return {
        ...day,
        activities: [...day.activities, newActivity],
      };
    });

    setCurrentItinerary({
      ...currentItinerary,
      days: updatedDays,
    });
  };

  // operations inside activity, passed to day list then to activity item
  const handleEditActivity = (
    dayId: string,
    activityId: string,
    editedActivity: GeneratedItineraryActivity
  ) => {
    const updatedDays = currentItinerary.days.map((day) => {
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

    setCurrentItinerary({
      ...currentItinerary,
      days: updatedDays,
    });
  };

  const handleDeleteActivity = (dayId: string, activityId: string) => {
    const updatedDays = currentItinerary.days.map((day) => {
      if (day.dayId !== dayId) return day;

      const updatedActivities = day.activities.filter(
        (act) => act.activityId !== activityId
      );

      return {
        ...day,
        activities: updatedActivities,
      };
    });

    setCurrentItinerary({
      ...currentItinerary,
      days: updatedDays,
    });
  };

  const handleRegenerateActivity = () => {
    console.log("NOT IMPLEMENTED");
  };

  const handleRevertAllChanges = () => {
    if (!itinerary) return;

    setCurrentItinerary(itinerary);
  };

  // handle cross-container moves as you drag
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    if (!over || !active.data?.current || !over.data?.current) {
      setHoveredDayId(null); // reset if drag leaves all valid targets
      return;
    }

    const fromId = active.data.current.sortable.containerId as string;
    const toId = over.data.current.sortable.containerId as string;

    // Prevent dropping into a regenerating day
    if (toId === regeneratingDayId) {
      setHoveredDayId(null);
      return;
    }

    setHoveredDayId(toId); // track the day being hovered over
    const itemId = active.id as string;
    if (fromId === toId) return;

    setCurrentItinerary((prev) => {
      if (!prev) return prev;
      const fromDay = prev.days.find((d) => d.dayId === fromId)!;
      const toDay = prev.days.find((d) => d.dayId === toId)!;

      // remove from source
      const sourceActivities = [...fromDay.activities];
      const idx = sourceActivities.findIndex((a) => a.activityId === itemId);
      const [moved] = sourceActivities.splice(idx, 1);

      // insert at end of target
      const targetActivities = [...toDay.activities, moved];

      return {
        ...prev,
        days: prev.days.map((d) => {
          if (d.dayId === fromId) return { ...d, activities: sourceActivities };
          if (d.dayId === toId) return { ...d, activities: targetActivities };
          return d;
        }),
      };
    });
  }

  // finalize intra-day reorder
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    if (!over || !active.data?.current || !over.data?.current) return;

    const fromId = active.data.current.sortable.containerId as string;
    const toId = over.data.current.sortable.containerId as string;

    // Prevent final drop into regenerating day
    if (toId === regeneratingDayId) {
      setHoveredDayId(null);
      return;
    }

    const itemId = active.id as string;

    // only handle same-day reordering here
    if (fromId === toId) {
      setCurrentItinerary((prev) => {
        if (!prev) return prev;
        const day = prev.days.find((d) => d.dayId === fromId)!;
        const oldIndex = day.activities.findIndex(
          (a) => a.activityId === itemId
        );
        const newIndex = day.activities.findIndex(
          (a) => a.activityId === over.id
        );
        const items = arrayMove(day.activities, oldIndex, newIndex);

        setHoveredDayId(null); // reset
        return {
          ...prev,
          days: prev.days.map((d) =>
            d.dayId === fromId ? { ...d, activities: items } : d
          ),
        };
      });
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Destination Title */}
      <h1 className="text-3xl font-bold mb-4">Itinerary Editor</h1>
      <h2 className="text-2xl font-bold mb-8 text-dm-dark-4">
        Destination: {currentItinerary.destination}
      </h2>

      <div className="flex flex-col md:flex-row gap-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Left: Itinerary Editor */}
          <DayList
            days={currentItinerary.days.sort((a, b) => a.day - b.day)}
            onAddDay={handleAddDay}
            onAddActivity={handleAddActivity}
            onDeleteDay={handleDeleteDay}
            onRegenerateDay={handleRegenerateDay}
            regeneratingDayId={regeneratingDayId}
            // passed to activity item
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onRegenerateActivity={handleRegenerateActivity}
            hoveredDayId={hoveredDayId}
          />
        </DndContext>

        {/* Right: Action Buttons */}
        <div className="w-1/4 flex flex-col justify-between h-[80vh]">
          {/* Top buttons */}
          <div className="space-y-4">
            <button
              className="w-[70%] px-4 py-2 bg-dm-dark-3 text-white rounded hover:bg-dm-secondary"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
            <button
              className="w-[70%] px-4 py-2 bg-dm-dark-3 text-white rounded hover:bg-dm-secondary"
              onClick={handleRevertAllChanges}
            >
              Revert all changes
            </button>
            <button
              className="w-[70%] px-4 py-2 bg-dm-dark-3 text-white rounded hover:bg-dm-secondary"
              onClick={handleTurnIntoPost}
            >
              Turn Into Post
            </button>
            <button className="w-[70%] px-4 py-2 bg-dm-red text-white rounded hover:bg-dm-red-2 mt-4">
              Delete Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryEditor;
