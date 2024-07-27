import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  message,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
const { Paragraph } = Typography;
const { Option } = Select;
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import MapWrapper from "./components/MapWrapper/MapWrapper";
import { FeatureGroup, Polygon } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import axios from "axios";
import { LoadingOutlined } from "@ant-design/icons";

const URL_API = "http://localhost:3000/api/v1";

const App: React.FC = () => {
  const [fields, setFields] = useState<any[]>([
    {
      ref: "",
      highways: [
        {
          highway_name: "",
          ways: [
            {
              nodes: [],
              maxSpeed: "" ?? "",
              minSpeed: "" ?? "",
              lanes: "",
            },
          ],
        },
      ],
    },
  ]);
  const [collection, setCollection] = useState("highways");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMap, setLoadingMap] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [highways, setHighways] = useState<any[]>([]);

  const handleRefresh = async () => {
    setLoadingMap(true);
    const res = await axios.get(`${URL_API}/${collection}/get-all`);
    setLoadingMap(false);
    setHighways(res.data);
  };

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

  const handleCreated = (e: any) => {
    const { layer } = e;
    updateHighways(() =>
      layer._latlngs.map((latLng: any) => [
        Number(latLng.lat.toFixed(7)),
        Number(latLng.lng.toFixed(7)),
      ])
    );
  };

  const handleDeleted = () => {
    updateHighways(() => []);
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

  const onFinish = () => {
    const sendData = async () => {
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

    sendData();

    console.log("Received values of form: ", fields);
  };

  return (
    <>
      {contextHolder}
      <Space
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Space
          style={{
            width: "600px",
            alignItems: "center",
            maxHeight: "90vh",
            overflow: "auto",
          }}
          direction="vertical"
        >
          <Form
            name="complex-form"
            onFinish={onFinish}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            fields={fields}
            onFieldsChange={(_, allFields) => {
              setFields([
                {
                  ref: allFields[0].value,
                  highways: [
                    {
                      highway_name: allFields[1].value,
                      ways: [
                        {
                          nodes: fields[0].highways[0].ways[0].nodes,
                          maxSpeed: allFields[3].value ?? "",
                          minSpeed: allFields[4].value ?? "",
                          lanes: "",
                        },
                      ],
                    },
                  ],
                },
              ]);
            }}
          >
            <Form.Item label="Tên đại diện">
              <Space>
                <Form.Item
                  name="ref"
                  noStyle
                  rules={[
                    { required: true, message: "Tên đại diện không được rỗng" },
                  ]}
                >
                  <Input style={{ width: "100%" }} placeholder="Tên đại diện" />
                </Form.Item>
              </Space>
            </Form.Item>
            <Form.Item label="Tên">
              <Space>
                <Form.Item
                  name="highway_name"
                  noStyle
                  rules={[{ required: true, message: "Tên không được rỗng" }]}
                >
                  <Input
                    style={{ width: "100%" }}
                    placeholder="Vui lòng nhập tên"
                  />
                </Form.Item>
              </Space>
            </Form.Item>
            <Form.Item label="Collection">
              <Space.Compact>
                <Form.Item
                  style={{ width: "100%" }}
                  name={["address", "province"]}
                  noStyle
                  rules={[
                    { required: true, message: "Collection không được rỗng" },
                  ]}
                >
                  <Select
                    value={collection}
                    defaultValue={collection}
                    style={{ width: "100%" }}
                    placeholder="Chọn collection"
                    onChange={(value) => setCollection(value)}
                  >
                    <Option value="highways">Highways</Option>
                    <Option value="trunk">Trunk</Option>
                  </Select>
                </Form.Item>
              </Space.Compact>
            </Form.Item>
            <Form.Item label="Tốc độ" style={{ marginBottom: 0 }}>
              <Form.Item
                name="max_speed"
                rules={[{ required: true, message: "Không được rỗng" }]}
                style={{ display: "inline-block", width: "calc(50% - 8px)" }}
              >
                <Input placeholder="Tốc độ tối đa" />
              </Form.Item>
              <Form.Item
                name="min_speed"
                rules={[{ required: true, message: "Không được rỗng" }]}
                style={{
                  display: "inline-block",
                  width: "calc(50% - 8px)",
                  margin: "0 8px",
                }}
              >
                <Input placeholder="Tốc độ tối thiểu" />
              </Form.Item>
            </Form.Item>
            <Form.Item label=" " colon={false}>
              <Button loading={loading} type="primary" htmlType="submit">
                Thêm
              </Button>
              <Button
                loading={loading}
                style={{ marginLeft: "10px" }}
                type="primary"
                onClick={handleRefresh}
              >
                Tải lại
              </Button>
            </Form.Item>
          </Form>
          <Paragraph style={{ maxWidth: 440, marginTop: 24, width: 440 }}>
            <pre style={{ border: "none" }}>
              {JSON.stringify(fields, null, 2)}
            </pre>
          </Paragraph>
        </Space>
        <Space
          style={{
            width: "1200px",
            height: "90vh",
            flex: 1,
          }}
        >
          {loadingMap ? (
            <div
              style={{
                background: "#f4f4f4",
                width: "1200px",
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
                {highways?.map((ref) =>
                  ref.highways.map((highway: any) =>
                    highway.ways.map((way: any) => (
                      <Polygon positions={way.buffer_geometry} color="red" />
                    ))
                  )
                )}
              </FeatureGroup>
            </MapWrapper>
          )}
        </Space>
      </Space>
    </>
  );
};

export default App;
