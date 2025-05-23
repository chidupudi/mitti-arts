// components/ProductCard/ProductCard.jsx
import React, { memo } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Rating,
  Tooltip,
} from '@mui/material';
import {
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  Warning,
  InfoOutlined,
  VisibilityOff,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme, isUnavailable }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: `1px solid ${theme.palette.divider}`,
  opacity: isUnavailable ? 0.75 : 1,
  
  '&:hover': {
    transform: isUnavailable ? 'none' : 'translateY(-4px)',
    boxShadow: isUnavailable 
      ? theme.shadows[1] 
      : `0 12px 28px rgba(210, 105, 30, 0.15)`,
  },
  
  ...(isUnavailable && {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.6)',
      zIndex: 1,
      pointerEvents: 'none',
    },
  }),
}));

const StatusRibbon = styled(Box)(({ theme, status }) => ({
  position: 'absolute',
  top: 12,
  right: -30,
  transform: 'rotate(35deg)',
  width: 120,
  textAlign: 'center',
  padding: '4px 0',
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'white',
  zIndex: 2,
  letterSpacing: '0.5px',
  ...(status === 'unavailable' && {
    backgroundColor: theme.palette.warning.main,
  }),
  ...(status === 'out_of_stock' && {
    backgroundColor: theme.palette.error.main,
  }),
}));

const PriceContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const DiscountChip = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: '0.7rem',
  fontWeight: 600,
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
}));

const StockStatus = styled(Box)(({ theme, stockLevel }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  borderRadius: 6,
  backgroundColor: theme.palette.background.default,
  ...(stockLevel === 'critical' && {
    color: theme.palette.error.main,
    backgroundColor: theme.palette.error.light + '20',
  }),
  ...(stockLevel === 'low' && {
    color: theme.palette.warning.main,
    backgroundColor: theme.palette.warning.light + '20',
  }),
  ...(stockLevel === 'normal' && {
    color: theme.palette.success.main,
    backgroundColor: theme.palette.success.light + '20',
  }),
}));

const ImageContainer = styled(Box)({
  position: 'relative',
  overflow: 'hidden',
});

const ProductImage = styled(CardMedia)(({ isUnavailable }) => ({
  height: 220,
  transition: 'transform 0.3s ease',
  filter: isUnavailable ? 'grayscale(30%)' : 'none',
  
  '&:hover': {
    transform: isUnavailable ? 'none' : 'scale(1.05)',
  },
}));

const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  onProductClick,
  isInWishlist 
}) => {
  const isOutOfStock = product.stock === 0;
  const isHidden = product.hidden;
  const isUnavailable = isHidden || isOutOfStock;
  
  const getStockLevel = () => {
    if (isOutOfStock) return 'out';
    if (product.stock < 10) return 'critical';
    if (product.stock < 20) return 'low';
    return 'normal';
  };

  const stockLevel = getStockLevel();

  const handleCardClick = (e) => {
    // Prevent click when clicking on buttons
    if (e.target.closest('button') || e.target.closest('[role="button"]')) {
      return;
    }
    onProductClick(product.id, product.code);
  };

  const renderStockStatus = () => {
    if (isHidden) {
      return (
        <StockStatus stockLevel="unavailable">
          <VisibilityOff fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" fontWeight={600}>
            Currently Unavailable
          </Typography>
        </StockStatus>
      );
    }

    if (isOutOfStock) {
      return (
        <StockStatus stockLevel="critical">
          <Warning fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" fontWeight={600}>
            Out of Stock
          </Typography>
        </StockStatus>
      );
    }

    if (product.stock < 10) {
      return (
        <StockStatus stockLevel="critical">
          <Warning fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" fontWeight={600}>
            Only {product.stock} left!
          </Typography>
        </StockStatus>
      );
    }

    if (product.stock < 20) {
      return (
        <StockStatus stockLevel="low">
          <InfoOutlined fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" fontWeight={600}>
            Few items left
          </Typography>
        </StockStatus>
      );
    }

    return (
      <StockStatus stockLevel="normal">
        <Typography variant="caption" fontWeight={600}>
          In Stock
        </Typography>
      </StockStatus>
    );
  };

  return (
    <StyledCard isUnavailable={isUnavailable} onClick={handleCardClick}>
      {/* Status Ribbons */}
      {isHidden && (
        <StatusRibbon status="unavailable">
          UNAVAILABLE
        </StatusRibbon>
      )}
      {!isHidden && isOutOfStock && (
        <StatusRibbon status="out_of_stock">
          OUT OF STOCK
        </StatusRibbon>
      )}

      {/* Featured Badge */}
      {product.isFeatured && !isUnavailable && (
        <Chip
          label="Featured"
          color="primary"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            fontWeight: 600,
          }}
        />
      )}

      <ImageContainer>
        <ProductImage
          component="img"
          image={product.imgUrl || '/api/placeholder/300/220'}
          alt={product.name}
          isUnavailable={isUnavailable}
        />
      </ImageContainer>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography 
          variant="h6" 
          noWrap 
          sx={{ 
            fontWeight: 600, 
            mb: 1,
            fontSize: '1rem',
          }}
        >
          {product.name}
        </Typography>

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating
            value={parseFloat(product.rating || 0)}
            readOnly
            precision={0.1}
            size="small"
            icon={<Star fontSize="inherit" />}
            emptyIcon={<StarBorder fontSize="inherit" />}
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#D2691E',
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {product.rating} ({product.reviews || 0})
          </Typography>
        </Box>

        {/* Price */}
        <PriceContainer>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {formatPrice(product.price)}
          </Typography>
          {product.originalPrice > product.price && (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                {formatPrice(product.originalPrice)}
              </Typography>
              <DiscountChip
                label={`${product.discount}% OFF`}
                size="small"
              />
            </>
          )}
        </PriceContainer>

        {/* Stock Status */}
        {renderStockStatus()}

        {/* Product Code */}
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ display: 'block', mt: 1 }}
        >
          Code: {product.code}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          startIcon={<AddShoppingCart />}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={isUnavailable}
          fullWidth
          sx={{
            mr: 1,
            borderRadius: 2,
            py: 1,
            fontWeight: 600,
            ...(isUnavailable && {
              backgroundColor: 'grey.300',
              color: 'grey.600',
            }),
          }}
        >
          {isOutOfStock ? 'Out of Stock' : isHidden ? 'Unavailable' : 'Add to Cart'}
        </Button>

        <Tooltip title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            color={isInWishlist ? 'error' : 'default'}
            sx={{
              border: '1px solid',
              borderColor: isInWishlist ? 'error.main' : 'divider',
              borderRadius: 2,
              p: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            {isInWishlist ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Tooltip>
      </CardActions>
    </StyledCard>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;