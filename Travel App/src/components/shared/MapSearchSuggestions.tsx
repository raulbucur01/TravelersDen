import { ISuggestionInfo } from "@/types";

type MapSearchSuggestionsProps = {
  suggestions: ISuggestionInfo[];
};

const MapSearchSuggestions = ({ suggestions }: MapSearchSuggestionsProps) => {
  return (
    <div className="absolute top-13 left-0 w-full max-h-96 bg-dm-dark border border-dm-secondary rounded-b-lg overflow-auto shadow-lg z-10 custom-scrollbar">
      {suggestions.length === 0 ? (
        <p className="p-4 text-dm-light">No suggestions available</p>
      ) : (
        suggestions.map((suggestion, index) => (
          <div key={index} className="p-3 hover:bg-dm-secondary cursor-pointer">
            <h3 className="font-semibold text-lg text-dm-light">
              {suggestion.poiName}
            </h3>
            <p className="text-sm text-dm-dark-4">{suggestion.address}</p>
            <span className="px-2 py-1 mt-2 inline-block bg-dm-dark-3 text-dm-light-2 text-xs font-medium rounded">
              {suggestion.category}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default MapSearchSuggestions;
