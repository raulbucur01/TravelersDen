import React from "react";

interface MapPopupProps {
  name: string;
  category: string;
  coordinates: [number, number];
}

const MapPopup = ({ name, category, coordinates }: MapPopupProps) => {
  return (
    <div className="bg-dm-dark rounded-lg p-4">
      <div className="text-dm-light">{name || "POI Name"}</div>
      <div className="text-dm-dark-4">{category || "Category"}</div>
    </div>
  );
};

export default MapPopup;
