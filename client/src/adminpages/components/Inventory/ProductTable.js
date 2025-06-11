import React from 'react';
import {
  Table,
  Avatar,
  Typography,
  Tag,
  Button,
  Space,
  Tooltip,
  Image,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  BgColorsOutlined,
  ColumnWidthOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const ProductTable = ({ 
  products, 
  page, 
  rowsPerPage, 
  totalCount,
  onEdit, 
  onDelete, 
  onToggleHide,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  const getStockColor = (stock) => {
    if (stock > 10) return 'success';
    if (stock > 0) return 'warning';
    return 'error';
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {record.images?.[0] ? (
            <Avatar
              src={record.images[0]}
              size={48}
              shape="square"
            />
          ) : (
            <Avatar
              size={48}
              shape="square"
              style={{ backgroundColor: '#f5f5f5' }}
              icon={<PictureOutlined style={{ color: '#d9d9d9' }} />}
            />
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text strong style={{ fontSize: '14px' }}>
                {record.name}
              </Text>
              {record.hyderabadOnly && (
                <Tag 
                  icon={<EnvironmentOutlined />}
                  color="purple" 
                  size="small"
                >
                  Hyderabad Only
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description?.substring(0, 50)}
              {record.description?.length > 50 ? '...' : ''}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (code) => (
        <Text type="secondary">{code || '-'}</Text>
      ),
    },
    {
      title: 'Specifications',
      dataIndex: 'specifications',
      key: 'specifications',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.color && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BgColorsOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.color}
              </Text>
            </div>
          )}
          
          {record.dimensions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ColumnWidthOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.dimensions}
              </Text>
            </div>
          )}
          
          {record.weight && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ExperimentOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.weight}
              </Text>
            </div>
          )}
          
          {!record.color && !record.dimensions && !record.weight && (
            <Text type="secondary">-</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text strong style={{ color: '#D2691E', fontSize: '14px' }}>
          ₹{price?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={getStockColor(stock)}>
          {stock}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.hidden && (
            <Tag color="warning">Hidden</Tag>
          )}
          <Tag color={record.inStock ? "success" : "error"}>
            {record.inStock ? "In Stock" : "Out of Stock"}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.hidden ? "Show" : "Hide"}>
            <Button 
              type="text" 
              size="small"
              icon={record.hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => onToggleHide(record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={products}
      rowKey="id"
      pagination={{
        current: page + 1,
        pageSize: rowsPerPage,
        total: totalCount,
        onChange: (page, pageSize) => {
          onChangePage(null, page - 1);
          if (pageSize !== rowsPerPage) {
            onChangeRowsPerPage({ target: { value: pageSize } });
          }
        },
        showSizeChanger: true,
        pageSizeOptions: ['12', '24', '48', '96'],
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} products`,
      }}
      scroll={{ x: 800 }}
      style={{ borderRadius: '8px' }}
    />
  );
};

export default ProductTable;