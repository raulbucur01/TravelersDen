import { useGetItineraryDetails } from "@/lib/react-query/queriesAndMutations";
import Loader from "../shared/Loader";
import AccommodationsDisplay from "../shared/AccommodationsDisplay";
import TripStepDisplay from "../shared/TripStepDisplay";

const ItineraryDetails = ({ id }: { id: string }) => {
  const { data: itineraryData, isPending: isGettingItineraryData } =
    useGetItineraryDetails(id);

  if (isGettingItineraryData || !itineraryData) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Accommodation Section */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl ml-10 font-semibold text-dm-light">
          Accommodation
        </h1>
        <AccommodationsDisplay accommodations={itineraryData.accommodations} />
      </div>

      {/* Trip Steps Section */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl ml-10 font-semibold text-dm-light">
          Trip Steps
        </h1>
        <div className="flex justify-center w-full">
          <TripStepDisplay tripSteps={itineraryData.tripSteps} />
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetails;
