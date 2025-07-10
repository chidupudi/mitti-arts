// Enhanced AddGaneshIdolDialog.js - Now supports both images and videos
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
  Tabs,
  Progress,
  Tooltip,
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
  VideoCameraOutlined,
  PlayCircleOutlined,
  PictureOutlined,
} from '@ant-design/icons';

// Import enhanced Cloudinary utilities with video support
import { 
  uploadToCloudinary, 
  validateImageFile,
  uploadVideoToCloudinary,
  validateVideoFile,
  getVideoMetadata,
  formatDuration
} from '../../../utils/cloudinary';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

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
  const [uploadingVideoIndex, setUploadingVideoIndex] = useState(null);
  
  // NEW: Video-related states
  const [videoMetadata, setVideoMetadata] = useState({});
  const [videoUploadProgress, setVideoUploadProgress] = useState({});
  
  // Function to handle form field changes
  const handleChange = (field, value) => {
    setIdol({ ...idol, [field]: value });
    form.setFieldsValue({ [field]: value });
  };

  // ENHANCED: Handle image upload (existing functionality)
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

  // NEW: Handle video upload
  const handleVideoChange = async (e, index) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Validate video file
      validateVideoFile(file);

      // Get video metadata
      const metadata = await getVideoMetadata(file);
      console.log('Video metadata:', metadata);
      
      // Set loading state
      setUploadingVideoIndex(index);
      const newVideos = [...(idol.videos || Array(5).fill(null))];
      newVideos[index] = { 
        loading: true, 
        progress: 0,
        filename: file.name,
        size: file.size 
      };
      handleChange('videos', newVideos);

      // Upload video to Cloudinary
      const videoData = await uploadVideoToCloudinary(file, {
        quality: 'auto',
        thumbnailTime: 2 // Generate thumbnail at 2 seconds
      });

      // Update with video data
      const updatedVideos = [...(idol.videos || Array(5).fill(null))];
      updatedVideos[index] = {
        id: videoData.id,
        src: videoData.src,
        thumbnail: videoData.thumbnail,
        title: `${idol.name || 'Ganesh Idol'} - Video ${index + 1}`,
        duration: videoData.duration,
        format: videoData.format,
        size: videoData.size,
        width: videoData.width,
        height: videoData.height,
        qualities: videoData.qualities,
        uploadedAt: new Date().toISOString()
      };
      handleChange('videos', updatedVideos);

      // Store metadata for display
      setVideoMetadata(prev => ({
        ...prev,
        [index]: metadata
      }));

      message.success('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      
      // Reset loading state on error
      const resetVideos = [...(idol.videos || Array(5).fill(null))];
      resetVideos[index] = null;
      handleChange('videos', resetVideos);
      
      message.error(error.message || 'Failed to upload video');
    } finally {
      setUploadingVideoIndex(null);
    }
  };

  // Remove image (existing)
  const removeImage = (index) => {
    const newImages = [...(idol.images || Array(8).fill(''))];
    newImages[index] = '';
    handleChange('images', newImages);
  };

  // NEW: Remove video
  const removeVideo = (index) => {
    const newVideos = [...(idol.videos || Array(5).fill(null))];
    newVideos[index] = null;
    handleChange('videos', newVideos);
    
    // Remove metadata
    setVideoMetadata(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  // Add feature (existing)
  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      handleChange('features', updatedFeatures);
      setNewFeature('');
    }
  };

  // Remove feature (existing)
  const removeFeature = (featureToRemove) => {
    const updatedFeatures = features.filter(feature => feature !== featureToRemove);
    setFeatures(updatedFeatures);
    handleChange('features', updatedFeatures);
  };

  // Calculate advance preview (existing)
  const calculateAdvancePreview = () => {
    if (!idol.price) return 0;
    if (idol.price >= 8000 && idol.price <= 10000) return 2000;
    if (idol.price > 10000 && idol.price <= 15000) return 2500;
    if (idol.price > 15000) return 3000;
    return 2000; // Default
  };

  // NEW: Video upload card component
  const VideoUploadCard = ({ index }) => {
    const videoData = idol.videos?.[index];
    const isLoading = uploadingVideoIndex === index || videoData?.loading;

    return (
      <Card
        style={{
          height: '160px',
          border: '2px dashed #FF8F00',
          borderRadius: '8px',
          position: 'relative',
          cursor: !videoData ? 'pointer' : 'default',
        }}
        bodyStyle={{ 
          padding: 0, 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        onClick={() => {
          if (!videoData && !isLoading) {
            document.getElementById(`video-upload-${index}`).click();
          }
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <LoadingOutlined style={{ fontSize: '32px', color: '#FF8F00' }} />
            <div style={{ marginTop: '8px', color: '#FF8F00', fontSize: '12px' }}>
              Uploading video...
            </div>
            {videoData?.filename && (
              <div style={{ marginTop: '4px', fontSize: '10px', color: '#666' }}>
                {videoData.filename}
              </div>
            )}
          </div>
        ) : videoData ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Video Thumbnail */}
            <img
              src={videoData.thumbnail}
              alt={videoData.title || `Video ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '6px',
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
              <div>{videoData.duration || 'Video'}</div>
              <div>{videoData.format?.toUpperCase() || 'MP4'}</div>
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
                removeVideo(index);
              }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <VideoCameraOutlined style={{ fontSize: '32px', color: '#FF8F00' }} />
            <div style={{ marginTop: 8, color: '#FF8F00' }}>Upload Video</div>
            <div style={{ marginTop: 4, fontSize: '10px', color: '#999' }}>
              MP4, WebM, MOV (Max 100MB)
            </div>
          </div>
        )}
        
        <input
          type="file"
          id={`video-upload-${index}`}
          style={{ display: 'none' }}
          accept="video/*"
          onChange={(e) => handleVideoChange(e, index)}
        />
      </Card>
    );
  };

  // Image upload component (existing with minor enhancements)
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
      width={1000} // Increased width for video support
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
        {/* Basic Information - Same as before */}
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

        {/* Pricing & Business - Same as before */}
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

        {/* Physical Specifications - Same as before */}
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

        {/* Features - Same as before */}
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

        {/* ENHANCED: Media Upload Section with Tabs */}
        <Card 
          title={
            <Space>
              <CameraOutlined style={{ color: '#9C27B0' }} />
              <span style={{ color: '#E65100' }}>Media Gallery (Images & Videos)</span>
            </Space>
          }
          style={{ marginBottom: '16px', borderColor: '#FFE0B2' }}
        >
          <Alert
            message="Media Guidelines"
            description="Upload high-quality images and videos showcasing different angles and details of the Ganesh idol. First image will be the primary display image."
            type="info"
            style={{ marginBottom: '16px' }}
            icon={<InfoCircleOutlined />}
          />

          <Tabs defaultActiveKey="images" type="card">
            {/* Images Tab */}
            <TabPane 
              tab={
                <Space>
                  <PictureOutlined />
                  Images (0-8)
                </Space>
              } 
              key="images"
            >
              <div style={{ marginBottom: '12px' }}>
                <Text type="secondary">
                  Supported formats: JPEG, PNG, GIF, WebP (Max 10MB each)
                </Text>
              </div>
              
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
            </TabPane>

            {/* Videos Tab */}
            <TabPane 
              tab={
                <Space>
                  <VideoCameraOutlined />
                  Videos (0-5)
                </Space>
              } 
              key="videos"
            >
              <div style={{ marginBottom: '12px' }}>
                <Text type="secondary">
                  Supported formats: MP4, WebM, MOV, AVI (Max 100MB each, 5 minutes duration)
                </Text>
              </div>
              
              <Row gutter={[16, 16]}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Col span={8} key={index}>
                    <VideoUploadCard index={index} />
                    {index === 0 && (
                      <Text type="secondary" style={{ fontSize: '10px', textAlign: 'center', display: 'block', marginTop: '4px' }}>
                        Primary Video
                      </Text>
                    )}
                  </Col>
                ))}
              </Row>
            </TabPane>
          </Tabs>
        </Card>
      </Form>
    </Modal>
  );
};

export default AddGaneshIdolDialog;