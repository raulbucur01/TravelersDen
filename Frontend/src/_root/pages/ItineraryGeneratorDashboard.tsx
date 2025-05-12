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
    <div className="p-6 max-w-6xl mx-auto space-y-12">
      <h1 className="h3-bold md:h2-bold text-center w-full mt-7">
        AI Trip Itinerary Generator
      </h1>
      {/* Generator Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-dm-light-2">
            Plan Your Perfect Trip
          </h1>
          <p className="text-lg text-dm-light">
            Generate your personalized travel itinerary with the help of AI.
            Select a destination, how many days you want to spend there, pick
            your preferences and let us handle the planning!
          </p>
        </div>
        <GeneratorForm
          onGenerate={handleGenerateItinerary}
          isLoading={isGenerating}
        />
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-2xl font-semibold text-dm-light-2 mb-4">
          Your Generated Itineraries
        </h2>
        <GeneratedItineraryHistory
          generatedItineraries={generatedItineraries || []}
          onViewEdit={handleViewEdit}
          onDelete={handleDelete}
          isLoading={isGettingItineraries || isDeleting}
        />
      </div>
    </div>
  );
};

export default ItineraryGeneratorDashboard;
