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
  if (isGettingItineraryData || !itineraryData) {
    return <Loader />;
  }

  return (
    <div>
      <AccommodationsDisplay accommodations={itineraryData.accommodations} />
    </div>
  );
};

export default ItineraryDetails;
