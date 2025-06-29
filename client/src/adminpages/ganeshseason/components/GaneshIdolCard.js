// client/src/adminpages/ganeshseason/components/GaneshIdolCard.js
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
  Badge,
  Row,
  Col
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  MoreOutlined,
  PictureOutlined,
  ToolOutlined,
  CrownOutlined,
  StarOutlined,
  FireOutlined,
  HeartOutlined,
  ColumnHeightOutlined,
  DashboardOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Meta } = Card;

const GaneshIdolCard = ({ 
  idol, 
  onEdit, 
  onDelete, 
  onToggleHide 
}) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'traditional': return <CrownOutlined />;
      case 'modern': return <StarOutlined />;
      case 'premium': return <FireOutlined />;
      default: return <HeartOutlined />;
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

  const cardStyle = {
    height: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    opacity: idol.hidden ? 0.7 : 1,
    border: idol.hidden ? '2px solid #faad14' : '2px solid #FFE0B2',
    transition: 'all 0.3s ease',
    background: idol.hidden ? 'rgba(255, 193, 7, 0.05)' : 'white',
  };

  const averagePrice = (idol.priceMin + idol.priceMax) / 2;

  return (
    <Badge.Ribbon 
      text="HIDDEN" 
      color="orange"
      style={{ display: idol.hidden ? 'block' : 'none' }}
    >
      <Card
        style={cardStyle}
        hoverable
        cover={
          <div style={{ position: 'relative', height: '220px' }}>
            {idol.images && idol.images.length > 0 && idol.images[0] ? (
              <Image
                src={idol.images[0]}
                alt={idol.name}
                style={{ 
                  width: '100%', 
                  height: '220px', 
                  objectFit: 'cover' 
                }}
                preview={false}
              />
            ) : (
              <div
                style={{
                  height: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FFF3E0',
                  color: '#FF8F00'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <PictureOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
                  <div>🕉️ No Image</div>
                </div>
              </div>
            )}
            
            {/* Category Badge */}
            <Tag
              icon={getCategoryIcon(idol.category)}
              color={getCategoryColor(idol.category)}
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '2px solid white',
                textTransform: 'capitalize'
              }}
            >
              {idol.category}
            </Tag>

            {/* Customizable Badge */}
            {idol.customizable && (
              <Tag
                icon={<ToolOutlined />}
                color="purple"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: '2px solid white'
                }}
              >
                Customizable
              </Tag>
            )}

            {/* Availability Badge */}
            <Tag
              color={getAvailabilityColor(idol.availability)}
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '2px solid white',
                textTransform: 'capitalize'
              }}
            >
              {idol.availability === 'custom-order' ? 'Custom Order' : idol.availability}
            </Tag>
          </div>
        }
        actions={[
          <Tooltip title="Edit Idol">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(idol)}
              style={{ color: '#FF8F00' }}
            />
          </Tooltip>,
          <Tooltip title={idol.hidden ? "Show Idol" : "Hide Idol"}>
            <Button 
              type="text" 
              icon={idol.hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => onToggleHide(idol.id)}
              style={{ color: '#FF8F00' }}
            />
          </Tooltip>,
          <Tooltip title="Delete Idol">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => onDelete(idol)}
            />
          </Tooltip>,
          <Tooltip title="More Options">
            <Button 
              type="text" 
              icon={<MoreOutlined />}
              style={{ color: '#FF8F00' }}
            />
          </Tooltip>,
        ]}
      >
        <Meta
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Title level={5} style={{ margin: 0, fontSize: '16px', color: '#E65100' }}>
                🕉️ {idol.name}
              </Title>
            </div>
          }
          description={
            <Text type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: '13px' }}>
              {idol.description || 'Beautiful Ganesh idol for your festivities'}
            </Text>
          }
        />

        {/* Price Range */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          margin: '16px 0' 
        }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#FF8F00', fontWeight: 700, fontSize: '18px' }}>
              ₹{idol.priceMin?.toLocaleString()} - ₹{idol.priceMax?.toLocaleString()}
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Avg: ₹{averagePrice.toLocaleString()}
            </Text>
          </div>
          <Text style={{ 
            fontSize: '11px', 
            color: '#4CAF50', 
            fontWeight: 'bold',
            background: 'rgba(76, 175, 80, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {idol.estimatedDays || 7} days
          </Text>
        </div>

        {/* Specifications */}
        <Divider style={{ margin: '12px 0' }} />
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Row gutter={8}>
            {idol.height && (
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ColumnHeightOutlined style={{ fontSize: '12px', color: '#FF8F00' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {idol.height}
                  </Text>
                </div>
              </Col>
            )}
            
            {idol.weight && (
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DashboardOutlined style={{ fontSize: '12px', color: '#FF8F00' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {idol.weight}
                  </Text>
                </div>
              </Col>
            )}
          </Row>

          {idol.color && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BgColorsOutlined style={{ fontSize: '12px', color: '#FF8F00' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {idol.color}
              </Text>
            </div>
          )}
          
          {idol.material && (
            <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
              Material: {idol.material}
            </Text>
          )}
        </Space>

        {/* Features */}
        {idol.features && idol.features.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <Text strong style={{ fontSize: '12px', color: '#E65100', marginBottom: '6px', display: 'block' }}>
              Features:
            </Text>
            <Space wrap size="small">
              {idol.features.slice(0, 3).map((feature, index) => (
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
                  {feature}
                </Tag>
              ))}
              {idol.features.length > 3 && (
                <Tag 
                  size="small"
                  style={{ 
                    fontSize: '10px',
                    background: '#FFE0B2',
                    color: '#E65100',
                    border: '1px solid #FF8F00'
                  }}
                >
                  +{idol.features.length - 3} more
                </Tag>
              )}
            </Space>
          </div>
        )}

        {/* Advance Payment Info */}
        <div style={{ 
          marginTop: '12px',
          padding: '8px',
          background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)',
          borderRadius: '6px',
          border: '1px solid #C8E6C9'
        }}>
          <Text style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 'bold' }}>
            💰 Advance: {idol.advancePercentage || 25}% • Est. ₹{Math.round(averagePrice * (idol.advancePercentage || 25) / 100).toLocaleString()}
          </Text>
        </div>

        {/* Status Tags */}
        <Space wrap style={{ marginTop: '12px' }}>
          {idol.hidden && (
            <Tag color="warning" size="small">Hidden</Tag>
          )}
          {idol.customizable && (
            <Tag color="purple" size="small" icon={<ToolOutlined />}>
              Customizable
            </Tag>
          )}
          <Tag 
            color={getAvailabilityColor(idol.availability)} 
            size="small"
            style={{ textTransform: 'capitalize' }}
          >
            {idol.availability}
          </Tag>
        </Space>

        {/* Creation Date */}
        {idol.createdAt && (
          <Text type="secondary" style={{ fontSize: '10px', display: 'block', marginTop: '8px' }}>
            Added: {new Date(idol.createdAt?.seconds ? idol.createdAt.seconds * 1000 : idol.createdAt).toLocaleDateString()}
          </Text>
        )}
      </Card>
    </Badge.Ribbon>
  );
};

export default GaneshIdolCard;