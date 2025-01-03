import { ISuggestionInfo } from "@/types";

type MapSearchSuggestionsProps = {
  suggestions: ISuggestionInfo[];
};

const MapSearchSuggestions = ({ suggestions }: MapSearchSuggestionsProps) => {
  return (
    <div className="absolute top-14 left-0 w-full max-h-64 bg-white border border-gray-300 rounded-xl overflow-auto shadow-lg z-10 custom-scrollbar">
      {suggestions.length === 0 ? (
        <p className="p-4 text-gray-500">No suggestions available</p>
      ) : (
        suggestions.map((suggestion, index) => (
          <div key={index} className="p-3 hover:bg-gray-100 cursor-pointer">
            <h3 className="font-semibold text-lg text-gray-800">
              {suggestion.poiName}
            </h3>
            <p className="text-sm text-gray-600">{suggestion.address}</p>
            <span className="px-2 py-1 mt-2 inline-block bg-blue-100 text-blue-700 text-xs font-medium rounded">
              {suggestion.category}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default MapSearchSuggestions;
