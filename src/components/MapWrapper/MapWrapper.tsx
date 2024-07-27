import React, { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, useMapEvents } from "react-leaflet";
import ReactLeafletGoogleLayer from "react-leaflet-google-layer";
const LocationFinderDummy = () => {
  const [currentPos, setCurrentPos] = useState<[number, number]>();

  const map = useMapEvents({
    contextmenu(e) {
      setCurrentPos([
        Number(Number(e.latlng.lat).toFixed(7)),
        Number(Number(e.latlng.lng).toFixed(7)),
      ]);
    },
  });

  return (
    <>
      {currentPos && (
        <Marker position={currentPos} draggable={true}>
          <Popup position={currentPos}>
            Current location: {`lat=${currentPos[0]}&lng=${currentPos[1]}`}
          </Popup>
        </Marker>
      )}
    </>
  );
};
const MapWrapper: React.FC<{
  children: React.ReactNode;
  center: [number, number];
}> = ({ children, center }) => {
  const googleLayer = useMemo(
    () => (
      <ReactLeafletGoogleLayer
        apiKey="AIzaSyA8A9yPeigR3I485ayAHKniugLw3OqXlS4"
        type={"hybrid"}
      />
    ),
    []
  );

  const mapContainer = useMemo(
    () => (
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ width: "1200px", height: "90vh" }}
      >
        {googleLayer}
        {children}

        <LocationFinderDummy />
      </MapContainer>
    ),
    [center, googleLayer, children]
  );

  return <div style={{ height: "100%" }}>{mapContainer}</div>;
};

export default MapWrapper;
