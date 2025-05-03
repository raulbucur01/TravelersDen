import {
  useDeleteGeneratedItinerary,
  useGenerateNewItinerary,
  useGetGeneratedItinerariesForUser,
} from "@/api/tanstack-query/queriesAndMutations";
import GeneratedItineraryHistory from "@/components/itinerary-generator/GeneratedItineraryHistory";
import GeneratorForm from "@/components/itinerary-generator/GeneratorForm";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ItineraryGeneratorDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user: currentUser } = useUserContext();

  const { mutateAsync: generateNewItinerary, isPending: isGenerating } =
    useGenerateNewItinerary();
  const {
    data: generatedItineraries,
    refetch: refetchItineraries,
    isPending: isGettingItineraries,
  } = useGetGeneratedItinerariesForUser(currentUser.userId);
  const { mutateAsync: deleteItinerary, isPending: isDeleting } =
    useDeleteGeneratedItinerary();

  // call the useGenerateNewItinerary inside the dashboard and after it
  // returns the id we navigate to ItineraryEditor and fetch the data there
  const handleGenerateItinerary = async (
    destination: string,
    days: number,
    preferences: string[]
  ) => {
    const response = await generateNewItinerary({
      destination,
      days,
      preferences,
      userId: currentUser.userId,
    });

    if (response?.itineraryId) {
      navigate(`/itinerary-editor/${response.itineraryId}`);
    } else {
      return toast({
        title: "Failed to generate itinerary",
        variant: "destructive",
      });
    }
  };

  const handleViewEdit = (id: string) => {
    navigate(`/itinerary-editor/${id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteItinerary(id);
    await refetchItineraries();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">AI Trip Itinerary Generator</h1>
        <p className="text-gray-600 mb-6">
          Plan your perfect trip with AI assistance!
        </p>
        <GeneratorForm onGenerate={handleGenerateItinerary} />
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Your generated itineraries
        </h2>
        <GeneratedItineraryHistory
          generatedItineraries={generatedItineraries || []}
          onViewEdit={handleViewEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default ItineraryGeneratorDashboard;
