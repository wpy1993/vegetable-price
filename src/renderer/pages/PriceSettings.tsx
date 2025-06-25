import React, { useState, useEffect } from 'react'
import { storageService, PriceItem } from '../services/storage'
import { Table, Input, Button, Space, Card, Typography, Form, InputNumber, Popconfirm, message, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType: 'text' | 'number';
  record: PriceItem;
  index: number;
  children: React.ReactNode;
}

interface EditableColumnType extends Omit<ColumnsType<PriceItem>[0], 'editable'> {
  editable?: boolean;
  dataIndex?: string;
}

const PriceSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<PriceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)

  // 从本地文件读取数据
  const loadData = async () => {
    try {
      const data = await storageService.readData()
      setItems(data)
    } catch (error) {
      console.error('Failed to load data:', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = async (values: { name: string; price: number }) => {
    try {
      const newData = [...items, {
        id: Date.now(),
        name: values.name,
        price: values.price
      }]

      await storageService.writeData(newData)
      setItems(newData)
      form.resetFields()
      message.success('添加成功')
    } catch (error) {
      console.error('Failed to add item:', error)
      message.error('添加失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const newData = items.filter(item => item.id !== id)
      await storageService.writeData(newData)
      setItems(newData)
      message.success('删除成功')
    } catch (error) {
      console.error('Failed to delete item:', error)
      message.error('删除失败')
    }
  }

  const handleEdit = async (id: number) => {
    try {
      const row = await form.validateFields();
      const newData = items.map(item =>
        item.id === id
          ? { ...item, name: row.name, price: row.price }
          : item
      )
      await storageService.writeData(newData)
      setItems(newData)
      setEditingId(null)
      message.success('修改成功')
    } catch (error) {
      console.error('Failed to edit item:', error)
      message.error('修改失败')
    }
  }

  const isEditing = (record: PriceItem) => record.id === editingId;

  const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'number' ? <InputNumber min={0} precision={2} /> : <Input />;

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `请输入${title}!`,
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

  const columns: EditableColumnType[] = [
    {
      title: '菜品名称',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      editable: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: '30%',
      editable: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => handleEdit(record.id)}
            >
              保存
            </Button>
            <Button onClick={() => setEditingId(null)}>
              取消
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingId(record.id);
                form.setFieldsValue(record);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除吗？"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: PriceItem) => ({
        record,
        inputType: col.dataIndex === 'price' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title as string,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Spin spinning={loading}>
      <div className="price-settings">
        <Card>
          <Title level={2}>设置默认价格</Title>

          <Form
            form={form}
            name="addPrice"
            onFinish={handleAdd}
            layout="inline"
            style={{ marginBottom: 24 }}
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: '请输入菜品名称!' }]}
            >
              <Input placeholder="菜品名称" style={{ width: 200 }} />
            </Form.Item>

            <Form.Item
              name="price"
              rules={[{ required: true, message: '请输入价格!' }]}
            >
              <InputNumber
                placeholder="价格"
                min={0}
                precision={2}
                style={{ width: 150 }}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                添加
              </Button>
            </Form.Item>
          </Form>

          <Form form={form} component={false}>
            <Table
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              bordered
              dataSource={items}
              columns={mergedColumns}
              rowClassName="editable-row"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          </Form>
        </Card>
      </div>
    </Spin>
  )
}

export default PriceSettings 