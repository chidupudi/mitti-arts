// client/src/adminpages/ganeshseason/components/EditGaneshIdolDialog.js
import React, { useState, useEffect } from 'react';
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
  EditOutlined,
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
  PlusOutlined,
  HistoryOutlined,
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

const EditGaneshIdolDialog = ({
  open,
  onClose,
  idol,
  onChange,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);

  // Initialize features when idol changes
  useEffect(() => {
    if (idol) {
      setFeatures(idol.features || []);
      form.setFieldsValue(idol);
    }
  }, [idol, form]);

  if (!idol) return null;

  // Add feature
  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      onChange('features', updatedFeatures);
      setNewFeature('');
    }
  };

  // Remove feature
  const removeFeature = (featureToRemove) => {
    const updatedFeatures = features.filter(feature => feature !== featureToRemove);
    setFeatures(updatedFeatures);
    onChange('features', updatedFeatures);
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
      onChange('images', newImages);

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
      onChange('images', updatedImages);

      message.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Reset loading state on error
      const resetImages = [...(idol.images || Array(8).fill(''))];
      resetImages[index] = '';
      onChange('images', resetImages);
      
      message.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingIndex(null);
    }
  };

  // Function to add an empty slot for a new image
  const handleAddImageSlot = () => {
    const currentImages = [...(idol.images || [])];
    if (currentImages.length < 8) {
      currentImages.push('');
      onChange('images', currentImages);
    }
  };

  // Delete image completely (remove from array)
  const deleteImage = (index) => {
    const newImages = [...(idol.images || [])];
    newImages.splice(index, 1);
    onChange('images', newImages);
  };

  // Calculate advance amount preview
  const calculateAdvancePreview = () => {
    if (!idol.priceMin || !idol.priceMax) return 0;
    const averagePrice = (idol.priceMin + idol.priceMax) / 2;
    return Math.round(averagePrice * (idol.advancePercentage || 25) / 100);
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
            document.getElementById(`edit-image-upload-${index}`).click();
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
            <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage(index);
                }}
                title="Delete image permanently"
              />
            </div>
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
          id={`edit-image-upload-${index}`}
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
          <EditOutlined style={{ color: '#FF8F00' }} />
          <span style={{ color: '#E65100' }}>🕉️ Edit Ganesh Idol</span>
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
            background: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)',
            border: 'none',
            fontWeight: '600'
          }}
        >
          💾 Save Changes
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
        {/* Edit History Alert */}
        <Alert
          message={
            <Space>
              <HistoryOutlined />
              <Text strong>Editing: {idol.name}</Text>
            </Space>
          }
          description={
            <div>
              <Text type="secondary">
                Created: {new Date(idol.createdAt?.seconds ? idol.createdAt.seconds * 1000 : idol.createdAt || Date.now()).toLocaleDateString()}
              </Text>
              {idol.updatedAt && (
                <Text type="secondary" style={{ marginLeft: '16px' }}>
                  Last updated: {new Date(idol.updatedAt?.seconds ? idol.updatedAt.seconds * 1000 : idol.updatedAt).toLocaleDateString()}
                </Text>
              )}
            </div>
          }
          type="info"
          style={{ marginBottom: '16px' }}
        />

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
                  value={idol.name || ''}
                  onChange={e => onChange('name', e.target.value)}
                  placeholder="e.g., Traditional Ganesha, Modern Eco-Friendly Ganesha"
                  prefix="🕉️"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Category *</Text>} name="category">
                <Select
                  value={idol.category || 'traditional'}
                  onChange={value => onChange('category', value)}
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
              value={idol.description || ''}
              onChange={e => onChange('description', e.target.value)}
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
            <Col span={8}>
              <Form.Item
                label={<Text strong>Minimum Price (₹) *</Text>}
                name="priceMin"
                rules={[{ required: true, message: 'Minimum price is required' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  value={idol.priceMin || ''}
                  onChange={value => onChange('priceMin', value)}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  placeholder="7000"
                  min={1000}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<Text strong>Maximum Price (₹) *</Text>}
                name="priceMax"
                rules={[{ required: true, message: 'Maximum price is required' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  value={idol.priceMax || ''}
                  onChange={value => onChange('priceMax', value)}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  placeholder="31000"
                  min={idol.priceMin || 1000}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Text strong>Advance % *</Text>} name="advancePercentage">
                <InputNumber
                  style={{ width: '100%' }}
                  value={idol.advancePercentage || 25}
                  onChange={value => onChange('advancePercentage', value)}
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
          {idol.priceMin && idol.priceMax && (
            <Alert
              message={
                <div>
                  <Text strong>💰 Advance Amount Preview: </Text>
                  <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    ₹{calculateAdvancePreview().toLocaleString()} 
                  </Text>
                  <Text type="secondary">
                    {' '}(based on average price of ₹{Math.round((idol.priceMin + idol.priceMax) / 2).toLocaleString()})
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
                  value={idol.availability || 'available'}
                  onChange={value => onChange('availability', value)}
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
                  value={idol.estimatedDays || 7}
                  onChange={value => onChange('estimatedDays', value)}
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
                  onChange={e => onChange('height', e.target.value)}
                  placeholder="e.g., 12 inches, 1.5 feet"
                  suffix="📏"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Text strong>Weight</Text>} name="weight">
                <Input
                  value={idol.weight || ''}
                  onChange={e => onChange('weight', e.target.value)}
                  placeholder="e.g., 2.5 kg"
                  suffix="⚖️"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Text strong>Color</Text>} name="color">
                <Input
                  value={idol.color || ''}
                  onChange={e => onChange('color', e.target.value)}
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
                  onChange={e => onChange('material', e.target.value)}
                  placeholder="e.g., Eco-friendly Clay, Plaster of Paris"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Text strong>Customizable</Text>} name="customizable">
                <Switch
                  checked={idol.customizable || false}
                  onChange={value => onChange('customizable', value)}
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
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '0' 
            }}>
              <Space>
                <CameraOutlined style={{ color: '#9C27B0' }} />
                <span style={{ color: '#E65100' }}>
                  Ganesh Idol Images ({(idol.images || []).filter(img => img && img !== 'loading').length}/8)
                </span>
              </Space>
              
              {/* Add Image Button */}
              {(idol.images || []).length < 8 && (
                <Button 
                  type="dashed" 
                  icon={<PlusOutlined />}
                  onClick={handleAddImageSlot}
                  size="small"
                  style={{ color: '#FF8F00', borderColor: '#FF8F00' }}
                >
                  Add Image Slot
                </Button>
              )}
            </div>
          }
          style={{ marginBottom: '16px', borderColor: '#FFE0B2' }}
        >
          <Alert
            message="Image Management"
            description="Upload high-quality images showing different angles. First image will be the primary display image. Supported formats: JPEG, PNG, GIF, WebP (Max 5MB each)"
            type="info"
            style={{ marginBottom: '16px' }}
            icon={<InfoCircleOutlined />}
          />
          
          <Row gutter={[16, 16]}>
            {(idol.images || []).map((imageUrl, index) => (
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
          
          {/* Image management instructions */}
          {(idol.images || []).length > 0 && (
            <Card style={{ marginTop: '16px', backgroundColor: '#f5f5f5' }}>
              <Text type="secondary">
                • Click on empty slots to upload new images<br />
                • Use the delete button (trash icon) to remove images permanently<br />
                • Images are automatically saved when you upload them<br />
                • First image is always the primary display image
              </Text>
            </Card>
          )}
        </Card>
      </Form>
    </Modal>
  );
};

export default EditGaneshIdolDialog;