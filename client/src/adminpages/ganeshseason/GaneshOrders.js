// client/src/adminpages/ganeshseason/GaneshOrders.js
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Table, Button, Tag, Space, Typography, Alert, Spin, Badge, Modal, Form, Input, Select, Descriptions, Steps, Divider, Progress, message } from 'antd';
import { 
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  TruckOutlined,
  GiftOutlined,
  EyeOutlined,
  EditOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  CalendarOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, updateDoc, doc, serverTimestamp, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import { useSeason } from '../../hooks/useSeason';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const GaneshOrders = () => {
  const navigate = useNavigate();
  const { isGaneshSeason } = useSeason();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();

  // Real-time orders subscription
  useEffect(() => {
    if (!isGaneshSeason) return;

    const ordersQuery = query(collection(db, 'ganeshOrders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = [];
      snapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isGaneshSeason]);

  // Handle status update
  const handleStatusUpdate = async (values) => {
    try {
      const { status, notes } = values;
      
      await updateDoc(doc(db, 'ganeshOrders', selectedOrder.id), {
        status: status,
        updatedAt: serverTimestamp(),
        ...(notes && { 
          statusHistory: [
            ...(selectedOrder.statusHistory || []),
            {
              status: status,
              notes: notes,
              updatedBy: 'admin',
              timestamp: serverTimestamp()
            }
          ]
        }),
        ...(status === 'in_production' && { productionStartedAt: serverTimestamp() }),
        ...(status === 'ready_for_delivery' && { readyAt: serverTimestamp() }),
        ...(status === 'delivered' && { deliveredAt: serverTimestamp() }),
        ...(status === 'cancelled' && { cancelledAt: serverTimestamp() })
      });
      
      setUpdateStatusModalVisible(false);
      setSelectedOrder(null);
      form.resetFields();
      message.success('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    }
  };

  // Handle payment confirmation
  const handlePaymentConfirmation = async (values) => {
    try {
      const { paymentMethod, transactionId, notes } = values;
      
      await updateDoc(doc(db, 'ganeshOrders', selectedOrder.id), {
        paymentStatus: 'paid',
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        paidAt: serverTimestamp(),
        status: selectedOrder.status === 'pending_advance' ? 'advance_paid' : selectedOrder.status,
        updatedAt: serverTimestamp(),
        paymentNotes: notes
      });
      
      // Create payment record
      await addDoc(collection(db, 'ganeshPayments'), {
        orderId: selectedOrder.id,
        customerId: selectedOrder.customerId,
        amount: selectedOrder.advanceAmount,
        paymentType: 'advance',
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        status: 'completed',
        createdAt: serverTimestamp()
      });
      
      setPaymentModalVisible(false);
      setSelectedOrder(null);
      paymentForm.resetFields();
      message.success('Payment confirmed successfully!');
    } catch (error) {
      console.error('Error confirming payment:', error);
      message.error('Failed to confirm payment');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    const paymentMatch = filterPayment === 'all' || order.paymentStatus === filterPayment;
    return statusMatch && paymentMatch;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_advance': return 'orange';
      case 'advance_paid': return 'blue';
      case 'in_production': return 'purple';
      case 'ready_for_delivery': return 'cyan';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'paid': return 'green';
      case 'failed': return 'red';
      case 'refunded': return 'purple';
      default: return 'default';
    }
  };

  // Get order progress
  const getOrderProgress = (status) => {
    const statusMap = {
      'pending_advance': 20,
      'advance_paid': 40,
      'in_production': 60,
      'ready_for_delivery': 80,
      'delivered': 100,
      'cancelled': 0
    };
    return statusMap[status] || 0;
  };

  // Table columns
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <Text strong style={{ fontSize: '12px' }}>
          #{id.slice(-8).toUpperCase()}
        </Text>
      )
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <Text strong>{record.customerInfo?.name || 'N/A'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <PhoneOutlined /> {record.customerInfo?.phone}
          </Text>
        </div>
      )
    },
    {
      title: 'Idol Details',
      key: 'idol',
      render: (_, record) => (
        <div>
          <Text strong>{record.idolDetails?.name || 'N/A'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Final Price: ₹{record.finalPrice?.toLocaleString()}
          </Text>
          {record.idolDetails?.height && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.idolDetails.height}
              </Text>
            </>
          )}
        </div>
      )
    },
    {
      title: 'Payment',
      key: 'payment',
      render: (_, record) => (
        <div>
          <Text strong>Advance: ₹{record.advanceAmount?.toLocaleString()}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Remaining: ₹{record.remainingAmount?.toLocaleString()}
          </Text>
          <br />
          <Tag color={getPaymentStatusColor(record.paymentStatus)} style={{ fontSize: '10px' }}>
            {record.paymentStatus?.toUpperCase()}
          </Tag>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <div>
          <Tag color={getStatusColor(record.status)} style={{ marginBottom: '4px' }}>
            {record.status?.replace('_', ' ').toUpperCase()}
          </Tag>
          <br />
          <Progress 
            percent={getOrderProgress(record.status)} 
            size="small" 
            showInfo={false}
            strokeColor={record.status === 'cancelled' ? '#ff4d4f' : '#1890ff'}
          />
        </div>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (
        <Text style={{ fontSize: '12px' }}>
          {createdAt?.toDate ? createdAt.toDate().toLocaleDateString() : 'N/A'}
        </Text>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setViewModalVisible(true);
            }}
          >
            View
          </Button>
          {record.paymentStatus === 'pending' && (
            <Button 
              size="small" 
              type="primary"
              style={{ background: '#52c41a' }}
              icon={<PaymentOutlined />}
              onClick={() => {
                setSelectedOrder(record);
                setPaymentModalVisible(true);
              }}
            >
              Confirm Payment
            </Button>
          )}
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setUpdateStatusModalVisible(true);
            }}
            disabled={record.status === 'delivered' || record.status === 'cancelled'}
          >
            Update Status
          </Button>
        </Space>
      )
    }
  ];

  // Statistics
  const stats = {
    total: orders.length,
    pendingAdvance: orders.filter(o => o.status === 'pending_advance').length,
    advancePaid: orders.filter(o => o.status === 'advance_paid').length,
    inProduction: orders.filter(o => o.status === 'in_production').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.advanceAmount || 0), 0)
  };

  if (!isGaneshSeason) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Content style={{ padding: '24px' }}>
          <Alert
            message="Ganesh Season Not Active"
            description="Order management is only available during Ganesh season."
            type="warning"
            showIcon
            action={
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            color: 'white'
          }}>
            <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
              🛒 Ganesh Orders Management
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
              Track advance payments and order fulfillment
            </Text>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{stats.total}</Title>
                <Text type="secondary">Total Orders</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#fa8c16' }}>{stats.pendingAdvance}</Title>
                <Text type="secondary">Pending Advance</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{stats.advancePaid}</Title>
                <Text type="secondary">Advance Paid</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#722ed1' }}>{stats.inProduction}</Title>
                <Text type="secondary">In Production</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#52c41a' }}>{stats.delivered}</Title>
                <Text type="secondary">Delivered</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#13c2c2' }}>₹{stats.totalRevenue.toLocaleString()}</Title>
                <Text type="secondary">Total Revenue</Text>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
            <Space wrap>
              <div>
                <Text strong>Order Status:</Text>
                <Select 
                  value={filterStatus} 
                  onChange={setFilterStatus}
                  style={{ width: 180, marginLeft: 8 }}
                >
                  <Option value="all">All Orders</Option>
                  <Option value="pending_advance">Pending Advance</Option>
                  <Option value="advance_paid">Advance Paid</Option>
                  <Option value="in_production">In Production</Option>
                  <Option value="ready_for_delivery">Ready for Delivery</Option>
                  <Option value="delivered">Delivered</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </div>
              <div>
                <Text strong>Payment Status:</Text>
                <Select 
                  value={filterPayment} 
                  onChange={setFilterPayment}
                  style={{ width: 150, marginLeft: 8 }}
                >
                  <Option value="all">All Payments</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="paid">Paid</Option>
                  <Option value="failed">Failed</Option>
                  <Option value="refunded">Refunded</Option>
                </Select>
              </div>
              <Badge count={filteredOrders.length} style={{ backgroundColor: '#52c41a' }}>
                <Button icon={<ShoppingCartOutlined />}>Showing Results</Button>
              </Badge>
            </Space>
          </Card>

          {/* Orders Table */}
          <Card style={{ borderRadius: '12px' }}>
            <Table
              columns={columns}
              dataSource={filteredOrders}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`
              }}
              scroll={{ x: 1000 }}
            />
          </Card>

          {/* View Order Modal */}
          <Modal
            title="Order Details"
            open={viewModalVisible}
            onCancel={() => setViewModalVisible(false)}
            footer={null}
            width={800}
          >
            {selectedOrder && (
              <div>
                {/* Order Progress */}
                <div style={{ marginBottom: '24px' }}>
                  <Title level={5}>Order Progress</Title>
                  <Steps 
                    size="small" 
                    current={
                      selectedOrder.status === 'pending_advance' ? 0 :
                      selectedOrder.status === 'advance_paid' ? 1 :
                      selectedOrder.status === 'in_production' ? 2 :
                      selectedOrder.status === 'ready_for_delivery' ? 3 :
                      selectedOrder.status === 'delivered' ? 4 : 0
                    }
                    status={selectedOrder.status === 'cancelled' ? 'error' : 'process'}
                  >
                    <Step title="Advance Pending" icon={<ClockCircleOutlined />} />
                    <Step title="Advance Paid" icon={<PaymentOutlined />} />
                    <Step title="In Production" icon={<GiftOutlined />} />
                    <Step title="Ready for Delivery" icon={<TruckOutlined />} />
                    <Step title="Delivered" icon={<CheckCircleOutlined />} />
                  </Steps>
                </div>

                <Divider />

                {/* Order Information */}
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Title level={5}>Customer Information</Title>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Name">{selectedOrder.customerInfo?.name}</Descriptions.Item>
                      <Descriptions.Item label="Phone">{selectedOrder.customerInfo?.phone}</Descriptions.Item>
                      <Descriptions.Item label="Email">{selectedOrder.customerInfo?.email || 'Not provided'}</Descriptions.Item>
                    </Descriptions>
                  </Col>
                  
                  <Col span={12}>
                    <Title level={5}>Idol Details</Title>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Idol Name">{selectedOrder.idolDetails?.name}</Descriptions.Item>
                      <Descriptions.Item label="Category">{selectedOrder.idolDetails?.category}</Descriptions.Item>
                      <Descriptions.Item label="Height">{selectedOrder.idolDetails?.height || 'Not specified'}</Descriptions.Item>
                      <Descriptions.Item label="Material">{selectedOrder.idolDetails?.material || 'Not specified'}</Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>

                <Divider />

                {/* Payment Information */}
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Title level={5}>Payment Details</Title>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Final Price">₹{selectedOrder.finalPrice?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="Advance Amount">₹{selectedOrder.advanceAmount?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="Remaining Amount">₹{selectedOrder.remainingAmount?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="Payment Status">
                        <Tag color={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                          {selectedOrder.paymentStatus?.toUpperCase()}
                        </Tag>
                      </Descriptions.Item>
                      {selectedOrder.paymentMethod && (
                        <Descriptions.Item label="Payment Method">{selectedOrder.paymentMethod}</Descriptions.Item>
                      )}
                      {selectedOrder.transactionId && (
                        <Descriptions.Item label="Transaction ID">{selectedOrder.transactionId}</Descriptions.Item>
                      )}
                    </Descriptions>
                  </Col>
                  
                  <Col span={12}>
                    <Title level={5}>Order Status</Title>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Current Status">
                        <Tag color={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status?.replace('_', ' ').toUpperCase()}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Created">
                        {selectedOrder.createdAt?.toDate ? selectedOrder.createdAt.toDate().toLocaleString() : 'N/A'}
                      </Descriptions.Item>
                      {selectedOrder.paidAt && (
                        <Descriptions.Item label="Paid At">
                          {selectedOrder.paidAt.toDate ? selectedOrder.paidAt.toDate().toLocaleString() : 'N/A'}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Col>
                </Row>

                {/* Order Notes */}
                {selectedOrder.notes && (
                  <>
                    <Divider />
                    <Title level={5}>Order Notes</Title>
                    <Text>{selectedOrder.notes}</Text>
                  </>
                )}

                {/* Status History */}
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>Status History</Title>
                    {selectedOrder.statusHistory.map((history, index) => (
                      <div key={index} style={{ marginBottom: '8px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <Text strong>{history.status?.replace('_', ' ').toUpperCase()}</Text>
                        <Text type="secondary" style={{ marginLeft: '8px' }}>
                          {history.timestamp?.toDate ? history.timestamp.toDate().toLocaleString() : 'N/A'}
                        </Text>
                        {history.notes && (
                          <div>
                            <Text>{history.notes}</Text>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </Modal>

          {/* Update Status Modal */}
          <Modal
            title="Update Order Status"
            open={updateStatusModalVisible}
            onCancel={() => setUpdateStatusModalVisible(false)}
            onOk={() => form.submit()}
            okText="Update Status"
          >
            <Form form={form} onFinish={handleStatusUpdate} layout="vertical">
              <Form.Item
                name="status"
                label="New Status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select placeholder="Select new status">
                  <Option value="pending_advance">Pending Advance</Option>
                  <Option value="advance_paid">Advance Paid</Option>
                  <Option value="in_production">In Production</Option>
                  <Option value="ready_for_delivery">Ready for Delivery</Option>
                  <Option value="delivered">Delivered</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="notes"
                label="Status Notes"
              >
                <Input.TextArea rows={3} placeholder="Add notes about this status update..." />
              </Form.Item>
            </Form>
          </Modal>

          {/* Payment Confirmation Modal */}
          <Modal
            title="Confirm Payment"
            open={paymentModalVisible}
            onCancel={() => setPaymentModalVisible(false)}
            onOk={() => paymentForm.submit()}
            okText="Confirm Payment"
          >
            <Form form={paymentForm} onFinish={handlePaymentConfirmation} layout="vertical">
              <Alert
                message="Payment Confirmation"
                description={`Confirming advance payment of ₹${selectedOrder?.advanceAmount?.toLocaleString()} for this order.`}
                type="info"
                style={{ marginBottom: '16px' }}
              />
              
              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                rules={[{ required: true, message: 'Please select payment method' }]}
              >
                <Select placeholder="Select payment method">
                  <Option value="phonepe">PhonePe</Option>
                  <Option value="gpay">Google Pay</Option>
                  <Option value="paytm">Paytm</Option>
                  <Option value="bank_transfer">Bank Transfer</Option>
                  <Option value="cash">Cash</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="transactionId"
                label="Transaction ID / Reference Number"
                rules={[{ required: true, message: 'Please enter transaction ID' }]}
              >
                <Input placeholder="Enter transaction ID or reference number" />
              </Form.Item>
              
              <Form.Item
                name="notes"
                label="Payment Notes"
              >
                <Input.TextArea rows={2} placeholder="Any additional notes about the payment..." />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default GaneshOrders;