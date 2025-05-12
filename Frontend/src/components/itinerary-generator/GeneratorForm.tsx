import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";

const suggestedOptions = [
  { value: "museums", label: "Museums" },
  { value: "local food", label: "Local Food" },
  { value: "outdoors", label: "Outdoors" },
  { value: "history", label: "History" },
  { value: "shopping", label: "Shopping" },
  { value: "nightlife", label: "Nightlife" },
  { value: "beach", label: "Beach" },
];

interface GeneratorFormProps {
  onGenerate: (
    destination: string,
    days: number,
    preferences: string[]
  ) => void;
  isLoading: boolean;
}

const GeneratorForm = ({ onGenerate, isLoading }: GeneratorFormProps) => {
  const { toast } = useToast();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(1);
  const [preferences, setPreferences] = useState<
    { value: string; label: string }[]
  >([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate destination
    if (!destination.trim()) {
      toast({
        title: "Destination is required",
        description: "Please enter a destination for your itinerary.",
        variant: "destructive",
      });
      return;
    }

    // Validate days
    if (isNaN(days) || days < 1) {
      toast({
        title: "Invalid number of days",
        description: "Please enter a valid number of days (at least 1).",
        variant: "destructive",
      });
      return;
    }

    // create preference strings as an array
    const prefStrings = preferences.map((p) => p.value);

    onGenerate(destination.trim(), Number(days), prefStrings);
  };

  return (
    <div className="relative bg-dm-dark shadow-lg rounded-2xl p-6">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 rounded-2xl">
          <img
            src="/assets/icons/loader.svg"
            alt="loader"
            width={24}
            height={24}
          />
          <p className="text-white font-semibold text-center mt-7">
            Generating your itinerary... <br></br>This could take a little bit!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-dm-light">
            Your Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full p-2 border rounded bg-dm-dark"
            placeholder="e.g. Madrid"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-dm-light">
            Number of days
          </label>
          <input
            type="number"
            value={isNaN(days) ? "" : days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="w-full p-2 border rounded bg-dm-dark"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-dm-light">
            Preferences (optional)
          </label>
          <CreatableSelect
            isMulti
            options={suggestedOptions}
            value={preferences}
            onChange={(selected) => setPreferences(selected as any)}
            placeholder="Select or type preferences"
            classNamePrefix={"react-select"}
            isDisabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className={
            isLoading
              ? "w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition pointer-events-none"
              : "w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          }
          disabled={isLoading}
        >
          Generate Itinerary
        </button>
      </form>
    </div>
  );
};

export default GeneratorForm;
