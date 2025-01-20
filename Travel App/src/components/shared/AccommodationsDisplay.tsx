import React from "react";
import { Button } from "../ui/button";
import { IAccommodation, IDisplayedAccommodation } from "@/types";
import { formatDateString } from "@/lib/utils";

const accommodations = [
  {
    name: "Luxury Beach Resort",
    description: "A beautiful resort by the beach with stunning views.",
    latitude: null,
    longitude: null,
    startDate: "2025-01-13T17:43:45.122",
    endDate: "2025-01-23T22:00:00",
    pricePerNight: 123,
    totalPrice: 1230,
    link: "https://example.com/accommodation/1",
  },
  {
    name: "Mountain Cabin Retreat",
    description: "Cozy cabin in the mountains, perfect for relaxation.",
    latitude: null,
    longitude: null,
    startDate: "2025-02-01T14:00:00",
    endDate: "2025-02-05T10:00:00",
    pricePerNight: 200,
    totalPrice: 800,
    link: "https://example.com/accommodation/2",
  },
  {
    name: "Mountain Cabin Retreat",
    description: "Cozy cabin in the mountains, perfect for relaxation.",
    latitude: null,
    longitude: null,
    startDate: "2025-02-01T14:00:00",
    endDate: "2025-02-05T10:00:00",
    pricePerNight: 200,
    totalPrice: 800,
    link: "https://example.com/accommodation/2",
  },
];

type AccommodationsDisplayProps = {
  accommodations: IDisplayedAccommodation[];
};

const AccommodationsDisplay = ({
  accommodations,
}: AccommodationsDisplayProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 p-4">
      {accommodations.map((accommodation, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 shadow-lg bg-white hover:shadow-xl transition"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {accommodation.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {accommodation.description}
          </p>
          <div className="text-sm text-gray-700">
            <p>
              <strong>Start Date:</strong> {accommodation.startDate}
            </p>
            <p>
              <strong>End Date:</strong> {accommodation.endDate}
            </p>
            <p>
              <strong>Price per Night:</strong> ${accommodation.pricePerNight}
            </p>
            <p>
              <strong>Total Price:</strong> ${accommodation.totalPrice}
            </p>
          </div>
          <div className="mt-4">
            <a
              href={accommodation.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-sm hover:text-blue-700"
            >
              View Details
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccommodationsDisplay;
