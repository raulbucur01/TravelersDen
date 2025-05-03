import { useGetGeneratedItineraryById } from "@/api/tanstack-query/queriesAndMutations";
import ItineraryDay from "@/components/itinerary-editor/DaySection";
import { useParams } from "react-router-dom";

const ItineraryEditor = () => {
  const { id } = useParams();
  const { data: itinerary, isPending } = useGetGeneratedItineraryById(id || "");

  if (isPending) return <div className="p-4">Loading itinerary...</div>;
  if (!itinerary)
    return <div className="p-4 text-red-600">Itinerary not found.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Destination Title */}
      <h1 className="text-3xl font-bold mb-4">Itinerary Editor</h1>
      <h2 className="text-2xl font-bold mb-8 text-dm-dark-4">
        Destination: {itinerary.destination}
      </h2>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: Itinerary Editor */}
        <div className="flex-1 max-h-[80vh] overflow-y-auto custom-scrollbar space-y-6 p-4 rounded">
          {itinerary.days.map((day) => (
            <ItineraryDay key={day.day} day={day} />
          ))}
        </div>

        {/* Right: Action Buttons */}
        <div className="w-full md:w-1/3 flex flex-col items-end space-y-4">
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Save Changes
          </button>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Turn Into Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryEditor;
