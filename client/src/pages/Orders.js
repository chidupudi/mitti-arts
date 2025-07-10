// Updated Orders.js - Unified Orders with Ganesh Support
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
  ExclamationCircleOutlined,
  MessageOutlined,
  UserOutlined,
  ToolOutlined,
  FireOutlined
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
  ganesh: '#FF8F00',
  text: {
    primary: '#3D405B',
    secondary: '#797B8E'
  }
};

// Enhanced hook to fetch both regular and Ganesh orders
const useUnifiedOrders = (user) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const allOrders = [];

      // Fetch regular orders
      try {
        const regularOrdersQuery = query(
          collection(db, 'orders'), 
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const regularOrdersSnapshot = await getDocs(regularOrdersQuery);
        regularOrdersSnapshot.forEach((doc) => {
          const data = doc.data();
          allOrders.push({
            id: doc.id,
            ...data,
            orderType: 'regular',
            orderDate: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
            displayStatus: normalizeStatus(data.status || 'PENDING'),
            originalStatus: data.status || 'PENDING',
            paymentStatus: data.paymentStatus || 'INITIATED'
          });
        });
      } catch (err) {
        console.warn('Error fetching regular orders, trying without orderBy:', err);
        // Fallback without orderBy
        const regularOrdersQuery = query(
          collection(db, 'orders'), 
          where('userId', '==', userId)
        );
        
        const regularOrdersSnapshot = await getDocs(regularOrdersQuery);
        regularOrdersSnapshot.forEach((doc) => {
          const data = doc.data();
          allOrders.push({
            id: doc.id,
            ...data,
            orderType: 'regular',
            orderDate: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
            displayStatus: normalizeStatus(data.status || 'PENDING'),
            originalStatus: data.status || 'PENDING',
            paymentStatus: data.paymentStatus || 'INITIATED'
          });
        });
      }

      // Fetch Ganesh orders (converted from leads)
      try {
        const ganeshOrdersQuery = query(
          collection(db, 'ganeshOrders'), 
          where('customerId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const ganeshOrdersSnapshot = await getDocs(ganeshOrdersQuery);
        ganeshOrdersSnapshot.forEach((doc) => {
          const data = doc.data();
          allOrders.push({
            id: doc.id,
            ...data,
            orderType: 'ganesh',
            orderDate: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
            displayStatus: normalizeGaneshStatus(data.status || 'pending_advance'),
            originalStatus: data.status || 'pending_advance',
            paymentStatus: data.paymentStatus || 'pending',
            // Transform Ganesh order structure to match regular orders for display
            orderDetails: {
              totalAmount: data.finalPrice || data.advanceAmount || 0,
              items: [{
                name: data.idolDetails?.name || 'Ganesh Idol',
                quantity: 1,
                price: data.finalPrice || data.advanceAmount || 0,
                id: data.idolDetails?.id || 'ganesh-idol'
              }],
              personalInfo: {
                fullName: data.customerInfo?.name || 'Customer',
                phone: data.customerInfo?.phone || '',
                email: data.customerInfo?.email || ''
              },
              deliveryAddress: {
                addressLine1: data.customerInfo?.address || 'Address not provided'
              }
            }
          });
        });
      } catch (err) {
        console.warn('Error fetching Ganesh orders, trying without orderBy:', err);
        // Fallback without orderBy
        const ganeshOrdersQuery = query(
          collection(db, 'ganeshOrders'), 
          where('customerId', '==', userId)
        );
        
        const ganeshOrdersSnapshot = await getDocs(ganeshOrdersQuery);
        ganeshOrdersSnapshot.forEach((doc) => {
          const data = doc.data();
          allOrders.push({
            id: doc.id,
            ...data,
            orderType: 'ganesh',
            orderDate: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
            displayStatus: normalizeGaneshStatus(data.status || 'pending_advance'),
            originalStatus: data.status || 'pending_advance',
            paymentStatus: data.paymentStatus || 'pending',
            // Transform Ganesh order structure to match regular orders for display
            orderDetails: {
              totalAmount: data.finalPrice || data.advanceAmount || 0,
              items: [{
                name: data.idolDetails?.name || 'Ganesh Idol',
                quantity: 1,
                price: data.finalPrice || data.advanceAmount || 0,
                id: data.idolDetails?.id || 'ganesh-idol'
              }],
              personalInfo: {
                fullName: data.customerInfo?.name || 'Customer',
                phone: data.customerInfo?.phone || '',
                email: data.customerInfo?.email || ''
              },
              deliveryAddress: {
                addressLine1: data.customerInfo?.address || 'Address not provided'
              }
            }
          });
        });
      }

      // Sort all orders by date (newest first)
      allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

      setOrders(allOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching unified orders:', err);
      setError(err.message || 'Failed to load orders');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.uid) {
      fetchOrders(user.uid);
    }
  }, [user?.uid, fetchOrders]);

  return { orders, loading, error, refetch: () => fetchOrders(user?.uid) };
};

// Helper function to normalize regular order status
const normalizeStatus = (status) => {
  const statusMap = {
    'PENDING': 'Order Placed',
    'PROCESSING': 'Processing',
    'CONFIRMED': 'Confirmed',
    'CHECKED_IN': 'Checked In',
    'IN_TRANSIT': 'In Transit',
    'DELIVERED': 'Delivered',
    'CANCELLED': 'Cancelled'
  };
  return statusMap[status?.toUpperCase()] || status || 'Order Placed';
};

// Helper function to normalize Ganesh order status
const normalizeGaneshStatus = (status) => {
  const statusMap = {
    'pending_advance': 'Waiting for Advance',
    'advance_paid': 'Advance Paid',
    'in_production': 'In Production',
    'ready_for_delivery': 'Ready for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status || 'Waiting for Advance';
};

// Enhanced Order Status Badge Component
const OrderStatusBadge = ({ order }) => {
  const getStatusConfig = () => {
    if (order.orderType === 'ganesh') {
      switch (order.originalStatus) {
        case 'delivered':
          return { 
            color: terracottaTheme.success, 
            text: 'Delivered', 
            icon: <CheckCircleOutlined />,
            bgColor: 'rgba(107, 120, 33, 0.1)'
          };
        case 'ready_for_delivery':
          return { 
            color: '#00BCD4', 
            text: 'Ready for Delivery', 
            icon: <CarOutlined />,
            bgColor: 'rgba(0, 188, 212, 0.1)'
          };
        case 'in_production':
          return { 
            color: terracottaTheme.ganesh, 
            text: 'In Production', 
            icon: <ToolOutlined />,
            bgColor: 'rgba(255, 143, 0, 0.1)'
          };
        case 'advance_paid':
          return { 
            color: '#7B1FA2', 
            text: 'Advance Paid', 
            icon: <DollarOutlined />,
            bgColor: 'rgba(123, 31, 162, 0.1)'
          };
        case 'pending_advance':
          return { 
            color: terracottaTheme.warning, 
            text: 'Waiting for Advance', 
            icon: <ClockCircleOutlined />,
            bgColor: 'rgba(255, 143, 0, 0.1)'
          };
        case 'cancelled':
          return { 
            color: terracottaTheme.error, 
            text: 'Cancelled', 
            icon: <ExclamationCircleOutlined />,
            bgColor: 'rgba(198, 40, 40, 0.1)'
          };
        default:
          return { 
            color: terracottaTheme.warning, 
            text: 'Waiting for Advance', 
            icon: <ClockCircleOutlined />,
            bgColor: 'rgba(255, 143, 0, 0.1)'
          };
      }
    } else {
      // Regular order status logic (existing)
      switch (order.originalStatus?.toUpperCase()) {
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
            icon: <ExclamationCircleOutlined />,
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
    }
  };

  const config = getStatusConfig();
  
  return (
    <Space>
      {/* Order Type Badge */}
      <Tag
        icon={order.orderType === 'ganesh' ? <GiftOutlined /> : <ShoppingCartOutlined />}
        color={order.orderType === 'ganesh' ? terracottaTheme.ganesh : terracottaTheme.primary}
        style={{
          backgroundColor: order.orderType === 'ganesh' ? 'rgba(255, 143, 0, 0.1)' : 'rgba(210, 105, 30, 0.1)',
          color: order.orderType === 'ganesh' ? terracottaTheme.ganesh : terracottaTheme.primary,
          border: `1px solid ${order.orderType === 'ganesh' ? terracottaTheme.ganesh : terracottaTheme.primary}`,
          fontWeight: 'bold',
          borderRadius: '16px',
          padding: '4px 12px'
        }}
      >
        {order.orderType === 'ganesh' ? '🕉️ Ganesh Order' : 'Regular Order'}
      </Tag>
      
      {/* Status Badge */}
      <Tag 
        color={config.color}
        icon={config.icon}
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}`,
          borderRadius: '16px',
          fontWeight: 'bold',
          padding: '4px 12px'
        }}
      >
        {config.text}
      </Tag>
      
      {/* Payment Status */}
      {(order.paymentStatus === 'COMPLETED' || order.paymentStatus === 'paid') && (
        <Tag 
          color={terracottaTheme.success}
          icon={<DollarOutlined />}
          style={{
            backgroundColor: 'rgba(107, 120, 33, 0.1)',
            color: terracottaTheme.success,
            border: `1px solid ${terracottaTheme.success}`,
            borderRadius: '16px',
            fontWeight: 'bold',
            padding: '4px 12px'
          }}
        >
          Paid
        </Tag>
      )}
    </Space>
  );
};

// Enhanced Order Progress Tracker
const OrderProgress = ({ order }) => {
  const getActiveStep = () => {
    if (order.orderType === 'ganesh') {
      switch (order.originalStatus) {
        case 'delivered': return 4;
        case 'ready_for_delivery': return 3;
        case 'in_production': return 2;
        case 'advance_paid': return 1;
        case 'pending_advance': return 0;
        case 'cancelled': return -1;
        default: return 0;
      }
    } else {
      switch (order.originalStatus?.toUpperCase()) {
        case 'DELIVERED': return 4;
        case 'IN_TRANSIT': return 3;
        case 'CHECKED_IN': return 2;
        case 'PROCESSING':
        case 'CONFIRMED': return 1;
        case 'PENDING': return 0;
        case 'CANCELLED': return -1;
        default: return 0;
      }
    }
  };

  const steps = order.orderType === 'ganesh' ? [
    {
      title: 'Interest Submitted',
      description: new Date(order.orderDate).toLocaleDateString(),
      icon: <GiftOutlined />
    },
    {
      title: 'Advance Paid',
      description: 'Production can begin',
      icon: <DollarOutlined />
    },
    {
      title: 'In Production',
      description: 'Idol being crafted',
      icon: <ToolOutlined />
    },
    {
      title: 'Ready for Delivery',
      description: 'Idol completed',
      icon: <TruckOutlined />
    },
    {
      title: 'Delivered',
      description: order.originalStatus === 'delivered' 
        ? `Delivered on ${order.deliveredAt ? new Date(order.deliveredAt.seconds * 1000).toLocaleDateString() : 'Recently'}` 
        : 'Idol delivery',
      icon: <CheckCircleOutlined />
    }
  ] : [
    {
      title: 'Order Placed',
      description: new Date(order.orderDate).toLocaleDateString(),
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
      description: order.originalStatus === 'DELIVERED' 
        ? `Delivered on ${order.deliveredAt ? new Date(order.deliveredAt.seconds * 1000).toLocaleDateString() : 'Recently'}` 
        : 'Package delivery',
      icon: <CheckCircleOutlined />
    }
  ];

  return (
    <div style={{ margin: '20px 0' }}>
      <Steps
        current={getActiveStep()}
        size="small"
        items={steps}
        status={order.originalStatus?.toLowerCase().includes('cancelled') ? 'error' : 'process'}
      />
    </div>
  );
};

// Enhanced Order Card Component
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
  const isGaneshOrder = order.orderType === 'ganesh';

  const cardStyle = {
    height: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    border: isGaneshOrder 
      ? `2px solid ${terracottaTheme.ganesh}40` 
      : `1px solid ${terracottaTheme.light}`,
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: isGaneshOrder 
      ? `linear-gradient(135deg, ${terracottaTheme.ganesh}15 0%, #FFE0B2 100%)`
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    ...(isHovered ? {
      transform: 'translateY(-8px)',
      boxShadow: isGaneshOrder 
        ? `0 12px 48px ${terracottaTheme.ganesh}25`
        : `0 12px 48px ${terracottaTheme.primary}25`,
      borderColor: isGaneshOrder ? terracottaTheme.ganesh : terracottaTheme.primary
    } : {})
  };

  return (
    <>
      <Card
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Order Header */}
        <Row justify="space-between" align="top" style={{ marginBottom: '16px' }}>
          <Col>
            <Space direction="vertical" size={4}>
              <Space align="center">
                <Title level={4} style={{ margin: 0, color: isGaneshOrder ? terracottaTheme.ganesh : terracottaTheme.primary }}>
                  #{order.id.slice(-6).toUpperCase()}
                </Title>
                <OrderStatusBadge order={order} />
              </Space>
              <Space>
                <CalendarOutlined style={{ color: terracottaTheme.secondary }} />
                <Text type="secondary">
                  {isGaneshOrder ? 'Interest shown on' : 'Placed on'} {new Date(order.orderDate).toLocaleDateString('en-IN', {
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
              {isGaneshOrder && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {order.paymentStatus === 'paid' ? 'Advance Paid' : 'Advance Amount'}
                </Text>
              )}
              <Space>
                <Button 
                  type="primary" 
                  icon={<EyeOutlined />} 
                  onClick={showOrderDetails}
                  style={{
                    background: isGaneshOrder 
                      ? `linear-gradient(135deg, ${terracottaTheme.ganesh} 0%, #FFB74D 100%)`
                      : `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.accent} 100%)`,
                    border: 'none',
                    borderRadius: '8px'
                  }}
                >
                  View Details
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>

        {/* Order Progress */}
        <OrderProgress order={order} />

        {/* Quick Info for Ganesh Orders */}
        {isGaneshOrder && (
          <Alert
            message="🕉️ Custom Ganesh Idol Order"
            description={`${order.idolDetails?.name || 'Ganesh Idol'} • ${order.idolDetails?.category || 'Traditional'} Style • ${order.idolDetails?.estimatedDays || 7} days delivery`}
            type="info"
            showIcon
            style={{
              marginTop: '16px',
              backgroundColor: `${terracottaTheme.ganesh}10`,
              border: `1px solid ${terracottaTheme.ganesh}30`,
              borderRadius: '8px'
            }}
          />
        )}

        {/* Admin Notes for Ganesh Orders */}
        {isGaneshOrder && order.notes && (
          <Alert
            message="📝 Admin Notes"
            description={order.notes}
            type="success"
            showIcon
            style={{
              marginTop: '12px',
              backgroundColor: `${terracottaTheme.success}10`,
              border: `1px solid ${terracottaTheme.success}30`,
              borderRadius: '8px'
            }}
          />
        )}

        {/* Quick Actions */}
        <Row gutter={8} style={{ marginTop: '16px' }}>
          <Col span={12}>
            <Button 
              block 
              size="small" 
              icon={<PhoneOutlined />}
              style={{
                borderRadius: '8px',
                fontSize: '12px',
                height: '32px',
                borderColor: isGaneshOrder ? terracottaTheme.ganesh : terracottaTheme.primary,
                color: isGaneshOrder ? terracottaTheme.ganesh : terracottaTheme.primary
              }}
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
                borderRadius: '8px',
                fontSize: '12px',
                height: '32px',
                borderColor: isGaneshOrder ? terracottaTheme.ganesh : terracottaTheme.primary,
                color: isGaneshOrder ? terracottaTheme.ganesh : terracottaTheme.primary,
                ...(order.deliveryDetails?.consignmentNumber ? {
                  backgroundColor: isGaneshOrder 
                    ? `rgba(255, 143, 0, 0.1)` 
                    : `rgba(210, 105, 30, 0.1)`
                } : {})
              }}
            >
              Track
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Enhanced Order Details Modal */}
      <Modal
        title={
          <div style={{ color: 'white' }}>
            <Space>
              {isGaneshOrder ? <GiftOutlined style={{ color: 'white' }} /> : <ShoppingCartOutlined style={{ color: 'white' }} />}
              <span>{isGaneshOrder ? '🕉️ Ganesh Order Details' : 'Order Details'} - #{order.id.slice(-6).toUpperCase()}</span>
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
        width={700}
        style={{ top: 20 }}
        styles={{
          header: {
            background: isGaneshOrder 
              ? `linear-gradient(135deg, ${terracottaTheme.ganesh} 0%, #FFB74D 100%)`
              : `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.secondary} 100())`,
            borderRadius: '8px 8px 0 0'
          }
        }}
      >
        <div style={{ padding: '20px 0' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Order Status */}
            <div>
              <Title level={5}>Order Status</Title>
              <OrderStatusBadge order={order} />
            </div>
            
            {/* Ganesh Order Specific Details */}
            {isGaneshOrder && (
              <>
                <div>
                  <Title level={5}>🕉️ Ganesh Idol Details</Title>
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <Text strong>Idol Name:</Text>
                      <div>{order.idolDetails?.name || 'Custom Ganesh Idol'}</div>
                    </Col>
                    <Col span={12}>
                      <Text strong>Category:</Text>
                      <div style={{ textTransform: 'capitalize' }}>
                        {order.idolDetails?.category || 'Traditional'}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text strong>Height:</Text>
                      <div>{order.idolDetails?.height || 'As per requirement'}</div>
                    </Col>
                    <Col span={12}>
                      <Text strong>Material:</Text>
                      <div>{order.idolDetails?.material || 'Eco-friendly Clay'}</div>
                    </Col>
                    <Col span={12}>
                      <Text strong>Estimated Days:</Text>
                      <div>{order.idolDetails?.estimatedDays || 7} days</div>
                    </Col>
                    <Col span={12}>
                      <Text strong>Customizable:</Text>
                      <div>{order.idolDetails?.customizable ? 'Yes' : 'No'}</div>
                    </Col>
                  </Row>
                </div>

                <div>
                  <Title level={5}>💰 Payment Information</Title>
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <Text strong>Final Price:</Text>
                      <div style={{ color: terracottaTheme.ganesh, fontSize: '16px', fontWeight: 'bold' }}>
                        ₹{order.finalPrice?.toLocaleString() || order.advanceAmount?.toLocaleString()}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text strong>Advance Amount:</Text>
                      <div style={{ color: terracottaTheme.success, fontSize: '16px', fontWeight: 'bold' }}>
                        ₹{order.advanceAmount?.toLocaleString()}
                      </div>
                    </Col>
                    {order.remainingAmount > 0 && (
                      <Col span={12}>
                        <Text strong>Remaining Amount:</Text>
                        <div style={{ color: terracottaTheme.warning, fontSize: '16px', fontWeight: 'bold' }}>
                          ₹{order.remainingAmount?.toLocaleString()}
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>

                {/* Customer Requirements */}
                {order.requirements && (
                  <div>
                    <Title level={5}>📝 Special Requirements</Title>
                    <Text>{order.requirements}</Text>
                  </div>
                )}

                {/* Admin Notes */}
                {order.notes && (
                  <div>
                    <Title level={5}>🗒️ Admin Notes</Title>
                    <Alert
                      message="Notes from our team"
                      description={order.notes}
                      type="info"
                      showIcon
                      style={{
                        backgroundColor: `${terracottaTheme.ganesh}10`,
                        border: `1px solid ${terracottaTheme.ganesh}30`
                      }}
                    />
                  </div>
                )}
              </>
            )}
            
            {/* Regular Order Items */}
            {!isGaneshOrder && (
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
            )}

            {/* Customer Information */}
            <div>
              <Title level={5}>Customer Information</Title>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Name:</Text>
                  <div>{order.orderDetails?.personalInfo?.fullName || order.customerInfo?.name || 'Not provided'}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Phone:</Text>
                  <div>{order.orderDetails?.personalInfo?.phone || order.customerInfo?.phone || 'Not provided'}</div>
                </Col>
                <Col span={24}>
                  <Text strong>Email:</Text>
                  <div>{order.orderDetails?.personalInfo?.email || order.customerInfo?.email || 'Not provided'}</div>
                </Col>
                <Col span={24}>
                  <Text strong>Address:</Text>
                  <div>{order.orderDetails?.deliveryAddress?.addressLine1 || order.customerInfo?.address || 'Not provided'}</div>
                </Col>
              </Row>
            </div>

            {/* Total Amount */}
            <div>
              <Title level={5}>Total Amount</Title>
              <Text strong style={{ fontSize: '18px', color: terracottaTheme.success }}>
                ₹{order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}
              </Text>
              {isGaneshOrder && order.paymentStatus !== 'paid' && (
                <div style={{ marginTop: '8px' }}>
                  <Text type="warning">Advance payment pending</Text>
                </div>
              )}
            </div>
          </Space>
        </div>
      </Modal>
    </>
  );
};

// Main Orders Component with rest of the existing code...
const Orders = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Use the unified orders hook
  const { orders, loading, error, refetch } = useUnifiedOrders(user);

  // Courier tracking URLs (existing code)
  const courierTrackingUrls = {
    'Delhivery': 'https://www.delhivery.com/track/package/',
    'DTDC': 'https://www.dtdc.in/tracking.asp',
    'FedEx': 'https://www.fedex.com/fedextrack/?trknbr=',
    'BlueDart': 'https://www.bluedart.com/tracking',
    'Amazon': 'https://www.amazon.in/trackpkg/',
  };

  // Auth state management (existing code)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setAuthLoading(false);
        navigate('/auth');
        return;
      }
      
      setUser(currentUser);
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Track package handler (existing code)
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
    refetch();
  }, [refetch]);

  // Navigation handlers (existing code)
  const handleShopNavigation = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  const handleWishlistNavigation = useCallback(() => {
    navigate('/wishlist');
  }, [navigate]);

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Show error if there's an error
  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Result
            status="error"
            title="Unable to Load Orders"
            subTitle={error || "Something went wrong while fetching your orders. Please try again."}
            extra={[
              <Button 
                type="primary" 
                key="retry" 
                icon={<ReloadOutlined />}
                onClick={handleRetry}
              >
                Try Again
              </Button>,
              <Button 
                key="home" 
                icon={<ShopOutlined />}
                onClick={handleShopNavigation}
              >
                Continue Shopping
              </Button>
            ]}
          />
        </div>
      </div>
    );
  }

  // Show loading while orders are being fetched
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.secondary} 50%, ${terracottaTheme.accent} 100%)`,
      padding: '20px 0'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <Card style={{ 
          borderRadius: '20px',
          marginBottom: '24px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          border: 'none',
          boxShadow: `0 8px 32px rgba(210, 105, 30, 0.15)`
        }}>
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
                  <Title level={2} style={{ 
                    margin: 0,
                    background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.secondary} 100())`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 600
                  }}>
                    My Orders
                  </Title>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    Track and manage all your orders • Regular & Ganesh orders
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
                    style={{
                      background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.accent} 100())`,
                      border: 'none',
                      boxShadow: `0 4px 12px rgba(210, 105, 30, 0.3)`,
                      borderRadius: '12px'
                    }}
                  >
                    Continue Shopping
                  </Button>
                </Badge>
                <Button 
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={handleRetry}
                  style={{
                    borderColor: terracottaTheme.primary,
                    color: terracottaTheme.primary,
                    borderRadius: '8px'
                  }}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Orders Statistics */}
        {orders.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Statistic
                  title="Total Orders"
                  value={orders.length}
                  valueStyle={{ color: terracottaTheme.primary }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Statistic
                  title="Ganesh Orders"
                  value={orders.filter(o => o.orderType === 'ganesh').length}
                  valueStyle={{ color: terracottaTheme.ganesh }}
                  prefix="🕉️"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Statistic
                  title="Regular Orders"
                  value={orders.filter(o => o.orderType === 'regular').length}
                  valueStyle={{ color: terracottaTheme.primary }}
                  prefix="🛒"
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Orders List or Empty State */}
        {orders.length === 0 ? (
          <Card style={{ 
            borderRadius: '20px',
            textAlign: 'center',
            padding: '60px 40px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: 'none'
          }}>
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
                    Start exploring our amazing products and place your first order to see it here!
                  </Paragraph>
                </div>
              }
            >
              <Space>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ShopOutlined />}
                  onClick={handleShopNavigation}
                  style={{
                    background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.accent} 100())`,
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 32px', 
                    height: 'auto',
                    fontSize: '16px',
                    boxShadow: `0 4px 20px rgba(210, 105, 30, 0.3)`
                  }}
                >
                  Start Shopping
                </Button>
                <Button 
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={handleRetry}
                  style={{
                    borderColor: terracottaTheme.primary,
                    color: terracottaTheme.primary,
                    borderRadius: '8px'
                  }}
                >
                  Refresh
                </Button>
              </Space>
            </Empty>
          </Card>
        ) : (
          <div>
            {orders.map((order) => (
              <OrderCard
                key={`${order.orderType}-${order.id}`}
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
                style={{
                  background: `linear-gradient(135deg, ${terracottaTheme.primary} 0%, ${terracottaTheme.accent} 100())`,
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: `0 4px 12px rgba(210, 105, 30, 0.3)`
                }}
              >
                Shop More
              </Button>
              <Button 
                size="large"
                icon={<HeartOutlined />}
                onClick={handleWishlistNavigation}
                style={{
                  borderColor: terracottaTheme.primary,
                  color: terracottaTheme.primary,
                  borderRadius: '8px'
                }}
              >
                View Wishlist
              </Button>
              <Button 
                size="large"
                icon={<PhoneOutlined />}
                style={{
                  borderColor: terracottaTheme.primary,
                  color: terracottaTheme.primary,
                  borderRadius: '8px'
                }}
              >
                Contact Support
              </Button>
            </Space>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Orders;