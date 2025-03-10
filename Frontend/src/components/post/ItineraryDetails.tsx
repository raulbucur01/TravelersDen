import { useGetItineraryDetails } from "@/api/tanstack-query/queriesAndMutations";
import Loader from "../shared/Loader";
import AccommodationsDisplay from "./AccommodationsDisplay";
import TripStepDisplay from "./TripStepDisplay";
import TripSummaryDisplay from "./TripSummaryDisplay";

const ItineraryDetails = ({ id }: { id: string }) => {
  const { data: itineraryData, isPending: isGettingItineraryData } =
    useGetItineraryDetails(id);

  if (isGettingItineraryData || !itineraryData) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-10 mb-10">
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

      {/* Trip Summary Section */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl ml-10 font-semibold text-dm-light">
          Trip Summary
        </h1>
        <div className="flex justify-center w-full">
          <TripSummaryDisplay tripSteps={itineraryData.tripSteps} />
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetails;
