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
  notification,
  Alert,
  Result
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
  ShareAltOutlined,
  HourglassOutlined,
  ArrowRightOutlined,
  CarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { auth, db } from '../Firebase/Firebase';
import { collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;

// Terracotta Theme Colors
const terracottaTheme = {
  primary: '#D2691E',
  secondary: '#CD853F',
  accent: '#F4A460',
  dark: '#A0522D',
  light: '#FFEEE6',
  success: '#6B7821',
  warning: '#FF8F00',
  error: '#C62828',
  text: {
    primary: '#3D405B',
    secondary: '#797B8E'
  }
};

// Inline CSS Styles with Terracotta Theme
const styles = {
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

  primaryButton: {
    background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.accent} 100%)`,
    border: 'none',
    boxShadow: `0 4px 12px rgba(210, 105, 30, 0.3)`,
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    color: 'white'
  },

  secondaryButton: {
    borderColor: terracottaTheme.primary,
    color: terracottaTheme.primary,
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },

  gradientText: {
    background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.secondary} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 600
  },

  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
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

  emptyStateCard: {
    borderRadius: '20px',
    textAlign: 'center',
    padding: '60px 40px',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    border: 'none'
  },

  errorCard: {
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    border: `2px solid ${terracottaTheme.error}`,
    boxShadow: `0 8px 32px rgba(198, 40, 40, 0.15)`
  },

  modalHeader: {
    background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.secondary} 100%)`,
    borderRadius: '8px 8px 0 0'
  },

  quickActionButton: {
    borderRadius: '8px',
    fontSize: '12px',
    height: '32px',
    borderColor: terracottaTheme.primary,
    color: terracottaTheme.primary
  },

  statusBadge: {
    borderRadius: '16px',
    fontWeight: 500,
    padding: '4px 12px',
    border: 'none',
    boxShadow: `0 2px 4px rgba(210, 105, 30, 0.15)`
  }
};

// Order Status Component
const OrderStatusBadge = ({ status, paymentStatus }) => {
  const getStatusConfig = () => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return { 
          color: terracottaTheme.success, 
          text: 'Delivered', 
          icon: <CheckCircleOutlined />,
          bgColor: 'rgba(107, 120, 33, 0.1)'
        };
      case 'IN_TRANSIT':
        return { 
          color: terracottaTheme.primary, 
          text: 'In Transit', 
          icon: <CarOutlined />,
          bgColor: 'rgba(210, 105, 30, 0.1)'
        };
      case 'CHECKED_IN':
        return { 
          color: '#7B1FA2', 
          text: 'Checked In', 
          icon: <ArrowRightOutlined />,
          bgColor: 'rgba(123, 31, 162, 0.1)'
        };
      case 'PROCESSING':
      case 'CONFIRMED':
        return { 
          color: terracottaTheme.warning, 
          text: 'Processing', 
          icon: <HourglassOutlined />,
          bgColor: 'rgba(255, 143, 0, 0.1)'
        };
      case 'PENDING':
        return { 
          color: terracottaTheme.secondary, 
          text: 'Pending', 
          icon: <ClockCircleOutlined />,
          bgColor: 'rgba(205, 133, 63, 0.1)'
        };
      case 'CANCELLED':
        return { 
          color: terracottaTheme.error, 
          text: 'Cancelled', 
          icon: <ClockCircleOutlined />,
          bgColor: 'rgba(198, 40, 40, 0.1)'
        };
      default:
        return { 
          color: terracottaTheme.secondary, 
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

// Order Progress Tracker
const OrderProgress = ({ status, orderDate, deliveryDate, deliveredAt }) => {
  const getActiveStep = () => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return 4;
      case 'IN_TRANSIT': return 3;
      case 'CHECKED_IN': return 2;
      case 'PROCESSING':
      case 'CONFIRMED': return 1;
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
      description: 'Order is being prepared',
      icon: <HourglassOutlined />
    },
    {
      title: 'Checked In',
      description: 'Order verified by admin',
      icon: <ArrowRightOutlined />
    },
    {
      title: 'In Transit',
      description: 'On the way to you',
      icon: <TruckOutlined />
    },
    {
      title: 'Delivered',
      description: status === 'DELIVERED' 
        ? `Delivered on ${deliveredAt ? new Date(deliveredAt.seconds * 1000).toLocaleDateString() : 'Recently'}` 
        : `Expected ${new Date(deliveryDate).toLocaleDateString()}`,
      icon: <CheckCircleOutlined />
    }
  ];

  return (
    <div style={{ margin: '20px 0' }}>
      <Steps
        current={getActiveStep()}
        size="small"
        items={steps}
      />
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order, onTrack }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const showOrderDetails = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const orderItems = order.orderDetails?.items || [];

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
              </Space>
            </Space>
          </Col>
        </Row>

        {/* Order Progress */}
        <OrderProgress 
          status={order.status} 
          orderDate={order.orderDate}
          deliveryDate={order.deliveryDate}
          deliveredAt={order.deliveredAt}
        />

        {/* Quick Actions */}
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
          </Button>
        ]}
        width={600}
        style={{ top: 20 }}
        styles={{
          header: styles.modalHeader
        }}
      >
        <div style={{ padding: '20px 0' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={5}>Order Status</Title>
              <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
            </div>
            
            <div>
              <Title level={5}>Order Items</Title>
              {orderItems.length > 0 ? (
                orderItems.map((item, index) => (
                  <div key={index} style={{ marginBottom: '8px', padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                    <Text strong>{item.name}</Text> - Qty: {item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                ))
              ) : (
                <Text type="secondary">No items found</Text>
              )}
            </div>

            <div>
              <Title level={5}>Total Amount</Title>
              <Text strong style={{ fontSize: '18px', color: terracottaTheme.success }}>
                ₹{order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}
              </Text>
            </div>
          </Space>
        </div>
      </Modal>
    </>
  );
};

// Loading Component
const LoadingView = ({ message = "Loading your orders..." }) => (
  <div style={styles.loadingContainer}>
    <Card style={styles.loadingCard}>
      <Spin size="large" />
      <Title level={4} style={{ marginTop: '20px', ...styles.gradientText }}>
        {message}
      </Title>
    </Card>
  </div>
);

// Error Component
const ErrorView = ({ error, onRetry }) => (
  <div style={styles.pageContainer}>
    <div style={styles.contentWrapper}>
      <Card style={styles.errorCard}>
        <Result
          status="error"
          title="Unable to Load Orders"
          subTitle={error || "Something went wrong while fetching your orders. Please try again."}
          extra={[
            <Button 
              type="primary" 
              key="retry" 
              icon={<ReloadOutlined />}
              onClick={onRetry}
              style={styles.primaryButton}
            >
              Try Again
            </Button>,
            <Button 
              key="home" 
              icon={<ShopOutlined />}
              onClick={() => window.location.href = '/products'}
              style={styles.secondaryButton}
            >
              Continue Shopping
            </Button>
          ]}
        />
      </Card>
    </div>
  </div>
);

// Empty State Component
const EmptyOrdersView = ({ onShop, onRetry }) => (
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
      <Space>
        <Button 
          type="primary" 
          size="large"
          icon={<ShopOutlined />}
          onClick={onShop}
          style={{
            ...styles.primaryButton,
            padding: '12px 32px', 
            height: 'auto',
            fontSize: '16px'
          }}
        >
          Start Shopping
        </Button>
        <Button 
          size="large"
          icon={<ReloadOutlined />}
          onClick={onRetry}
          style={styles.secondaryButton}
        >
          Refresh
        </Button>
      </Space>
    </Empty>
  </Card>
);

// Main Orders Component
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setAuthLoading(false);
        setLoading(false);
        navigate('/auth');
        return;
      }
      
      setUser(currentUser);
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Fetch orders function with fallback methods
  const fetchOrders = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Primary method: Try with orderBy
      let ordersData = [];
      
      try {
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          ordersData.push({ id: doc.id, ...doc.data() });
        });
      } catch (orderByError) {
        // Fallback: Try without orderBy
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          ordersData.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort manually
        ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      }

      // Process orders data
      const processedOrders = ordersData.map(order => {
        const orderDate = order.createdAt?.toDate 
          ? order.createdAt.toDate() 
          : new Date(order.createdAt || Date.now());
        
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + 3);
        
        return {
          ...order,
          orderDate,
          deliveryDate,
          status: order.status || 'PENDING',
          paymentStatus: order.paymentStatus || 'INITIATED'
        };
      });

      setOrders(processedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
      setLoading(false);
    }
  }, []);

  // Fetch orders when user is authenticated
  useEffect(() => {
    if (user?.uid && !authLoading) {
      fetchOrders(user.uid);
    }
  }, [user?.uid, authLoading, fetchOrders]);

  // Track package handler
  const handleTrackPackage = useCallback((deliveryDetails) => {
    if (!deliveryDetails?.company || !deliveryDetails?.consignmentNumber) {
      notification.warning({
        message: 'Tracking Unavailable',
        description: 'Tracking information is not available yet. Please check back later.',
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

  // Manual retry function
  const handleRetry = useCallback(() => {
    if (user?.uid) {
      fetchOrders(user.uid);
    } else {
      window.location.reload();
    }
  }, [user?.uid, fetchOrders]);

  // Navigation handlers
  const handleShopNavigation = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  const handleWishlistNavigation = useCallback(() => {
    navigate('/wishlist');
  }, [navigate]);

  // Show loading while authentication is being checked
  if (authLoading) {
    return <LoadingView message="Checking authentication..." />;
  }

  // Show error if there's an error
  if (error) {
    return <ErrorView error={error} onRetry={handleRetry} />;
  }

  // Show loading while orders are being fetched
  if (loading) {
    return <LoadingView />;
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
                    onClick={handleShopNavigation}
                    style={styles.primaryButton}
                  >
                    Continue Shopping
                  </Button>
                </Badge>
                <Button 
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={handleRetry}
                  style={styles.secondaryButton}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Orders List or Empty State */}
        {orders.length === 0 ? (
          <EmptyOrdersView 
            onShop={handleShopNavigation} 
            onRetry={handleRetry} 
          />
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
                onClick={handleShopNavigation}
                style={styles.primaryButton}
              >
                Shop More
              </Button>
              <Button 
                size="large"
                icon={<HeartOutlined />}
                onClick={handleWishlistNavigation}
                style={styles.secondaryButton}
              >
                View Wishlist
              </Button>
              <Button 
                size="large"
                icon={<PhoneOutlined />}
                style={styles.secondaryButton}
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
        
        .ant-btn-primary:hover {
          background: linear-gradient(135deg, ${terracottaTheme.dark} 0%, ${terracottaTheme.primary} 100%) !important;
          border-color: ${terracottaTheme.dark} !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(210, 105, 30, 0.4) !important;
        }
        
        .ant-btn:hover {
          transform: translateY(-1px);
          transition: all 0.3s ease;
        }
        
        .ant-tag {
          transition: all 0.3s ease;
        }
        
        .ant-tag:hover {
          transform: scale(1.05);
        }
        
        .ant-result-title {
          color: ${terracottaTheme.text.primary} !important;
        }
        
        .ant-result-subtitle {
          color: ${terracottaTheme.text.secondary} !important;
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
          
          .ant-row {
            flex-direction: column !important;
          }
          
          .ant-col {
            width: 100% !important;
            margin-bottom: 16px !important;
          }
          
          .ant-space {
            flex-direction: column !important;
            width: 100% !important;
          }
          
          .ant-space-item {
            width: 100% !important;
          }
        }
        
        @media (max-width: 576px) {
          .ant-space-item {
            margin-bottom: 8px !important;
          }
          
          .ant-btn {
            font-size: 12px !important;
            height: 32px !important;
            padding: 0 12px !important;
          }
          
          .ant-btn-lg {
            font-size: 14px !important;
            height: 40px !important;
            padding: 0 16px !important;
          }
          
          .ant-statistic-content-value {
            font-size: 16px !important;
          }
          
          .ant-typography h2 {
            font-size: 20px !important;
          }
          
          .ant-typography h3 {
            font-size: 18px !important;
          }
          
          .ant-typography h4 {
            font-size: 16px !important;
          }
          
          .ant-empty-image {
            height: 80px !important;
          }
          
          .ant-empty-image svg {
            font-size: 80px !important;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .ant-card {
            background: rgba(20, 20, 20, 0.95) !important;
            color: #fff !important;
          }
          
          .ant-typography {
            color: #fff !important;
          }
          
          .ant-btn:not(.ant-btn-primary) {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: #fff !important;
          }
          
          .ant-modal-content {
            background: rgba(20, 20, 20, 0.95) !important;
            color: #fff !important;
          }
        }
        
        /* Accessibility improvements */
        .ant-btn:focus-visible {
          outline: 3px solid ${terracottaTheme.primary} !important;
          outline-offset: 2px !important;
        }
        
        .ant-card:focus-within {
          outline: 2px solid ${terracottaTheme.primary} !important;
          outline-offset: 2px !important;
        }
        
        /* Animation improvements */
        .ant-card {
          animation: fadeInUp 0.6s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .ant-steps-item {
          transition: all 0.3s ease;
        }
        
        .ant-steps-item:hover {
          transform: scale(1.02);
        }
        
        /* Loading animation */
        .ant-spin-dot {
          animation: spin 1.2s infinite linear;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${terracottaTheme.light};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${terracottaTheme.primary};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${terracottaTheme.dark};
        }
      `}</style>
    </div>
  );
};

export default Orders;