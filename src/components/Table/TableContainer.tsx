import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Table,
  Typography,
} from "antd";
import axios from "axios";
import { URL_API } from "../../constant";

interface DataType {
  children: any;
  id: any;
  key: any;
  ref: string;
  highways: {
    id: any;
    highway_name: string;
    maxSpeed: string | number;
    minSpeed: string | number;
    ways: {
      name: string;
      id: any;
      nodes: [];
      maxSpeed: string | number;
      minSpeed: string | number;
      lanes: string;
      buffer_geometry: [];
      bounds: [];
    }[];
    isDelete: number;
  }[];
  isDelete: number;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "number" | "text";
  record: DataType;
  index: number;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: false,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const TableContainer: React.FC<{
  highways: DataType[];
  loading: boolean;
  collection: string;
  handleRefresh: () => void;
  keyWayEdit: any;
}> = ({ highways, loading, collection, handleRefresh, keyWayEdit }) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [data, setData] = useState(highways ?? []);
  const [rowIsDeletes, setRowIsDeletes] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState("Content of the modal");
  const [idDelete, setIdDelete] = useState<string[] | null>(null);
  const [keyDelete, setKeyDelete] = useState<string>("");
  const [currenPage, setCurrentPage] = useState(1);
  const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const pageSize = 10;

  useEffect(() => {
    const rowIsDelete = highways
      .map((item, index) => (item.isDelete === 1 ? `${index}` : null))
      .filter((index) => index !== null);
    const rowIsDeleteChild = highways
      .map((item, i) =>
        item.highways
          .map((highway, j) => (highway.isDelete === 1 ? `${i}-${j}` : null))
          .filter((index) => index !== null)
      )
      .flat();

    setRowIsDeletes([...rowIsDelete, ...rowIsDeleteChild]);

    setData(
      highways.map((item) => ({
        ...item,
        key: `${item.id}`,
        children: item.highways.map((highway) => ({
          key: `${item.id}-${highway.id}`,
          ...highway,
          maxSpeed: highway.maxSpeed,
          minSpeed: highway.minSpeed,
          children: highway.ways.map((way) => ({
            key: `${item.id}-${highway.id}-${way.id}`,
            ...way,
            highway_name: way.name ?? "",
            maxSpeed: way.maxSpeed,
            minSpeed: way.minSpeed,
          })),
        })),
      }))
    );
  }, [highways]);

  useEffect(() => {
    handleFindRow();
  }, [keyWayEdit]);

  const showModal = (key: string) => {
    setModalText("Are you sure? " + key);
    const ids = key.split("-");
    setKeyDelete(key);
    setIdDelete(ids);
    setOpen(true);
  };

  const isEditing = (record: DataType) => record.key === editingKey;

  const edit = (record: Partial<DataType> & { key: React.Key }) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: React.Key) => {
    try {
      const row = await form.validateFields();
      const keys = key.toString().split("-");
      const keyParent = Number(keys[0]);
      const res = await axios.put(
        `${URL_API}/${collection}/update/${keyParent}`,
        {
          key: `${
            keys.length === 2 ? `${keys?.[1]}` : `${keys?.[1]}-${keys?.[2]}`
          }`,
          max_speed: Number(row?.maxSpeed),
          min_speed: Number(row?.minSpeed),
          name: row?.highway_name.trim() === "" ? undefined : row?.highway_name,
        }
      );
      setEditingKey("");
      if (res.status === 200) {
        messageApi.open({
          type: "success",
          content: "Sửa thành công",
        });
      } else {
        messageApi.open({
          type: "error",
          content: "Sửa thất bại",
        });
      }
      // handleRefresh();
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleOk = (type: string) => {
    setModalText(`${type} ${idDelete}...`);
    const fetch = async () => {
      try {
        setConfirmLoading(true);
        const res = await axios.put(
          `${URL_API}/${collection}/${type}/${idDelete?.[0] ?? ""}`,
          {
            indexs: idDelete?.[1] ? [Number(idDelete?.[1])] : [],
            indexsWay: idDelete?.[2] ? [Number(idDelete?.[2])] : [],
          }
        );
        setOpen(false);
        setConfirmLoading(false);
        if (res.status === 200) {
          messageApi.open({
            type: "success",
            content: `${type} thành công`,
          });
        } else {
          messageApi.open({
            type: "error",
            content: "Xóa thất bại",
          });
        }
        // handleRefresh();
      } catch (error) {
        console.error(error);
      }
    };

    fetch();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên đại diện",
      dataIndex: "ref",
      key: "ref",
    },
    {
      title: "Tên tuyến đường",
      dataIndex: "highway_name",
      key: "highway_name",
      editable: true,
    },
    {
      title: "Tốc độ tối đa",
      dataIndex: "maxSpeed",
      key: "maxSpeed",
      editable: true,
    },
    {
      title: "Tốc độ tối thiểu",
      dataIndex: "minSpeed",
      key: "minSpeed",
      editable: true,
    },
    {
      title: "operation",
      dataIndex: "operation",
      render: (_: any, record: DataType) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{ marginInlineEnd: 8 }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <div>
            <Button
              style={{ marginRight: 10 }}
              onClick={() => showModal(record.key)}
              type="primary"
            >
              {rowIsDeletes.includes(record.key) ? "Restore" : "Delete"}
            </Button>
            <Typography.Link
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
            >
              Edit
            </Typography.Link>
          </div>
        );
      },
    },
  ];

  const mergedColumns: TableProps["columns"] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        inputType: col.dataIndex === "age" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleFindRow = () => {
    if (!keyWayEdit) return;
    const key = keyWayEdit?.split("-");
    const rowIndex = data.findIndex((item) => item.id === Number(key[0]));
    if (rowIndex === -1) {
      return;
    }
    const pageIndex = Math.floor(rowIndex / pageSize) + 1;
    setCurrentPage(pageIndex);
  };

  const handleExpand = (expanded: any, record: any) => {
    const newExpandedRowKeys = expanded
      ? [...expandedRowKeys, record.key]
      : expandedRowKeys.filter((key: any) => key !== record.key);

    setExpandedRowKeys(newExpandedRowKeys);
  };

  const generateHierarchicalSegments = (key: string) => {
    if (!key) return [];
    const parts = key.split("-");
    return parts.map((_: any, index: any) =>
      parts.slice(0, index + 1).join("-")
    );
  };

  useEffect(() => {
    const defaultExpandedKeys = generateHierarchicalSegments(keyWayEdit);

    if (defaultExpandedKeys.length > 0) {
      setExpandedRowKeys(defaultExpandedKeys as any);
    }
  }, [keyWayEdit]);

  return (
    <>
      {contextHolder}
      <Form form={form} component={false}>
        <Table
          loading={loading}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowSelection={{ selectedRowKeys: rowIsDeletes }}
          pagination={{
            current: currenPage,
            pageSize: pageSize,
            onChange: (page) => {
              cancel();
              setCurrentPage(page);
            },
          }}
          rowClassName={(record, _) =>
            record.key === keyWayEdit ? "active" : ""
          }
          expandable={{
            expandedRowKeys,
            onExpand: handleExpand,
          }}
        />
      </Form>
      <Modal
        title="Title"
        open={open}
        onOk={() =>
          handleOk(rowIsDeletes.includes(keyDelete) ? "restore" : "delete")
        }
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>{modalText}</p>
      </Modal>
    </>
  );
};

export default TableContainer;
