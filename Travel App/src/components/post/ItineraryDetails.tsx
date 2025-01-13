import { useGetItineraryDetails } from "@/lib/react-query/queriesAndMutations";
import React from "react";
import Loader from "../shared/Loader";

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
      <h2>Trip Steps</h2>
      {itineraryData?.tripSteps.map((step, index) => (
        <div key={index}>
          <h1>Step {step.stepNumber}</h1>
          <p>{step.description}</p>
        </div>
      ))}

      <h2>Accomodations</h2>
      {itineraryData?.accommodations.map((accomodation, index) => (
        <div key={index}>
          <h1>{accomodation.name}</h1>
          <p>{accomodation.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ItineraryDetails;
