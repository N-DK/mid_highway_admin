import { Button, Form, Input, Select, Space, Typography } from "antd";
const { Paragraph } = Typography;
const { Option } = Select;

const FormContainer = ({
  onFinish,
  fields,
  setFields,
  setCollection,
  highways,
  loading,
  handleRefresh,
}: {
  onFinish: any;
  fields: any;
  setFields: any;
  setCollection: any;
  highways: any;
  loading: any;
  handleRefresh: any;
}) => {
  return (
    <div
      style={{
        width: "600px",
        alignItems: "center",
        maxHeight: "90vh",
        overflow: "auto",
        marginRight: 100,
      }}
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
                  highway_name: allFields[1].value ?? "",
                  maxSpeed: allFields[3].value ?? "",
                  minSpeed: allFields[4].value ?? "",
                  ways: [
                    {
                      nodes: fields[0].highways[0].ways[0].nodes,
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
                // value={collection}
                // defaultValue={collection}
                style={{ width: "100%" }}
                placeholder="Chọn collection"
                onChange={(value) => setCollection(value)}
              >
                <Option value="highways">Highways</Option>
                <Option value="trunks">Trunk</Option>
                <Option value="tollboths">TollBoths</Option>
              </Select>
            </Form.Item>
          </Space.Compact>
          <span style={{ marginLeft: 10 }}>{highways.length}</span>
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
