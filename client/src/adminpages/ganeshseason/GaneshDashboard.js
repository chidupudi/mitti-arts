// client/src/adminpages/ganeshseason/GaneshDashboard.js
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Typography, Statistic, Progress, Table, Tag, Space, Button, Alert, Spin, Timeline, List, Avatar } from 'antd';
import { 
  ShopOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  PhoneOutlined,
  GiftOutlined,
  CalendarOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import { useSeason } from '../../hooks/useSeason';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const { Content } = Layout;
const { Title, Text } = Typography;

const GaneshDashboard = () => {
  const navigate = useNavigate();
  const { isGaneshSeason } = useSeason();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    idols: [],
    leads: [],
    orders: [],
    recentActivity: []
  });

  // Real-time data subscription
  useEffect(() => {
    if (!isGaneshSeason) return;

    const unsubscribes = [];

    // Fetch Ganesh Idols
    const idolsQuery = collection(db, 'ganeshIdols');
    unsubscribes.push(
      onSnapshot(idolsQuery, (snapshot) => {
        const idolsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDashboardData(prev => ({ ...prev, idols: idolsData }));
      })
    );

    // Fetch Recent Leads
    const leadsQuery = query(collection(db, 'ganeshLeads'), orderBy('createdAt', 'desc'), limit(10));
    unsubscribes.push(
      onSnapshot(leadsQuery, (snapshot) => {
        const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDashboardData(prev => ({ ...prev, leads: leadsData }));
      })
    );

    // Fetch Recent Orders
    const ordersQuery = query(collection(db, 'ganeshOrders'), orderBy('createdAt', 'desc'), limit(10));
    unsubscribes.push(
      onSnapshot(ordersQuery, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDashboardData(prev => ({ ...prev, orders: ordersData }));
        setLoading(false);
      })
    );

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [isGaneshSeason]);

  if (!isGaneshSeason) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Content style={{ padding: '24px' }}>
          <Alert
            message="Ganesh Season Not Active"
            description="Ganesh dashboard is only available during Ganesh season."
            type="warning"
            showIcon
            action={
              <Button onClick={() => navigate('/dashboard')}>
                Go to Main Dashboard
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

  // Calculate statistics
  const stats = {
    totalIdols: dashboardData.idols.length,
    activeIdols: dashboardData.idols.filter(i => !i.hidden && i.availability === 'available').length,
    totalLeads: dashboardData.leads.length,
    newLeads: dashboardData.leads.filter(l => l.status === 'new').length,
    convertedLeads: dashboardData.leads.filter(l => l.status === 'converted').length,
    totalOrders: dashboardData.orders.length,
    pendingOrders: dashboardData.orders.filter(o => o.status === 'pending_advance').length,
    completedOrders: dashboardData.orders.filter(o => o.status === 'delivered').length,
    totalRevenue: dashboardData.orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.advanceAmount || 0), 0),
    conversionRate: dashboardData.leads.length > 0 ? ((dashboardData.leads.filter(l => l.status === 'converted').length / dashboardData.leads.length) * 100).toFixed(1) : 0
  };

  // Chart data
  const categoryData = dashboardData.idols.reduce((acc, idol) => {
    const category = idol.category || 'uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryData).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
    color: category === 'traditional' ? '#8E24AA' : category === 'modern' ? '#1976D2' : '#D32F2F'
  }));

  // Price range distribution
 const priceRangeData = dashboardData.idols.reduce((acc, idol) => {
      const price = idol.price || 0;
      if (price <= 10000) acc['₹8k-₹10k'] = (acc['₹8k-₹10k'] || 0) + 1;
      else if (price <= 15000) acc['₹10k-₹15k'] = (acc['₹10k-₹15k'] || 0) + 1;
      else acc['₹15k+'] = (acc['₹15k+'] || 0) + 1;
      return acc;
    }, {});
   const barChartData = Object.entries(priceRangeData).map(([range, count]) => ({
      range,
      count,
      advance: range === '₹8k-₹10k' ? 2000 : range === '₹10k-₹15k' ? 2500 : 3000
    }));
  // Recent activity
  const recentActivity = [
    ...dashboardData.leads.slice(0, 3).map(lead => ({
      type: 'lead',
      title: `New lead from ${lead.customerInfo?.name}`,
      description: `Interested in ${lead.idolDetails?.name}`,
      time: lead.createdAt?.toDate ? lead.createdAt.toDate() : new Date(),
      icon: <TeamOutlined style={{ color: '#1890ff' }} />
    })),
    ...dashboardData.orders.slice(0, 2).map(order => ({
      type: 'order',
      title: `Order ${order.paymentStatus === 'paid' ? 'payment confirmed' : 'created'}`,
      description: `₹${order.finalPrice?.toLocaleString()} - ${order.customerInfo?.name}`,
      time: order.createdAt?.toDate ? order.createdAt.toDate() : new Date(),
      icon: <ShoppingCartOutlined style={{ color: '#52c41a' }} />
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            color: 'white'
          }}>
            <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
              🕉️ Ganesh Season Dashboard
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
              Complete overview of your Ganesh festival business
            </Text>
          </div>

          {/* Key Metrics */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Active Idols"
                  value={stats.activeIdols}
                  prefix={<GiftOutlined />}
                  suffix={`/ ${stats.totalIdols}`}
                  valueStyle={{ color: '#FF8F00' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Leads"
                  value={stats.totalLeads}
                  prefix={<TeamOutlined />}
                  suffix={stats.newLeads > 0 ? `(${stats.newLeads} new)` : ''}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Orders"
                  value={stats.totalOrders}
                  prefix={<ShoppingCartOutlined />}
                  suffix={stats.pendingOrders > 0 ? `(${stats.pendingOrders} pending)` : ''}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Revenue (Advance)"
                  value={stats.totalRevenue}
                  prefix="₹"
                  precision={0}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Performance Metrics */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8}>
              <Card title="🎯 Conversion Rate" extra={<Button type="link" onClick={() => navigate('/ganesh-leads')}>View Leads</Button>}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={parseFloat(stats.conversionRate)}
                    format={percent => `${percent}%`}
                    strokeColor={stats.conversionRate > 50 ? '#52c41a' : stats.conversionRate > 30 ? '#faad14' : '#ff4d4f'}
                  />
                  <div style={{ marginTop: '16px' }}>
                    <Text strong>{stats.convertedLeads}</Text> <Text type="secondary">/ {stats.totalLeads} leads converted</Text>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Card title="📊 Idol Categories" extra={<Button type="link" onClick={() => navigate('/ganesh-inventory')}>Manage Inventory</Button>}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  {pieChartData.map((entry, index) => (
                    <Tag key={index} color={entry.color} style={{ margin: '2px' }}>
                      {entry.name}: {entry.value}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Card title="💰 Price Brackets" extra={<Button type="link" onClick={() => navigate('/ganesh-orders')}>View Orders</Button>}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Idols' : 'Advance']} />
                    <Bar dataKey="count" fill="#FF8F00" name="count" />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  <div>₹8k-₹10k: ₹2k advance</div>
                  <div>₹10k-₹15k: ₹2.5k advance</div>
                  <div>₹15k+: ₹3k advance</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Tables Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {/* Recent Leads */}
            <Col xs={24} lg={12}>
              <Card 
                title="🙋‍♂️ Recent Leads" 
                extra={<Button type="primary" onClick={() => navigate('/ganesh-leads')}>View All</Button>}
              >
                <Table
                  dataSource={dashboardData.leads.slice(0, 5)}
                  columns={[
                    {
                      title: 'Customer',
                      key: 'customer',
                      render: (_, record) => (
                        <div>
                          <Text strong>{record.customerInfo?.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.customerInfo?.phone}
                          </Text>
                        </div>
                      )
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => (
                        <Tag color={
                          status === 'new' ? 'blue' :
                          status === 'contacted' ? 'orange' :
                          status === 'converted' ? 'green' :
                          status === 'lost' ? 'red' : 'default'
                        }>
                          {status?.toUpperCase()}
                        </Tag>
                      )
                    },
                    {
                      title: 'Action',
                      key: 'action',
                      render: (_, record) => (
                        <Button size="small" icon={<PhoneOutlined />} type="link">
                          Contact
                        </Button>
                      )
                    }
                  ]}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </Card>
            </Col>

            {/* Recent Orders */}
            <Col xs={24} lg={12}>
              <Card 
                title="🛒 Recent Orders" 
                extra={<Button type="primary" onClick={() => navigate('/ganesh-orders')}>View All</Button>}
              >
                <Table
                  dataSource={dashboardData.orders.slice(0, 5)}
                  columns={[
                    {
                      title: 'Customer',
                      key: 'customer',
                      render: (_, record) => (
                        <div>
                          <Text strong>{record.customerInfo?.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            ₹{record.finalPrice?.toLocaleString()}
                          </Text>
                        </div>
                      )
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => (
                        <Tag color={
                          status === 'pending_advance' ? 'orange' :
                          status === 'advance_paid' ? 'blue' :
                          status === 'in_production' ? 'purple' :
                          status === 'delivered' ? 'green' : 'default'
                        }>
                          {status?.replace('_', ' ').toUpperCase()}
                        </Tag>
                      )
                    },
                    {
                      title: 'Payment',
                      dataIndex: 'paymentStatus',
                      key: 'paymentStatus',
                      render: (paymentStatus) => (
                        <Tag color={paymentStatus === 'paid' ? 'green' : 'orange'}>
                          {paymentStatus?.toUpperCase()}
                        </Tag>
                      )
                    }
                  ]}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </Card>
            </Col>
          </Row>

          {/* Recent Activity Timeline */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="📈 Business Insights">
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Statistic
                        title="Avg Idol Price"
                        value={dashboardData.idols.length > 0 ? Math.round(dashboardData.idols.reduce((sum, i) => sum + (i.price || 0), 0) / dashboardData.idols.length) : 0}
                        prefix="₹"
                        valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Statistic
                        title="Avg Advance"
                        value={stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}
                        prefix="₹"
                        valueStyle={{ fontSize: '18px', color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Statistic
                        title="Pending Revenue"
                        value={dashboardData.orders.filter(o => o.paymentStatus === 'pending').reduce((sum, o) => sum + (o.advanceAmount || 0), 0)}
                        prefix="₹"
                        valueStyle={{ fontSize: '18px', color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                </Row>
                
                <div style={{ marginTop: '24px' }}>
                  <Title level={5}>💡 Recommendations</Title>
                  <List
                    size="small"
                    dataSource={[
                      { text: `${stats.newLeads} new leads need immediate attention`, icon: <ClockCircleOutlined style={{ color: '#faad14' }} /> },
                      { text: `${stats.pendingOrders} orders awaiting advance payment`, icon: <DollarOutlined style={{ color: '#ff4d4f' }} /> },
                      { text: `Conversion rate is ${stats.conversionRate}% - ${parseFloat(stats.conversionRate) > 50 ? 'Excellent!' : 'Room for improvement'}`, icon: <TrophyOutlined style={{ color: '#52c41a' }} /> }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={item.icon}
                          title={item.text}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="⚡ Recent Activity">
                <Timeline>
                  {recentActivity.slice(0, 6).map((activity, index) => (
                    <Timeline.Item key={index} dot={activity.icon}>
                      <div>
                        <Text strong>{activity.title}</Text>
                        <br />
                        <Text type="secondary">{activity.description}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {activity.time.toLocaleString()}
                        </Text>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
                
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Space>
                    <Button size="small" onClick={() => navigate('/ganesh-leads')}>
                      View All Leads
                    </Button>
                    <Button size="small" onClick={() => navigate('/ganesh-orders')}>
                      View All Orders
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row style={{ marginTop: '24px' }}>
            <Col span={24}>
              <Card title="🚀 Quick Actions">
                <Space wrap>
                  <Button type="primary" icon={<GiftOutlined />} onClick={() => navigate('/ganesh-inventory')}>
                    Manage Idols
                  </Button>
                  <Button icon={<TeamOutlined />} onClick={() => navigate('/ganesh-leads')}>
                    Follow Up Leads
                  </Button>
                  <Button icon={<ShoppingCartOutlined />} onClick={() => navigate('/ganesh-orders')}>
                    Process Orders
                  </Button>
                  <Button icon={<DollarOutlined />} onClick={() => navigate('/ganesh-orders?filter=pending')}>
                    Collect Payments
                  </Button>
                  <Button icon={<CalendarOutlined />} onClick={() => navigate('/dashboard')}>
                    Main Dashboard
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default GaneshDashboard;