// Enhanced EditGaneshIdolDialog.js - Updated with animations and 10MB support
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
  Progress,
  Tabs,
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
  CheckCircleOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
  PictureOutlined,
} from '@ant-design/icons';

// FIXED: Import Cloudinary utilities with ES6 imports
import { 
  uploadToCloudinary, 
  validateImageFile,
  uploadVideoToCloudinary,
  validateVideoFile,
  validateMediaFile, 
  isVideoUrl, 
  validateUploadConstraints,
  getVideoMetadata,
  formatDuration,
  countVideos,
  countImages
} from '../../../utils/cloudinary';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Enhanced loading animation styles (same as Add dialog)
const loadingAnimationStyles = `
  @keyframes pulseUpload {
    0% { 
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(255, 143, 0, 0.7);
    }
    50% { 
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(255, 143, 0, 0.3);
    }
    100% { 
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(255, 143, 0, 0);
    }
  }

  @keyframes rotateUpload {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes uploadProgress {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  .upload-loading-container {
    animation: pulseUpload 2s infinite;
    background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
    border: 2px dashed #FF8F00 !important;
    position: relative;
    overflow: hidden;
  }

  .upload-loading-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 143, 0, 0.2), transparent);
    animation: uploadProgress 1.5s infinite;
  }

  .upload-spinner {
    animation: rotateUpload 1s linear infinite;
    color: #FF8F00;
    font-size: 32px;
  }

  .upload-success-animation {
    animation: successPulse 0.6s ease-out;
  }

  @keyframes successPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  .upload-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #FF8F00, #FFB74D);
    transition: width 0.3s ease;
    border-radius: 0 0 6px 6px;
  }
`;

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
  const [uploadingVideoIndex, setUploadingVideoIndex] = useState(null);
  
  // NEW: Enhanced upload progress states
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadSuccess, setUploadSuccess] = useState({});
  
  // NEW: Video-related states
  const [videoMetadata, setVideoMetadata] = useState({});
  const [videoUploadProgress, setVideoUploadProgress] = useState({});

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

  // ENHANCED: Handle image upload with better animations
  const handleImageChange = async (e, index) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file before upload
      if (file.type.startsWith('image/')) {
        validateImageFile(file); // This now uses 10MB limit
      } else if (file.type.startsWith('video/')) {
        validateVideoFile(file);
      } else {
        throw new Error('Invalid file type. Please upload an image or video file.');
      }

      // Set loading state for this specific index
      setUploadingIndex(index);
      setUploadProgress({ [index]: 0 });
      
      const newImages = [...(idol.images || Array(8).fill(''))];
      newImages[index] = 'loading';
      onChange('images', newImages);

      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [index]: Math.min((prev[index] || 0) + Math.random() * 20, 85)
        }));
      }, 200);

      // Upload to cloudinary
      let mediaUrl;
      if (file.type.startsWith('video/')) {
        const videoData = await uploadVideoToCloudinary(file, {
          quality: 'auto',
          thumbnailTime: 2
        });
        mediaUrl = videoData.src;
      } else {
        mediaUrl = await uploadToCloudinary(file);
      }

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress({ [index]: 100 });

      // Update with actual URL
      const updatedImages = [...(idol.images || Array(8).fill(''))];
      updatedImages[index] = mediaUrl;
      onChange('images', updatedImages);

      // Show success animation
      setUploadSuccess({ [index]: true });
      setTimeout(() => {
        setUploadSuccess({});
      }, 1000);

      message.success(`${file.type.startsWith('video/') ? 'Video' : 'Image'} uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading media:', error);
      
      // Reset loading state on error
      const resetImages = [...(idol.images || Array(8).fill(''))];
      resetImages[index] = '';
      onChange('images', resetImages);
      
      message.error(error.message || 'Failed to upload file');
    } finally {
      setUploadingIndex(null);
      setUploadProgress({});
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

  const calculateAdvancePreview = () => {
    if (!idol.price) return 0;
    if (idol.price >= 8000 && idol.price <= 10000) return 2000;
    if (idol.price > 10000 && idol.price <= 15000) return 2500;
    if (idol.price > 15000) return 3000;
    return 2000; // Default
  };

  // ENHANCED: Image upload component with animations
  const ImageUploadCard = ({ index }) => {
    const mediaUrl = idol.images?.[index];
    const isLoading = uploadingIndex === index || mediaUrl === 'loading';
    const isVideo = mediaUrl && isVideoUrl(mediaUrl);
    const progress = uploadProgress[index] || 0;
    const isSuccess = uploadSuccess[index];

    return (
      <Card
        className={isLoading ? 'upload-loading-container' : isSuccess ? 'upload-success-animation' : ''}
        style={{
          height: '140px',
          border: '2px dashed #FFB74D',
          borderRadius: '8px',
          position: 'relative',
          cursor: !mediaUrl ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
        }}
        bodyStyle={{ 
          padding: 0, 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        onClick={() => {
          if (!mediaUrl && !isLoading) {
            document.getElementById(`edit-image-upload-${index}`).click();
          }
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div className="upload-spinner">
              <LoadingOutlined />
            </div>
            <div style={{ marginTop: '8px', color: '#FF8F00', fontSize: '12px', fontWeight: 'bold' }}>
              Uploading...
            </div>
            <div style={{ marginTop: '8px', width: '60px', margin: '0 auto' }}>
              <Progress 
                percent={progress} 
                size="small" 
                strokeColor={{
                  '0%': '#FF8F00',
                  '100%': '#FFB74D',
                }}
                showInfo={false}
              />
            </div>
            {/* Progress bar at bottom */}
            <div 
              className="upload-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : mediaUrl ? (
          <>
            {isVideo ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <video
                  src={mediaUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '6px',
                  }}
                  controls={false}
                  muted
                  loop
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => e.target.pause()}
                />
                {/* Play Icon Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontSize: '24px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                }}>
                  <PlayCircleOutlined />
                </div>
              </div>
            ) : (
              <img
                src={mediaUrl}
                alt={`Ganesh Idol ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '6px',
                }}
              />
            )}
            
            <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
              {/* Success indicator */}
              {isSuccess && (
                <div style={{
                  color: '#52c41a',
                  fontSize: '16px',
                  marginRight: '4px'
                }}>
                  <CheckCircleOutlined />
                </div>
              )}
              
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage(index);
                }}
                title="Delete media permanently"
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
            
            {isVideo && (
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '4px',
                background: 'rgba(231, 76, 60, 0.9)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                VIDEO
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CloudUploadOutlined style={{ fontSize: '32px', color: '#FF8F00' }} />
            <div style={{ marginTop: 8, color: '#FF6F00' }}>Upload Image/Video</div>
            <div style={{ marginTop: 4, fontSize: '10px', color: '#999' }}>
              Images (Max 10MB), Videos (Max 100MB)
            </div>
          </div>
        )}
        
        <input
          type="file"
          id={`edit-image-upload-${index}`}
          style={{ display: 'none' }}
          accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,video/mp4,video/webm,video/mov,video/avi"
          onChange={(e) => handleImageChange(e, index)}
        />
      </Card>
    );
  };

  return (
    <>
      {/* Inject CSS animations */}
      <style>{loadingAnimationStyles}</style>
      
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EditOutlined style={{ color: '#FF8F00' }} />
            <span style={{ color: '#E65100' }}>🕉️ Edit Ganesh Idol</span>
          </div>
        }
        open={open}
        onCancel={onClose}
        width={1000} // Increased width
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
              <Col span={12}>
                <Form.Item
                  label={<Text strong>Price (₹) *</Text>}
                  name="price"
                  rules={[{ required: true, message: 'Price is required' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    value={idol.price || ''}
                    onChange={value => onChange('price', value)}
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

          {/* ENHANCED: Media Upload Section */}
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
                    Ganesh Idol Media ({(idol.images || []).filter(img => img && img !== 'loading').length}/8)
                  </span>
                </Space>
                
                {/* Add Media Button */}
                {(idol.images || []).length < 8 && (
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />}
                    onClick={handleAddImageSlot}
                    size="small"
                    style={{ color: '#FF8F00', borderColor: '#FF8F00' }}
                  >
                    Add Media Slot
                  </Button>
                )}
              </div>
            }
            style={{ marginBottom: '16px', borderColor: '#FFE0B2' }}
          >
            <Alert
              message="Media Management"
              description="Upload high-quality images and videos. First media will be the primary display. Images (max 10MB), Videos (max 100MB). Supported: JPEG, PNG, GIF, WebP, BMP, MP4, WebM, MOV, AVI. Maximum 2 videos allowed."
              type="info"
              style={{ marginBottom: '16px' }}
              icon={<InfoCircleOutlined />}
            />
            
            <Row gutter={[16, 16]}>
              {(idol.images || []).map((mediaUrl, index) => (
                <Col span={6} key={index}>
                  <ImageUploadCard index={index} />
                  {index === 0 && (
                    <Text type="secondary" style={{ fontSize: '10px', textAlign: 'center', display: 'block', marginTop: '4px' }}>
                      Primary Media
                    </Text>
                  )}
                </Col>
              ))}
            </Row>
            
            {/* Media management instructions */}
            {(idol.images || []).length > 0 && (
              <Card style={{ marginTop: '16px', backgroundColor: '#f5f5f5' }}>
                <Text type="secondary">
                  • Click on empty slots to upload new images or videos<br />
                  • Use the delete button (trash icon) to remove media permanently<br />
                  • Media files are automatically saved when you upload them<br />
                  • First media is always the primary display media<br />
                  • Maximum 2 videos allowed (6 images + 2 videos OR 7 images + 1 video OR 8 images)
                </Text>
              </Card>
            )}
          </Card>
        </Form>
      </Modal>
    </>
  );
};

export default EditGaneshIdolDialog;