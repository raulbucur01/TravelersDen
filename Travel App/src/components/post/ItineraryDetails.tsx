import { useGetItineraryDetails } from "@/lib/react-query/queriesAndMutations";
import React from "react";
import Loader from "../shared/Loader";
import AccommodationsDisplay from "../shared/AccommodationsDisplay";
import Map from "../shared/Map";

const ItineraryDetails = ({ id }: { id: string }) => {
  console.log(id);
  const { data: itineraryData, isPending: isGettingItineraryData } =
    useGetItineraryDetails(id);

  console.log(itineraryData);
  if (isGettingItineraryData) {
    return <Loader />;
  }

  return (
    <div>
      <div>
        {!itineraryData ? (
          <Loader />
        ) : (
          <AccommodationsDisplay
            accommodations={itineraryData.accommodations}
          />
        )}
      </div>
      <h2>Trip Steps</h2>
      {itineraryData?.tripSteps.map((step, index) => (
        <div key={index}>
          <h1>Step {step.stepNumber}</h1>
          <p>{step.description}</p>
          <Map
            preselectedLatitude={step.latitude}
            preselectedLongitude={step.longitude}
          />
        </div>
      ))}
    </div>
  );
};

export default ItineraryDetails;
