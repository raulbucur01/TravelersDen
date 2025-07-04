import { useState } from "react";
import { Button } from "../ui/button";
import { DisplayedAccommodation } from "@/types";
import { formatToLongDate } from "@/utilities/utils";
import ExpandableText from "../reusable/ExpandableText";

type AccommodationsDisplayProps = {
  accommodations: DisplayedAccommodation[];
};

const AccommodationsDisplay = ({
  accommodations,
}: AccommodationsDisplayProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleClick = (link: string) => {
    window.open(link, "_blank"); // Opens the link in a new tab
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? accommodations.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === accommodations.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="gap-4 ml-10 mr-10 w-auto">
      <div className="flex items-center justify-center">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          className={`bg-dm-dark hover:bg-dm-secondary text-dm-light p-2 rounded-full z-20 opacity-${
            currentIndex > 0 ? "30" : "0"
          } ${
            currentIndex > 0 ? "pointer-events-auto" : "pointer-events-none"
          } hover:opacity-90`}
        >
          <img
            src="/assets/icons/left-arrow.png"
            alt="left-arrow"
            className="w-5 h-auto"
          />
        </button>

        {/* Accommodation Card */}
        <div className="border border-dm-dark rounded-md p-4 bg-dm-dark-2 flex-1">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Name and Description */}
            <div className="lg:w-1/3 lg:pr-4 lg:border-r border-b border-dm-dark lg:border-b-0 pb-4 lg:pb-0">
              <h2 className="text-lg font-bold text-left text-dm-light">
                {accommodations[currentIndex].name}
              </h2>
              <ExpandableText
                key={currentIndex}
                maxCharsPerLine={40}
                text={accommodations[currentIndex].description}
                maxLength={50}
                className="whitespace-pre-line overflow-hidden"
              />
            </div>

            {/* Middle: Price and Dates */}
            <div className="lg:w-1/3 lg:px-4 lg:border-r border-b border-dm-dark lg:border-b-0 pb-4 lg:pb-0 flex flex-col justify-between items-start mt-4 lg:mt-0">
              {/* Price Information */}
              <div>
                <p className="text-dm-light font-medium">
                  Total Price: ${accommodations[currentIndex].totalPrice}
                </p>
                <p className="text-sm text-dm-light-3">
                  (${accommodations[currentIndex].pricePerNight} per night)
                </p>
              </div>

              {/* Date Information */}
              <div className="grid grid-cols-2 gap-x-4 text-left mt-2">
                <p className="font-medium text-dm-light-3">Check-in:</p>
                <p className="text-dm-light">
                  {formatToLongDate(accommodations[currentIndex].startDate)}
                </p>

                <p className="font-medium text-dm-light-3">Check-out:</p>
                <p className="text-dm-light">
                  {formatToLongDate(accommodations[currentIndex].endDate)}
                </p>
              </div>
            </div>

            {/* Right: Map */}
            <div className="lg:w-1/3 lg:pl-4">
              <p className="text-dm-light text-center">Toggle MAP/Photos</p>
            </div>
          </div>
          {/* More Button */}
          <div className="mt-4 text-right">
            <Button
              className="bg-dm-dark-3 text-dm-light hover:bg-dm-secondary rounded-full"
              onClick={() => handleClick(accommodations[currentIndex].link)}
            >
              Explore Attached Link
            </Button>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className={`bg-dm-dark hover:bg-dm-secondary text-dm-light p-2 rounded-full z-20 opacity-${
            currentIndex < accommodations.length - 1 ? "30" : "0"
          } ${
            currentIndex < accommodations.length - 1
              ? "pointer-events-auto"
              : "pointer-events-none"
          } hover:opacity-90`}
        >
          <img
            src="/assets/icons/right-arrow.png"
            alt="right-arrow"
            className="w-5 h-auto"
          />
        </button>
      </div>
    </div>
  );
};

export default AccommodationsDisplay;
