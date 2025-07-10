// client/src/pages/GaneshOrderSummary.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Form,
  Input,
  message,
  Divider,
  Space,
  Tag,
  Alert,
  Avatar,
  Steps,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  GiftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  MessageOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { auth, db } from '../Firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

// Terracotta colors
const colors = {
  primary: '#D2691E',
  ganesh: '#FF8F00',
  background: '#FDFCFA',
  backgroundLight: '#FFEEE6',
  text: '#2C1810',
  textSecondary: '#6B4423',
  success: '#8BC34A',
};

const GaneshOrderSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Get idol data from location state
  const { idol } = location.state || {};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        message.error('Please log in to show interest');
        navigate('/auth');
        return;
      }
      setUser(currentUser);
      setLoading(false);

      // Pre-fill form with user data
      form.setFieldsValue({
        customerName: currentUser.displayName || '',
        customerEmail: currentUser.email || '',
      });
    });

    return unsubscribe;
  }, [navigate, form]);

  useEffect(() => {
    if (!idol) {
      message.error('No idol data found');
      navigate('/products');
    }
  }, [idol, navigate]);

// Replace the leadData object in GaneshOrderSummary.js handleSubmitInterest function with this updated structure:

const handleSubmitInterest = async (values) => {
  if (!user || !idol) return;

  setSubmitting(true);
  try {
    // Calculate advance amount
    const advanceAmount = Math.round(idol.price * (idol.advancePercentage || 25) / 100);

    // Create lead data structure that matches what admin expects
    const leadData = {
      // Customer identification
      customerId: user.uid,
      
      // Customer contact information (matches admin display expectations)
      customerInfo: {
        name: values.customerName,
        phone: values.customerPhone,
        email: values.customerEmail,
        address: values.customerAddress,
      },
      
      // Idol details (matches admin display expectations)
      idolDetails: {
        id: idol.id,
        name: idol.name,
        price: idol.price,
        category: idol.category || 'traditional',
        height: idol.height || 'Standard',
        weight: idol.weight || 'Standard',
        color: idol.color || 'Natural',
        material: idol.material || 'Eco-friendly Clay',
        estimatedDays: idol.estimatedDays || 7,
        advancePercentage: idol.advancePercentage || 25,
        advanceAmount: advanceAmount,
        images: idol.images || [],
        customizable: idol.customizable || true,
        features: idol.features || [],
      },
      
      // Customer requirements
      requirements: values.specialRequirements || 'No specific requirements mentioned',
      
      // Lead status and metadata
      status: 'new', // new, contacted, interested, negotiating, converted, lost
      priority: 'normal', // normal, high, urgent
      source: 'website', // website, phone, referral, etc.
      leadScore: 0, // Can be updated by admin later
      
      // Admin notes (empty initially)
      adminNotes: '',
      contactAttempts: 0,
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Follow-up dates (initially null)
      nextFollowUp: null,
      contactedAt: null,
      convertedAt: null,
      lostAt: null,
      
      // Additional metadata
      deviceInfo: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || 'direct',
      }
    };

    await addDoc(collection(db, 'ganeshLeads'), leadData);

    // Move to success step
    setCurrentStep(2);
    
    message.success('🕉️ Your interest has been recorded successfully!');
    
    // Auto redirect after 5 seconds
    setTimeout(() => {
      navigate('/products');
    }, 5000);

  } catch (error) {
    console.error('Error submitting interest:', error);
    message.error('Failed to submit interest. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!idol) {
    return null;
  

  const advanceAmount = Math.round(idol.price * (idol.advancePercentage || 25) / 100);

  const steps = [
    {
      title: 'Idol Details',
      icon: <GiftOutlined />,
    },
    {
      title: 'Your Information',
      icon: <UserOutlined />,
    },
    {
      title: 'Confirmation',
      icon: <CheckCircleOutlined />,
    },
  ];

  const renderIdolSummary = () => (
    <Card
      style={{
        borderRadius: '12px',
        marginBottom: '24px',
        background: `linear-gradient(135deg, ${colors.ganesh}15 0%, #FFE0B2 100%)`,
        border: `1px solid ${colors.ganesh}30`,
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8}>
          <Avatar
            src={idol.images?.[0] || idol.imgUrl}
            alt={idol.name}
            shape="square"
            size={120}
            style={{ width: '100%', height: '120px' }}
          />
        </Col>
        <Col xs={24} sm={16}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Title level={4} style={{ margin: 0, color: colors.ganesh }}>
              🕉️ {idol.name}
            </Title>
            
            <Tag 
              color={idol.category === 'traditional' ? '#8E24AA' : idol.category === 'modern' ? '#1976D2' : '#D32F2F'}
              style={{ fontWeight: 'bold' }}
            >
              {idol.category?.charAt(0).toUpperCase() + idol.category?.slice(1)} Style
            </Tag>

            <div>
              <Text strong style={{ fontSize: '18px', color: colors.ganesh }}>
                ₹{idol.price?.toLocaleString()}
              </Text>
              <Text type="secondary" style={{ marginLeft: '8px' }}>
                (Advance: ₹{advanceAmount.toLocaleString()})
              </Text>
            </div>

            <Space wrap size="small">
              {idol.height && (
                <Tag size="small">📏 {idol.height}</Tag>
              )}
              {idol.material && (
                <Tag size="small">🏺 {idol.material}</Tag>
              )}
              <Tag size="small" icon={<CalendarOutlined />}>
                {idol.estimatedDays || 7} days
              </Tag>
            </Space>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const renderPersonalInfoForm = () => (
    <Card
      title={
        <Space>
          <UserOutlined style={{ color: colors.ganesh }} />
          <span>Your Contact Information</span>
        </Space>
      }
      style={{ borderRadius: '12px', marginBottom: '24px' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmitInterest}
        autoComplete="off"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Full Name"
              name="customerName"
              rules={[
                { required: true, message: 'Please enter your full name' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
                size="large"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              label="Phone Number"
              name="customerPhone"
              rules={[
                { required: true, message: 'Please enter your phone number' },
                { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Enter 10-digit phone number"
                size="large"
                maxLength={10}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24}>
            <Form.Item
              label="Email Address"
              name="customerEmail"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email address"
                size="large"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24}>
            <Form.Item
              label="Address"
              name="customerAddress"
              rules={[
                { required: true, message: 'Please enter your address' },
                { min: 10, message: 'Please enter a complete address' }
              ]}
            >
              <TextArea
                placeholder="Enter your complete address for delivery"
                rows={3}
                size="large"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24}>
            <Form.Item
              label="Special Requirements (Optional)"
              name="specialRequirements"
            >
              <TextArea
                placeholder="Any specific customizations or requirements for your Ganesh idol..."
                rows={3}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Alert
          message="Next Steps"
          description={
            <div>
              <Paragraph style={{ marginBottom: '8px' }}>
                After you submit this form:
              </Paragraph>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li>Our team will contact you within 24 hours</li>
                <li>We'll discuss customization details and confirm specifications</li>
                <li>Advance payment of ₹{advanceAmount.toLocaleString()} will be collected</li>
                <li>Production will begin after advance payment</li>
                <li>Delivery in {idol.estimatedDays || 7} days</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{
            marginBottom: '24px',
            backgroundColor: `${colors.ganesh}10`,
            border: `1px solid ${colors.ganesh}30`,
          }}
        />

        <div style={{ textAlign: 'center' }}>
          <Space size="middle">
            <Button
              onClick={() => navigate(-1)}
              size="large"
              style={{
                borderRadius: '8px',
                borderColor: colors.primary,
                color: colors.primary,
                fontWeight: 600,
              }}
            >
              <ArrowLeftOutlined /> Go Back
            </Button>
            
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
              icon={<GiftOutlined />}
              style={{
                borderRadius: '8px',
                backgroundColor: colors.ganesh,
                borderColor: colors.ganesh,
                fontWeight: 600,
                minWidth: '160px',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Interest'}
            </Button>
          </Space>
        </div>
      </Form>
    </Card>
  );

  const renderSuccessMessage = () => (
    <Card
      style={{
        borderRadius: '12px',
        textAlign: 'center',
        background: `linear-gradient(135deg, ${colors.success}15 0%, #E8F5E8 100%)`,
        border: `1px solid ${colors.success}30`,
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <CheckCircleOutlined 
          style={{ 
            fontSize: '64px', 
            color: colors.success,
            marginBottom: '16px' 
          }} 
        />
        
        <Title level={3} style={{ color: colors.success, marginBottom: '8px' }}>
          🕉️ Interest Submitted Successfully!
        </Title>
        
        <Paragraph style={{ fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
          Thank you for your interest in our <strong>{idol.name}</strong>. 
          Our team will contact you soon to discuss the customization details 
          and payment process.
        </Paragraph>
        
        <Alert
          message="What happens next?"
          description={
            <div style={{ textAlign: 'left' }}>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li><strong>Within 24 hours:</strong> Our team will call you</li>
                <li><strong>Discuss:</strong> Final design and customization</li>
                <li><strong>Advance Payment:</strong> ₹{advanceAmount.toLocaleString()} to start production</li>
                <li><strong>Delivery:</strong> Ready in {idol.estimatedDays || 7} days</li>
              </ul>
            </div>
          }
          type="success"
          showIcon
          style={{ marginTop: '16px' }}
        />
        
        <Space size="middle" style={{ marginTop: '24px' }}>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/products')}
            style={{
              borderRadius: '8px',
              backgroundColor: colors.ganesh,
              borderColor: colors.ganesh,
              fontWeight: 600,
            }}
          >
            Continue Shopping
          </Button>
          
          <Button
            size="large"
            onClick={() => navigate('/profile')}
            style={{
              borderRadius: '8px',
              borderColor: colors.primary,
              color: colors.primary,
              fontWeight: 600,
            }}
          >
            View Profile
          </Button>
        </Space>
        
        <Text type="secondary" style={{ fontSize: '14px' }}>
          Redirecting to products page in 5 seconds...
        </Text>
      </Space>
    </Card>
  );

  return (
    <div style={{ 
      backgroundColor: colors.background, 
      minHeight: '100vh', 
      padding: '24px 16px' 
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <Title level={2} style={{ 
            marginBottom: '8px',
            background: `linear-gradient(135deg, ${colors.ganesh} 0%, #FFB74D 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🕉️ Show Interest in Ganesh Idol
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Complete your details and our team will contact you soon
          </Text>
        </div>

        {/* Progress Steps */}
        <Card style={{ borderRadius: '12px', marginBottom: '24px' }}>
          <Steps current={currentStep} items={steps} />
        </Card>

        {/* Content based on current step */}
        {currentStep === 0 && (
          <>
            {renderIdolSummary()}
            <div style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                onClick={() => setCurrentStep(1)}
                icon={<UserOutlined />}
                style={{
                  borderRadius: '8px',
                  backgroundColor: colors.ganesh,
                  borderColor: colors.ganesh,
                  fontWeight: 600,
                  minWidth: '200px',
                }}
              >
                Proceed to Contact Details
              </Button>
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            {renderIdolSummary()}
            {renderPersonalInfoForm()}
          </>
        )}

        {currentStep === 2 && renderSuccessMessage()}
      </div>
    </div>
  );
};

export default GaneshOrderSummary;