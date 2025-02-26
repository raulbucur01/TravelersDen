import Map from "@/components/shared/map/Map";
import { getAllTripCoordinates } from "@/lib/utils";
import { IDisplayedTripStep } from "@/types";

type TripSummaryDisplayProps = {
  tripSteps: IDisplayedTripStep[];
};

const TripSummaryDisplay = ({ tripSteps }: TripSummaryDisplayProps) => {
  return (
    <div className="flex w-[87%] h-[500px] border border-dm-dark overflow-hidden">
      {/* Left Section (1/3 width) */}
      <div className="w-1/3 p-4 flex items-center justify-center">
        <p className="text-lg font-semibold text-gray-700">To-Do</p>
      </div>

      {/* Right Section (2/3 width) */}
      <div className="w-2/3">
        <Map
          width="100%"
          height="100%"
          mapUIMode="small"
          preselectedZoom={12}
          tripStepCoordinates={getAllTripCoordinates(tripSteps)}
        />
      </div>
    </div>
  );
};

export default TripSummaryDisplay;
