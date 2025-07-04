import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TravelMode } from "@/types";

type TravelModeSelectorProps = {
  travelMode: TravelMode;
  onChange: (mode: TravelMode) => void;
};

const TravelModeSelector = ({
  travelMode,
  onChange,
}: TravelModeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<TravelMode | null>(null);
  const options: TravelMode[] = ["pedestrian", "car", "bus", "bicycle"];

  return (
    <div className="relative w-[180px]">
      {/* Travel Mode Label */}
      <div className="inline-block px-2 py-1 rounded-tl-md rounded-tr-md bg-dm-dark text-dm-light text-sm font-medium">
        Select travel mode
      </div>

      {/* Dropdown Toggle */}
      <div
        className="w-full h-10 hover:bg-dm-secondary px-3 py-2 text-sm bg-dm-dark text-dm-light border-input rounded-bl-md rounded-br-md rounded-tr-md flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {travelMode.charAt(0).toUpperCase() + travelMode.slice(1)}
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} // Smooth appear from below
            animate={{ opacity: 1, y: 0 }} // Fade in and move up
            exit={{ opacity: 0, y: 10 }} // Fade out and move down
            transition={{ duration: 0.2 }} // Smooth animation
            className="absolute bottom-full mb-1 w-full bg-dm-dark border border-input rounded-md shadow-lg"
          >
            {options.map((mode) => (
              <div
                key={mode}
                onMouseEnter={() => setHoveredOption(mode)}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() => {
                  onChange(mode);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer rounded-md ${
                  hoveredOption === mode // Highlight only when hovered
                    ? "bg-dm-secondary"
                    : travelMode === mode && hoveredOption === null // Keep selected if not hovering
                    ? "bg-dm-secondary"
                    : ""
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TravelModeSelector;
