import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import {
  Button,
  Form,
  Input,
  InputNumber,
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
    highway_name: string;
    maxSpeed: string | number;
    minSpeed: string | number;
    ways: {
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
              required: true,
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
}> = ({ highways, loading, collection, handleRefresh }) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [data, setData] = useState(highways ?? []);
  const [rowIsDeletes, setRowIsDeletes] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState("Content of the modal");
  const [idDelete, setIdDelete] = useState<string[] | null>(null);
  const [keyDelete, setKeyDelete] = useState<string>("");

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
      highways.map((item, i) => ({
        ...item,
        key: `${i}`,
        children: item.highways.map((highway, j) => ({
          key: `${i}-${j}`,
          ...highway,
          maxSpeed: highway.maxSpeed,
          minSpeed: highway.minSpeed,
        })),
      }))
    );
  }, [highways]);

  const showModal = (key: string) => {
    setModalText("Are you sure?");
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

      const newData = [...data];
      const keyParent = key.toString().split("-")[0];
      const index = newData.findIndex((item) => keyParent === item.key);
      const indexChild = newData[index]?.children.findIndex(
        (item: any) => key === item.key
      );
      // newData[index].children[indexChild] = {
      //   ...newData[index].children[indexChild],
      //   maxSpeed: Number(row?.maxSpeed),
      //   minSpeed: Number(row?.minSpeed),
      // };
      // setData(newData);
      await axios.put(`${URL_API}/${collection}/update/${index}`, {
        index: indexChild,
        max_speed: Number(row?.maxSpeed),
        min_speed: Number(row?.minSpeed),
      });
      setEditingKey("");
      handleRefresh();
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleOk = (type: string) => {
    setModalText(`${type} ${idDelete}...`);
    const fetch = async () => {
      try {
        setConfirmLoading(true);
        await axios.put(
          `${URL_API}/${collection}/${type}/${idDelete?.[0] ?? ""}`,
          {
            indexs: idDelete?.[1] ? [Number(idDelete?.[1])] : [],
          }
        );
        setOpen(false);
        setConfirmLoading(false);
        handleRefresh();
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

  return (
    <>
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
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
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
