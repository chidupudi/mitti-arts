// client/src/adminpages/ganeshseason/components/GaneshIdolTable.js
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
  Progress,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PictureOutlined,
  ToolOutlined,
  CrownOutlined,
  StarOutlined,
  FireOutlined,
  RulerOutlined,
  ScaleOutlined,
  BgColorsOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const GaneshIdolTable = ({ 
  idols, 
  page, 
  rowsPerPage, 
  totalCount,
  onEdit, 
  onDelete, 
  onToggleHide,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'traditional': return <CrownOutlined />;
      case 'modern': return <StarOutlined />;
      case 'premium': return <FireOutlined />;
      default: return <StarOutlined />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'traditional': return '#8E24AA';
      case 'modern': return '#1976D2';
      case 'premium': return '#D32F2F';
      default: return '#FF8F00';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return 'success';
      case 'custom-order': return 'warning';
      case 'sold-out': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Ganesh Idol',
      dataIndex: 'idol',
      key: 'idol',
      width: 300,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {record.images?.[0] ? (
            <Avatar
              src={record.images[0]}
              size={56}
              shape="square"
              style={{ borderRadius: '8px' }}
            />
          ) : (
            <Avatar
              size={56}
              shape="square"
              style={{ 
                backgroundColor: '#FFF3E0', 
                color: '#FF8F00',
                borderRadius: '8px',
                border: '2px solid #FFE0B2'
              }}
              icon={<PictureOutlined style={{ fontSize: '24px' }} />}
            />
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text strong style={{ fontSize: '14px', color: '#E65100' }}>
                🕉️ {record.name}
              </Text>
              {record.customizable && (
                <Tag 
                  icon={<ToolOutlined />}
                  color="purple" 
                  size="small"
                  style={{ fontSize: '10px' }}
                >
                  Customizable
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description?.substring(0, 40)}
              {record.description?.length > 40 ? '...' : ''}
            </Text>
            {record.material && (
              <div style={{ marginTop: '2px' }}>
                <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                  {record.material}
                </Text>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => (
        <Tag
          icon={getCategoryIcon(category)}
          color={getCategoryColor(category)}
          style={{
            fontWeight: 600,
            textTransform: 'capitalize',
            borderRadius: '8px'
          }}
        >
          {category}
        </Tag>
      ),
    },
    {
      title: 'Specifications',
      dataIndex: 'specifications',
      key: 'specifications',
      width: 160,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.height && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RulerOutlined style={{ fontSize: '12px', color: '#FF8F00' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                H: {record.height}
              </Text>
            </div>
          )}
          
          {record.weight && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ScaleOutlined style={{ fontSize: '12px', color: '#FF8F00' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                W: {record.weight}
              </Text>
            </div>
          )}
          
          {record.color && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BgColorsOutlined style={{ fontSize: '12px', color: '#FF8F00' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.color}
              </Text>
            </div>
          )}
          
          {!record.height && !record.weight && !record.color && (
            <Text type="secondary" style={{ fontSize: '12px' }}>-</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Price Range',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (_, record) => {
        const averagePrice = (record.priceMin + record.priceMax) / 2;
        const pricePercentage = ((averagePrice - 7000) / (31000 - 7000)) * 100;
        
        return (
          <div>
            <Text strong style={{ color: '#FF8F00', fontSize: '14px', display: 'block' }}>
              ₹{record.priceMin?.toLocaleString()} - ₹{record.priceMax?.toLocaleString()}
            </Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Avg: ₹{averagePrice.toLocaleString()}
            </Text>
            <Progress 
              percent={pricePercentage} 
              size="small" 
              showInfo={false}
              strokeColor={{
                '0%': '#FFE0B2',
                '50%': '#FF8F00',
                '100%': '#E65100',
              }}
              style={{ marginTop: '4px' }}
            />
          </div>
        );
      },
    },
    {
      title: 'Advance & Time',
      dataIndex: 'advance',
      key: 'advance',
      width: 130,
      render: (_, record) => {
        const averagePrice = (record.priceMin + record.priceMax) / 2;
        const advanceAmount = Math.round(averagePrice * (record.advancePercentage || 25) / 100);
        
        return (
          <Space direction="vertical" size="small">
            <div style={{ 
              background: 'rgba(76, 175, 80, 0.1)',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #C8E6C9'
            }}>
              <Text style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 'bold' }}>
                💰 ₹{advanceAmount.toLocaleString()}
              </Text>
              <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>
                ({record.advancePercentage || 25}% advance)
              </Text>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ClockCircleOutlined style={{ fontSize: '12px', color: '#4CAF50' }} />
              <Text style={{ fontSize: '11px', color: '#4CAF50', fontWeight: 'bold' }}>
                {record.estimatedDays || 7} days
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Features',
      dataIndex: 'features',
      key: 'features',
      width: 180,
      render: (features) => (
        <div>
          {features && features.length > 0 ? (
            <Space wrap size="small">
              {features.slice(0, 2).map((feature, index) => (
                <Tag 
                  key={index}
                  size="small"
                  style={{ 
                    fontSize: '10px',
                    background: '#FFF3E0',
                    color: '#E65100',
                    border: '1px solid #FFE0B2',
                    borderRadius: '4px'
                  }}
                >
                  {feature.length > 12 ? `${feature.substring(0, 12)}...` : feature}
                </Tag>
              ))}
              {features.length > 2 && (
                <Tag 
                  size="small"
                  style={{ 
                    fontSize: '10px',
                    background: '#FFE0B2',
                    color: '#E65100',
                    border: '1px solid #FF8F00'
                  }}
                >
                  +{features.length - 2}
                </Tag>
              )}
            </Space>
          ) : (
            <Text type="secondary" style={{ fontSize: '12px' }}>No features listed</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.hidden && (
            <Tag color="warning" size="small">Hidden</Tag>
          )}
          <Tag 
            color={getAvailabilityColor(record.availability)} 
            size="small"
            style={{ textTransform: 'capitalize' }}
          >
            {record.availability === 'custom-order' ? 'Custom Order' : record.availability}
          </Tag>
          {record.customizable && (
            <Tag color="purple" size="small" icon={<ToolOutlined />}>
              Custom
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Idol">
            <Button 
              type="text" 
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              style={{ color: '#FF8F00' }}
            />
          </Tooltip>
          <Tooltip title={record.hidden ? "Show Idol" : "Hide Idol"}>
            <Button 
              type="text" 
              size="small"
              icon={record.hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => onToggleHide(record.id)}
              style={{ color: '#FF8F00' }}
            />
          </Tooltip>
          <Tooltip title="Delete Idol">
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
      dataSource={idols}
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
        pageSizeOptions: ['10', '25', '50', '100'],
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} Ganesh idols`,
        style: {
          background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
          borderRadius: '8px',
          padding: '12px'
        }
      }}
      scroll={{ x: 1200 }}
      style={{ 
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid #FFE0B2'
      }}
      rowClassName={(record) => 
        record.hidden ? 'hidden-row' : ''
      }
      components={{
        header: {
          cell: (props) => (
            <th 
              {...props} 
              style={{
                ...props.style,
                background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
                color: 'white',
                fontWeight: 'bold',
                borderBottom: '2px solid #E65100'
              }}
            />
          ),
        },
      }}
    />
  );
};

// Add custom styles for hidden rows
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .ant-table-tbody .hidden-row {
    background-color: rgba(255, 193, 7, 0.05) !important;
    opacity: 0.7;
  }
  .ant-table-tbody .hidden-row:hover {
    background-color: rgba(255, 193, 7, 0.1) !important;
  }
`;
document.head.appendChild(styleSheet);

export default GaneshIdolTable;
