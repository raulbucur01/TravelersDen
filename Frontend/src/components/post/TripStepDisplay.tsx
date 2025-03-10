import { IDisplayedTripStep } from "@/types";
import ExpandableText from "../shared/ExpandableText";
import Map from "../shared/map/Map";
import MediaCarousel from "../shared/MediaCarousel";

type TripStepDisplayProps = {
  tripSteps: IDisplayedTripStep[];
};

const TripStepDisplay = ({ tripSteps }: TripStepDisplayProps) => {
  return (
    <div className="ml-10 mr-10 w-[87%]">
      {tripSteps.map((tripStep, index) => (
        <div
          className="flex flex-col lg:flex-row border lg:h-[390px] border-dm-dark p-4 rounded-md mb-10 mt-5 relative"
          key={index}
        >
          {/* Left: Step Number */}
          <div className="top-left-index-number">{index + 1}</div>

          {/* Left: Carousel */}
          <div className="lg:w-1/3 lg:pr-4 lg:border-r border-b border-dm-dark lg:border-b-0 pb-4 lg:pb-0 max-w-[400px]">
            <MediaCarousel
              mediaUrls={tripStep.mediaUrls}
              customStyles={{
                container: "h-full w-full", // Make the carousel container take the full allocated space
                image: "h-full w-full object-cover", // Scale the images to fit within the container
                video: "h-full w-full", // Scale the videos similarly
              }}
            />
          </div>

          {/* Middle: Description and price */}
          <div className="lg:w-1/3 lg:px-4 lg:border-r border-b border-dm-dark lg:border-b-0 pb-4 lg:pb-0 flex flex-col justify-between mt-4 lg:mt-0">
            <div>
              <ExpandableText text={tripStep.description} maxLength={250} />
            </div>

            <div className="grid grid-cols-2 gap-x-4 text-left mt-2">
              <p className="font-medium text-dm-dark-4">
                Price: {tripStep.price}
              </p>
            </div>
          </div>

          {/* Right: Map */}
          <div className="lg:w-1/3 lg:pl-4">
            <Map
              width="100%"
              height="100%"
              mapUIMode="small"
              preselectedLatitude={tripStep.latitude}
              preselectedLongitude={tripStep.longitude}
              preselectedZoom={tripStep.zoom}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TripStepDisplay;
