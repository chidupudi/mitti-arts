import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Button,
  Tag,
  Timeline,
  Avatar,
  Empty,
  Spin,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Badge,
  Steps,
  Collapse,
  Modal,
  Image,
  Tooltip,
  Progress,
  Statistic,
  List,
  Rate,
  notification
} from 'antd';
import {
  ShoppingCartOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CreditCardOutlined,
  EyeOutlined,
  ReloadOutlined,
  StarOutlined,
  GiftOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ShopOutlined,
  HeartOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { auth, db } from '../Firebase/Firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;

// Terracotta Theme Colors
const terracottaTheme = {
  primary: '#D2691E',      // Terracotta
  secondary: '#CD853F',    // Peru
  accent: '#F4A460',       // Sandy Brown
  dark: '#A0522D',         // Sienna
  light: '#FFEEE6',        // Very light terracotta
  success: '#6B7821',      // Olive green
  warning: '#FF8F00',      // Amber
  error: '#C62828',        // Red
  text: {
    primary: '#3D405B',    // Dark blue-grey
    secondary: '#797B8E'   // Medium blue-grey
  }
};

// Inline CSS Styles with Terracotta Theme
const styles = {
  // Main container styles
  pageContainer: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.secondary} 50%, ${terracottaTheme.accent} 100%)`,
    padding: '20px 0'
  },
  
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },

  // Card styles
  headerCard: {
    borderRadius: '20px',
    marginBottom: '24px',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    border: 'none',
    boxShadow: `0 8px 32px rgba(210, 105, 30, 0.15)`
  },

  orderCard: {
    borderRadius: '16px',
    marginBottom: '24px',
    border: `2px solid ${terracottaTheme.light}`,
    boxShadow: `0 4px 12px rgba(210, 105, 30, 0.1)`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer'
  },

  orderCardHover: {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 48px rgba(210, 105, 30, 0.25)`,
    borderColor: terracottaTheme.primary
  },

  productItemCard: {
    marginBottom: '12px',
    borderRadius: '12px',
    border: `1px solid ${terracottaTheme.light}`,
    boxShadow: `0 2px 8px rgba(210, 105, 30, 0.08)`,
    transition: 'all 0.2s ease',
    background: 'rgba(255, 255, 255, 0.9)'
  },

  glassCard: {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    border: `1px solid rgba(210, 105, 30, 0.18)`,
    boxShadow: `0 8px 32px rgba(210, 105, 30, 0.2)`,
    borderRadius: '12px'
  },

  // Button styles
  primaryButton: {
    background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.accent} 100%)`,
    border: 'none',
    boxShadow: `0 4px 12px rgba(210, 105, 30, 0.3)`,
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    color: 'white'
  },

  primaryButtonHover: {
    background: `linear-gradient(135deg, ${terracottaTheme.dark} 0%, ${terracottaTheme.primary} 100%)`,
    boxShadow: `0 6px 20px rgba(210, 105, 30, 0.4)`,
    transform: 'translateY(-2px)'
  },

  secondaryButton: {
    borderColor: terracottaTheme.primary,
    color: terracottaTheme.primary,
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },

  // Text styles
  gradientText: {
    background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.secondary} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 600
  },

  // Loading styles
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80vh',
    background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.secondary} 100%)`
  },

  loadingCard: {
    textAlign: 'center',
    borderRadius: '16px',
    padding: '40px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: 'none',
    boxShadow: `0 8px 32px rgba(210, 105, 30, 0.15)`
  },

  // Empty state styles
  emptyStateCard: {
    borderRadius: '20px',
    textAlign: 'center',
    padding: '60px 40px',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    border: 'none'
  },

  // Modal styles
  modalHeader: {
    background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.secondary} 100%)`,
    borderRadius: '8px 8px 0 0'
  },

  // Item preview styles
  itemPreviewCard: {
    marginBottom: '16px',
    borderRadius: '12px',
    backgroundColor: terracottaTheme.light,
    border: `1px solid ${terracottaTheme.accent}`
  },

  // Quick actions styles
  quickActionButton: {
    borderRadius: '8px',
    fontSize: '12px',
    height: '32px',
    borderColor: terracottaTheme.primary,
    color: terracottaTheme.primary
  },

  // Status badge styles
  statusBadge: {
    borderRadius: '16px',
    fontWeight: 500,
    padding: '4px 12px',
    border: 'none',
    boxShadow: `0 2px 4px rgba(210, 105, 30, 0.15)`
  },

  // Terracotta themed status colors
  statusColors: {
    delivered: terracottaTheme.success,
    shipped: terracottaTheme.primary,
    processing: terracottaTheme.warning,
    ordered: terracottaTheme.secondary
  }
};

// Enhanced Order Status Component with Terracotta Theme
const OrderStatusBadge = ({ status, paymentStatus }) => {
  const getStatusConfig = () => {
    if (status === 'Delivered') {
      return { 
        color: styles.statusColors.delivered, 
        text: 'Delivered', 
        icon: <CheckCircleOutlined />,
        bgColor: 'rgba(107, 120, 33, 0.1)'
      };
    } else if (status === 'Shipped') {
      return { 
        color: styles.statusColors.shipped, 
        text: 'In Transit', 
        icon: <TruckOutlined />,
        bgColor: 'rgba(210, 105, 30, 0.1)'
      };
    } else if (status === 'Processing') {
      return { 
        color: styles.statusColors.processing, 
        text: 'Processing', 
        icon: <ClockCircleOutlined />,
        bgColor: 'rgba(255, 143, 0, 0.1)'
      };
    } else {
      return { 
        color: styles.statusColors.ordered, 
        text: 'Confirmed', 
        icon: <ShoppingCartOutlined />,
        bgColor: 'rgba(205, 133, 63, 0.1)'
      };
    }
  };

  const config = getStatusConfig();
  
  return (
    <Space>
      <Tag 
        color={config.color}
        icon={config.icon}
        style={{
          ...styles.statusBadge,
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}`
        }}
      >
        {config.text}
      </Tag>
      {paymentStatus === 'COMPLETED' && (
        <Tag 
          color={terracottaTheme.success}
          icon={<DollarOutlined />}
          style={{
            ...styles.statusBadge,
            backgroundColor: 'rgba(107, 120, 33, 0.1)',
            color: terracottaTheme.success,
            border: `1px solid ${terracottaTheme.success}`
          }}
        >
          Paid
        </Tag>
      )}
    </Space>
  );
};

// Order Progress Tracker with Terracotta Theme
const OrderProgress = ({ status, orderDate, deliveryDate }) => {
  const getActiveStep = () => {
    switch (status) {
      case 'Delivered': return 3;
      case 'Shipped': return 2;
      case 'Processing': return 1;
      default: return 0;
    }
  };

  const steps = [
    {
      title: 'Order Placed',
      description: new Date(orderDate).toLocaleDateString(),
      icon: <ShoppingCartOutlined />
    },
    {
      title: 'Processing',
      description: 'Preparing your order',
      icon: <ClockCircleOutlined />
    },
    {
      title: 'Shipped',
      description: 'On the way to you',
      icon: <TruckOutlined />
    },
    {
      title: 'Delivered',
      description: status === 'Delivered' ? 'Successfully delivered' : `Expected ${new Date(deliveryDate).toLocaleDateString()}`,
      icon: <CheckCircleOutlined />
    }
  ];

  return (
    <div style={{ margin: '20px 0' }}>
      <Steps
        current={getActiveStep()}
        size="small"
        items={steps}
        style={{
          '& .ant-steps-item-finish .ant-steps-item-icon': {
            backgroundColor: terracottaTheme.success,
            borderColor: terracottaTheme.success
          },
          '& .ant-steps-item-process .ant-steps-item-icon': {
            backgroundColor: terracottaTheme.primary,
            borderColor: terracottaTheme.primary
          },
          '& .ant-steps-item-wait .ant-steps-item-icon': {
            backgroundColor: '#f5f5f5',
            borderColor: '#d9d9d9'
          }
        }}
      />
    </div>
  );
};

// Enhanced Product Item Card with Terracotta Theme
const ProductItemCard = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      size="small" 
      style={{
        ...styles.productItemCard,
        ...(isHovered ? { 
          background: 'rgba(255, 255, 255, 1)',
          transform: 'translateX(4px)',
          boxShadow: `0 4px 16px rgba(210, 105, 30, 0.15)`,
          borderColor: terracottaTheme.primary
        } : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Row align="middle" gutter={16}>
        <Col>
          <Avatar
            src={item.image}
            size={64}
            shape="square"
            style={{ 
              borderRadius: '8px',
              border: `2px solid ${terracottaTheme.light}`
            }}
            icon={<GiftOutlined />}
          />
        </Col>
        <Col flex="auto">
          <Space direction="vertical" size={2}>
            <Text strong style={{ fontSize: '15px', color: terracottaTheme.text.primary }}>
              {item.name}
            </Text>
            <Space>
              <Tag 
                color={terracottaTheme.primary}
                style={{
                  ...styles.statusBadge,
                  backgroundColor: 'rgba(210, 105, 30, 0.1)',
                  color: terracottaTheme.primary
                }}
              >
                Qty: {item.quantity}
              </Tag>
              <Text type="secondary">₹{item.price?.toFixed(2)}</Text>
            </Space>
            <Rate 
              disabled 
              defaultValue={4.5} 
              size="small"
              style={{ color: terracottaTheme.warning }}
            />
          </Space>
        </Col>
        <Col>
          <Statistic
            value={item.price * item.quantity}
            precision={2}
            prefix="₹"
            valueStyle={{ 
              color: terracottaTheme.success, 
              fontWeight: 'bold',
              letterSpacing: '-0.5px'
            }}
          />
        </Col>
      </Row>
    </Card>
  );
};

// Order Summary Card with Terracotta Theme
const OrderSummaryCard = ({ order }) => (
  <Card 
    title={
      <Space>
        <DollarOutlined style={{ color: terracottaTheme.success }} />
        <span style={{ color: terracottaTheme.text.primary }}>Order Summary</span>
      </Space>
    }
    size="small"
    style={{ 
      borderRadius: '12px',
      border: `1px solid ${terracottaTheme.light}`
    }}
  >
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row justify="space-between">
        <Text>Subtotal</Text>
        <Text>₹{order.orderDetails?.subtotal?.toFixed(2) || '0.00'}</Text>
      </Row>
      <Row justify="space-between">
        <Text>Shipping</Text>
        <Text>₹{order.orderDetails?.shippingCost?.toFixed(2) || '0.00'}</Text>
      </Row>
      {order.orderDetails?.discount > 0 && (
        <Row justify="space-between">
          <Text style={{ color: terracottaTheme.success }}>Discount</Text>
          <Text style={{ color: terracottaTheme.success }}>
            -₹{order.orderDetails?.discount?.toFixed(2)}
          </Text>
        </Row>
      )}
      <Divider style={{ margin: '8px 0' }} />
      <Row justify="space-between">
        <Text strong style={{ fontSize: '16px' }}>Total</Text>
        <Text strong style={{ fontSize: '16px', color: terracottaTheme.success }}>
          ₹{order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}
        </Text>
      </Row>
    </Space>
  </Card>
);

// Delivery Tracking Card with Terracotta Theme
const DeliveryTrackingCard = ({ order, onTrack }) => (
  <Card
    title={
      <Space>
        <TruckOutlined style={{ color: terracottaTheme.primary }} />
        <span style={{ color: terracottaTheme.text.primary }}>Delivery Tracking</span>
      </Space>
    }
    size="small"
    extra={
      order.deliveryDetails?.consignmentNumber && (
        <Button 
          type="primary" 
          size="small" 
          onClick={() => onTrack(order.deliveryDetails)}
          style={styles.primaryButton}
        >
          Track Package
        </Button>
      )
    }
    style={{ 
      borderRadius: '12px',
      border: `1px solid ${terracottaTheme.light}`
    }}
  >
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row justify="space-between">
        <Text type="secondary">Courier</Text>
        <Text strong>{order.deliveryDetails?.company || 'Not assigned'}</Text>
      </Row>
      <Row justify="space-between">
        <Text type="secondary">Tracking Number</Text>
        <Text 
          code
          style={{ 
            backgroundColor: terracottaTheme.light,
            color: terracottaTheme.primary 
          }}
        >
          {order.deliveryDetails?.consignmentNumber || 'Not generated'}
        </Text>
      </Row>
      <Row justify="space-between">
        <Text type="secondary">Expected Delivery</Text>
        <Text>{new Date(order.deliveryDate).toLocaleDateString()}</Text>
      </Row>
      {order.deliveryDetails?.remarks && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          <Text type="secondary" italic>{order.deliveryDetails.remarks}</Text>
        </>
      )}
    </Space>
  </Card>
);

// Main Order Card Component with Terracotta Theme
const OrderCard = ({ order, onViewDetails, onTrack }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const showOrderDetails = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const orderItems = order.orderDetails?.items || [];
  const displayItems = orderItems.slice(0, 2);
  const remainingItems = orderItems.length - 2;

  return (
    <>
      <Card
        style={{
          ...styles.orderCard,
          ...(isHovered ? styles.orderCardHover : {})
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Order Header */}
        <Row justify="space-between" align="top" style={{ marginBottom: '16px' }}>
          <Col>
            <Space direction="vertical" size={4}>
              <Space align="center">
                <Title level={4} style={{ margin: 0, ...styles.gradientText }}>
                  #{order.id.slice(-6).toUpperCase()}
                </Title>
                <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
              </Space>
              <Space>
                <CalendarOutlined style={{ color: terracottaTheme.secondary }} />
                <Text type="secondary">
                  Placed on {new Date(order.orderDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </Space>
            </Space>
          </Col>
          
          <Col>
            <Space direction="vertical" align="end">
              <Statistic
                value={order.orderDetails?.totalAmount || 0}
                precision={2}
                prefix="₹"
                valueStyle={{ 
                  color: terracottaTheme.success, 
                  fontWeight: 'bold', 
                  fontSize: '18px',
                  letterSpacing: '-0.5px'
                }}
              />
              <Space>
                <Button 
                  type="primary" 
                  icon={<EyeOutlined />} 
                  onClick={showOrderDetails}
                  style={styles.primaryButton}
                >
                  View Details
                </Button>
                <Tooltip title="Reorder items">
                  <Button 
                    icon={<ReloadOutlined />} 
                    style={styles.secondaryButton}
                  />
                </Tooltip>
              </Space>
            </Space>
          </Col>
        </Row>

        {/* Quick Order Items Preview */}
        <Card 
          size="small" 
          title={
            <span style={{ color: terracottaTheme.text.primary }}>Order Items</span>
          }
          style={styles.itemPreviewCard}
        >
          {displayItems.map((item, index) => (
            <Row key={index} align="middle" style={{ marginBottom: '8px' }}>
              <Col span={2}>
                <Avatar 
                  src={item.image} 
                  size="small" 
                  icon={<GiftOutlined />}
                  style={{ border: `1px solid ${terracottaTheme.light}` }}
                />
              </Col>
              <Col span={16}>
                <Text style={{ fontSize: '14px', color: terracottaTheme.text.primary }}>
                  {item.quantity}× {item.name}
                </Text>
              </Col>
              <Col span={6} style={{ textAlign: 'right' }}>
                <Text strong style={{ color: terracottaTheme.success }}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Text>
              </Col>
            </Row>
          ))}
          {remainingItems > 0 && (
            <Text type="secondary" style={{ fontStyle: 'italic' }}>
              +{remainingItems} more items
            </Text>
          )}
        </Card>

        {/* Order Progress */}
        <OrderProgress 
          status={order.status} 
          orderDate={order.orderDate}
          deliveryDate={order.deliveryDate}
        />

        {/* Quick Actions - Removed Invoice and Review */}
        <Row gutter={8} style={{ marginTop: '16px' }}>
          <Col span={12}>
            <Button 
              block 
              size="small" 
              icon={<PhoneOutlined />}
              style={styles.quickActionButton}
            >
              Support
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              block 
              size="small" 
              icon={<TruckOutlined />}
              disabled={!order.deliveryDetails?.consignmentNumber}
              onClick={() => onTrack(order.deliveryDetails)}
              style={{
                ...styles.quickActionButton,
                ...(order.deliveryDetails?.consignmentNumber ? {
                  backgroundColor: 'rgba(210, 105, 30, 0.1)',
                  borderColor: terracottaTheme.primary,
                  color: terracottaTheme.primary
                } : {})
              }}
            >
              Track
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Detailed Order Modal */}
      <Modal
        title={
          <div style={{ color: 'white' }}>
            <Space>
              <ShoppingCartOutlined style={{ color: 'white' }} />
              <span>Order Details - #{order.id.slice(-6).toUpperCase()}</span>
            </Space>
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
          <Button 
            key="reorder" 
            type="primary" 
            icon={<ReloadOutlined />}
            style={styles.primaryButton}
          >
            Reorder Items
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
        styles={{
          header: styles.modalHeader
        }}
      >
        <Row gutter={16}>
          <Col span={14}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* All Order Items */}
              <Card 
                title={<span style={{ color: terracottaTheme.text.primary }}>Order Items</span>}
                size="small" 
                style={{ 
                  borderRadius: '12px',
                  border: `1px solid ${terracottaTheme.light}`
                }}
              >
                {orderItems.map((item, index) => (
                  <ProductItemCard key={index} item={item} index={index} />
                ))}
              </Card>

              {/* Delivery Address */}
              <Card 
                title={
                  <Space>
                    <EnvironmentOutlined style={{ color: terracottaTheme.primary }} />
                    <span style={{ color: terracottaTheme.text.primary }}>Delivery Address</span>
                  </Space>
                }
                size="small"
                style={{ 
                  borderRadius: '12px',
                  border: `1px solid ${terracottaTheme.light}`
                }}
              >
                <Paragraph>
                  <Text strong style={{ color: terracottaTheme.text.primary }}>
                    {order.orderDetails?.personalInfo?.fullName}
                  </Text><br />
                  {order.orderDetails?.deliveryAddress?.addressLine1}<br />
                  {order.orderDetails?.deliveryAddress?.addressLine2 && (
                    <>{order.orderDetails.deliveryAddress.addressLine2}<br /></>
                  )}
                  {order.orderDetails?.deliveryAddress?.city}, {order.orderDetails?.deliveryAddress?.state}<br />
                  PIN: {order.orderDetails?.deliveryAddress?.pincode}<br />
                  <PhoneOutlined style={{ color: terracottaTheme.primary }} /> {order.orderDetails?.personalInfo?.phone}
                </Paragraph>
              </Card>
            </Space>
          </Col>

          <Col span={10}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Order Summary */}
              <OrderSummaryCard order={order} />

              {/* Delivery Tracking */}
              <DeliveryTrackingCard order={order} onTrack={onTrack} />

              {/* Payment Info */}
              <Card
                title={
                  <Space>
                    <CreditCardOutlined style={{ color: terracottaTheme.success }} />
                    <span style={{ color: terracottaTheme.text.primary }}>Payment Info</span>
                  </Space>
                }
                size="small"
                style={{ 
                  borderRadius: '12px',
                  border: `1px solid ${terracottaTheme.light}`
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row justify="space-between">
                    <Text type="secondary">Status</Text>
                    <Tag 
                      color={order.paymentStatus === 'COMPLETED' ? terracottaTheme.success : terracottaTheme.warning}
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: order.paymentStatus === 'COMPLETED' 
                          ? 'rgba(107, 120, 33, 0.1)' 
                          : 'rgba(255, 143, 0, 0.1)',
                        color: order.paymentStatus === 'COMPLETED' ? terracottaTheme.success : terracottaTheme.warning
                      }}
                    >
                      {order.paymentStatus}
                    </Tag>
                  </Row>
                  <Row justify="space-between">
                    <Text type="secondary">Method</Text>
                    <Text>{order.paymentMethod || 'Online Payment'}</Text>
                  </Row>
                  <Row justify="space-between">
                    <Text type="secondary">Transaction ID</Text>
                    <Text 
                      code
                      style={{ 
                        backgroundColor: terracottaTheme.light,
                        color: terracottaTheme.primary 
                      }}
                    >
                      {order.transactionId || 'N/A'}
                    </Text>
                  </Row>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

// Main Orders Component with Terracotta Theme
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Courier tracking URLs
  const courierTrackingUrls = {
    'Delhivery': 'https://www.delhivery.com/track/package/',
    'DTDC': 'https://www.dtdc.in/tracking.asp',
    'FedEx': 'https://www.fedex.com/fedextrack/?trknbr=',
    'BlueDart': 'https://www.bluedart.com/tracking',
    'Amazon': 'https://www.amazon.in/trackpkg/',
  };

  // Auth state management
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      
      setUser(currentUser);
      await fetchOrders(currentUser.uid);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [navigate]);

  // Fetch orders
  const fetchOrders = useCallback(async (uid) => {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const ordersData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const orderDate = data.createdAt?.toDate 
          ? data.createdAt.toDate() 
          : new Date(data.createdAt || Date.now());
        
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 2) + 3);
        
        const today = new Date();
        let status = 'Ordered';
        if (today > deliveryDate) {
          status = 'Delivered';
        } else if (today > orderDate && (today - orderDate) / (1000 * 60 * 60 * 24) > 1) {
          status = 'Shipped';
        } else if (today > orderDate) {
          status = 'Processing';
        }
        
        ordersData.push({
          id: doc.id,
          ...data,
          orderDate,
          deliveryDate,
          status,
          paymentStatus: data.paymentStatus || 'INITIATED',
          deliveryDetails: data.deliveryDetails || {
            company: 'Not assigned yet',
            consignmentNumber: 'Not generated yet',
            tentativeDate: deliveryDate,
            remarks: 'Order is being processed'
          }
        });
      });

      ordersData.sort((a, b) => b.orderDate - a.orderDate);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load orders. Please try again.',
        style: { 
          borderRadius: '12px',
          border: `1px solid ${terracottaTheme.error}`
        }
      });
    }
  }, []);

  // Track package handler
  const handleTrackPackage = useCallback((deliveryDetails) => {
    if (!deliveryDetails?.company || !deliveryDetails?.consignmentNumber) {
      notification.warning({
        message: 'Tracking Unavailable',
        description: 'Tracking information is not available yet. Please check back later.',
        style: { 
          borderRadius: '12px',
          border: `1px solid ${terracottaTheme.warning}`
        }
      });
      return;
    }

    const courierName = deliveryDetails.company.toLowerCase();
    let trackingUrl = '';

    for (const [key, url] of Object.entries(courierTrackingUrls)) {
      if (courierName.includes(key.toLowerCase())) {
        trackingUrl = url + deliveryDetails.consignmentNumber;
        break;
      }
    }

    if (!trackingUrl) {
      trackingUrl = `https://www.google.com/search?q=track+${deliveryDetails.consignmentNumber}+${deliveryDetails.company}`;
    }

    window.open(trackingUrl, '_blank');
  }, [courierTrackingUrls]);

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Card style={styles.loadingCard}>
          <Spin 
            size="large" 
            style={{ 
              color: terracottaTheme.primary,
              '& .ant-spin-dot-item': {
                backgroundColor: terracottaTheme.primary
              }
            }}
          />
          <Title level={4} style={{ marginTop: '20px', ...styles.gradientText }}>
            Loading your orders...
          </Title>
        </Card>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Avatar 
                  size={48} 
                  icon={<ShoppingCartOutlined />} 
                  style={{ 
                    background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.secondary} 100%)`,
                    border: `2px solid ${terracottaTheme.light}`
                  }}
                />
                <div>
                  <Title level={2} style={{ margin: 0, ...styles.gradientText }}>
                    My Orders
                  </Title>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    Track and manage all your orders in one place
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Badge 
                  count={orders.length} 
                  style={{ 
                    backgroundColor: terracottaTheme.success,
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<ShopOutlined />}
                    onClick={() => navigate('/products')}
                    style={styles.primaryButton}
                  >
                    Continue Shopping
                  </Button>
                </Badge>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card style={styles.emptyStateCard}>
            <Empty
              image={
                <ShoppingCartOutlined 
                  style={{ 
                    fontSize: '120px', 
                    color: terracottaTheme.secondary,
                    opacity: 0.3
                  }} 
                />
              }
              imageStyle={{ height: 120 }}
              description={
                <div>
                  <Title level={3} style={{ color: terracottaTheme.secondary }}>
                    No orders yet
                  </Title>
                  <Paragraph style={{ 
                    fontSize: '16px', 
                    color: terracottaTheme.text.secondary, 
                    maxWidth: '400px', 
                    margin: '0 auto 24px' 
                  }}>
                    Start exploring our amazing terracotta products and place your first order to see it here!
                  </Paragraph>
                </div>
              }
            >
              <Button 
                type="primary" 
                size="large"
                icon={<ShopOutlined />}
                onClick={() => navigate('/products')}
                style={{
                  ...styles.primaryButton,
                  padding: '12px 32px', 
                  height: 'auto',
                  fontSize: '16px'
                }}
              >
                Start Shopping
              </Button>
            </Empty>
          </Card>
        ) : (
          <div>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onTrack={handleTrackPackage}
              />
            ))}
          </div>
        )}

        {/* Footer Actions */}
        {orders.length > 0 && (
          <Card 
            style={{ 
              borderRadius: '20px',
              marginTop: '24px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${terracottaTheme.light}`,
              boxShadow: `0 8px 32px rgba(210, 105, 30, 0.1)`
            }}
          >
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                icon={<ShopOutlined />}
                onClick={() => navigate('/products')}
                style={styles.primaryButton}
              >
                Shop More
              </Button>
              <Button 
                size="large"
                icon={<HeartOutlined />}
                onClick={() => navigate('/wishlist')}
                style={{
                  ...styles.secondaryButton,
                  height: '40px',
                  padding: '0 24px'
                }}
              >
                View Wishlist
              </Button>
              <Button 
                size="large"
                icon={<PhoneOutlined />}
                style={{
                  ...styles.secondaryButton,
                  height: '40px',
                  padding: '0 24px'
                }}
              >
                Contact Support
              </Button>
            </Space>
          </Card>
        )}
      </div>

      {/* Custom CSS for Ant Design components */}
      <style jsx>{`
        .ant-steps-item-finish .ant-steps-item-icon {
          background-color: ${terracottaTheme.success} !important;
          border-color: ${terracottaTheme.success} !important;
        }
        
        .ant-steps-item-process .ant-steps-item-icon {
          background-color: ${terracottaTheme.primary} !important;
          border-color: ${terracottaTheme.primary} !important;
        }
        
        .ant-steps-item-wait .ant-steps-item-icon {
          background-color: #f5f5f5 !important;
          border-color: #d9d9d9 !important;
        }
        
        .ant-steps-item-title {
          font-weight: 600 !important;
          color: ${terracottaTheme.text.primary} !important;
        }
        
        .ant-steps-item-description {
          color: ${terracottaTheme.text.secondary} !important;
        }
        
        .ant-card-head-title {
          font-weight: 600;
          color: ${terracottaTheme.text.primary} !important;
        }
        
        .ant-modal-header {
          background: linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.secondary} 100%) !important;
          border-radius: 8px 8px 0 0;
        }
        
        .ant-modal-title {
          color: white !important;
          font-weight: 600;
        }
        
        .ant-modal-close-x {
          color: white !important;
        }
        
        .ant-spin-dot-item {
          background-color: ${terracottaTheme.primary} !important;
        }
        
        .ant-badge-count {
          font-weight: 600;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(210, 105, 30, 0.3);
        }
        
        .ant-card-hoverable:hover {
          box-shadow: 0 8px 32px rgba(210, 105, 30, 0.2) !important;
        }
        
        .ant-notification {
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(210, 105, 30, 0.15);
        }
        
        .ant-notification-notice {
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        
        .ant-rate-star {
          color: ${terracottaTheme.warning} !important;
        }
        
        .ant-statistic-content-value {
          font-weight: 700 !important;
          letter-spacing: -0.5px;
        }
        
        .ant-empty-description {
          color: ${terracottaTheme.text.secondary} !important;
          font-size: 16px;
        }
        
        .ant-btn:focus,
        .ant-input:focus,
        .ant-select-selector:focus {
          outline: 2px solid ${terracottaTheme.primary};
          outline-offset: 2px;
        }
        
        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .ant-card-body {
            padding: 16px !important;
          }
          
          .ant-modal {
            margin: 0 !important;
            padding: 16px !important;
          }
          
          .ant-modal-content {
            border-radius: 12px !important;
          }
          
          .ant-steps {
            margin: 16px 0 !important;
          }
          
          .ant-steps-item-title {
            font-size: 12px !important;
          }
          
          .ant-steps-item-description {
            font-size: 11px !important;
          }
        }
        
        @media (max-width: 576px) {
          .ant-space-item {
            margin-bottom: 8px !important;
          }
          
          .ant-btn {
            font-size: 12px !important;
            height: 28px !important;
            padding: 0 8px !important;
          }
          
          .ant-statistic-content-value {
            font-size: 18px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Orders;