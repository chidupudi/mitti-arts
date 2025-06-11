import React from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Tag, 
  Tooltip, 
  Divider,
  Image,
  Badge
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  MoreOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  BgColorsOutlined,
  ColumnWidthOutlined,
  ExperimentOutlined,
  
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Meta } = Card;

const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleHide 
}) => {
  const getStockColor = (stock) => {
    if (stock > 10) return 'success';
    if (stock > 0) return 'warning';
    return 'error';
  };

  const cardStyle = {
    height: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    opacity: product.hidden ? 0.7 : 1,
    border: product.hidden ? '2px solid #faad14' : '1px solid #f0f0f0',
    transition: 'all 0.3s ease',
  };

  if (product.hidden) {
    cardStyle.position = 'relative';
  }

  return (
    <Badge.Ribbon 
      text="HIDDEN" 
      color="orange"
      style={{ display: product.hidden ? 'block' : 'none' }}
    >
      <Card
        style={cardStyle}
        hoverable
        cover={
          <div style={{ position: 'relative', height: '200px' }}>
            {product.images && product.images.length > 0 && product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover' 
                }}
                preview={false}
              />
            ) : (
              <div
                style={{
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <PictureOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
              </div>
            )}
            
            {/* Hyderabad-Only Badge */}
            {product.hyderabadOnly && (
              <Tag
                icon={<EnvironmentOutlined />}
                color="purple"
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  fontWeight: 600,
                }}
              >
                Hyderabad Only
              </Tag>
            )}
          </div>
        }
        actions={[
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(product)}
            />
          </Tooltip>,
          <Tooltip title={product.hidden ? "Show" : "Hide"}>
            <Button 
              type="text" 
              icon={product.hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => onToggleHide(product.id)}
            />
          </Tooltip>,
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => onDelete(product)}
            />
          </Tooltip>,
          <Tooltip title="More">
            <Button 
              type="text" 
              icon={<MoreOutlined />}
            />
          </Tooltip>,
        ]}
      >
        <Meta
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                {product.name}
              </Title>
            </div>
          }
          description={
            <Text type="secondary" ellipsis={{ rows: 2 }}>
              {product.description || 'No description available'}
            </Text>
          }
        />

        {/* Price and Stock */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          margin: '16px 0' 
        }}>
          <Title level={4} style={{ margin: 0, color: '#D2691E', fontWeight: 700 }}>
            ₹{product.price?.toLocaleString()}
          </Title>
          <Tag color={getStockColor(product.stock)}>
            Stock: {product.stock}
          </Tag>
        </div>

        {/* Product Specifications */}
        {(product.color || product.dimensions || product.weight) && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {product.color && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <BgColorsOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {product.color}
                  </Text>
                </div>
              )}
              
              {product.dimensions && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ColumnWidthOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {product.dimensions}
                  </Text>
                </div>
              )}
              
              {product.weight && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ExperimentOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {product.weight}
                  </Text>
                </div>
              )}
            </Space>
          </>
        )}

        {/* Product Code */}
        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
          Code: {product.code || 'N/A'}
        </Text>

        {/* Status Tags */}
        <Space wrap style={{ marginTop: '12px' }}>
          {product.hidden && (
            <Tag color="warning">Hidden</Tag>
          )}
          <Tag color={product.inStock ? "success" : "error"}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </Tag>
          {product.hyderabadOnly && (
            <Tag color="purple" icon={<EnvironmentOutlined />}>
              Hyderabad Only
            </Tag>
          )}
        </Space>
      </Card>
    </Badge.Ribbon>
  );
};

export default ProductCard;