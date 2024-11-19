import {
  Button,
  Col,
  Form,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import { useEffect, useState, useMemo, useRef } from "react";

const { Paragraph } = Typography;

interface Field {
  ref: string;
  highways: Array<{
    highway_name: string;
    ways: Array<{
      nodes: any;
      lanes: string;
      maxSpeed: string;
      minSpeed: string;
    }>;
  }>;
}

interface FormContainerProps {
  onFinish: (values: any) => void;
  fields: Field[];
  setFields: (fields: Field[]) => void;
  setCollection: (value: string) => void;
  highways: any[];
  loading: boolean;
  handleRefresh: () => void;
  setHighwaySelected: React.Dispatch<any>;
}

const nationalHighways = [
  "QL.17",
  "QL.9E",
  "QL.61B",
  "QL.56",
  "QL.4E",
  "QL.3B",
  "QL.12B",
  "QL.9G",
  "QL.18C",
  "QL.13",
  "QL.37B",
  "QL.21",
  "QL.15D",
  "QL.70B",
  "QL.60",
  "QL.1K",
  "QL.14H",
  "QL.14B",
  "QL.27C",
  "QL.24B",
  "QL.48D",
  "QL.9C",
  "QL.N1",
  "QL.18C",
  "QL.15B",
  "QL.8",
  "QL.53",
  "QL.21C",
  "QL.26B",
  "QL.48",
  "QL.29",
  "QL.26C",
  "QL.48B",
  "QL.45",
  "QL.43",
  "QL.27",
  "QL.1B",
  "QL.2C",
  "QL.12",
  "QL.2",
  "QL.4H",
  "QL.4G",
  "QL.4D",
  "QL.4C",
  "QL.12C",
  "QL.9D",
  "QL.15",
  "QL.14G",
  "QL.14E",
  "QL.14D",
  "QL.15C",
  "QL.17B",
  "QL.23",
  "QL.22B",
  "QL.28B",
  "QL.26",
  "QL.28",
  "QL.38",
  "QL.46B",
  "QL.46C",
  "QL.47C",
  "QL.48E",
  "QL.47",
  "QL.63",
  "QL.61C",
  "QL.62",
  "QL. N1",
  "QL. N2",
  "QL.279D",
  "QL.4",
  "QL.9",
  "QL.5C",
  "QL.27B",
  "QL.8C",
  "QL.7B",
  "QL.9B",
  "QL.19",
  "QL.279C",
  "QL.62;QL.N2",
  "QL.N2",
  "QL.217B",
  "QL.19B",
  "QL.19C",
  "DHCM;QL.12A",
  "QL.217",
  "QL.279",
  "QL.280",
  "QL.281",
  "QL.7",
  "QL.91B",
  "QL.91C",
  "QL.21B",
  "QL.32B",
  "QL. 30B",
  "QL. 57B",
  "QL.57B",
  "QL.38B",
  "QL.3C",
  "QL.1D",
  "QL.6B",
  "QL.4B",
  "QL.47B",
  "QL.48C",
  "QL.8B",
  "QL.2D",
  "QL.49C",
  "QL.10",
  "QL.31",
  "QL.40B",
  "QL.50",
  "QL.51",
  "QL.4A",
  "QL.7C",
  "QL.34B",
  "QL.14", // note: it needs update
  "QL.5",
  "QL.6C",
  "N/A",
  "QL.24",
  "QL.49B",
  "QL.14C",
  "QL.46",
  "QL.55",
  "QL.70",
  "QL.20",
  "QL.25",
  "QL.22",
  "QL.91",
  "QL.39",
  "QL.54",
  "QL.80",
  "QL.61",
  "QL.57",
  "QL.49",
  "QL.12A",
  "QL.34",
  "QL.32",
  "QL.37",
  "QL.6",
  "QL.3",
  "QL.18",
  "QL.16",
  "HCM",
  "DHCM",
  "HCM;QL.217",
  "QL.21;HCM",
  "QL.9;DHCM",
  "HCM;QL.12B",
  "HCM;ĐT.203",
  "HCM;QL.3",
  "DHCM;QL.12A;QL.15",
  "QL.1",
  "QL.14;DHCM",
  "HCM;QL.15",
  "QL.16;HCM",
  "QL.9;HCM",
  "HCM;QL.9",
  "HCM;QL.281",
  "HCM;QL.9B",
  "HCM;QL.15;QL.9E",
  "CT.02;QL.14;DHCM",
  "QL.14;DHCM;AH17",
  "DHCM;CT.02",
  "HCM;QL.15;QL.9B",
  "HCM;QL.3;QL.279",
  "DHCM;QL.46",
  "QL.N2;QL.30B",
  "CT.02;HCM",
  "QL.N2;ĐT.941",
  "QL.N2;ĐT.970",
  "QL.14;HCM;QL.19",
  "QL.14;HCM",
  "DHCM;QL.15",
];

const FormContainer: React.FC<FormContainerProps> = ({
  onFinish,
  fields,
  setFields,
  setCollection,
  highways,
  loading,
  handleRefresh,
  setHighwaySelected,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollLeft = ref.current.scrollWidth;
    }
  }, [ref]);

  useEffect(() => {
    const filteredHighways = selectedItems
      .map((item) => {
        const [ref, id] = item.split(" - ");

        return data.find((d) => d.ref == ref && d.id == id);
      })
      .filter(Boolean);

    setHighwaySelected(filteredHighways);
  }, [selectedItems, data]);

  useEffect(() => {
    if (highways) setData(highways);
  }, [highways]);

  const filteredOptions = useMemo(() => {
    const uniqueRefs = new Set();
    return data
      .filter(
        (o: any) =>
          !selectedItems.includes(`${o.ref} - ${o.id}`) &&
          !uniqueRefs.has(`${o.ref} - ${o.id}`) &&
          !nationalHighways.includes(o.ref)
      )
      .map((item: any) => {
        uniqueRefs.add(`${item.ref} - ${item.id}`);
        return {
          value: `${item.ref} - ${item.id}`,
          label: `${item.ref} - ${item.id}`,
        };
      });
  }, [data, selectedItems]);

  return (
    <div
      ref={ref}
      style={{
        width: "350px",
        alignItems: "center",
        maxHeight: "90vh",
        overflow: "hidden",
        marginRight: 100,
      }}
    >
      <Form
        name="complex-form"
        onFinish={onFinish}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        fields={fields.map((field, index) => ({
          name: `field_${index}`,
          value: field.ref,
        }))}
        onFieldsChange={(_, allFields) => {
          // console.log(allFields);
          setFields([
            {
              ref: allFields[0]?.value || "",
              highways: [
                {
                  highway_name: allFields[1]?.value || "",
                  ways: fields[0]?.highways[0]?.ways?.map((way: any) => ({
                    nodes: way.nodes,
                    lanes: allFields[2]?.value || "",
                    maxSpeed: allFields[3]?.value || "",
                    minSpeed: allFields[4]?.value || "",
                  })),
                },
              ],
            },
          ]);
        }}
      >
        <Form.Item
          label="Tên đại diện"
          name="ref"
          rules={[{ required: true, message: "Tên đại diện không được rỗng" }]}
        >
          <Input placeholder="Tên đại diện" />
        </Form.Item>

        <Form.Item
          label="Tên"
          name="highway_name"
          rules={[{ required: true, message: "Tên không được rỗng" }]}
        >
          <Input placeholder="Vui lòng nhập tên" />
        </Form.Item>

        <Form.Item label="Collection">
          <Select
            virtual={false}
            placeholder="Chọn collection"
            onChange={setCollection}
            options={[
              { value: "highways", label: "Highways" },
              { value: "trunks", label: "Trunk" },
              { value: "tollboths", label: "TollBoths" },
            ]}
          />
          <p style={{ marginLeft: 10, marginTop: 10, marginBottom: 0 }}>
            {data.length}
          </p>
        </Form.Item>

        <Form.Item label="Tốc độ" style={{ marginBottom: 0 }}>
          <Space style={{ width: "100%" }}>
            <Form.Item
              name="max_speed"
              rules={[{ required: true, message: "Không được rỗng" }]}
              style={{ width: "100%" }}
            >
              <Input placeholder="Tốc độ tối đa" />
            </Form.Item>
            <Form.Item
              name="min_speed"
              rules={[{ required: true, message: "Không được rỗng" }]}
              style={{ width: "100%", marginLeft: 8 }}
            >
              <Input placeholder="Tốc độ tối thiểu" />
            </Form.Item>
          </Space>
        </Form.Item>

        <Form.Item label=" " colon={false}>
          <Space>
            <Button loading={loading} type="primary" htmlType="submit">
              Thêm
            </Button>
            <Button
              loading={loading}
              style={{ marginLeft: "10px" }}
              onClick={handleRefresh}
            >
              Tải lại
            </Button>
          </Space>
        </Form.Item>

        <div style={{ display: "flex", position: "relative" }}>
          <Form.Item label="Select" style={{ width: "100%" }}>
            <Select
              mode="multiple"
              placeholder="Inserted are removed"
              value={selectedItems}
              onChange={setSelectedItems}
              style={{ width: "100%" }}
              options={filteredOptions}
            />
          </Form.Item>
          <Button
            onClick={() => {
              setFields([
                {
                  ref: "",
                  highways: [
                    {
                      highway_name: "",
                      ways: [
                        { nodes: [], lanes: "", maxSpeed: "", minSpeed: "" },
                      ],
                    },
                  ],
                },
              ]);
            }}
            style={{ position: "absolute", right: "0px", top: "80%" }}
          >
            Clear
          </Button>
        </div>
      </Form>

      <Paragraph
        style={{
          marginTop: 24,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <pre style={{ border: "none", width: 500 }}>
          {JSON.stringify(fields, null, 2)}
        </pre>
      </Paragraph>
    </div>
  );
};

export default FormContainer;
