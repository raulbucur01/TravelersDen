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
      <div className="flex flex-col md:flex-row items-stretch gap-12">
        <div className="md:w-[48%] space-y-4 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-dm-light-2">
            Plan Your Perfect Trip
          </h1>
          <p className="text-lg text-dm-light">
            Say goodbye to planning stress! <br />
            Tell us where you want to adventure yourself, how long you plan to
            stay, and what you love — our AI will craft the perfect trip
            itinerary for you.
          </p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-[1px] bg-dm-dark-4" />

        <div className="md:w-[48%] space-y-4 flex flex-col justify-center">
          <GeneratorForm
            onGenerate={handleGenerateItinerary}
            isLoading={isGenerating}
          />
        </div>
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
