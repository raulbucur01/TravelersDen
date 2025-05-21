import { useState, useEffect, useRef } from "react";

import "@tomtom-international/web-sdk-maps/dist/maps.css";
import * as tt from "@tomtom-international/web-sdk-maps";
import ttServices from "@tomtom-international/web-sdk-services";

import { useGetMapSearchResults } from "@/api/tanstack-query/queriesAndMutations";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import MapSearchSuggestions from "./MapSearchSuggestions";
import { ISuggestionInfo, TravelMode } from "@/types";
import { useDebounce } from "use-debounce";
import { formatMapSearchSuggestions } from "@/utilities/utils";
import { createRoot } from "react-dom/client";
import MapPopup from "./MapPopup";
import { apiConfig } from "@/api/config";
import TravelModeSelector from "./TravelModeSelector";

type MapProps = {
  width?: string;
  height?: string;
  preselectedLongitude?: number;
  preselectedLatitude?: number;
  preselectedZoom?: number;
  tripStepCoordinates?: [number, number][]; // for trip summary mode
  onLocationPicked?: (
    longitude: number,
    latitude: number,
    zoom: number
  ) => void;
  onZoomChanged?: (zoom: number) => void;
  mapUIMode?: "small" | "large";
};

const Map = ({
  width = "100vh",
  height = "90vh",
  preselectedLongitude = 24.79279,
  preselectedLatitude = 46.22141,
  preselectedZoom = 15,
  tripStepCoordinates,
  onLocationPicked,
  onZoomChanged, // for update and create mode to keep the zoom state
  mapUIMode,
}: MapProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const { refetch: refetchSearchResults } = useGetMapSearchResults(searchQuery);

  // map
  const API_KEY = apiConfig.tomTomApiKey;
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<tt.Map | null>(null);
  const markerRef = useRef<tt.Marker | null>(null);

  // map state
  const [selectedMapLongitude, setSelectedMapLongitude] =
    useState(preselectedLongitude);
  const [selectedMapLatitude, setSelectedMapLatitude] =
    useState(preselectedLatitude);
  const [selectedMapZoom, setSelectedMapZoom] = useState(preselectedZoom);

  // other
  const [suggestions, setSuggestions] = useState<ISuggestionInfo[]>([]);
  const [popup, setPopup] = useState<tt.Popup | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>("car");

  // map initialization
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
        // center of the map (the average of all coordinates if trip summary mode is on else selected location)
        center: [selectedMapLongitude, selectedMapLatitude],
        zoom: selectedMapZoom,
      });
      setMap(newMap);

      // Update zoom state when user zooms in or out
      newMap.on("zoomend", () => {
        setSelectedMapZoom(newMap.getZoom());
      });

      // Initialize the marker if we are not in trip summary mode
      if (!tripStepCoordinates) {
        // Initialize the marker
        const initialMarker = new tt.Marker({
          color: "#070C0D",
        })
          .setLngLat([selectedMapLongitude, selectedMapLatitude])
          .addTo(newMap);
        markerRef.current = initialMarker;
      }

      // Add event listeners
      newMap.on("load", () => {
        // initialize route if in trip summary mode
        if (tripStepCoordinates && tripStepCoordinates.length > 0) {
          // Create a bounding box with the trip coordinates
          const bounds = new tt.LngLatBounds();
          tripStepCoordinates.forEach(([lng, lat]) =>
            bounds.extend([lng, lat])
          );

          // Fit the map to the bounding box
          newMap.fitBounds(bounds, {
            padding: 50, // Optional padding
            linear: true,
            maxZoom: 14, // Prevents zooming in too much
          });

          // Fetch route from TomTom API
          ttServices.services
            .calculateRoute({
              key: API_KEY,
              traffic: false,
              locations: tripStepCoordinates.map((coord) => coord.join(",")),
            })
            .then((response) => {
              const geoJson = response.toGeoJson();
              // Draw the route on the map
              newMap.addLayer({
                id: "route",
                type: "line",
                source: {
                  type: "geojson",
                  data: geoJson,
                },
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#91EDDF", "line-width": 5 },
              });

              // Add markers at each waypoint
              tripStepCoordinates.forEach(([lng, lat]) => {
                new tt.Marker().setLngLat([lng, lat]).addTo(newMap);
              });
            });
        }

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

          handleLocationPicked(lngLat.lng, lngLat.lat, newMap.getZoom());
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

  // for update and create mode to keep the zoom state
  useEffect(() => {
    if (onZoomChanged) {
      onZoomChanged(selectedMapZoom);
    }
  }, [selectedMapZoom]);

  const handleLocationPicked = (
    longitude: number,
    latitude: number,
    zoom: number
  ) => {
    setSelectedMapLongitude(longitude);
    setSelectedMapLatitude(latitude);
    setSelectedMapZoom(zoom);
    if (onLocationPicked) {
      onLocationPicked(longitude, latitude, zoom);
    }
  };

  const handleFullscreenToggle = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!document.fullscreenElement) {
      // Request fullscreen
      if (mapElement.current) {
        mapElement.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // for travel mode change
  const handleTravelModeChange = (mode: TravelMode) => {
    setTravelMode(mode);
    if (tripStepCoordinates && map) {
      performRecalculateRouteRequest();
    }
  };

  const removeLayer = () => {
    if (!map?.getLayer("route")) {
      return;
    }
    map.removeLayer("route");
    map.removeSource("route");
  };

  const performRecalculateRouteRequest = () => {
    removeLayer();

    // Create a bounding box with the trip coordinates
    const bounds = new tt.LngLatBounds();
    tripStepCoordinates!.forEach(([lng, lat]) => bounds.extend([lng, lat]));

    // Fit the map to the bounding box
    map!.fitBounds(bounds, {
      padding: 50, // Optional padding
      linear: true,
      maxZoom: 14, // Prevents zooming in too much
    });

    // Fetch route from TomTom API
    ttServices.services
      .calculateRoute({
        key: API_KEY,
        traffic: false,
        locations: tripStepCoordinates!.map((coord) => coord.join(",")),
        travelMode: travelMode,
      })
      .then((response) => {
        const geoJson = response.toGeoJson();
        // Draw the route on the map
        map!.addLayer({
          id: "route",
          type: "line",
          source: {
            type: "geojson",
            data: geoJson,
          },
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#91EDDF", "line-width": 5 },
        });
      });
  };
  // (end) for travel mode change

  const createPopup = (mapInstance: tt.Map, feature: any) => {
    removePopup(); // Remove any existing popup
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
            const formattedSuggestions: ISuggestionInfo[] =
              formatMapSearchSuggestions(response.data.results);

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

  const handleSuggestionPicked = (
    latitude: number,
    longitude: number,
    zoom: number
  ) => {
    removePopup();
    if (map) {
      // Update the map's center
      map.flyTo({
        // Cast to `any` or a more appropriate type if necessary
        ...({
          center: [longitude, latitude],
          essential: true, // Ensure smooth transitions
          zoom: zoom,
          speed: 1.8,
        } as any),
      });

      markerRef.current?.remove();

      const newMarker = new tt.Marker()
        .setLngLat([longitude, latitude])
        .addTo(map);

      markerRef.current = newMarker;

      handleLocationPicked(longitude, latitude, zoom);

      if (mapUIMode === "small") setSuggestions([]);
    }
  };

  return (
    <div className="h-full w-full relative">
      {/* Map Container */}
      <div
        ref={mapElement}
        style={{ width, height }}
        className={"relative"} // dynamic width and height
      >
        {/* Overlay: Search Box and Suggestions */}
        <div className="absolute top-4 left-4 z-10 bg-opacity-100">
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
                className="w-full h-full object-contain"
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

        <div className="absolute top-4 right-4 z-10">
          <Button
            className="bg-dm-dark hover:bg-dm-secondary flex items-center justify-center w-10 h-10 p-2"
            onClick={(e) => handleFullscreenToggle(e)}
          >
            {!isFullscreen ? (
              <img
                src="/assets/icons/fullscreen.png"
                alt="fullscreen"
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src="/assets/icons/minimize.png"
                alt="minimize"
                className="w-full h-full object-contain"
              />
            )}
          </Button>
        </div>

        {/* Travel mode selector overlay*/}
        {tripStepCoordinates && tripStepCoordinates.length > 0 && (
          <div className="absolute bottom-4 left-4 z-10">
            <TravelModeSelector
              travelMode={travelMode}
              onChange={handleTravelModeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default Map;
