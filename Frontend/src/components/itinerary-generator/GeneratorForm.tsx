import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";

const suggestedOptions = [
  { value: "museums", label: "Museums" },
  { value: "local food", label: "Local Food" },
  { value: "outdoors", label: "Outdoors" },
  { value: "history", label: "History" },
  { value: "shopping", label: "Shopping" },
  { value: "nightlife", label: "Nightlife" },
];

interface GeneratorFormProps {
  onGenerate: (
    destination: string,
    days: number,
    preferences: string[]
  ) => void;
}

const GeneratorForm = ({ onGenerate }: GeneratorFormProps) => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(1);
  const [preferences, setPreferences] = useState<
    { value: string; label: string }[]
  >([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prefStrings = preferences.map((p) => p.value);
    onGenerate(destination, days, prefStrings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium text-gray-700">
          Destination
        </label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full p-2 border rounded bg-dm-dark"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">
          Number of days
        </label>
        <input
          type="number"
          min={1}
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="w-full p-2 border rounded bg-dm-dark"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">
          Preferences
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
  );
};

export default GeneratorForm;
