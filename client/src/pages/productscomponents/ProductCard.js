// pages/productscomponents/ProductCard.js
import React, { useState, memo } from 'react';
import {
  Typography,
  Card,
  Button,
  Rate,
  Tag,
  Tooltip,
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  WarningOutlined,
  InfoCircleOutlined,
  EyeInvisibleOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Terracotta colors
const terracottaColors = {
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
  ganesh: '#FF8F00',
};

// Format price helper
const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  onBuyNow,
  onToggleWishlist, 
  onProductClick,
  isInWishlist
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check if primary media is video
  const primaryMedia = product.images?.[0] || product.imgUrl || 'https://via.placeholder.com/300x220/D2691E/FFFFFF?text=Product';
  const isVideo = typeof primaryMedia === 'object' && primaryMedia.type === 'video';
  const videoSrc = isVideo ? primaryMedia.src : null;
  const videoThumbnail = isVideo ? primaryMedia.thumbnail : null;
  const imageSrc = isVideo ? (videoThumbnail || primaryMedia.src) : primaryMedia;

  const isOutOfStock = product.stock === 0;
  const isHidden = product.hidden;
  const isUnavailable = isHidden || isOutOfStock;

  const handleCardClick = (e) => {
    if (e.target.closest('.ant-btn') || 
        e.target.closest('.ant-rate') ||
        e.target.closest('[role="button"]')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    onProductClick(product.id, product.code);
  };

  const renderStockStatus = () => {
    if (isHidden) {
      return (
        <Tag icon={<EyeInvisibleOutlined />} color="warning">
          Currently Unavailable
        </Tag>
      );
    }
    if (isOutOfStock) {
      return (
        <Tag icon={<WarningOutlined />} color="error">
          Out of Stock
        </Tag>
      );
    }
    if (product.hyderabadOnly) {
      return (
        <Tag icon={<EnvironmentOutlined />} color="purple">
          Hyderabad Only Delivery
        </Tag>
      );
    }
    if (product.stock < 10) {
      return (
        <Tag icon={<WarningOutlined />} color="error">
          Only {product.stock} left!
        </Tag>
      );
    }
    if (product.stock < 20) {
      return (
        <Tag icon={<InfoCircleOutlined />} color="warning">
          Few items left
        </Tag>
      );
    }
    return (
      <Tag icon={<EnvironmentOutlined />} color="green">
        Pan India Delivery
      </Tag>
    );
  };

  return (
    <Card
      hoverable={!isUnavailable}
      className={`product-card ${isUnavailable ? 'unavailable' : ''}`}
      bodyStyle={{ padding: 0 }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        height: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${terracottaColors.divider}`,
        cursor: isUnavailable ? 'default' : 'pointer',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isUnavailable ? 'none' : isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isUnavailable ? '0 2px 8px rgba(0,0,0,0.1)' : isHovered ? `0 12px 28px ${terracottaColors.primary}25` : '0 2px 8px rgba(0,0,0,0.1)',
        opacity: isUnavailable ? 0.75 : 1,
      }}
    >
      {/* Status Ribbons */}
      {isHidden && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '-25px',
          transform: 'rotate(35deg)',
          width: '100px',
          textAlign: 'center',
          padding: '4px 0',
          fontSize: '10px',
          fontWeight: 700,
          color: 'white',
          backgroundColor: terracottaColors.warning,
          zIndex: 2,
          letterSpacing: '0.5px',
        }}>
          UNAVAILABLE
        </div>
      )}
      {!isHidden && isOutOfStock && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '-25px',
          transform: 'rotate(35deg)',
          width: '100px',
          textAlign: 'center',
          padding: '4px 0',
          fontSize: '10px',
          fontWeight: 700,
          color: 'white',
          backgroundColor: terracottaColors.error,
          zIndex: 2,
          letterSpacing: '0.5px',
        }}>
          OUT OF STOCK
        </div>
      )}

      {/* Featured Badge */}
      {product.isFeatured && !isUnavailable && (
        <Tag style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2,
          margin: 0,
          backgroundColor: terracottaColors.primary,
          color: 'white',
          border: 'none',
        }}>
          Featured
        </Tag>
      )}

      {/* Hyderabad-Only Badge */}
      {product.hyderabadOnly && !isUnavailable && (
        <Tag
          icon={<EnvironmentOutlined />}
          style={{
            position: 'absolute',
            top: product.isFeatured ? '46px' : '12px',
            left: '12px',
            zIndex: 2,
            margin: 0,
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
          }}
        >
          Hyderabad Only
        </Tag>
      )}

      {/* Media Display with Video Support */}
      <div style={{ position: 'relative' }}>
        {isVideo && isHovered ? (
          // Show video on hover
          <video
            src={videoSrc}
            style={{
              width: '100%',
              height: '220px',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              filter: isUnavailable ? 'grayscale(30%)' : 'none',
            }}
            autoPlay
            muted
            loop
            playsInline
            onError={() => {
              // Fallback to thumbnail if video fails
            }}
          />
        ) : (
          // Show image or video thumbnail
          <img
            src={imageSrc}
            alt={product.name}
            style={{
              width: '100%',
              height: '220px',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: isUnavailable ? 'scale(1)' : isHovered ? 'scale(1.05)' : 'scale(1)',
              filter: isUnavailable ? 'grayscale(30%)' : 'none',
            }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x220/D2691E/FFFFFF?text=Product';
            }}
          />
        )}

        {/* Video Play Icon Overlay */}
        {isVideo && !isHovered && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '32px',
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
          }}>
            <PlayCircleOutlined />
          </div>
        )}

        {/* Video Badge */}
        {isVideo && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}>
            📹 VIDEO
          </div>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        <Title 
          level={5} 
          ellipsis={{ rows: 1 }}
          style={{ 
            marginBottom: '8px',
            fontSize: '16px',
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </Title>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Rate
            value={parseFloat(product.rating || 0)}
            disabled
            allowHalf
            style={{ fontSize: '14px', color: terracottaColors.primary }}
          />
          <Text 
            type="secondary" 
            style={{ marginLeft: '8px', fontSize: '12px' }}
          >
            {product.rating} ({product.reviews || 0})
          </Text>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          <Text 
            strong 
            style={{ 
              fontSize: '20px',
              color: terracottaColors.primary,
            }}
          >
            {formatPrice(product.price)}
          </Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <Text
                delete
                type="secondary"
                style={{ fontSize: '14px' }}
              >
                {formatPrice(product.originalPrice)}
              </Text>
              <Tag color="error" style={{ margin: 0, fontSize: '10px' }}>
                {product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </Tag>
            </>
          )}
        </div>

        {/* Stock Status */}
        <div style={{ marginTop: '8px' }}>
          {renderStockStatus()}
        </div>

        {/* Product Code */}
        <Text 
          type="secondary"
          style={{ 
            display: 'block', 
            marginTop: '8px',
            fontSize: '11px',
          }}
        >
          Code: {product.code}
        </Text>
      </div>

      {/* Card Actions */}
      <div style={{ 
        padding: '16px', 
        paddingTop: 0, 
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {/* Add to Cart Button */}
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={isUnavailable}
          block
          style={{
            borderRadius: '8px',
            height: '40px',
            fontWeight: 600,
            fontSize: '14px',
            backgroundColor: terracottaColors.primary,
            borderColor: terracottaColors.primary,
          }}
        >
          {isOutOfStock ? 'Out of Stock' : isHidden ? 'Unavailable' : 'Add to Cart'}
        </Button>

        {/* Buy Now and Wishlist Row */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          width: '100%',
        }}>
          {/* Buy Now Button */}
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBuyNow(product);
            }}
            disabled={isUnavailable}
            style={{
              flex: 1,
              borderRadius: '8px',
              height: '40px',
              fontWeight: 600,
              fontSize: '14px',
              background: `linear-gradient(135deg, ${terracottaColors.success} 0%, #4CAF50 100%)`,
              borderColor: terracottaColors.success,
            }}
          >
            Buy Now
          </Button>

          {/* Wishlist Button */}
          <Tooltip title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
            <Button
              icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              style={{
                borderRadius: '8px',
                height: '40px',
                borderColor: isInWishlist ? terracottaColors.error : terracottaColors.divider,
                color: isInWishlist ? terracottaColors.error : 'inherit',
              }}
            />
          </Tooltip>
        </div>
      </div>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
export { terracottaColors, formatPrice };