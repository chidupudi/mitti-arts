// ProductImageGallery.jsx
import React, { useState, useMemo, useEffect, memo } from 'react';
import { Card, Image, Button } from 'antd';
import { ZoomInOutlined } from '@ant-design/icons';

// Terracotta theme colors
const colors = {
  primary: '#D2691E',
  primaryLight: '#E8A857',
  primaryDark: '#A0522D',
  secondary: '#CD853F',
  accent: '#F4A460',
  background: '#FDFCFA',
  backgroundLight: '#FFEEE6',
  text: '#2C1810',
  textSecondary: '#6B4423',
  divider: '#E8D5C4',
  success: '#8BC34A',
  warning: '#FF9800',
  error: '#F44336',
};

// Custom styles for the image gallery
const customStyles = {
  imageCard: {
    borderRadius: '16px',
    overflow: 'hidden',
    border: `1px solid ${colors.divider}`,
    background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${colors.backgroundLight}30 100%)`,
    boxShadow: `0 8px 32px ${colors.primary}15`,
  },
};

// Image Gallery Component
const ProductImageGallery = memo(({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);

  const imageList = useMemo(() => {
    if (!images || images.length === 0) {
      return [`https://via.placeholder.com/500x500/${colors.primary.slice(1)}/FFFFFF?text=${encodeURIComponent(productName || 'Product')}`];
    }
    return images;
  }, [images, productName]);

  useEffect(() => {
    setSelectedImage(0);
  }, [imageList]);

  return (
    <Card style={customStyles.imageCard} bodyStyle={{ padding: '16px' }}>
      {/* Main Image */}
      <div style={{ 
        position: 'relative',
        marginBottom: '16px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#f8f9fa',
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <Image
          src={imageList[selectedImage]}
          alt={productName}
          style={{ 
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            padding: '10px',
          }}
          preview={false}
          onClick={() => setPreviewVisible(true)}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<ZoomInOutlined />}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            color: colors.primary,
            border: 'none',
          }}
          onClick={() => setPreviewVisible(true)}
        />
      </div>

      {/* Thumbnail Strip */}
      <div style={{ 
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '8px 0',
      }}>
        {imageList.map((image, index) => (
          <div
            key={index}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: selectedImage === index 
                ? `3px solid ${colors.primary}` 
                : `2px solid ${colors.divider}`,
              transition: 'all 0.3s ease',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8f9fa',
            }}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={image}
              alt={`${productName} ${index + 1}`}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              preview={false}
            />
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      <Image
        style={{ display: 'none' }}
        src={imageList[selectedImage]}
        preview={{
          visible: previewVisible,
          onVisibleChange: setPreviewVisible,
          src: imageList[selectedImage],
        }}
      />
    </Card>
  );
});

ProductImageGallery.displayName = 'ProductImageGallery';

export default ProductImageGallery;