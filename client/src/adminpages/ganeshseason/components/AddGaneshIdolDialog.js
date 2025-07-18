// Enhanced AddGaneshIdolDialog.js - Focused on video upload functionality
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
  Progress,
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
  LoadingOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
  PictureOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

import { 
  uploadToCloudinary, 
  validateImageFile,
  uploadVideoToCloudinary,
  validateVideoFile,
  getVideoMetadata,
} from '../../../utils/cloudinary';

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
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadSuccess, setUploadSuccess] = useState({});

  const handleChange = (field, value) => {
    setIdol({ ...idol, [field]: value });
    form.setFieldsValue({ [field]: value });
  };

  // CORE: Handle media upload (images and videos)
  const handleMediaUpload = async (e, index, mediaType) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Validation based on media type
      if (mediaType === 'image') {
        validateImageFile(file);
      } else if (mediaType === 'video') {
        validateVideoFile(file);
        
        // Check video limit
        const currentVideos = (idol.videos || []).filter(v => v && v.url).length;
        if (currentVideos >= 3) {
          throw new Error('Maximum 3 videos allowed per idol.');
        }
      }

      setUploadingIndex(index);
      setUploadProgress({ [index]: 0 });

      // Update UI to show loading
      if (mediaType === 'image') {
        const newImages = [...(idol.images || Array(8).fill(''))];
        newImages[index] = 'loading';
        handleChange('images', newImages);
      } else {
        const newVideos = [...(idol.videos || Array(3).fill(null))];
        newVideos[index] = { loading: true, filename: file.name };
        handleChange('videos', newVideos);
      }

      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [index]: Math.min((prev[index] || 0) + Math.random() * 20, 85)
        }));
      }, 300);

      let uploadResult;
      
      if (mediaType === 'image') {
        uploadResult = await uploadToCloudinary(file);
        
        // Update images array
        const updatedImages = [...(idol.images || Array(8).fill(''))];
        updatedImages[index] = uploadResult;
        handleChange('images', updatedImages);
        
      } else if (mediaType === 'video') {
        uploadResult = await uploadVideoToCloudinary(file, {
          quality: 'auto',
          thumbnailTime: 2
        });
        
        // Update videos array
        const updatedVideos = [...(idol.videos || Array(3).fill(null))];
        updatedVideos[index] = {
          url: uploadResult.src,
          thumbnail: uploadResult.thumbnail,
          title: `${idol.name || 'Ganesh Idol'} - Video ${index + 1}`,
          duration: uploadResult.duration,
          format: uploadResult.format,
          size: uploadResult.size,
          uploadedAt: new Date().toISOString()
        };
        handleChange('videos', updatedVideos);
      }

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress({ [index]: 100 });

      // Success animation
      setUploadSuccess({ [index]: true });
      setTimeout(() => setUploadSuccess({}), 1000);

      message.success(`${mediaType === 'video' ? 'Video' : 'Image'} uploaded successfully!`);
      
    } catch (error) {
      console.error('Error uploading media:', error);
      
      // Reset on error
      if (mediaType === 'image') {
        const resetImages = [...(idol.images || Array(8).fill(''))];
        resetImages[index] = '';
        handleChange('images', resetImages);
      } else {
        const resetVideos = [...(idol.videos || Array(3).fill(null))];
        resetVideos[index] = null;
        handleChange('videos', resetVideos);
      }
      
      message.error(error.message || `Failed to upload ${mediaType}`);
    } finally {
      setUploadingIndex(null);
      setUploadProgress({});
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

  // Image Upload Component
  const ImageUploadCard = ({ index }) => {
    const imageUrl = idol.images?.[index];
    const isLoading = uploadingIndex === index || imageUrl === 'loading';
    const progress = uploadProgress[index] || 0;
    const isSuccess = uploadSuccess[index];

    return (
      <Card
        style={{
          height: '140px',
          border: '2px dashed #FFB74D',
          borderRadius: '8px',
          cursor: !imageUrl ? 'pointer' : 'default',
        }}
        bodyStyle={{ padding: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => {
          if (!imageUrl && !isLoading) {
            document.getElementById(`image-upload-${index}`).click();
          }
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center' }}>
            <LoadingOutlined style={{ fontSize: '32px', color: '#FF8F00' }} />
            <div style={{ marginTop: '8px', color: '#FF8F00', fontSize: '12px' }}>Uploading...</div>
            <Progress percent={progress} size="small" style={{ marginTop: '8px', width: '60px' }} />
          </div>
        ) : imageUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={imageUrl}
              alt={`Ganesh Idol ${index + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
            />
            {isSuccess && (
              <CheckCircleOutlined style={{ position: 'absolute', top: '4px', right: '40px', color: '#52c41a', fontSize: '16px' }} />
            )}
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              style={{ position: 'absolute', top: '4px', right: '4px' }}
              onClick={(e) => {
                e.stopPropagation();
                removeMedia(index, 'image');
              }}
            />
            {index === 0 && (
              <div style={{
                position: 'absolute', bottom: '4px', left: '4px',
                background: 'rgba(255, 143, 0, 0.9)', color: 'white',
                padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'
              }}>
                PRIMARY
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CloudUploadOutlined style={{ fontSize: '32px', color: '#FF8F00' }} />
            <div style={{ marginTop: 8, color: '#FF6F00' }}>Upload Image</div>
            <div style={{ marginTop: 4, fontSize: '10px', color: '#999' }}>Max 10MB</div>
          </div>
        )}
        
        <input
          type="file"
          id={`image-upload-${index}`}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={(e) => handleMediaUpload(e, index, 'image')}
        />
      </Card>
    );
  };

  // Video Upload Component
  const VideoUploadCard = ({ index }) => {
    const videoData = idol.videos?.[index];
    const isLoading = uploadingIndex === `video_${index}` || videoData?.loading;
    const progress = uploadProgress[`video_${index}`] || 0;
    const isSuccess = uploadSuccess[`video_${index}`];

    return (
      <Card
        style={{
          height: '160px',
          border: '2px dashed #FF8F00',
          borderRadius: '8px',
          cursor: !videoData ? 'pointer' : 'default',
        }}
        bodyStyle={{ padding: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => {
          if (!videoData && !isLoading) {
            document.getElementById(`video-upload-${index}`).click();
          }
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center' }}>
            <LoadingOutlined style={{ fontSize: '32px', color: '#FF8F00' }} />
            <div style={{ marginTop: '8px', color: '#FF8F00', fontSize: '12px' }}>Uploading video...</div>
            {videoData?.filename && (
              <div style={{ marginTop: '4px', fontSize: '10px', color: '#666' }}>{videoData.filename}</div>
            )}
            <Progress percent={progress} size="small" style={{ marginTop: '8px', width: '80px' }} />
          </div>
        ) : videoData ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={videoData.thumbnail}
              alt={videoData.title || `Video ${index + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
            />
            
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              color: 'white', fontSize: '32px', textShadow: '0 2px 8px rgba(0,0,0,0.6)'
            }}>
              <PlayCircleOutlined />
            </div>

            <div style={{
              position: 'absolute', bottom: '4px', left: '4px', right: '4px',
              background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px',
              borderRadius: '4px', fontSize: '10px'
            }}>
              <div>{videoData.duration || 'Video'}</div>
            </div>

            {index === 0 && (
              <div style={{
                position: 'absolute', top: '4px', left: '4px',
                background: 'rgba(255, 143, 0, 0.9)', color: 'white',
                padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'
              }}>
                PRIMARY
              </div>
            )}

            {isSuccess && (
              <CheckCircleOutlined style={{ position: 'absolute', top: '4px', right: '40px', color: '#52c41a', fontSize: '16px' }} />
            )}

            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              style={{ position: 'absolute', top: '4px', right: '4px' }}
              onClick={(e) => {
                e.stopPropagation();
                removeMedia(index, 'video');
              }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <VideoCameraOutlined style={{ fontSize: '32px', color: '#FF8F00' }} />
            <div style={{ marginTop: 8, color: '#FF8F00' }}>Upload Video</div>
            <div style={{ marginTop: 4, fontSize: '10px', color: '#999' }}>Max 100MB</div>
          </div>
        )}
        
        <input
          type="file"
          id={`video-upload-${index}`}
          style={{ display: 'none' }}
          accept="video/*"
          onChange={(e) => handleMediaUpload(e, `video_${index}`, 'video')}
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
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose} size="large">Cancel</Button>,
        <Button 
          key="save" 
          type="primary" 
          icon={<SaveOutlined />}
          onClick={onSave}
          size="large"
          style={{ background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)', border: 'none', fontWeight: '600' }}
        >
          🕉️ Add Ganesh Idol
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
        
        {/* Basic Information */}
        <Card title={<Space><CrownOutlined style={{ color: '#FF8F00' }} /><span style={{ color: '#E65100' }}>Basic Information</span></Space>} style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<Text strong>Idol Name *</Text>} name="name" rules={[{ required: true }]}>
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
                <Select value={idol.category} onChange={value => handleChange('category', value)}>
                  <Option value="traditional"><Space><CrownOutlined style={{ color: '#8E24AA' }} /> Traditional</Space></Option>
                  <Option value="modern"><Space><StarOutlined style={{ color: '#1976D2' }} /> Modern</Space></Option>
                  <Option value="premium"><Space><FireOutlined style={{ color: '#D32F2F' }} /> Premium</Space></Option>
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
              <Form.Item label={<Text strong>Price (₹) *</Text>} name="price" rules={[{ required: true }]}>
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
            <Button type="primary" icon={<PlusOutlined />} onClick={addFeature}>Add</Button>
          </Space.Compact>
          <Space wrap>
            {features.map((feature, index) => (
              <Tag key={index} closable onClose={() => removeFeature(feature)}>
                {feature}
              </Tag>
            ))}
          </Space>
        </Card>

        {/* Media Upload */}
        <Card title={<Space><PictureOutlined style={{ color: '#9C27B0' }} /><span>Media Gallery</span></Space>} style={{ marginBottom: '16px' }}>
          <Alert
            message="Upload up to 8 images and 3 videos. First media will be primary display."
            type="info"
            style={{ marginBottom: '16px' }}
            icon={<InfoCircleOutlined />}
          />
          
          {/* Images */}
          <div style={{ marginBottom: '24px' }}>
            <Title level={5}>Images (Max 8)</Title>
            <Row gutter={[16, 16]}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Col span={6} key={index}>
                  <ImageUploadCard index={index} />
                </Col>
              ))}
            </Row>
          </div>

          {/* Videos */}
          <div>
            <Title level={5}>Videos (Max 3)</Title>
            <Row gutter={[16, 16]}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Col span={8} key={index}>
                  <VideoUploadCard index={index} />
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