// client/src/adminpages/ganeshseason/components/AddGaneshIdolDialog.js
// Updated with ImageKit Widget (Frontend-Only Solution)
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
  Card,
  Space,
  Tag,
  Alert,
  message,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CrownOutlined,
  StarOutlined,
  FireOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
  PictureOutlined,
} from '@ant-design/icons';

// Import ImageKit widget utilities
import { 
  uploadWithImageKitWidget, 
  validateImageFile,
  validateVideoFile 
} from '../../../utils/imagekit-widget';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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

  const handleChange = (field, value) => {
    setIdol({ ...idol, [field]: value });
    form.setFieldsValue({ [field]: value });
  };

  // Widget-based upload handler
  const handleWidgetUpload = async (index, mediaType) => {
    try {
      console.log('🚀 Opening ImageKit upload widget...');
      
      const result = await uploadWithImageKitWidget();
      
      console.log('✅ Upload completed:', result);
      
      if (mediaType === 'image' || result.type === 'image') {
        const newImages = [...(idol.images || Array(8).fill(''))];
        newImages[index] = result.url;
        handleChange('images', newImages);
        message.success('Image uploaded successfully via ImageKit Widget!');
      } else {
        const newVideos = [...(idol.videos || Array(3).fill(null))];
        newVideos[index] = {
          type: 'video',
          url: result.url,
          src: result.url,
          thumbnail: `${result.url}?tr=so-1.0`, // ImageKit thumbnail transformation
          title: `Video ${index + 1}`,
          fileId: result.fileId,
          uploadedAt: new Date().toISOString()
        };
        handleChange('videos', newVideos);
        message.success('Video uploaded successfully via ImageKit Widget!');
      }
      
    } catch (error) {
      console.error('Error with ImageKit widget upload:', error);
      message.error(error.message || 'Upload failed');
    }
  };

  // Remove media
  const removeMedia = (index, mediaType) => {
    if (mediaType === 'image') {
      const newImages = [...(idol.images || Array(8).fill(''))];
      newImages[index] = '';
      handleChange('images', newImages);
    } else {
      const newVideos = [...(idol.videos || Array(3).fill(null))];
      newVideos[index] = null;
      handleChange('videos', newVideos);
    }
  };

  // Features management
  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      handleChange('features', updatedFeatures);
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove) => {
    const updatedFeatures = features.filter(feature => feature !== featureToRemove);
    setFeatures(updatedFeatures);
    handleChange('features', updatedFeatures);
  };

  // Updated Upload Card Component for Widget
  const ImageUploadCardWidget = ({ index }) => {
    const imageUrl = idol.images?.[index];

    return (
      <Card
        style={{
          height: '140px',
          border: '2px dashed #FFB74D',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        bodyStyle={{ 
          padding: 0, 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        onClick={() => handleWidgetUpload(index, 'image')}
        hoverable
      >
        {imageUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={imageUrl}
              alt={`Ganesh Idol ${index + 1}`}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                borderRadius: '6px' 
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
                right: '4px' 
              }}
              onClick={(e) => {
                e.stopPropagation();
                removeMedia(index, 'image');
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
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CloudUploadOutlined style={{ fontSize: '32px', color: '#FF8F00' }} />
            <div style={{ marginTop: 8, color: '#FF6F00' }}>ImageKit Widget</div>
            <div style={{ marginTop: 4, fontSize: '10px', color: '#999' }}>
              Click to upload
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Video Upload Card Component for Widget
  const VideoUploadCardWidget = ({ index }) => {
    const videoData = idol.videos?.[index];

    return (
      <Card
        style={{
          height: '160px',
          border: '2px dashed #FF8F00',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        bodyStyle={{ 
          padding: 0, 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        onClick={() => handleWidgetUpload(index, 'video')}
        hoverable
      >
        {videoData ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={videoData.thumbnail}
              alt={videoData.title || `Video ${index + 1}`}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                borderRadius: '6px' 
              }}
              onError={(e) => {
                e.target.style.backgroundColor = '#f0f0f0';
                e.target.style.display = 'flex';
                e.target.style.alignItems = 'center';
                e.target.style.justifyContent = 'center';
                e.target.innerHTML = '🎥';
              }}
            />
            
            {/* Play Icon Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontSize: '32px',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            }}>
              <PlayCircleOutlined />
            </div>

            {/* Video Info */}
            <div style={{
              position: 'absolute',
              bottom: '4px',
              left: '4px',
              right: '4px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
            }}>
              <div>ImageKit Video</div>
            </div>

            {/* Primary Video Badge */}
            {index === 0 && (
              <div style={{
                position: 'absolute',
                top: '4px',
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

            {/* Delete Button */}
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
                removeMedia(index, 'video');
              }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <VideoCameraOutlined style={{ fontSize: '32px', color: '#FF8F00' }} />
            <div style={{ marginTop: 8, color: '#FF8F00' }}>ImageKit Widget</div>
            <div style={{ marginTop: 4, fontSize: '10px', color: '#999' }}>
              Click to upload video
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusOutlined style={{ color: '#FF8F00' }} />
          <span style={{ color: '#E65100' }}>🕉️ Add New Ganesh Idol - ImageKit Widget</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={1000}
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
    >
      <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
        
        {/* ImageKit Widget Info */}
        <Alert
          message="Using ImageKit Upload Widget"
          description="No backend authentication required! Click on upload areas to open the ImageKit widget. Supports images (20MB) and videos (100MB)."
          type="success"
          style={{ marginBottom: '16px' }}
          icon={<CloudUploadOutlined />}
        />
        
        {/* Basic Information */}
        <Card 
          title={
            <Space>
              <CrownOutlined style={{ color: '#FF8F00' }} />
              <span style={{ color: '#E65100' }}>Basic Information</span>
            </Space>
          } 
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label={<Text strong>Idol Name *</Text>} 
                name="name" 
                rules={[{ required: true }]}
              >
                <Input
                  value={idol.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g., Traditional Ganesha"
                  prefix="🕉️"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Category *</Text>} name="category">
                <Select 
                  value={idol.category} 
                  onChange={value => handleChange('category', value)}
                >
                  <Option value="traditional">
                    <Space>
                      <CrownOutlined style={{ color: '#8E24AA' }} /> 
                      Traditional
                    </Space>
                  </Option>
                  <Option value="modern">
                    <Space>
                      <StarOutlined style={{ color: '#1976D2' }} /> 
                      Modern
                    </Space>
                  </Option>
                  <Option value="premium">
                    <Space>
                      <FireOutlined style={{ color: '#D32F2F' }} /> 
                      Premium
                    </Space>
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
              placeholder="Describe the Ganesh idol..."
            />
          </Form.Item>
        </Card>

        {/* Pricing */}
        <Card title="Pricing Details" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label={<Text strong>Price (₹) *</Text>} 
                name="price" 
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  value={idol.price}
                  onChange={value => handleChange('price', value)}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  min={1000}
                  max={50000}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Estimated Days</Text>} name="estimatedDays">
                <InputNumber
                  style={{ width: '100%' }}
                  value={idol.estimatedDays}
                  onChange={value => handleChange('estimatedDays', value)}
                  min={1}
                  max={30}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Features */}
        <Card title="Features" style={{ marginBottom: '16px' }}>
          <Space.Compact style={{ width: '100%', marginBottom: '12px' }}>
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature"
              onPressEnter={addFeature}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={addFeature}
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
              >
                {feature}
              </Tag>
            ))}
          </Space>
        </Card>

        {/* Media Upload with ImageKit Widget */}
        <Card 
          title={
            <Space>
              <PictureOutlined style={{ color: '#9C27B0' }} />
              <span>Media Gallery - ImageKit Widget</span>
            </Space>
          } 
          style={{ marginBottom: '16px' }}
        >
          <Alert
            message="ImageKit Upload Widget"
            description="Click on any upload area to open the ImageKit widget. No backend authentication required!"
            type="info"
            style={{ marginBottom: '16px' }}
            icon={<InfoCircleOutlined />}
          />
          
          {/* Images */}
          <div style={{ marginBottom: '24px' }}>
            <Title level={5}>Images (Max 8) - Widget Upload</Title>
            <Row gutter={[16, 16]}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Col span={6} key={index}>
                  <ImageUploadCardWidget index={index} />
                </Col>
              ))}
            </Row>
          </div>

          {/* Videos */}
          <div>
            <Title level={5}>Videos (Max 3) - Widget Upload</Title>
            <Row gutter={[16, 16]}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Col span={8} key={index}>
                  <VideoUploadCardWidget index={index} />
                </Col>
              ))}
            </Row>
          </div>
        </Card>

      </Form>
    </Modal>
  );
};

export default AddGaneshIdolDialog;