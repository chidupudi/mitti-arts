// client/src/adminpages/ganeshseason/components/DeleteConfirmationDialog.js
import React from 'react';
import { Modal, Typography, Alert, Space, Card, Row, Col, Divider } from 'antd';
import { 
  ExclamationCircleOutlined, 
  DeleteOutlined, 
  WarningOutlined,
  FireOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  HistoryOutlined,
 PictureOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const DeleteConfirmationDialog = ({
  open,
  onClose,
  idol,
  onConfirm,
}) => {
  if (!idol) return null;

  const averagePrice = idol.priceMin && idol.priceMax ? (idol.priceMin + idol.priceMax) / 2 : 0;
  const advanceAmount = Math.round(averagePrice * (idol.advancePercentage || 25) / 100);
  const imageCount = (idol.images || []).filter(img => img && img !== 'loading').length;

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
          <span style={{ color: '#E65100', fontSize: '18px', fontWeight: 'bold' }}>
            🕉️ Confirm Ganesh Idol Deletion
          </span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={onConfirm}
      okText="🗑️ Delete Idol"
      cancelText="Cancel"
      okType="danger"
      width={500}
      okButtonProps={{
        size: 'large',
        style: {
          background: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
          border: 'none',
          fontWeight: '600'
        }
      }}
      cancelButtonProps={{
        size: 'large'
      }}
      styles={{
        header: {
          background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
          borderBottom: '2px solid #EF5350'
        }
      }}
    >
      <div style={{ marginTop: '16px' }}>
        {/* Critical Warning */}
        <Alert
          message={
            <Space>
              <WarningOutlined />
              <Text strong style={{ color: '#D32F2F' }}>This action cannot be undone!</Text>
            </Space>
          }
          description="Deleting this Ganesh idol will permanently remove it from your inventory and cannot be recovered."
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        {/* Idol Summary Card */}
        <Card
          style={{
            marginBottom: '16px',
            borderColor: '#FFB74D',
            background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 100%)'
          }}
        >
          <Row gutter={16} align="middle">
            {/* Idol Image */}
            <Col span={6}>
              {idol.images?.[0] ? (
                <img
                  src={idol.images[0]}
                  alt={idol.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid #FFB74D'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    background: '#FFF3E0',
                    border: '2px solid #FFB74D',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF8F00'
                  }}
                >
                  <ImageOutlined style={{ fontSize: '24px' }} />
                </div>
              )}
            </Col>

            {/* Idol Details */}
            <Col span={18}>
              <Title level={5} style={{ margin: 0, color: '#E65100' }}>
                🕉️ {idol.name}
              </Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {idol.description?.substring(0, 80)}{idol.description?.length > 80 ? '...' : ''}
              </Text>
              <div style={{ marginTop: '4px' }}>
                <Space size="small">
                  <Text style={{ fontSize: '12px', color: '#8E24AA', fontWeight: 'bold' }}>
                    {idol.category?.toUpperCase()}
                  </Text>
                  {idol.customizable && (
                    <Text style={{ fontSize: '12px', color: '#9C27B0' }}>
                      • CUSTOMIZABLE
                    </Text>
                  )}
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Impact Analysis */}
        <Card
          title={
            <Space>
              <FireOutlined style={{ color: '#FF5722' }} />
              <Text strong style={{ color: '#D32F2F' }}>What will be permanently deleted?</Text>
            </Space>
          }
          style={{ marginBottom: '16px', borderColor: '#FFAB91' }}
          size="small"
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DeleteOutlined style={{ color: '#F44336' }} />
              <Text>Complete idol record and specifications</Text>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageOutlined style={{ color: '#F44336' }} />
              <Text>{imageCount} uploaded image{imageCount !== 1 ? 's' : ''}</Text>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarCircleOutlined style={{ color: '#F44336' }} />
              <Text>Pricing data (₹{idol.priceMin?.toLocaleString()} - ₹{idol.priceMax?.toLocaleString()})</Text>
            </div>
            
            {idol.features && idol.features.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FireOutlined style={{ color: '#F44336' }} />
                <Text>{idol.features.length} feature{idol.features.length !== 1 ? 's' : ''} and highlights</Text>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HistoryOutlined style={{ color: '#F44336' }} />
              <Text>Creation and modification history</Text>
            </div>
          </Space>
        </Card>

        {/* Business Impact */}
        <Card
          title={
            <Space>
              <TeamOutlined style={{ color: '#FF9800' }} />
              <Text strong style={{ color: '#E65100' }}>Business Impact</Text>
            </Space>
          }
          style={{ marginBottom: '16px', borderColor: '#FFE0B2' }}
          size="small"
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: '12px' }}>Average Price:</Text>
              <div>
                <Text strong style={{ color: '#4CAF50' }}>
                  ₹{averagePrice.toLocaleString()}
                </Text>
              </div>
            </Col>
            
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: '12px' }}>Advance Amount:</Text>
              <div>
                <Text strong style={{ color: '#FF9800' }}>
                  ₹{advanceAmount.toLocaleString()}
                </Text>
              </div>
            </Col>
            
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: '12px' }}>Category:</Text>
              <div>
                <Text strong style={{ color: '#8E24AA' }}>
                  {idol.category?.charAt(0).toUpperCase() + idol.category?.slice(1)}
                </Text>
              </div>
            </Col>
            
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: '12px' }}>Availability:</Text>
              <div>
                <Text strong style={{ 
                  color: idol.availability === 'available' ? '#4CAF50' : 
                        idol.availability === 'custom-order' ? '#FF9800' : '#F44336' 
                }}>
                  {idol.availability?.replace('-', ' ').toUpperCase()}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Alternative Actions */}
        <Alert
          message="Consider Alternative Actions"
          description={
            <div>
              <Text type="secondary">
                Instead of deleting, you could:
              </Text>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li><Text type="secondary">Hide the idol from customers (keeps data safe)</Text></li>
                <li><Text type="secondary">Mark as "Sold Out" temporarily</Text></li>
                <li><Text type="secondary">Update the availability status</Text></li>
              </ul>
            </div>
          }
          type="info"
          style={{ marginBottom: '16px' }}
        />

        {/* Final Confirmation */}
        <div style={{ 
          padding: '16px', 
          background: 'rgba(244, 67, 54, 0.05)', 
          borderRadius: '8px', 
          border: '2px solid rgba(244, 67, 54, 0.2)',
          textAlign: 'center'
        }}>
          <Title level={5} style={{ color: '#D32F2F', margin: 0, marginBottom: '8px' }}>
            ⚠️ Final Confirmation Required
          </Title>
          <Text style={{ color: '#D32F2F', fontWeight: 'bold' }}>
            Are you absolutely sure you want to permanently delete "{idol.name}"?
          </Text>
          <div style={{ marginTop: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              This will remove the idol from your Ganesh season inventory forever.
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationDialog;