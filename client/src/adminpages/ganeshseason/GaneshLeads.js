// client/src/adminpages/ganeshseason/GaneshLeads.js
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Table, Button, Tag, Space, Typography, Alert, Spin, Badge, Modal, Form, Input, Select, message } from 'antd';
import { 
  TeamOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  WhatsAppOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import { useSeason } from '../../hooks/useSeason';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const GaneshLeads = () => {
  const navigate = useNavigate();
  const { isGaneshSeason } = useSeason();
  const [leads, setLeads] = useState([]);
  const [ganeshIdols, setGaneshIdols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form] = Form.useForm();

  // Real-time leads subscription
  useEffect(() => {
    if (!isGaneshSeason) return;

    const leadsQuery = query(collection(db, 'ganeshLeads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = [];
      snapshot.forEach((doc) => {
        leadsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setLeads(leadsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isGaneshSeason]);

  // Fetch Ganesh idols for reference
  useEffect(() => {
    if (!isGaneshSeason) return;

    const idolsQuery = collection(db, 'ganeshIdols');
    const unsubscribe = onSnapshot(idolsQuery, (snapshot) => {
      const idolsData = [];
      snapshot.forEach((doc) => {
        idolsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setGaneshIdols(idolsData);
    });

    return () => unsubscribe();
  }, [isGaneshSeason]);

  // Handle status update
  const handleStatusUpdate = async (leadId, newStatus, notes = '') => {
    try {
      await updateDoc(doc(db, 'ganeshLeads', leadId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(notes && { adminNotes: notes }),
        ...(newStatus === 'contacted' && { contactedAt: serverTimestamp() }),
        ...(newStatus === 'converted' && { convertedAt: serverTimestamp() }),
        ...(newStatus === 'lost' && { lostAt: serverTimestamp() })
      });
      
      message.success(`Lead status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating lead status:', error);
      message.error('Failed to update lead status');
    }
  };

  // Handle lead conversion to order
  const handleConvertToOrder = async (values) => {
    try {
      const { finalPrice, advanceAmount, notes } = values;
      
      // Create order in ganeshOrders collection
      const orderData = {
        leadId: selectedLead.id,
        customerId: selectedLead.customerId,
        customerInfo: selectedLead.customerInfo,
        idolDetails: selectedLead.idolDetails,
        finalPrice: Number(finalPrice),
        advanceAmount: Number(advanceAmount),
        remainingAmount: Number(finalPrice) - Number(advanceAmount),
        status: 'pending_advance',
        paymentStatus: 'pending',
        notes: notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'ganeshOrders'), orderData);
      
      // Update lead status
      await handleStatusUpdate(selectedLead.id, 'converted', `Converted to order. Final price: ₹${finalPrice}`);
      
      setConvertModalVisible(false);
      setSelectedLead(null);
      form.resetFields();
      
      message.success('Lead converted to order successfully!');
    } catch (error) {
      console.error('Error converting lead:', error);
      message.error('Failed to convert lead to order');
    }
  };

  // Filter leads based on status
  const filteredLeads = leads.filter(lead => {
    if (filterStatus === 'all') return true;
    return lead.status === filterStatus;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'blue';
      case 'contacted': return 'orange';
      case 'interested': return 'cyan';
      case 'negotiating': return 'purple';
      case 'converted': return 'green';
      case 'lost': return 'red';
      default: return 'default';
    }
  };

  // Calculate advance amount based on price brackets
  const calculateAdvanceAmount = (price) => {
    if (price >= 8000 && price <= 10000) return 2000;
    if (price > 10000 && price <= 15000) return 2500;
    if (price > 15000) return 3000;
    return 2000; // Default
  };

  // Table columns
  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <Text strong>{record.customerInfo?.name || 'N/A'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <PhoneOutlined /> {record.customerInfo?.phone || 'N/A'}
          </Text>
          {record.customerInfo?.email && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <MailOutlined /> {record.customerInfo.email}
              </Text>
            </>
          )}
        </div>
      )
    },
    {
      title: 'Interested Idol',
      key: 'idol',
      render: (_, record) => (
        <div>
          <Text strong>{record.idolDetails?.name || 'N/A'}</Text>
          <br />
          <Text type="secondary">
            ₹{record.idolDetails?.priceMin?.toLocaleString()} - ₹{record.idolDetails?.priceMax?.toLocaleString()}
          </Text>
          {record.idolDetails?.height && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Height: {record.idolDetails.height}
              </Text>
            </>
          )}
        </div>
      )
    },
    {
      title: 'Requirements',
      dataIndex: 'requirements',
      key: 'requirements',
      render: (requirements) => (
        <Text style={{ fontSize: '12px' }}>
          {requirements ? requirements.substring(0, 50) + (requirements.length > 50 ? '...' : '') : 'No specific requirements'}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ textTransform: 'capitalize' }}>
          {status?.replace('_', ' ') || 'New'}
        </Tag>
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
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedLead(record);
              setViewModalVisible(true);
            }}
          >
            View
          </Button>
          <Button 
            size="small" 
            type="primary"
            icon={<PhoneOutlined />}
            onClick={() => {
              setSelectedLead(record);
              setContactModalVisible(true);
            }}
          >
            Contact
          </Button>
          {record.status !== 'converted' && record.status !== 'lost' && (
            <Button 
              size="small" 
              type="primary"
              style={{ background: '#52c41a' }}
              icon={<DollarOutlined />}
              onClick={() => {
                setSelectedLead(record);
                setConvertModalVisible(true);
              }}
            >
              Convert
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Statistics
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : 0
  };

  if (!isGaneshSeason) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Content style={{ padding: '24px' }}>
          <Alert
            message="Ganesh Season Not Active"
            description="Lead management is only available during Ganesh season."
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
            background: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            color: 'white'
          }}>
            <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
              🙋‍♂️ Ganesh Season Leads
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
              Manage customer inquiries and convert leads to orders
            </Text>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{stats.total}</Title>
                <Text type="secondary">Total Leads</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#722ed1' }}>{stats.new}</Title>
                <Text type="secondary">New Leads</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#fa8c16' }}>{stats.contacted}</Title>
                <Text type="secondary">Contacted</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#52c41a' }}>{stats.converted}</Title>
                <Text type="secondary">Converted</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#f5222d' }}>{stats.lost}</Title>
                <Text type="secondary">Lost</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4} xl={4}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#13c2c2' }}>{stats.conversionRate}%</Title>
                <Text type="secondary">Conversion Rate</Text>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
            <Space>
              <Text strong>Filter by Status:</Text>
              <Select 
                value={filterStatus} 
                onChange={setFilterStatus}
                style={{ width: 150 }}
              >
                <Option value="all">All Leads</Option>
                <Option value="new">New</Option>
                <Option value="contacted">Contacted</Option>
                <Option value="interested">Interested</Option>
                <Option value="negotiating">Negotiating</Option>
                <Option value="converted">Converted</Option>
                <Option value="lost">Lost</Option>
              </Select>
              <Badge count={filteredLeads.length} style={{ backgroundColor: '#52c41a' }}>
                <Button icon={<FilterOutlined />}>Showing Results</Button>
              </Badge>
            </Space>
          </Card>

          {/* Leads Table */}
          <Card style={{ borderRadius: '12px' }}>
            <Table
              columns={columns}
              dataSource={filteredLeads}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} leads`
              }}
              scroll={{ x: 800 }}
            />
          </Card>

          {/* View Lead Modal */}
          <Modal
            title="Lead Details"
            open={viewModalVisible}
            onCancel={() => setViewModalVisible(false)}
            footer={null}
            width={600}
          >
            {selectedLead && (
              <div>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Customer Name:</Text>
                    <br />
                    <Text>{selectedLead.customerInfo?.name}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Phone:</Text>
                    <br />
                    <Text>{selectedLead.customerInfo?.phone}</Text>
                  </Col>
                  <Col span={24}>
                    <Text strong>Email:</Text>
                    <br />
                    <Text>{selectedLead.customerInfo?.email || 'Not provided'}</Text>
                  </Col>
                  <Col span={24}>
                    <Text strong>Interested Idol:</Text>
                    <br />
                    <Text>{selectedLead.idolDetails?.name}</Text>
                    <br />
                    <Text type="secondary">
                      Price Range: ₹{selectedLead.idolDetails?.priceMin?.toLocaleString()} - ₹{selectedLead.idolDetails?.priceMax?.toLocaleString()}
                    </Text>
                  </Col>
                  <Col span={24}>
                    <Text strong>Requirements:</Text>
                    <br />
                    <Text>{selectedLead.requirements || 'No specific requirements mentioned'}</Text>
                  </Col>
                  <Col span={24}>
                    <Text strong>Status:</Text>
                    <br />
                    <Tag color={getStatusColor(selectedLead.status)}>
                      {selectedLead.status?.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </Col>
                </Row>
              </div>
            )}
          </Modal>

          {/* Contact Modal */}
          <Modal
            title="Contact Lead"
            open={contactModalVisible}
            onCancel={() => setContactModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setContactModalVisible(false)}>
                Cancel
              </Button>,
              <Button 
                key="contacted" 
                type="primary"
                onClick={() => {
                  handleStatusUpdate(selectedLead?.id, 'contacted');
                  setContactModalVisible(false);
                }}
              >
                Mark as Contacted
              </Button>
            ]}
          >
            {selectedLead && (
              <div>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Customer: {selectedLead.customerInfo?.name}</Text>
                    <br />
                    <Text>Phone: {selectedLead.customerInfo?.phone}</Text>
                  </div>
                  
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<PhoneOutlined />}
                      href={`tel:${selectedLead.customerInfo?.phone}`}
                    >
                      Call Now
                    </Button>
                    <Button 
                      type="primary" 
                      style={{ background: '#25d366' }}
                      icon={<WhatsAppOutlined />}
                      href={`https://wa.me/91${selectedLead.customerInfo?.phone?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                    >
                      WhatsApp
                    </Button>
                  </Space>
                </Space>
              </div>
            )}
          </Modal>

          {/* Convert to Order Modal */}
          <Modal
            title="Convert Lead to Order"
            open={convertModalVisible}
            onCancel={() => setConvertModalVisible(false)}
            onOk={() => form.submit()}
            okText="Create Order"
            width={600}
          >
            <Form form={form} onFinish={handleConvertToOrder} layout="vertical">
              <Form.Item
                name="finalPrice"
                label="Final Negotiated Price (₹)"
                rules={[{ required: true, message: 'Please enter the final price' }]}
              >
                <Input 
                  type="number" 
                  placeholder="Enter final price"
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    const suggestedAdvance = calculateAdvanceAmount(price);
                    form.setFieldsValue({ advanceAmount: suggestedAdvance });
                  }}
                />
              </Form.Item>
              
              <Form.Item
                name="advanceAmount"
                label="Advance Amount (₹)"
                rules={[{ required: true, message: 'Please enter the advance amount' }]}
              >
                <Input type="number" placeholder="Advance amount" />
              </Form.Item>
              
              <Form.Item
                name="notes"
                label="Order Notes"
              >
                <Input.TextArea rows={3} placeholder="Any special notes for this order..." />
              </Form.Item>
              
              <Alert
                message="Price Bracket Information"
                description={
                  <div>
                    <Text>• ₹8k-₹10k: ₹2,000 advance</Text><br />
                    <Text>• ₹10k-₹15k: ₹2,500 advance</Text><br />
                    <Text>• Above ₹15k: ₹3,000 advance</Text>
                  </div>
                }
                type="info"
                style={{ marginTop: '16px' }}
              />
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default GaneshLeads;