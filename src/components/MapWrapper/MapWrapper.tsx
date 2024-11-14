import React, { useMemo, useState, useCallback } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import ReactLeafletGoogleLayer from "react-leaflet-google-layer"; // Uncomment if using Google Layer

const LocationFinderDummy = React.memo(() => {
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);

  useMapEvents({
    contextmenu: useCallback((e: any) => {
      setCurrentPos([
        parseFloat(e.latlng.lat.toFixed(7)),
        parseFloat(e.latlng.lng.toFixed(7)),
      ]);
    }, []),
  });

  return currentPos ? (
    <Marker position={currentPos} draggable>
      <Popup>
        Current location: lat={currentPos[0]}, lng={currentPos[1]}
      </Popup>
    </Marker>
  ) : null;
});

const MapWrapper: React.FC<{
  children: React.ReactNode;
  center: [number, number];
}> = ({ children, center }) => {
  const googleLayer = useMemo(
    () => (
      <ReactLeafletGoogleLayer
        apiKey="AIzaSyA8A9yPeigR3I485ayAHKniugLw3OqXlS4"
        type="hybrid"
      />
      // <TileLayer
      //   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      //   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      // />
    ),
    []
  );

  return (
    <div style={{ height: "100%" }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        zoomControl={false}
        style={{ width: "100%", height: "90vh" }}
      >
        {googleLayer}
        {children}
        <LocationFinderDummy />
      </MapContainer>
    </div>
  );
};

export default MapWrapper;
