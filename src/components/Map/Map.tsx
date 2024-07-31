import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import MapWrapper from "../MapWrapper/MapWrapper";
import { FeatureGroup, Polygon } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

const Map = ({
  loadingMap,
  collection,
  highways,
  handleCreated,
  handleDeleted,
  handleEdited,
}: {
  loadingMap: any;
  collection: any;
  highways: any;
  handleCreated: any;
  handleDeleted: any;
  handleEdited: any;
}) => {
  return (
    <>
      {loadingMap && collection.trim() !== "" ? (
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
          <FeatureGroup>
            <EditControl
              draw={{
                polyline: {
                  shapeOptions: {
                    color: "red",
                  },
                },
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
            />
            {highways
              ?.filter((high: any) => high.isDelete !== 1)
              .map((ref: any) =>
                ref.highways
                  ?.filter((item: any) => item.isDelete !== 1)
                  .map((highway: any) =>
                    highway.ways.map((way: any, wayIndex: any) => (
                      <Polygon
                        pathOptions={{
                          className: `${
                            collection === "tollboths"
                              ? ref.id
                              : `${ref.id}-${highway.id}`
                          }`,
                        }}
                        key={wayIndex}
                        positions={way.buffer_geometry}
                        color="red"
                      />
                    ))
                  )
              )}
          </FeatureGroup>
        </MapWrapper>
      )}
    </>
  );
};

export default Map;
