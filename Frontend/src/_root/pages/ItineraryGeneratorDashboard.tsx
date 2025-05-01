import GeneratedItineraryHistory from "@/components/itinerary-generator/GeneratedItineraryHistory";
import GeneratorForm from "@/components/itinerary-generator/GeneratorForm";
import { useNavigate } from "react-router-dom";

const mockHistory = [
  {
    id: "1",
    destination: "Rome",
    days: [
      {
        day: 1,
        activities: [
          { title: "Visit Colosseum" },
          { title: "Roman Forum walk" },
        ],
      },
      {
        day: 2,
        activities: [
          { title: "Vatican Museums" },
          { title: "St. Peter's Basilica" },
        ],
      },
    ],
    createdAt: "2024-04-30",
  },
  {
    id: "2",
    destination: "Paris",
    days: [
      {
        day: 1,
        activities: [{ title: "Eiffel Tower" }, { title: "Louvre Museum" }],
      },
      {
        day: 2,
        activities: [
          { title: "Seine River Cruise" },
          { title: "Montmartre walk" },
        ],
      },
    ],
    createdAt: "2024-04-25",
  },
];

const ItineraryGeneratorDashboard = () => {
  const navigate = useNavigate();

  // call the useGenerateNewItinerary inside the dashboard and after it
  // returns the id we navigate to ItineraryEditor and fetch the data there
  const handleGenerate = (
    destination: string,
    days: number,
    preferences: string[]
  ) => {};

  const handleViewEdit = (id: string) => {
    console.log("View/Edit itinerary:", id);
    // Navigate to /itinerary-editor/:id
  };

  const handleDelete = (id: string) => {
    console.log("Delete itinerary:", id);
    // Call backend or remove from state
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">AI Trip Itinerary Generator</h1>
        <p className="text-gray-600 mb-6">
          Plan your perfect trip with AI assistance!
        </p>
        <GeneratorForm onGenerate={handleGenerate} />
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Your generated itineraries
        </h2>
        <GeneratedItineraryHistory
          history={mockHistory}
          onViewEdit={handleViewEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default ItineraryGeneratorDashboard;
