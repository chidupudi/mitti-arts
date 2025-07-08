// client/src/adminpages/ganeshseason/components/AddGaneshIdolDialog.js
import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Button,
  Typography,
  Switch,
  Select,
  Divider,
  Card,
  Space,
  Tag,
  Alert,
  message,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  CameraOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CrownOutlined,
  StarOutlined,
  FireOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Import Cloudinary utilities with try-catch for safety
let uploadToCloudinary, validateImageFile;
try {
  const cloudinaryUtils = require('../../../utils/cloudinary');
  uploadToCloudinary = cloudinaryUtils.uploadToCloudinary;
  validateImageFile = cloudinaryUtils.validateImageFile;
} catch (error) {
  console.warn('Cloudinary utils not found, using fallback');
  // Fallback functions
  uploadToCloudinary = async (file) => {
    throw new Error('Cloudinary not configured');
  };
  validateImageFile = (file) => {
    return true;
  };
}

const AddGaneshIdolDialog = ({
  open,
  onClose,
  idol,
  setIdol,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [features, setFeatures] = useState(idol.features || []);
  const [newFeature, setNewFeature] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);

  // Function to handle form field changes
  const handleChange = (field, value) => {
    setIdol({ ...idol, [field]: value });
    form.setFieldsValue({ [field]: value });
  };

  // Handle image upload with direct Cloudinary integration
  const handleImageChange = async (e, index) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file before upload
      if (validateImageFile) {
        validateImageFile(file);
      }

      // Set loading state for this specific index
      setUploadingIndex(index);
      const newImages = [...(idol.images || Array(8).fill(''))];
      newImages[index] = 'loading';
      handleChange('images', newImages);

      // Upload to cloudinary
      let imageUrl;
      if (uploadToCloudinary) {
        imageUrl = await uploadToCloudinary(file);
      } else {
        throw new Error('Upload service not available');
      }

      // Update with actual URL
      const updatedImages = [...(idol.images || Array(8).fill(''))];
      updatedImages[index] = imageUrl;
      handleChange('images', updatedImages);

      message.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Reset loading state on error
      const resetImages = [...(idol.images || Array(8).fill(''))];
      resetImages[index] = '';
      handleChange('images', resetImages);
      
      message.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingIndex(null);
    }
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...(idol.images || Array(8).fill(''))];
    newImages[index] = '';
    handleChange('images', newImages);
  };

  // Add feature
  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      handleChange('features', updatedFeatures);
      setNewFeature('');
    }
  };

  // Remove feature
  const removeFeature = (featureToRemove) => {
    const updatedFeatures = features.filter(feature => feature !== featureToRemove);
    setFeatures(updatedFeatures);
    handleChange('features', updatedFeatures);
  };

const calculateAdvancePreview = () => {
  if (!idol.price) return 0;
  if (idol.price >= 8000 && idol.price <= 10000) return 2000;
  if (idol.price > 10000 && idol.price <= 15000) return 2500;
  if (idol.price > 15000) return 3000;
  return 2000; // Default
};

  // Image upload component
  const ImageUploadCard = ({ index }) => {
    const imageUrl = idol.images?.[index];
    const isLoading = uploadingIndex === index || imageUrl === 'loading';

    return (
      <Card
        style={{
          height: '140px',
          border: '2px dashed #FFB74D',
          borderRadius: '8px',
          position: 'relative',
          cursor: !imageUrl ? 'pointer' : 'default',
        }}
        bodyStyle={{ 
          padding: 0, 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        onClick={() => {
          if (!imageUrl && !isLoading) {
            document.getElementById(`image-upload-${index}`).click();
          }
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center' }}>
            <LoadingOutlined style={{ fontSize: '32px', color: '#FF8F00' }} />
            <div style={{ marginTop: '8px', color: '#FF8F00', fontSize: '12px' }}>
              Uploading...
            </div>
          </div>
        ) : imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={`Ganesh Idol ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '6px',
              }}
            />
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
              }}
              onClick={(e) => {
                e.stopPropagation();
                removeImage(index);
              }}
            />
            {index === 0 && (
              <div style={{
                position: 'absolute',
                bottom: '4px',
                left: '4px',
                background: 'rgba(255, 143, 0, 0.9)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                PRIMARY
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CloudUploadOutlined style={{ fontSize: '32px', color: '#FF8F00' }} />
            <div style={{ marginTop: 8, color: '#FF6F00' }}>Upload Image</div>
          </div>
        )}
        
        <input
          type="file"
          id={`image-upload-${index}`}
          style={{ display: 'none' }}
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => handleImageChange(e, index)}
        />
      </Card>
    );
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusOutlined style={{ color: '#FF8F00' }} />
          <span style={{ color: '#E65100' }}>🕉️ Add New Ganesh Idol</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose} size="large">
          Cancel
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          icon={<SaveOutlined />}
          onClick={onSave}
          size="large"
          style={{
            background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
            border: 'none',
            fontWeight: '600'
          }}
        >
          🕉️ Add Ganesh Idol
        </Button>,
      ]}
      styles={{
        header: {
          background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
          borderBottom: '2px solid #FFB74D'
        }
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
        {/* Basic Information */}
        <Card 
          title={
            <Space>
              <CrownOutlined style={{ color: '#FF8F00' }} />
              <span style={{ color: '#E65100' }}>Basic Information</span>
            </Space>
          }
          style={{ marginBottom: '16px', borderColor: '#FFE0B2' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<Text strong>Idol Name *</Text>}
                name="name"
                rules={[{ required: true, message: 'Idol name is required' }]}
              >
                <Input
                  value={idol.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g., Traditional Ganesha, Modern Eco-Friendly Ganesha"
                  prefix="🕉️"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Category *</Text>} name="category">
                <Select
                  value={idol.category}
                  onChange={value => handleChange('category', value)}
                  placeholder="Select category"
                >
                  <Option value="traditional">
                    <Space><CrownOutlined style={{ color: '#8E24AA' }} /> Traditional</Space>
                  </Option>
                  <Option value="modern">
                    <Space><StarOutlined style={{ color: '#1976D2' }} /> Modern</Space>
                  </Option>
                  <Option value="premium">
                    <Space><FireOutlined style={{ color: '#D32F2F' }} /> Premium</Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={<Text strong>Description</Text>} name="description">
            <TextArea
              rows={3}
              value={idol.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Describe the Ganesh idol - style, significance, special features..."
            />
          </Form.Item>
        </Card>

        {/* Pricing & Business */}
        <Card 
          title={
            <Space>
              <DollarOutlined style={{ color: '#4CAF50' }} />
              <span style={{ color: '#E65100' }}>Pricing & Business Details</span>
            </Space>
          }
          style={{ marginBottom: '16px', borderColor: '#FFE0B2' }}
        >
          <Row gutter={16}>
  <Col span={12}>
    <Form.Item
      label={<Text strong>Price (₹) *</Text>}
      name="price"
      rules={[{ required: true, message: 'Price is required' }]}
    >
      <InputNumber
        style={{ width: '100%' }}
        value={idol.price}
        onChange={value => handleChange('price', value)}
        formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={value => value.replace(/₹\s?|(,*)/g, '')}
        placeholder="15000"
        min={1000}
        max={50000}
      />
    </Form.Item>
  </Col>
  <Col span={12}>
              <Form.Item label={<Text strong>Advance % *</Text>} name="advancePercentage">
                <InputNumber
                  style={{ width: '100%' }}
                  value={idol.advancePercentage}
                  onChange={value => handleChange('advancePercentage', value)}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                  placeholder="25"
                  min={10}
                  max={50}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Advance Preview */}
          {idol.price && (
  <Alert
    message={
      <div>
        <Text strong>💰 Advance Amount Preview: </Text>
        <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>
          ₹{calculateAdvancePreview().toLocaleString()} 
        </Text>
        <Text type="secondary">
          {' '}(for price of ₹{idol.price.toLocaleString()})
        </Text>
      </div>
    }
              type="info"
              style={{ marginTop: '8px' }}
            />
          )}

          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Form.Item label={<Text strong>Availability</Text>} name="availability">
                <Select
                  value={idol.availability}
                  onChange={value => handleChange('availability', value)}
                  placeholder="Select availability"
                >
                  <Option value="available">✅ Available</Option>
                  <Option value="custom-order">🛠️ Custom Order Only</Option>
                  <Option value="sold-out">❌ Sold Out</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Estimated Days</Text>} name="estimatedDays">
                <InputNumber
                  style={{ width: '100%' }}
                  value={idol.estimatedDays}
                  onChange={value => handleChange('estimatedDays', value)}
                  placeholder="7"
                  min={1}
                  max={30}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Physical Specifications */}
        <Card 
          title={
            <Space>
              <ToolOutlined style={{ color: '#1976D2' }} />
              <span style={{ color: '#E65100' }}>Physical Specifications</span>
            </Space>
          }
          style={{ marginBottom: '16px', borderColor: '#FFE0B2' }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={<Text strong>Height</Text>} name="height">
                <Input
                  value={idol.height || ''}
                  onChange={e => handleChange('height', e.target.value)}
                  placeholder="e.g., 12 inches, 1.5 feet"
                  suffix="📏"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Text strong>Weight</Text>} name="weight">
                <Input
                  value={idol.weight || ''}
                  onChange={e => handleChange('weight', e.target.value)}
                  placeholder="e.g., 2.5 kg"
                  suffix="⚖️"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Text strong>Color</Text>} name="color">
                <Input
                  value={idol.color || ''}
                  onChange={e => handleChange('color', e.target.value)}
                  placeholder="e.g., Natural Clay, Golden"
                  suffix="🎨"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label={<Text strong>Material</Text>} name="material">
                <Input
                  value={idol.material || ''}
                  onChange={e => handleChange('material', e.target.value)}
                  placeholder="e.g., Eco-friendly Clay, Plaster of Paris"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Text strong>Customizable</Text>} name="customizable">
                <Switch
                  checked={idol.customizable}
                  onChange={value => handleChange('customizable', value)}
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                />
                <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                  Can customers request modifications?
                </Text>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Features */}
        <Card 
          title={
            <Space>
              <StarOutlined style={{ color: '#E91E63' }} />
              <span style={{ color: '#E65100' }}>Features & Highlights</span>
            </Space>
          }
          style={{ marginBottom: '16px', borderColor: '#FFE0B2' }}
        >
          <Space.Compact style={{ width: '100%', marginBottom: '12px' }}>
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature (e.g., Hand-crafted, Eco-friendly, Detailed carving)"
              onPressEnter={addFeature}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={addFeature}
              style={{ background: '#FF8F00', borderColor: '#FF8F00' }}
            >
              Add
            </Button>
          </Space.Compact>
          
          <Space wrap>
            {features.map((feature, index) => (
              <Tag
                key={index}
                closable
                onClose={() => removeFeature(feature)}
                style={{
                  background: '#FFF3E0',
                  borderColor: '#FFB74D',
                  color: '#E65100',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                {feature}
              </Tag>
            ))}
          </Space>
          
          {features.length === 0 && (
            <Text type="secondary">No features added yet. Add features to highlight this idol's uniqueness.</Text>
          )}
        </Card>

        {/* Image Upload Section */}
        <Card 
          title={
            <Space>
              <CameraOutlined style={{ color: '#9C27B0' }} />
              <span style={{ color: '#E65100' }}>Ganesh Idol Images (Upload up to 8 images)</span>
            </Space>
          }
          style={{ marginBottom: '16px', borderColor: '#FFE0B2' }}
        >
          <Alert
            message="Image Guidelines"
            description="Upload high-quality images showing different angles of the Ganesh idol. First image will be the primary display image. Supported formats: JPEG, PNG, GIF, WebP (Max 5MB each)"
            type="info"
            style={{ marginBottom: '16px' }}
            icon={<InfoCircleOutlined />}
          />
          
          <Row gutter={[16, 16]}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Col span={6} key={index}>
                <ImageUploadCard index={index} />
                {index === 0 && (
                  <Text type="secondary" style={{ fontSize: '10px', textAlign: 'center', display: 'block', marginTop: '4px' }}>
                    Primary Image
                  </Text>
                )}
              </Col>
            ))}
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default AddGaneshIdolDialog;