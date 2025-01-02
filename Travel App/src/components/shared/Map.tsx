import { useState, useEffect, useRef } from "react";

import "@tomtom-international/web-sdk-maps/dist/maps.css";
import * as tt from "@tomtom-international/web-sdk-maps";

const Map = () => {
  const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [mapLongitude, setMapLongitude] = useState(-121.91599);
  const [mapLatitude, setMapLatitude] = useState(37.36765);
  const [map, setMap] = useState<tt.Map | null>(null);
  const [marker, setMarker] = useState<tt.Marker | null>(null);

  useEffect(() => {
    if (mapElement.current) {
      const newMap = tt.map({
        key: API_KEY,
        container: mapElement.current,
        center: [mapLongitude, mapLatitude],
      });
      setMap(newMap);
      setMarker(
        new tt.Marker().setLngLat([mapLongitude, mapLatitude]).addTo(newMap)
      );
      return () => newMap.remove();
    }
  }, []);

  return (
    <div className="container h-full w-full">
      <div className="flex flex-wrap">
        <div
          ref={mapElement}
          className="w-[100vh] h-[100vh] border border-gray-300 rounded-3xl"
        ></div>
      </div>
    </div>
  );
};

export default Map;
