import { useState, useEffect, useRef } from "react";

import "@tomtom-international/web-sdk-maps/dist/maps.css";
import * as tt from "@tomtom-international/web-sdk-maps";

import { useGetMapSearchResults } from "@/lib/react-query/queriesAndMutations";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import MapSearchSuggestions from "./MapSearchSuggestions";
import { ISuggestionInfo } from "@/types";
import { useDebounce } from "use-debounce";
import { formatSuggestions as formatMapSearchSuggestions } from "@/lib/utils";

const Map = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const {
    data: mapSearchResults,
    refetch: refetchSearchResults,
    isPending: isGettingSearchResults,
  } = useGetMapSearchResults(searchQuery);

  const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;
  const mapElement = useRef<HTMLDivElement | null>(null);

  const [mapLongitude, setMapLongitude] = useState(24.79279);
  const [mapLatitude, setMapLatitude] = useState(46.22141);
  const [map, setMap] = useState<tt.Map | null>(null);
  const [marker, setMarker] = useState<tt.Marker | null>(null);

  const [suggestions, setSuggestions] = useState<ISuggestionInfo[]>([]);

  useEffect(() => {
    if (mapElement.current) {
      const newMap = tt.map({
        key: API_KEY,
        style: {
          map: "basic_night",
          poi: "2/poi_dark",
          trafficIncidents: "2/incidents_dark",
          trafficFlow: "2/flow_relative-dark",
        },
        container: mapElement.current,
        center: [mapLongitude, mapLatitude],
        zoom: 15,
      });
      setMap(newMap);
      setMarker(
        new tt.Marker().setLngLat([mapLongitude, mapLatitude]).addTo(newMap)
      );
      return () => newMap.remove();
    }
  }, []);

  // Handle search query changes and refetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchQuery.length > 3) {
        try {
          const response = await refetchSearchResults();
          if (response?.data) {
            console.log(response.data);

            const formattedSuggestions = formatMapSearchSuggestions(
              response.data.results
            );

            console.log(formattedSuggestions);
            setSuggestions(formattedSuggestions);
          } else {
            console.log("No data returned");
          }
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      }
    };
    fetchResults();
  }, [debouncedSearchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value); // Update search query state
  };

  const handleSearch = () => {
    console.log("Search query:", searchQuery);
  };

  return (
    <div className="container h-full w-full">
      <div className="flex flex-col items-center">
        {/* Search Input and Button */}
        <div className="mb-4 flex">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => handleInputChange(e)}
            placeholder="Search location"
            className="shad-input"
          />
          <Button
            className="h-12 ml-1 bg-dm-dark text-dm-light hover:bg-dm-secondary"
            onClick={handleSearch}
          >
            <img
              src="/assets/icons/search.svg"
              alt="search"
              width={24}
              height={24}
            />
          </Button>
        </div>

        {/* Search suggestions */}
        <MapSearchSuggestions suggestions={suggestions} />

        {/* Map Container */}
        <div
          ref={mapElement}
          className="w-[100vh] h-[100vh] border border-gray-300 rounded-3xl"
        ></div>
      </div>
    </div>
  );
};

export default Map;
