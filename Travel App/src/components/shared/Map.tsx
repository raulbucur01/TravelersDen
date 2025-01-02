import React, { useEffect, useRef, useState } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import ttServices from "@tomtom-international/web-sdk-services";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

const Map = () => {
  const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
  const mapElement = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<tt.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (mapElement.current) {
      const newMap = tt.map({
        key: apiKey,
        container: mapElement.current,
        center: [0, 0], // Default center (Longitude, Latitude)
        zoom: 2, // Default zoom level
      });
      setMap(newMap);

      return () => newMap.remove(); // Clean up on component unmount
    }
  }, [apiKey]);

  const handleSearch = () => {
    if (map && searchQuery) {
      ttServices.services
        .fuzzySearch({
          key: apiKey,
          query: searchQuery,
        })
        .then((response) => {
          if (response?.results?.[0]) {
            const { position } = response.results[0];
            
            map.panTo(position);
          }
        });
    }
  };

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <div ref={mapElement} style={{ height: "100%", width: "100%" }}></div>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location"
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            marginLeft: "8px",
            padding: "8px 12px",
            borderRadius: "4px",
            border: "none",
            background: "#0079c2",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default Map;
