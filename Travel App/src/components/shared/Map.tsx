import { useState, useEffect, useRef } from "react";

import "@tomtom-international/web-sdk-maps/dist/maps.css";
import * as tt from "@tomtom-international/web-sdk-maps";

import { useGetMapSearchResults } from "@/lib/react-query/queriesAndMutations";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import MapSearchSuggestions from "./MapSearchSuggestions";
import { ISuggestionInfo } from "@/types";
import { useDebounce } from "use-debounce";
import { formatMapSearchSuggestions } from "@/lib/utils";
import { createRoot } from "react-dom/client";
import MapPopup from "./MapPopup";
import { set } from "date-fns";

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

  const [selectedMapLongitude, setSelectedMapLongitude] = useState(24.79279);
  const [selectedMapLatitude, setSelectedMapLatitude] = useState(46.22141);
  const [map, setMap] = useState<tt.Map | null>(null);
  const markerRef = useRef<tt.Marker | null>(null);

  const [suggestions, setSuggestions] = useState<ISuggestionInfo[]>([]);
  const [popup, setPopup] = useState<tt.Popup | null>(null);

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
        center: [selectedMapLongitude, selectedMapLatitude],
        zoom: 15,
        // trackResize: true,
      });
      newMap?.addControl(new tt.FullscreenControl());
      newMap?.addControl(new tt.NavigationControl());
      setMap(newMap);

      // Initialize the marker
      const initialMarker = new tt.Marker({
        color: "#070C0D",
      })
        .setLngLat([selectedMapLongitude, selectedMapLatitude])
        .addTo(newMap);
      markerRef.current = initialMarker;

      // Add event listeners
      newMap.on("load", () => {
        // map click event
        newMap.on("click", (event) => {
          setSuggestions([]);
          setSearchQuery("");
          const feature = newMap.queryRenderedFeatures(event.point)[0];
          const lngLat = event.lngLat;

          // Remove the existing marker if it exists
          if (markerRef.current) {
            markerRef.current.remove();
          }

          if (feature.id != 0 && feature.layer.id === "POI") {
            createPopup(newMap, feature);

            newMap.flyTo({
              ...({
                center: lngLat,
                essential: true,
                zoom: 15,
                speed: 1.2,
              } as any),
            });
          } else {
            // Create a new marker at the clicked position
            const newMarker = new tt.Marker()
              .setLngLat([lngLat.lng, lngLat.lat])
              .addTo(newMap);

            // Update the ref with the new marker
            markerRef.current = newMarker;
            removePopup();
          }

          setSelectedMapLatitude(lngLat.lat);
          setSelectedMapLongitude(lngLat.lng);
          console.log("lngLat", [lngLat.lng, lngLat.lat]);
        });

        newMap.on("mouseenter", "POI", () => {
          newMap.getCanvas().style.cursor = "pointer";
        });

        newMap.on("mouseleave", "POI", () => {
          newMap.getCanvas().style.cursor = "";
        });
      });

      return () => newMap.remove();
    }
  }, []);

  const createPopup = (mapInstance: tt.Map, feature: any) => {
    removePopup(); // Remove any existing popup
    console.log("feature", feature);
    const popupContainer = document.createElement("div");

    // Use `createRoot` to render the React component into the popup container
    const root = createRoot(popupContainer);

    root.render(
      <MapPopup
        name={feature.properties.name || "POI Name"}
        category={feature.properties.category || "Category"}
        coordinates={feature.geometry.coordinates}
      />
    );

    const newPopup = new tt.Popup({
      offset: { top: [0, 20], bottom: [0, -10] },
      closeButton: false,
    })
      .setLngLat(feature.geometry.coordinates)
      .setDOMContent(popupContainer)
      .addTo(mapInstance);

    setPopup(newPopup);
  };

  const removePopup = () => {
    if (popup) {
      popup.remove();
      setPopup(null);
    }
  };

  // Handle search query changes and refetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchQuery.length > 3) {
        try {
          const response = await refetchSearchResults();
          if (response?.data) {
            console.log(response.data);

            const formattedSuggestions: ISuggestionInfo[] =
              formatMapSearchSuggestions(response.data.results);

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

  const handleSuggestionPicked = (latitude: number, longitude: number) => {
    removePopup();
    if (map) {
      // Update the map's center
      map.flyTo({
        // Cast to `any` or a more appropriate type if necessary
        ...({
          center: [longitude, latitude],
          essential: true, // Ensure smooth transitions
          zoom: 15,
          speed: 1.2,
        } as any),
      });

      // // Update the marker's position
      // if (markerRef.current) {
      //   markerRef.current.setLngLat([longitude, latitude]);
      // } else {
      markerRef.current?.remove();

      const newMarker = new tt.Marker()
        .setLngLat([longitude, latitude])
        .addTo(map);

      markerRef.current = newMarker;
      // }

      // Optionally update state to reflect the selected location
      setSelectedMapLongitude(longitude);
      setSelectedMapLatitude(latitude);
      console.log("lngLat", [longitude, latitude]);
    }
  };

  return (
    <div className="container h-full w-full relative">
      {/* Map Container */}
      <div
        ref={mapElement}
        className="relative w-[100vh] h-full border rounded-3xl"
      >
        {/* Overlay: Search Box and Suggestions */}
        <div className="absolute top-4 left-4 z-10 bg-opacity-100">
          {/* Search Input and Button */}
          <div className="flex">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e)}
              placeholder="Search location..."
              className="shad-input rounded-r-none"
            />
            <Button
              className="h-12 bg-dm-dark text-dm-light hover:bg-dm-secondary rounded-l-none"
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

          {/* Search Suggestions */}
          {suggestions.length > 0 && searchQuery.length > 3 && (
            <MapSearchSuggestions
              suggestions={suggestions}
              onSuggestionPicked={handleSuggestionPicked}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
