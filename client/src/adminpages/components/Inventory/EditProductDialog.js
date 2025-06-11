import React from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Button,
  Typography,
  Upload,
  Checkbox,
  Tooltip,
  Divider,
  Card,
  Space,
  message,
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  BgColorsOutlined,
  ColumnWidthOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const EditProductDialog = ({
  open,
  onClose,
  product,
  onChange,
  onSave,
  onImageUpload,
}) => {
  const [form] = Form.useForm();

  if (!product) return null;

  // Function to delete an image at the specified index
  const handleDeleteImage = (index) => {
    const newImages = [...(product.images || [])];
    newImages.splice(index, 1); // Remove the image at the index
    onChange('images', newImages);
  };

  // Function to add an empty slot for a new image
  const handleAddImageSlot = () => {
    const currentImages = [...(product.images || [])];
    if (currentImages.length < 8) {
      currentImages.push(''); // Add an empty slot
      onChange('images', currentImages);
    }
  };

  // Handle image upload
  const handleImageChange = (info, index) => {
    if (info.file.status === 'uploading') {
      const newImages = [...(product.images || [])];
      newImages[index] = 'loading';
      onChange('images', newImages);
      return;
    }
    
    if (info.file.status === 'done') {
      // Call the provided onImageUpload function
      onImageUpload(info, index, true);
    }
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...(product.images || [])];
    newImages[index] = '';
    onChange('images', newImages);
  };

  const uploadButton = (index) => (
    <div style={{ textAlign: 'center' }}>
      <CloudUploadOutlined style={{ fontSize: '32px', color: '#d9d9d9' }} />
      <div style={{ marginTop: 8, color: '#8c8c8c' }}>Upload Image</div>
    </div>
  );

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EditOutlined />
          <span>Edit Product</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          icon={<SaveOutlined />}
          onClick={onSave}
          style={{
            background: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)',
            border: 'none',
          }}
        >
          Save Changes
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
        {/* Basic Information */}
        <Title level={5}>Basic Information</Title>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Product Name"
              name="name"
              rules={[{ required: true, message: 'Product name is required' }]}
            >
              <Input
                value={product.name || ''}
                onChange={e => onChange('name', e.target.value)}
                placeholder="Enter product name"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Product Code" name="code">
              <Input
                value={product.code || ''}
                onChange={e => onChange('code', e.target.value)}
                placeholder="SKU or product code"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Description" name="description">
          <TextArea
            rows={3}
            value={product.description || ''}
            onChange={e => onChange('description', e.target.value)}
            placeholder="Detailed product description..."
          />
        </Form.Item>

        {/* Pricing and Inventory */}
        <Divider />
        <Title level={5}>Pricing & Inventory</Title>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: 'Price is required' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                value={product.price || ''}
                onChange={value => onChange('price', value)}
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                placeholder="Enter price"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Stock Quantity" name="stock">
              <InputNumber
                style={{ width: '100%' }}
                value={product.stock || 0}
                onChange={value => onChange('stock', value)}
                min={0}
                placeholder="Enter stock quantity"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Category" name="category">
              <Input
                value={product.category || ''}
                onChange={e => onChange('category', e.target.value)}
                placeholder="Product category"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Product Specifications */}
        <Divider />
        <Title level={5}>Product Specifications</Title>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Color" name="color">
              <Input
                prefix={<BgColorsOutlined />}
                value={product.color || ''}
                onChange={e => onChange('color', e.target.value)}
                placeholder="e.g., Natural Terracotta"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Dimensions" name="dimensions">
              <Input
                prefix={<ColumnWidthOutlined />}
                value={product.dimensions || ''}
                onChange={e => onChange('dimensions', e.target.value)}
                placeholder="e.g., 10 x 10 x 1.5 inches"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Weight" name="weight">
              <Input
                prefix={<ExperimentOutlined />}
                value={product.weight || ''}
                onChange={e => onChange('weight', e.target.value)}
                placeholder="e.g., 0.8 kg"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Delivery Options */}
        <Divider />
        <Title level={5}>Delivery Options</Title>
        
        <Card 
          style={{ 
            backgroundColor: 'rgba(210, 105, 30, 0.08)',
            border: '1px dashed #D2691E',
            borderRadius: '8px'
          }}
        >
          <Form.Item name="hyderabadOnly" valuePropName="checked">
            <Checkbox 
              checked={product.hyderabadOnly || false}
              onChange={(e) => onChange('hyderabadOnly', e.target.checked)}
            >
              <Space>
                <EnvironmentOutlined style={{ color: '#D2691E' }} />
                <Text strong>Hyderabad Only Delivery</Text>
              </Space>
            </Checkbox>
          </Form.Item>
          <Text type="secondary" style={{ marginLeft: '24px' }}>
            Restrict this product to be delivered only within Hyderabad
          </Text>
        </Card>

        {/* Image Upload Section */}
        <Divider />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '16px' 
        }}>
          <Title level={5} style={{ margin: 0 }}>
            <Space>
              <CameraOutlined />
              Product Images ({(product.images || []).filter(img => img && img !== 'loading').length}/8)
            </Space>
          </Title>
          
          {/* Add Image Button */}
          {(product.images || []).length < 8 && (
            <Button 
              type="dashed" 
              icon={<PlusOutlined />}
              onClick={handleAddImageSlot}
              size="small"
            >
              Add Image Slot
            </Button>
          )}
        </div>
        
        <Row gutter={[16, 16]}>
          {(product.images || []).map((imageUrl, index) => (
            <Col span={6} key={index}>
              <Card
                style={{
                  height: '120px',
                  border: '2px dashed #d9d9d9',
                  borderRadius: '8px',
                  position: 'relative',
                }}
                bodyStyle={{ 
                  padding: 0, 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                {imageUrl === 'loading' ? (
                  <div style={{ textAlign: 'center' }}>
                    <div className="ant-spin ant-spin-spinning">
                      <span className="ant-spin-dot ant-spin-dot-spin">
                        <i className="ant-spin-dot-item"></i>
                        <i className="ant-spin-dot-item"></i>
                        <i className="ant-spin-dot-item"></i>
                        <i className="ant-spin-dot-item"></i>
                      </span>
                    </div>
                  </div>
                ) : imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={`Product ${index + 1}`}
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
                      onClick={() => handleDeleteImage(index)}
                    />
                  </>
                ) : (
                  <Upload
                    name="image"
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={(info) => handleImageChange(info, index)}
                    style={{ border: 'none' }}
                  >
                    {uploadButton(index)}
                  </Upload>
                )}
              </Card>
            </Col>
          ))}
        </Row>
        
        {/* Image management instructions */}
        {(product.images || []).length > 0 && (
          <Card style={{ marginTop: '16px', backgroundColor: '#f5f5f5' }}>
            <Text type="secondary">
              • Click on empty slots to upload new images<br />
              • Use the delete button (trash icon) to remove images<br />
              • Images are automatically saved when you upload them
            </Text>
          </Card>
        )}
      </Form>
    </Modal>
  );
};

export default EditProductDialog;