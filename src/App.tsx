import React, {
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Button, message, Modal, Typography, Input } from "antd";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import axios from "axios";
import { Map } from "./components/Map";
import { FormContainer } from "./components/Form";
import { TableContainer } from "./components/Table";
import { URL_API } from "./constant";
import { createMessageCheckWay } from "./utils";
import { SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
let isHandling = false;

const App: React.FC = () => {
  const [fields, setFields] = useState<any[]>([
    {
      ref: "",
      highways: [
        {
          highway_name: "",
          ways: [{ nodes: [], lanes: "", maxSpeed: "", minSpeed: "" }],
        },
      ],
    },
  ]);

  const [collection, setCollection] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [highways, setHighways] = useState<any[]>([]);
  const [highwaySelected, setHighwaySelected] = useState<any>([]);
  const [tab, setTab] = useState<ReactNode>("map");
  const [open, setOpen] = useState(false);
  const [keyWayEdit, setKeyWayEdit] = useState<any>();
  const [searchResult, setSearchResult] = useState<any>();
  const [searchText, setSearchText] = useState<string>("");
  const [openSearch, setOpenSearch] = useState(false);
  const [center, setCenter] = useState<any>([10.8231, 106.6297]); // default to HCMC

  const [messageApi, contextHolder] = message.useMessage();

  const handleRefresh = useCallback(async () => {
    if (collection) {
      setLoadingMap(true);
      try {
        const res = await axios.get(`${URL_API}/${collection}/get-all`);
        setHighways(res?.data ?? []);
        setKeyWayEdit("");
      } finally {
        setLoadingMap(false);
      }
    }
  }, [collection]);

  const updateHighways = useCallback((updateNodes: (nodes: any[]) => any[]) => {
    setFields((prev) =>
      prev.map((field) => ({
        ...field,
        highways: field.highways.map((highway: any) => ({
          ...highway,
          ways: [
            ...highway.ways?.filter((way: any) => way.nodes.length > 1),
            {
              ...highway.ways[0],
              nodes: updateNodes(highway.ways[0].nodes),
            },
          ],
        })),
      }))
    );
  }, []);

  const handleCreated = useCallback(
    (e: any) => {
      const { layer } = e;
      updateHighways(() =>
        layer._latlngs.map((latLng: any) => [
          Number(latLng.lat.toFixed(7)),
          Number(latLng.lng.toFixed(7)),
        ])
      );
    },
    [updateHighways]
  );

  const handleDeleted = useCallback(
    async (e: any) => {
      if (isHandling) return;
      isHandling = true;

      const deletionPromises: Promise<void>[] = [];

      e.layers.eachLayer((layer: any) => {
        try {
          const idDelete = layer.options.className.split("-");
          const deletePromise = axios
            .put(`${URL_API}/${collection}/delete/${idDelete?.[0]}`, {
              indexs: idDelete?.[1] ? [Number(idDelete?.[1])] : [],
              indexsWay: idDelete?.[2] ? [Number(idDelete?.[2])] : [],
            })
            .then(() => {});
          deletionPromises.push(deletePromise);
        } catch (error) {
          console.log(error);
        }
      });

      try {
        setLoading(true);
        await Promise.all(deletionPromises);
        messageApi.open({
          type: "success",
          content: "Xóa thành công tất cả các tuyến đường được chọn",
        });
      } catch (error) {
        messageApi.open({
          type: "error",
          content: "Xóa tuyến đường thất bại",
        });
      } finally {
        setLoading(false);
        updateHighways(() => []);
        setTimeout(() => (isHandling = false), 0);
      }
    },
    [collection, handleRefresh, updateHighways]
  );

  const handleEdited = useCallback(
    (e: any) => {
      const newLayer: any = Object.values(e.layers._layers)[0];
      updateHighways(() =>
        newLayer._latlngs.map((latLng: any) => [
          Number(latLng.lat.toFixed(7)),
          Number(latLng.lng.toFixed(7)),
        ])
      );
    },
    [updateHighways]
  );

  const handleSearch = async () => {
    if (!searchText) return;
    setLoadingMap(true);
    const [lat, lng] = searchText.split(",");
    try {
      const res = await axios.get(
        `${URL_API}/search?lat=${lat}&lng=${lng}&collection=${collection}`
      );
      setCenter([lat, lng]);
      setKeyWayEdit(res.data?.key);
      setSearchResult(res.data);
    } finally {
      setLoadingMap(false);
    }
  };

  const handleOk = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${URL_API}/${collection}`, fields[0]);
      messageApi.open({
        type: res.status === 200 ? "success" : "error",
        content: res.status === 200 ? "Thêm thành công" : "Thêm thất bại",
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Memoized component for map, updated only when dependencies change
  const map = useMemo(
    () => (
      <Map
        center={center}
        keyWayEdit={keyWayEdit}
        loadingMap={loadingMap}
        collection={collection}
        handleCreated={handleCreated}
        handleDeleted={handleDeleted}
        handleEdited={handleEdited}
        highways={highwaySelected}
      />
    ),
    [center, keyWayEdit, loadingMap, collection, highwaySelected]
  );

  useEffect(() => {
    handleRefresh();
  }, [collection, handleRefresh]);

  return (
    <>
      {contextHolder}
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <FormContainer
          onFinish={() => setOpen(true)}
          fields={fields}
          setFields={setFields}
          setCollection={setCollection}
          highways={highways}
          handleRefresh={handleRefresh}
          loading={loading}
          setHighwaySelected={setHighwaySelected}
        />
        <div style={{ height: "90vh", flex: 1, position: "relative" }}>
          <div style={{ display: tab === "map" ? "block" : "none" }}>{map}</div>
          <div style={{ display: tab === "table" ? "block" : "none" }}>
            <TableContainer
              keyWayEdit={keyWayEdit}
              highways={highways}
              loading={loadingMap}
              collection={collection}
              handleRefresh={handleRefresh}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: -78,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Button
              onClick={() => setTab("map")}
              type="primary"
              style={{ marginBottom: 10 }}
            >
              Map
            </Button>
            <Button
              onClick={() => setTab("table")}
              type="primary"
              style={{ marginBottom: 10 }}
            >
              Table
            </Button>
            <div style={{ position: "relative", zIndex: 100000000 }}>
              <Button onClick={() => setOpenSearch(!openSearch)} type="primary">
                <SearchOutlined />
              </Button>
              {openSearch && (
                <div
                  style={{
                    position: "absolute",
                    top: "120%",
                    left: 0,
                    background: "white",
                    boxShadow: "0 0 2px rgba(0, 0, 0, 0.1)",
                    width: 300,
                    borderRadius: 5,
                    padding: 10,
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <Button
                      onClick={handleSearch}
                      type="primary"
                      style={{ marginRight: 4 }}
                    >
                      Tìm kiếm
                    </Button>
                    <Input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="lat, lng"
                    />
                  </div>
                  <SearchResults searchResult={searchResult} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Thêm tuyến đường"
        open={open}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={() => setOpen(false)}
      >
        <p>{createMessageCheckWay(highways, fields[0])}</p>
      </Modal>
    </>
  );
};

const SearchResults = ({ searchResult }: { searchResult: any }) => (
  <div style={{ marginTop: 10 }}>
    {["Tên đại diện", "Tên", "Tốc độ tối thiểu", "Tốc độ tối đa"].map(
      (label, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: 4,
            paddingBottom: 4,
          }}
        >
          <Title level={5}>{label}:</Title>
          <Text style={{ marginLeft: 4 }}>
            {searchResult
              ? searchResult[
                  index === 0
                    ? "ref"
                    : index === 1
                    ? "highway_name"
                    : index === 2
                    ? "max_speed"
                    : "min_speed"
                ]
              : "N/A"}
          </Text>
        </div>
      )
    )}
  </div>
);

export default App;
