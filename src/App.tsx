import React, { ReactNode, useEffect, useState } from "react";
import { Button, message, Modal } from "antd";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import axios from "axios";
import { Map } from "./components/Map";
import { FormContainer } from "./components/Form";
import { TableContainer } from "./components/Table";
import { URL_API } from "./constant";
import { createMessageCheckWay } from "./utils";

let isHandling = false;

const App: React.FC = () => {
  const [fields, setFields] = useState<any[]>([
    {
      ref: "",
      highways: [
        {
          highway_name: "",
          maxSpeed: "" ?? "",
          minSpeed: "" ?? "",
          ways: [
            {
              nodes: [],
              lanes: "",
            },
          ],
        },
      ],
    },
  ]);
  const [collection, setCollection] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMap, setLoadingMap] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [highways, setHighways] = useState<any[]>([]);
  const [tab, setTab] = useState<ReactNode>("map");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      handleRefresh();
    };

    fetchData();
  }, [collection]);

  const updateHighways = (updateNodes: (nodes: any[]) => any[]) => {
    setFields((prev: any) =>
      prev.map((field: any) => ({
        ...field,
        highways: [
          {
            ...field.highways[0],
            ways: [
              {
                ...field.highways[0].ways[0],
                nodes: updateNodes(field.highways[0].ways[0].nodes),
              },
            ],
          },
        ],
      }))
    );
  };

  const handleRefresh = async () => {
    if (collection !== "") {
      setLoadingMap(true);
      const res = await axios.get(`${URL_API}/${collection}/get-all`);
      setLoadingMap(false);
      setHighways(res?.data ?? []);
    }
  };

  const handleCreated = (e: any) => {
    const { layer } = e;
    updateHighways(() =>
      layer._latlngs.map((latLng: any) => [
        Number(latLng.lat.toFixed(7)),
        Number(latLng.lng.toFixed(7)),
      ])
    );
  };

  const handleDeleted = (e: any) => {
    if (isHandling) return;
    isHandling = true;

    if (collection === "tollboths") {
      const { layers } = e;
      layers.eachLayer(async (layer: any) => {
        const id = Number(layer.options.className);
        await axios.put(`${URL_API}/${collection}/delete/${id}`, {
          indexs: [],
        });
        handleRefresh();
      });
    }

    updateHighways(() => []);

    setTimeout(() => {
      isHandling = false;
    }, 0);
  };

  const handleEdited = (e: any) => {
    const {
      layers: { _layers },
    } = e;
    const newLayer: any = Object.values(_layers)[0];
    updateHighways(() =>
      newLayer._latlngs.map((latLng: any) => [
        Number(latLng.lat.toFixed(7)),
        Number(latLng.lng.toFixed(7)),
      ])
    );
  };

  const handleOk = async () => {
    setLoading(true);
    const res = await axios.post(`${URL_API}/${collection}`, fields[0]);
    setLoading(false);
    console.log(res);
    if (res.status === 200) {
      messageApi.open({
        type: "success",
        content: "Thêm thành công",
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Thêm thất bại",
      });
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onFinish = () => {
    setOpen(true);
  };

  return (
    <>
      {contextHolder}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        <FormContainer
          onFinish={onFinish}
          fields={fields}
          setFields={setFields}
          setCollection={setCollection}
          highways={highways}
          handleRefresh={handleRefresh}
          loading={loading}
        />
        <div
          style={{
            height: "90vh",
            flex: 1,
            position: "relative",
          }}
        >
          <div style={{ display: `${tab === "map" ? "block" : "none"}` }}>
            <Map
              loadingMap={loadingMap}
              collection={collection}
              handleCreated={handleCreated}
              handleDeleted={handleDeleted}
              handleEdited={handleEdited}
              highways={highways}
            />
          </div>
          <div style={{ display: `${tab === "table" ? "block" : "none"}` }}>
            <TableContainer
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
              left: -75,
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
            <Button onClick={() => setTab("table")} type="primary">
              Table
            </Button>
          </div>
        </div>
      </div>
      <Modal
        title="Thêm tuyến đường"
        open={open}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={handleCancel}
      >
        <p>{createMessageCheckWay(highways, fields[0])}</p>
      </Modal>
    </>
  );
};

export default App;
