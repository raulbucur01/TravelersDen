import Map from "@/components/shared/map/Map";
import { getAllTripCoordinates } from "@/utilities/utils";
import { DisplayedTripStep } from "@/types";

type TripSummaryDisplayProps = {
  tripSteps: DisplayedTripStep[];
};

const TripSummaryDisplay = ({ tripSteps }: TripSummaryDisplayProps) => {
  return (
    <div className="flex w-[87%] h-[500px] border border-dm-dark overflow-hidden">
      <div className="w-full h-full relative">
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
