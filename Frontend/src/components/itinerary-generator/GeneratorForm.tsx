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
        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white text-center">
          <div className="loader-spinner w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold">
            Generating your itinerary...
            <br />
            This could take a little bit!
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`space-y-4 ${isLoading ? "pointer-events-none" : ""}`}
      >
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
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Generate Itinerary
        </button>
      </form>
    </div>
  );
};

export default GeneratorForm;
