import { LoadingOutlined } from "@ant-design/icons";
import { Pagination, Spin } from "antd";
import MapWrapper from "../MapWrapper/MapWrapper";
import { FeatureGroup, Polygon, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { URL_API } from "../../constant";

interface MapProps {
  loadingMap: boolean;
  collection: string;
  highways: Array<any>;
  handleCreated: (e: any) => void;
  handleDeleted: (e: any) => void;
  handleEdited: (e: any) => void;
  keyWayEdit: string | null;
  center: [number, number];
}

interface ZoomMapProps {
  lat: number;
  lng: number;
}

const ZoomMap = ({ lat, lng }: ZoomMapProps) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng]);
    }
  }, [lat, lng, map]);

  return null;
};

const Map = ({
  loadingMap,
  collection,
  highways,
  handleCreated,
  handleDeleted,
  handleEdited,
  keyWayEdit,
  center,
}: MapProps) => {
  const decodeKey = (key: string) => key.split("-");

  const checkKeyWay = (target: string) => {
    if (!keyWayEdit) return false;
    const targetDecode = decodeKey(target);
    const keyWayParts = decodeKey(keyWayEdit);

    switch (keyWayParts.length) {
      case 1:
        return keyWayParts[0] === targetDecode[0];
      case 2:
        return (
          `${keyWayParts[0]}-${keyWayParts[1]}` ===
          `${targetDecode[0]}-${targetDecode[1]}`
        );
      case 3:
        return keyWayEdit === target;
      default:
        return false;
    }
  };

  const [residentials, setResidentials] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const pageSize = 4000; // Số lượng phần tử hiển thị trên mỗi trang

  useEffect(() => {
    const fetchResidentials = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${URL_API}/residential/get-all`);
        setResidentials(res?.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchResidentials();
  }, []);

  const totalWays = residentials
    .flatMap((ref) =>
      ref.highways.flatMap((highway: any) => highway.ways.length)
    )
    .reduce((a, b) => a + b, 0);

  const polygons = useMemo(() => {
    const waysToShow = residentials.flatMap((ref) =>
      ref?.highways?.flatMap((highway: any) =>
        highway?.ways
          .slice(currentIndex, currentIndex + pageSize)
          .map((way: any) => (
            <Polygon
              pathOptions={{
                className: `${
                  collection === "tollboths"
                    ? ref.id
                    : `${ref.id}-${highway.id}-${way.id}`
                }`,
              }}
              key={`${ref.id}-${highway.id}-${way.id}`}
              positions={way.nodes}
              color={"purple"}
            />
          ))
      )
    );
    return waysToShow;
  }, [residentials, currentIndex]);

  const handlePaginationChange = (page: number) => {
    setCurrentIndex((page - 1) * pageSize);
  };

  return (
    <>
      {(loadingMap && collection.trim()) || loading ? (
        <div
          style={{
            background: "#f4f4f4",
            width: "100%",
            height: "90vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin
            size="large"
            tip="Loading"
            indicator={<LoadingOutlined style={{ fontSize: 80 }} spin />}
          />
        </div>
      ) : (
        <MapWrapper center={[20.918224, 106.842343]}>
          <FeatureGroup key={`${center}-${keyWayEdit}-${highways}`}>
            <EditControl
              draw={{
                polyline: { shapeOptions: { color: "red" } },
                rectangle: false,
                polygon: false,
                circle: false,
                marker: false,
                circlemarker: false,
              }}
              position="topright"
              onCreated={handleCreated}
              onDeleted={handleDeleted}
              onEdited={handleEdited}
              edit={{
                edit: false,
              }}
            />
            {highways
              ?.filter((high) => high.isDelete !== 1)
              .flatMap((ref) =>
                ref.highways
                  ?.filter((item: any) => item.isDelete !== 1)
                  .flatMap((highway: any) =>
                    highway.ways
                      ?.filter((item: any) => item.isDelete !== 1)
                      .flatMap((way: any) => (
                        <Polygon
                          pathOptions={{
                            className: `${
                              collection === "tollboths"
                                ? ref.id
                                : `${ref.id}-${highway.id}-${way.id}`
                            }`,
                          }}
                          key={`${ref.id}-${highway.id}-${way.id}`}
                          positions={way.buffer_geometry}
                          color={
                            checkKeyWay(`${ref.id}-${highway.id}-${way.id}`)
                              ? "blue"
                              : "yellow"
                          }
                        />
                      ))
                  )
              )}
            {polygons}
          </FeatureGroup>
          <ZoomMap lat={center?.[0]} lng={center?.[1]} />
        </MapWrapper>
      )}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <Pagination
          defaultCurrent={1}
          total={totalWays}
          pageSize={pageSize}
          onChange={handlePaginationChange}
        />
      </div>
    </>
  );
};

export default Map;
