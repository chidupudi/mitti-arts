// Products.jsx - iPhone-optimized with Android compatibility
import React, { 
  useState, 
  useEffect, 
  useMemo, 
  useCallback,
  memo
} from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  SwipeableDrawer,
  Skeleton,
  Snackbar,
  Alert,
  Zoom,
  Fade,
  useTheme,
  useMediaQuery,
  Container,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Rating,
  Tooltip,
  Slider,
  FormControl,
  Select,
  MenuItem,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Switch,
  FormControlLabel,
  ButtonGroup,
} from '@mui/material';
import {
  Search,
  Close,
  TuneOutlined,
  ViewModule,
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  Warning,
  InfoOutlined,
  VisibilityOff,
  Star,
  StarBorder,
  PriceChange,
  Sort,
  Refresh,
  ExpandMore,
  Add,
  Remove,
  ShoppingCart,
  LocationOn,
  FlashOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Import optimization hooks
import {
  useProducts,
  useProductSearch,
  useCartOperations,
  useWishlistOperations,
  usePerformanceMonitor,
  useLazyImage,
  useMemoryStorage,
} from '../hooks/useProductsOptimization';

// iPhone detection utility
const isIPhone = () => {
  return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

const isIOSDeviceCheck = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Terracotta color scheme with better contrast for iPhone
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
};

// iPhone-specific styles
const iPhoneStyles = {
  // Prevent zoom on input focus
  input: {
    fontSize: '16px !important', // Critical for preventing zoom
    WebkitAppearance: 'none',
    WebkitBorderRadius: '0',
  },
  // Better touch targets
  touchTarget: {
    minHeight: '44px',
    minWidth: '44px',
  },
  // Prevent text selection and highlighting
  noSelect: {
    WebkitTapHighlightColor: 'transparent',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  // Safe area handling
  safeArea: {
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  },
};

// Format price helper
const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

// ProductCard Component - iPhone-optimized
const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  onBuyNow,
  onToggleWishlist, 
  onProductClick,
  isInWishlist
}) => {
  const [imageSrc, setImageRef] = useLazyImage(
    product.imgUrl, 
    'https://via.placeholder.com/300x220/D2691E/FFFFFF?text=Product'
  );
  
  const isOutOfStock = product.stock === 0;
  const isHidden = product.hidden;
  const isUnavailable = isHidden || isOutOfStock;
  const isIPhoneDevice = isIPhone();

  const handleCardClick = (e) => {
    // Prevent card click on interactive elements
    if (e.target.closest('button') || e.target.closest('[role="button"]') || e.target.closest('.MuiIconButton-root')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onProductClick(product.id, product.code);
  };

  const renderStockStatus = () => {
    if (isHidden) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mt: 1,
          p: 0.5,
          borderRadius: 1,
          backgroundColor: `${terracottaColors.warning}20`,
          color: terracottaColors.warning,
        }}>
          <VisibilityOff fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" fontWeight={600}>
            Currently Unavailable
          </Typography>
        </Box>
      );
    }

    if (isOutOfStock) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mt: 1,
          p: 0.5,
          borderRadius: 1,
          backgroundColor: `${terracottaColors.error}20`,
          color: terracottaColors.error,
        }}>
          <Warning fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" fontWeight={600}>
            Out of Stock
          </Typography>
        </Box>
      );
    }

    if (product.hyderabadOnly) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mt: 1,
          p: 0.5,
          borderRadius: 1,
          backgroundColor: '#9C27B020',
          color: '#9C27B0',
        }}>
          <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" fontWeight={600}>
            Hyderabad Only Delivery
          </Typography>
        </Box>
      );
    }

    if (product.stock < 10) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mt: 1,
          p: 0.5,
          borderRadius: 1,
          backgroundColor: `${terracottaColors.error}20`,
          color: terracottaColors.error,
        }}>
          <Warning fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" fontWeight={600}>
            Only {product.stock} left!
          </Typography>
        </Box>
      );
    }

    if (product.stock < 20) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mt: 1,
          p: 0.5,
          borderRadius: 1,
          backgroundColor: `${terracottaColors.warning}20`,
          color: terracottaColors.warning,
        }}>
          <InfoOutlined fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" fontWeight={600}>
            Few items left
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mt: 1,
        p: 0.5,
        borderRadius: 1,
        backgroundColor: `${terracottaColors.success}20`,
        color: terracottaColors.success,
      }}>
        <Typography variant="caption" fontWeight={600}>
          In Stock
        </Typography>
      </Box>
    );
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: `1px solid ${terracottaColors.divider}`,
        opacity: isUnavailable ? 0.75 : 1,
        
        // iPhone-specific optimizations
        ...iPhoneStyles.noSelect,
        
        '&:hover': {
          transform: isUnavailable ? 'none' : 'translateY(-4px)',
          boxShadow: isUnavailable 
            ? 2 
            : `0 12px 28px ${terracottaColors.primary}25`,
        },
        
        // Enhanced touch targets for iPhone
        '& .MuiButton-root': {
          ...iPhoneStyles.touchTarget,
          fontSize: isIPhoneDevice ? '16px' : { xs: '0.875rem', sm: '1rem' },
          fontWeight: 600,
        },
        '& .MuiIconButton-root': {
          ...iPhoneStyles.touchTarget,
        },
        '& .MuiTextField-root input': {
          ...iPhoneStyles.input,
        },
      }}
      onClick={handleCardClick}
    >
      {/* Status Ribbons - Better positioning for iPhone */}
      {isHidden && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: isIPhoneDevice ? -20 : { xs: -25, sm: -30 },
            transform: 'rotate(35deg)',
            width: isIPhoneDevice ? 90 : { xs: 100, sm: 120 },
            textAlign: 'center',
            padding: '4px 0',
            fontSize: isIPhoneDevice ? '0.55rem' : { xs: '0.6rem', sm: '0.7rem' },
            fontWeight: 700,
            color: 'white',
            zIndex: 2,
            letterSpacing: '0.5px',
            backgroundColor: terracottaColors.warning,
          }}
        >
          UNAVAILABLE
        </Box>
      )}
      {!isHidden && isOutOfStock && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: isIPhoneDevice ? -20 : { xs: -25, sm: -30 },
            transform: 'rotate(35deg)',
            width: isIPhoneDevice ? 90 : { xs: 100, sm: 120 },
            textAlign: 'center',
            padding: '4px 0',
            fontSize: isIPhoneDevice ? '0.55rem' : { xs: '0.6rem', sm: '0.7rem' },
            fontWeight: 700,
            color: 'white',
            zIndex: 2,
            letterSpacing: '0.5px',
            backgroundColor: terracottaColors.error,
          }}
        >
          OUT OF STOCK
        </Box>
      )}

      {/* Featured Badge */}
      {product.isFeatured && !isUnavailable && (
        <Chip
          label="Featured"
          size="small"
          sx={{
            position: 'absolute',
            top: isIPhoneDevice ? 6 : { xs: 8, sm: 12 },
            left: isIPhoneDevice ? 6 : { xs: 8, sm: 12 },
            zIndex: 2,
            fontWeight: 600,
            fontSize: isIPhoneDevice ? '0.6rem' : { xs: '0.65rem', sm: '0.75rem' },
            height: isIPhoneDevice ? 18 : { xs: 20, sm: 24 },
            backgroundColor: terracottaColors.primary,
            color: 'white',
          }}
        />
      )}

      {/* Hyderabad-Only Badge */}
      {product.hyderabadOnly && !isUnavailable && (
        <Chip
          icon={<LocationOn fontSize="small" />}
          label="Hyderabad Only"
          size="small"
          sx={{
            position: 'absolute',
            top: product.isFeatured 
              ? (isIPhoneDevice ? 26 : { xs: 34, sm: 46 })
              : (isIPhoneDevice ? 6 : { xs: 8, sm: 12 }),
            left: isIPhoneDevice ? 6 : { xs: 8, sm: 12 },
            zIndex: 2,
            fontWeight: 600,
            fontSize: isIPhoneDevice ? '0.55rem' : { xs: '0.6rem', sm: '0.7rem' },
            height: isIPhoneDevice ? 18 : { xs: 20, sm: 24 },
            backgroundColor: '#9C27B0',
            color: 'white',
            pl: 0.5,
          }}
        />
      )}

      <CardMedia
        ref={setImageRef}
        component="img"
        height={isIPhoneDevice ? "200" : "220"}
        image={imageSrc}
        alt={product.name}
        sx={{
          transition: 'transform 0.3s ease',
          filter: isUnavailable ? 'grayscale(30%)' : 'none',
          objectFit: 'cover',
          
          '&:hover': {
            transform: isUnavailable ? 'none' : 'scale(1.05)',
          },
        }}
      />

      <CardContent sx={{ 
        flexGrow: 1, 
        p: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 },
      }}>
        <Typography 
          variant="h6" 
          noWrap 
          sx={{ 
            fontWeight: 600, 
            mb: 1,
            fontSize: isIPhoneDevice ? '0.85rem' : { xs: '0.9rem', sm: '1rem' },
            lineHeight: 1.3,
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
                color: terracottaColors.primary,
              },
              '& .MuiRating-icon': {
                fontSize: isIPhoneDevice ? '0.9rem' : { xs: '1rem', sm: '1.2rem' },
              },
            }}
          />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              ml: 1,
              fontSize: isIPhoneDevice ? '0.7rem' : { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            {product.rating} ({product.reviews || 0})
          </Typography>
        </Box>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: terracottaColors.primary,
              fontSize: isIPhoneDevice ? '0.95rem' : { xs: '1rem', sm: '1.25rem' },
            }}
          >
            {formatPrice(product.price)}
          </Typography>
          {product.originalPrice > product.price && (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ 
                  textDecoration: 'line-through',
                  fontSize: isIPhoneDevice ? '0.7rem' : { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                {formatPrice(product.originalPrice)}
              </Typography>
              <Chip
                label={`${product.discount}% OFF`}
                size="small"
                sx={{
                  height: isIPhoneDevice ? 16 : { xs: 18, sm: 20 },
                  fontSize: isIPhoneDevice ? '0.55rem' : { xs: '0.6rem', sm: '0.7rem' },
                  fontWeight: 600,
                  backgroundColor: terracottaColors.error,
                  color: 'white',
                }}
              />
            </>
          )}
        </Box>

        {/* Stock Status */}
        {renderStockStatus()}

        {/* Product Code */}
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            display: 'block', 
            mt: 1,
            fontSize: isIPhoneDevice ? '0.65rem' : { xs: '0.7rem', sm: '0.75rem' },
          }}
        >
          Code: {product.code}
        </Typography>
      </CardContent>

      {/* Enhanced CardActions with better iPhone touch targets */}
      <CardActions sx={{ 
        p: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 }, 
        pt: 0, 
        flexDirection: 'column', 
        gap: isIPhoneDevice ? 0.8 : { xs: 1, sm: 1.5 },
      }}>
        {/* Add to Cart Button */}
        <Button
          variant="contained"
          startIcon={<AddShoppingCart />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={isUnavailable}
          fullWidth
          sx={{
            borderRadius: 2,
            py: isIPhoneDevice ? 1.5 : { xs: 1.2, sm: 1.5 },
            fontWeight: 600,
            fontSize: isIPhoneDevice ? '14px' : { xs: '0.875rem', sm: '1rem' },
            ...iPhoneStyles.touchTarget,
            backgroundColor: terracottaColors.primary,
            '&:hover': {
              backgroundColor: terracottaColors.primaryDark,
            },
            ...(isUnavailable && {
              backgroundColor: 'grey.300',
              color: 'grey.600',
              '&:hover': {
                backgroundColor: 'grey.300',
              },
            }),
          }}
        >
          {isOutOfStock ? 'Out of Stock' : isHidden ? 'Unavailable' : 'Add to Cart'}
        </Button>

        {/* Buy Now and Wishlist Row */}
        <Box sx={{ 
          display: 'flex', 
          gap: isIPhoneDevice ? 0.8 : { xs: 1, sm: 1.5 }, 
          width: '100%',
        }}>
          {/* Buy Now Button */}
          <Button
            variant="contained"
            startIcon={<FlashOn />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBuyNow(product);
            }}
            disabled={isUnavailable}
            sx={{
              flex: 1,
              borderRadius: 2,
              py: isIPhoneDevice ? 1.5 : { xs: 1.2, sm: 1.5 },
              fontWeight: 600,
              fontSize: isIPhoneDevice ? '13px' : { xs: '0.8rem', sm: '0.85rem' },
              ...iPhoneStyles.touchTarget,
              background: `linear-gradient(135deg, ${terracottaColors.success} 0%, #4CAF50 100%)`,
              color: 'white',
              '&:hover': {
                background: `linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)`,
              },
              ...(isUnavailable && {
                backgroundColor: 'grey.300',
                color: 'grey.600',
                background: 'grey.300',
                '&:hover': {
                  backgroundColor: 'grey.300',
                  background: 'grey.300',
                },
              }),
            }}
          >
            Buy Now
          </Button>

          {/* Wishlist Button */}
          <Tooltip title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
            <IconButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              sx={{
                border: '1px solid',
                borderColor: isInWishlist ? terracottaColors.error : terracottaColors.divider,
                borderRadius: 2,
                p: isIPhoneDevice ? 1.5 : { xs: 1.2, sm: 1.5 },
                ...iPhoneStyles.touchTarget,
                transition: 'all 0.2s ease',
                color: isInWishlist ? terracottaColors.error : 'default',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: isInWishlist ? `${terracottaColors.error}10` : `${terracottaColors.primary}10`,
                },
              }}
            >
              {isInWishlist ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
});

// FilterPanel Component - iPhone-optimized
const FilterPanel = memo(({
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  hyderabadOnly,
  setHyderabadOnly,
  onResetFilters,
  expanded,
  onToggleSection
}) => {
  const isIPhoneDevice = isIPhone();

  const sections = [
    {
      key: 'price',
      title: 'Price Range',
      icon: <PriceChange sx={{ color: terracottaColors.primary }} />,
      content: (
        <Box>
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            min={1}
            max={5000}
            step={50}
            valueLabelDisplay="auto"
            valueLabelFormat={formatPrice}
            sx={{
              mb: 2,
              '& .MuiSlider-thumb': {
                height: isIPhoneDevice ? 28 : { xs: 24, sm: 20 },
                width: isIPhoneDevice ? 28 : { xs: 24, sm: 20 },
                backgroundColor: terracottaColors.primary,
                border: `2px solid white`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                '&:focus, &:hover, &.Mui-active': {
                  boxShadow: `0 3px 8px ${terracottaColors.primary}50`,
                },
              },
              '& .MuiSlider-track': {
                backgroundColor: terracottaColors.primary,
                border: 'none',
                height: isIPhoneDevice ? 8 : { xs: 6, sm: 4 },
              },
              '& .MuiSlider-rail': {
                backgroundColor: terracottaColors.divider,
                height: isIPhoneDevice ? 8 : { xs: 6, sm: 4 },
              },
              '& .MuiSlider-valueLabel': {
                backgroundColor: terracottaColors.primary,
                fontSize: isIPhoneDevice ? '0.7rem' : { xs: '0.75rem', sm: '0.875rem' },
                '&:before': {
                  borderColor: terracottaColors.primary,
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: isIPhoneDevice ? '0.7rem' : { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Min: {formatPrice(priceRange[0])}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: isIPhoneDevice ? '0.7rem' : { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Max: {formatPrice(priceRange[1])}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'sort',
      title: 'Sort By',
      icon: <Sort sx={{ color: terracottaColors.primary }} />,
      content: (
        <FormControl fullWidth>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              '& .MuiSelect-select': { 
                py: isIPhoneDevice ? 2 : { xs: 1.8, sm: 1.5 },
                fontSize: isIPhoneDevice ? '16px' : { xs: '0.875rem', sm: '1rem' },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: `${terracottaColors.primary}30`,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: terracottaColors.primary,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: terracottaColors.primary,
              },
            }}
          >
            <MenuItem value="relevance">Relevance (Hyderabad First)</MenuItem>
            <MenuItem value="priceLowToHigh">Price: Low to High</MenuItem>
            <MenuItem value="priceHighToLow">Price: High to Low</MenuItem>
            <MenuItem value="alphabetical">Alphabetical</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="featured">Featured First</MenuItem>
            <MenuItem value="discount">Best Discounts</MenuItem>
          </Select>
        </FormControl>
      ),
    },
    {
      key: 'location',
      title: 'Delivery Location',
      icon: <LocationOn sx={{ color: terracottaColors.primary }} />,
      content: (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 },
              borderRadius: 2,
              border: `1px dashed ${terracottaColors.primary}50`,
              backgroundColor: `${terracottaColors.primary}08`,
              mb: 1,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={hyderabadOnly}
                  onChange={(e) => setHyderabadOnly(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      padding: isIPhoneDevice ? 2 : { xs: 1.5, sm: 1 },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: terracottaColors.primary,
                      '&:hover': {
                        backgroundColor: `${terracottaColors.primary}20`,
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: terracottaColors.primary,
                    },
                    '& .MuiSwitch-thumb': {
                      width: isIPhoneDevice ? 28 : { xs: 24, sm: 20 },
                      height: isIPhoneDevice ? 28 : { xs: 24, sm: 20 },
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: isIPhoneDevice ? 16 : { xs: 14, sm: 11 },
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="body1" 
                    fontWeight={600}
                    sx={{ fontSize: isIPhoneDevice ? '0.85rem' : { xs: '0.875rem', sm: '1rem' } }}
                  >
                    Hyderabad Only
                  </Typography>
                  <Chip
                    label="Local"
                    size="small"
                    sx={{
                      ml: 1,
                      backgroundColor: hyderabadOnly ? terracottaColors.primary : `${terracottaColors.primary}30`,
                      color: hyderabadOnly ? 'white' : terracottaColors.primary,
                      fontWeight: 600,
                      height: isIPhoneDevice ? 16 : { xs: 18, sm: 20 },
                      fontSize: isIPhoneDevice ? '0.55rem' : { xs: '0.6rem', sm: '0.7rem' },
                    }}
                  />
                </Box>
              }
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 1,
                fontSize: isIPhoneDevice ? '0.7rem' : { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              Show only products available for delivery within Hyderabad city limits
            </Typography>
          </Paper>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            fontSize: isIPhoneDevice ? '1.05rem' : { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          Filters
        </Typography>
        <Divider sx={{ borderColor: terracottaColors.divider }} />
      </Box>

      {sections.map((section) => (
        <Paper
          key={section.key}
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 2,
            border: `1px solid ${terracottaColors.divider}`,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 },
              ...iPhoneStyles.touchTarget,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              ...iPhoneStyles.noSelect,
              '&:hover': {
                backgroundColor: `${terracottaColors.primary}08`,
              },
            }}
            onClick={() => onToggleSection(section.key)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {section.icon}
              <Typography 
                variant="subtitle1" 
                fontWeight={600}
                sx={{ fontSize: isIPhoneDevice ? '0.85rem' : { xs: '0.875rem', sm: '1rem' } }}
              >
                {section.title}
              </Typography>
            </Box>
            <IconButton
              size="small"
              sx={{
                transform: expanded[section.key] ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                padding: isIPhoneDevice ? 1.2 : { xs: 1, sm: 0.5 },
                ...iPhoneStyles.touchTarget,
              }}
            >
              <ExpandMore />
            </IconButton>
          </Box>
          
          <Collapse in={expanded[section.key]} timeout="auto" unmountOnExit>
            <Box sx={{ p: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 }, pt: 0 }}>
              {section.content}
            </Box>
          </Collapse>
        </Paper>
      ))}

      <Button
        variant="outlined"
        fullWidth
        startIcon={<Refresh />}
        onClick={onResetFilters}
        sx={{
          mt: 2,
          py: isIPhoneDevice ? 2 : { xs: 1.8, sm: 1.5 },
          borderRadius: 2,
          fontWeight: 600,
          fontSize: isIPhoneDevice ? '16px' : { xs: '0.875rem', sm: '1rem' },
          ...iPhoneStyles.touchTarget,
          borderWidth: 2,
          borderColor: terracottaColors.primary,
          color: terracottaColors.primary,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: terracottaColors.primaryLight,
            color: 'white',
            borderColor: terracottaColors.primaryLight,
          },
        }}
      >
        Reset Filters
      </Button>
    </Box>
  );
});

// QuantityModal Component - iPhone-optimized
const QuantityModal = ({ 
  open, 
  onClose, 
  product, 
  onConfirm
}) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const isIPhoneDevice = isIPhone();

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setError('');
    }
  }, [open]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) {
      setError(`Only ${product.stock} items available`);
      return;
    }
    setError('');
    setQuantity(newQuantity);
  };

  const handleConfirm = () => {
    if (quantity > product.stock) {
      setError(`Only ${product.stock} items available`);
      return;
    }
    onConfirm(quantity);
  };

  const totalPrice = product.price * quantity;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: isIPhoneDevice ? '92vw' : { xs: '95vw', sm: 500 },
          m: isIPhoneDevice ? 0.5 : { xs: 1, sm: 3 },
          // iPhone-specific positioning
          ...(isIPhoneDevice && {
            position: 'fixed',
            bottom: 0,
            top: 'auto',
            transform: 'none',
            marginBottom: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }),
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            fontWeight={700}
            sx={{ fontSize: isIPhoneDevice ? '1.05rem' : { xs: '1.1rem', sm: '1.25rem' } }}
          >
            Add to Cart
          </Typography>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ ...iPhoneStyles.touchTarget }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: isIPhoneDevice ? 1.5 : { xs: 2, sm: 3 } }}>
        {/* Product Information */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 },
            p: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 },
            backgroundColor: `${terracottaColors.primary}08`,
            borderRadius: 2,
            mt: 1,
          }}
        >
          <Avatar
            src={product.imgUrl}
            alt={product.name}
            variant="rounded"
            sx={{ 
              width: isIPhoneDevice ? 60 : { xs: 70, sm: 80 }, 
              height: isIPhoneDevice ? 60 : { xs: 70, sm: 80 } 
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              sx={{ 
                mb: 0.5,
                fontSize: isIPhoneDevice ? '0.9rem' : { xs: '1rem', sm: '1.25rem' },
                lineHeight: 1.3,
              }}
            >
              {product.name}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 1,
                fontSize: isIPhoneDevice ? '0.7rem' : { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              Code: {product.code}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                sx={{ 
                  color: terracottaColors.primary,
                  fontSize: isIPhoneDevice ? '0.9rem' : { xs: '1rem', sm: '1.25rem' },
                }}
              >
                {formatPrice(product.price)}
              </Typography>
              {product.originalPrice > product.price && (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ 
                      textDecoration: 'line-through',
                      fontSize: isIPhoneDevice ? '0.7rem' : { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  >
                    {formatPrice(product.originalPrice)}
                  </Typography>
                  <Chip
                    label={`${product.discount}% OFF`}
                    size="small"
                    sx={{
                      height: isIPhoneDevice ? 16 : { xs: 18, sm: 20 },
                      fontSize: isIPhoneDevice ? '0.55rem' : { xs: '0.6rem', sm: '0.7rem' },
                      backgroundColor: terracottaColors.error,
                      color: 'white',
                    }}
                  />
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Stock Information */}
        <Box sx={{ mt: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: isIPhoneDevice ? '0.75rem' : { xs: '0.8rem', sm: '0.875rem' } }}
          >
            Availability: {' '}
            <Typography
              component="span"
              variant="body2"
              color={product.stock > 10 ? terracottaColors.success : product.stock > 0 ? terracottaColors.warning : terracottaColors.error}
              fontWeight={600}
            >
              {product.stock > 10 
                ? 'In Stock' 
                : product.stock > 0 
                  ? `Only ${product.stock} left!`
                  : 'Out of Stock'
              }
            </Typography>
          </Typography>
          
          {product.hyderabadOnly && (
            <Box sx={{ 
              mt: 1, 
              display: 'flex', 
              alignItems: 'center',
              color: '#9C27B0'
            }}>
              <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
              <Typography 
                variant="body2" 
                fontWeight={600}
                sx={{ fontSize: isIPhoneDevice ? '0.75rem' : { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Available for delivery in Hyderabad only
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Quantity Selection */}
        <Typography 
          variant="subtitle1" 
          fontWeight={600} 
          sx={{ 
            mb: 2,
            fontSize: isIPhoneDevice ? '0.95rem' : { xs: '1rem', sm: '1.125rem' },
          }}
        >
          Select Quantity
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 }, 
          mb: 2,
          justifyContent: 'center',
        }}>
          <IconButton
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            sx={{
              border: `2px solid ${terracottaColors.primary}`,
              borderRadius: 1.5,
              width: isIPhoneDevice ? 50 : { xs: 48, sm: 40 },
              height: isIPhoneDevice ? 50 : { xs: 48, sm: 40 },
              ...iPhoneStyles.touchTarget,
              color: terracottaColors.primary,
              '&:hover': {
                backgroundColor: terracottaColors.primaryLight,
                color: 'white',
              },
              '&:disabled': {
                borderColor: 'action.disabled',
                color: 'action.disabled',
              },
            }}
          >
            <Remove />
          </IconButton>

          <TextField
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              handleQuantityChange(value);
            }}
            inputProps={{
              min: 1,
              max: product.stock,
              style: { 
                textAlign: 'center', 
                fontWeight: 600,
                fontSize: isIPhoneDevice ? '16px' : '18px', // Prevent zoom on iPhone
              }
            }}
            sx={{
              width: isIPhoneDevice ? 100 : { xs: 120, sm: 100 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                fontWeight: 600,
                height: isIPhoneDevice ? 50 : { xs: 48, sm: 40 },
                '& fieldset': {
                  borderColor: `${terracottaColors.primary}50`,
                },
                '&:hover fieldset': {
                  borderColor: terracottaColors.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: terracottaColors.primary,
                },
              },
            }}
          />

          <IconButton
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= product.stock}
            sx={{
              border: `2px solid ${terracottaColors.primary}`,
              borderRadius: 1.5,
              width: isIPhoneDevice ? 50 : { xs: 48, sm: 40 },
              height: isIPhoneDevice ? 50 : { xs: 48, sm: 40 },
              ...iPhoneStyles.touchTarget,
              color: terracottaColors.primary,
              '&:hover': {
                backgroundColor: terracottaColors.primaryLight,
                color: 'white',
              },
              '&:disabled': {
                borderColor: 'action.disabled',
                color: 'action.disabled',
              },
            }}
          >
            <Add />
          </IconButton>
        </Box>

        {error && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1, 
              color: terracottaColors.error,
              textAlign: 'center',
              fontSize: isIPhoneDevice ? '0.75rem' : { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            {error}
          </Typography>
        )}

        {/* Price Summary */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 },
            backgroundColor: `${terracottaColors.primary}15`,
            borderRadius: 1.5,
            border: `1px solid ${terracottaColors.primary}30`,
            mt: 2,
            flexDirection: isIPhoneDevice ? 'column' : { xs: 'column', sm: 'row' },
            gap: isIPhoneDevice ? 0.8 : { xs: 1, sm: 0 },
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: isIPhoneDevice ? '0.75rem' : { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Total Amount
            </Typography>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              sx={{ 
                color: terracottaColors.primary,
                fontSize: isIPhoneDevice ? '1.3rem' : { xs: '1.5rem', sm: '1.75rem' },
              }}
            >
              {formatPrice(totalPrice)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: isIPhoneDevice ? '0.75rem' : { xs: '0.8rem', sm: '0.875rem' } }}
            >
              {quantity} × {formatPrice(product.price)}
            </Typography>
            {product.originalPrice > product.price && (
              <Typography 
                variant="body2" 
                fontWeight={600} 
                sx={{ 
                  color: terracottaColors.success,
                  fontSize: isIPhoneDevice ? '0.75rem' : { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                You save {formatPrice((product.originalPrice - product.price) * quantity)}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        px: isIPhoneDevice ? 1.5 : { xs: 2, sm: 3 }, 
        pb: isIPhoneDevice ? 2 : { xs: 2, sm: 3 }, 
        pt: 1,
        gap: isIPhoneDevice ? 0.8 : { xs: 1, sm: 1.5 },
        flexDirection: 'column',
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth={true}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: isIPhoneDevice ? 2 : { xs: 1.5, sm: 1 },
            fontWeight: 600,
            fontSize: isIPhoneDevice ? '16px' : { xs: '0.875rem', sm: '1rem' },
            ...iPhoneStyles.touchTarget,
            borderColor: terracottaColors.primary,
            color: terracottaColors.primary,
            '&:hover': {
              borderColor: terracottaColors.primaryDark,
              backgroundColor: `${terracottaColors.primary}08`,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          startIcon={<ShoppingCart />}
          disabled={quantity > product.stock || product.stock === 0}
          fullWidth={true}
          sx={{
            borderRadius: 2,
            px: 3,
            py: isIPhoneDevice ? 2 : { xs: 1.5, sm: 1 },
            fontWeight: 600,
            fontSize: isIPhoneDevice ? '16px' : { xs: '0.875rem', sm: '1rem' },
            ...iPhoneStyles.touchTarget,
            backgroundColor: terracottaColors.primary,
            boxShadow: `0 4px 12px ${terracottaColors.primary}30`,
            '&:hover': {
              backgroundColor: terracottaColors.primaryDark,
            },
          }}
        >
          Add to Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Loading skeleton component - iPhone-optimized
const ProductSkeleton = () => {
  const isIPhoneDevice = isIPhone();
  
  return (
    <Grid container spacing={isIPhoneDevice ? 1.5 : { xs: 2, sm: 3 }}>
      {Array(8).fill(0).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Paper sx={{ 
            p: 0, 
            borderRadius: 3, 
            overflow: 'hidden',
            border: `1px solid ${terracottaColors.divider}`,
          }}>
            <Skeleton 
              variant="rectangular" 
              height={isIPhoneDevice ? 180 : 220}
              sx={{ backgroundColor: `${terracottaColors.primaryLight}20` }}
            />
            <Box sx={{ p: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 } }}>
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="text" width="60%" height={20} />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Skeleton variant="text" width="30%" height={20} />
                <Skeleton variant="text" width="25%" height={20} />
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Skeleton variant="rectangular" height={isIPhoneDevice ? 48 : 44} sx={{ flexGrow: 1 }} />
                <Skeleton variant="rectangular" width={isIPhoneDevice ? 48 : 44} height={isIPhoneDevice ? 48 : 44} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

// Main Products Component - iPhone-optimized
const Products = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isVerySmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isIPhoneDevice = isIPhone();
  const isIOSDevice = isIOSDeviceCheck();
  
  // State
  const [user, setUser] = useState(null);
  const [priceRange, setPriceRange] = useState([1, 5000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [hyderabadOnly, setHyderabadOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState({
    price: true,
    sort: true,
    location: true,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Use optimization hooks
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { addToCart } = useCartOperations(user);
  const { wishlist, toggleWishlistItem, isInWishlist } = useWishlistOperations(user);
  const { metrics, startTimer } = usePerformanceMonitor();
  
  // Search and filter with Hyderabad priority
  const { 
    products: filteredProducts, 
    totalCount, 
    hyderabadCount,
    isSearching 
  } = useProductSearch(products, searchQuery, {
    priceRange,
    sortBy,
    hyderabadOnly,
    hideOutOfStock: false,
  }, true); // Enable Hyderabad prioritization

  // Auth effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Performance monitoring
  useEffect(() => {
    const timer = startTimer('renderTime');
    return timer;
  }, [filteredProducts, startTimer]);

  // iPhone-specific effects
  useEffect(() => {
    if (isIPhoneDevice) {
      // Disable zoom on double tap
      document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
          event.preventDefault();
        }
      }, { passive: false });

      // Add viewport meta tag adjustments for iPhone
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Add safe area CSS variables
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
      document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
    }
  }, [isIPhoneDevice]);

  // Callbacks
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleProductClick = useCallback((id, code) => {
    navigate(`/product/${id}?code=${code}`);
  }, [navigate]);

  const handleAddToCart = useCallback(async (product) => {
    if (product.hidden || product.stock === 0) {
      showSnackbar(
        product.hidden ? 'This product is currently unavailable.' : 'This product is out of stock.',
        'warning'
      );
      return;
    }

    if (!user) {
      showSnackbar('Please log in to add items to cart.', 'warning');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    setSelectedProduct(product);
    setModalOpen(true);
  }, [user, navigate, showSnackbar]);

  // Enhanced Buy Now handler
  const handleBuyNow = useCallback(async (product) => {
    if (product.hidden || product.stock === 0) {
      showSnackbar(
        product.hidden ? 'This product is currently unavailable.' : 'This product is out of stock.',
        'warning'
      );
      return;
    }

    if (!user) {
      showSnackbar('Please log in to purchase items.', 'warning');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    try {
      const result = await addToCart(product, 1);
      if (result.success) {
        showSnackbar(result.message, 'success');
        // Navigate to cart page immediately
        setTimeout(() => {
          navigate('/cart');
        }, 1000);
      } else {
        showSnackbar(result.message, 'error');
      }
    } catch (error) {
      console.error('Error in Buy Now:', error);
      showSnackbar('Error processing your request', 'error');
    }
  }, [user, navigate, showSnackbar, addToCart]);

  const handleToggleWishlist = useCallback(async (product) => {
    if (!user) {
      showSnackbar('Please log in to manage your wishlist.', 'warning');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    try {
      const result = await toggleWishlistItem(product);
      if (result.success) {
        showSnackbar(result.message, 'success');
      } else {
        showSnackbar(result.message, 'error');
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      showSnackbar('Error updating wishlist', 'error');
    }
  }, [user, navigate, showSnackbar, toggleWishlistItem]);

  const handleConfirmAddToCart = useCallback(async (quantity) => {
    if (!selectedProduct || !user) return;

    if (selectedProduct.stock < quantity) {
      showSnackbar(`Only ${selectedProduct.stock} items available in stock.`, 'error');
      return;
    }

    try {
      const result = await addToCart(selectedProduct, quantity);
      if (result.success) {
        showSnackbar(result.message, 'success');
      } else {
        showSnackbar(result.message, 'error');
      }
      setModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showSnackbar('Error adding to cart', 'error');
    }
  }, [selectedProduct, user, showSnackbar, addToCart]);

  const handleResetFilters = useCallback(() => {
    setPriceRange([1, 5000]);
    setSortBy('relevance');
    setSearchQuery('');
    setHyderabadOnly(false);
  }, []);

  const handleToggleSection = useCallback((section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  return (
    <Box sx={{ 
      bgcolor: terracottaColors.background, 
      minHeight: '100vh',
      pt: isIPhoneDevice ? 0.5 : { xs: 1, sm: 2 },
      // iPhone-specific optimizations
      ...iPhoneStyles.noSelect,
      overflow: 'hidden auto',
      // iPhone safe area support
      ...(isIPhoneDevice && {
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }),
    }}>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbar-root': {
            top: isIPhoneDevice ? 100 : { xs: 80, sm: 24 }, // Avoid iPhone notch
          },
        }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            borderRadius: 2,
            fontSize: isIPhoneDevice ? '0.85rem' : { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="xl" sx={{ 
        px: isIPhoneDevice ? 1 : { xs: 1, sm: 2, md: 3 },
      }}>
        {/* Header Section */}
        <Box sx={{ mb: isIPhoneDevice ? 1.5 : { xs: 2, sm: 4 } }}>
          <Fade in timeout={800}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${terracottaColors.primary} 0%, ${terracottaColors.secondary} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  fontSize: isIPhoneDevice ? '1.6rem' : { xs: '1.75rem', sm: '2.125rem' },
                  textAlign: { xs: 'center', sm: 'left' },
                }}
              >
                Discover Our Products
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: isIPhoneDevice ? 1.5 : { xs: 2, sm: 3 },
                  fontSize: isIPhoneDevice ? '0.85rem' : { xs: '0.875rem', sm: '1rem' },
                  textAlign: { xs: 'center', sm: 'left' },
                }}
              >
                Explore our curated collection of premium items
              </Typography>
              
              {/* Products Stats */}
              <Box sx={{ 
                display: 'flex', 
                gap: isIPhoneDevice ? 1.5 : 2, 
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                mb: 2,
              }}>
                <Chip
                  label={`${totalCount} Total Products`}
                  sx={{
                    backgroundColor: `${terracottaColors.primary}15`,
                    color: terracottaColors.primaryDark,
                    fontWeight: 600,
                    fontSize: isIPhoneDevice ? '0.7rem' : { xs: '0.75rem', sm: '0.875rem' },
                  }}
                />
                {hyderabadCount > 0 && (
                  <Chip
                    icon={<LocationOn fontSize="small" />}
                    label={`${hyderabadCount} Hyderabad Available`}
                    sx={{
                      backgroundColor: '#9C27B015',
                      color: '#9C27B0',
                      fontWeight: 600,
                      fontSize: isIPhoneDevice ? '0.7rem' : { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  />
                )}
              </Box>
            </Box>
          </Fade>

          {/* Search and Filter Bar */}
          <Paper
            elevation={2}
            sx={{
              p: isIPhoneDevice ? 1.5 : { xs: 2, sm: 3 },
              borderRadius: 3,
              background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${terracottaColors.backgroundLight}30 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${terracottaColors.primary}20`,
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: isIPhoneDevice ? 1 : { xs: 1.5, sm: 2 },
              flexWrap: 'wrap',
            }}>
              {/* Search */}
              <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 250 } }}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: terracottaColors.primary }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => setSearchQuery('')}
                          edge="end"
                          sx={{ ...iPhoneStyles.touchTarget }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 2,
                      height: isIPhoneDevice ? 50 : { xs: 48, sm: 56 },
                      '& input': {
                        ...iPhoneStyles.input, // Prevent zoom on iPhone
                      },
                      '& fieldset': {
                        borderColor: `${terracottaColors.primary}30`,
                      },
                      '&:hover fieldset': {
                        borderColor: terracottaColors.primary,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: terracottaColors.primary,
                      },
                    },
                  }}
                />
              </Box>

              {/* Mobile Filter Button */}
              {isMobile && (
                <Button
                  variant="contained"
                  startIcon={<TuneOutlined />}
                  onClick={handleDrawerToggle}
                  sx={{ 
                    borderRadius: 2,
                    px: isIPhoneDevice ? 1.5 : { xs: 2, sm: 3 },
                    py: isIPhoneDevice ? 2 : { xs: 1.8, sm: 1.5 },
                    fontWeight: 600,
                    fontSize: isIPhoneDevice ? '16px' : { xs: '0.875rem', sm: '1rem' },
                    ...iPhoneStyles.touchTarget,
                    backgroundColor: terracottaColors.primary,
                    '&:hover': {
                      backgroundColor: terracottaColors.primaryDark,
                    },
                  }}
                >
                  Filters
                </Button>
              )}

              {/* Hyderabad Only Quick Filter Button - Mobile */}
              {isMobile && (
                <Button
                  variant={hyderabadOnly ? "contained" : "outlined"}
                  startIcon={<LocationOn />}
                  onClick={() => setHyderabadOnly(!hyderabadOnly)}
                  sx={{ 
                    borderRadius: 2,
                    px: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 },
                    py: isIPhoneDevice ? 2 : { xs: 1.8, sm: 1.5 },
                    fontWeight: 600,
                    fontSize: isIPhoneDevice ? '14px' : { xs: '0.8rem', sm: '0.875rem' },
                    ...iPhoneStyles.touchTarget,
                    borderColor: '#9C27B0',
                    color: hyderabadOnly ? 'white' : '#9C27B0',
                    backgroundColor: hyderabadOnly ? '#9C27B0' : 'transparent',
                    '&:hover': {
                      backgroundColor: hyderabadOnly ? '#7B1FA2' : 'rgba(156, 39, 176, 0.08)',
                      borderColor: hyderabadOnly ? '#7B1FA2' : '#9C27B0',
                    },
                  }}
                >
                  {(isVerySmall || isIPhoneDevice) ? 'HYD' : 'Hyderabad Only'}
                </Button>
              )}

              {/* Results Count */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: `${terracottaColors.primary}15`,
                px: isIPhoneDevice ? 1.2 : { xs: 1.5, sm: 2 },
                py: isIPhoneDevice ? 0.8 : { xs: 1, sm: 1 },
                borderRadius: 2,
                order: { xs: -1, sm: 0 },
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'center', sm: 'flex-start' },
              }}>
                <ViewModule sx={{ mr: 1, color: terracottaColors.primary }} />
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  sx={{ 
                    color: terracottaColors.primaryDark,
                    fontSize: isIPhoneDevice ? '0.75rem' : { xs: '0.8rem', sm: '0.875rem' },
                  }}
                >
                  {filteredProducts.length} Products
                  {isSearching && ' (searching...)'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', gap: { xs: 0, md: 3 } }}>
          {/* Desktop Filter Panel */}
          {!isMobile && (
            <Box sx={{ width: 320, flexShrink: 0 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  position: 'sticky',
                  top: 20,
                  maxHeight: 'calc(100vh - 40px)',
                  overflowY: 'auto',
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${terracottaColors.backgroundLight}30 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${terracottaColors.primary}20`,
                }}
              >
                <FilterPanel
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  hyderabadOnly={hyderabadOnly}
                  setHyderabadOnly={setHyderabadOnly}
                  onResetFilters={handleResetFilters}
                  expanded={expanded}
                  onToggleSection={handleToggleSection}
                />
              </Paper>
            </Box>
          )}

          {/* Products Grid */}
          <Box sx={{ flexGrow: 1 }}>
            {productsLoading ? (
              <ProductSkeleton />
            ) : productsError ? (
              <Paper
                sx={{
                  p: isIPhoneDevice ? 3 : { xs: 4, sm: 6 },
                  textAlign: 'center',
                  borderRadius: 3,
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${terracottaColors.backgroundLight}30 100%)`,
                }}
              >
                <Typography 
                  variant="h6" 
                  color="error" 
                  sx={{ 
                    mb: 2,
                    fontSize: isIPhoneDevice ? '1.05rem' : { xs: '1.1rem', sm: '1.25rem' },
                  }}
                >
                  Error Loading Products
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 3,
                    fontSize: isIPhoneDevice ? '0.85rem' : { xs: '0.875rem', sm: '1rem' },
                  }}
                >
                  {productsError}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  sx={{ 
                    borderRadius: 2, 
                    px: 4,
                    py: isIPhoneDevice ? 2 : { xs: 1.5, sm: 1 },
                    fontSize: isIPhoneDevice ? '16px' : 'inherit',
                    ...iPhoneStyles.touchTarget,
                    backgroundColor: terracottaColors.primary,
                    '&:hover': {
                      backgroundColor: terracottaColors.primaryDark,
                    },
                  }}
                >
                  Try Again
                </Button>
              </Paper>
            ) : filteredProducts.length === 0 ? (
              <Paper
                sx={{
                  p: isIPhoneDevice ? 3 : { xs: 4, sm: 6 },
                  textAlign: 'center',
                  borderRadius: 3,
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${terracottaColors.backgroundLight}30 100%)`,
                }}
              >
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    fontSize: isIPhoneDevice ? '1.05rem' : { xs: '1.1rem', sm: '1.25rem' },
                  }}
                >
                  No products found matching your criteria
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleResetFilters}
                  sx={{ 
                    borderRadius: 2, 
                    px: 4,
                    py: isIPhoneDevice ? 2 : { xs: 1.5, sm: 1 },
                    fontSize: isIPhoneDevice ? '16px' : 'inherit',
                    ...iPhoneStyles.touchTarget,
                    backgroundColor: terracottaColors.primary,
                    '&:hover': {
                      backgroundColor: terracottaColors.primaryDark,
                    },
                  }}
                >
                  Reset Filters
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={isIPhoneDevice ? 1.5 : { xs: 2, sm: 3 }}>
                {filteredProducts.map((product, index) => (
                  <Grid item xs={12} sm={6} lg={4} xl={3} key={product.id}>
                    <Zoom in timeout={500 + index * 50}>
                      <Box>
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onBuyNow={handleBuyNow}
                          onToggleWishlist={handleToggleWishlist}
                          onProductClick={handleProductClick}
                          isInWishlist={isInWishlist(product.id)}
                        />
                      </Box>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Container>

      {/* Mobile Filter Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        PaperProps={{
          sx: {
            width: isIPhoneDevice ? '85vw' : { xs: '90vw', sm: 300 },
            maxWidth: isIPhoneDevice ? 320 : 350,
            background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${terracottaColors.backgroundLight}50 100%)`,
            backdropFilter: 'blur(10px)',
            // iPhone safe area support
            ...(isIPhoneDevice && {
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }),
          }
        }}
        // iPhone-specific optimizations
        disableBackdropTransition={isIPhoneDevice}
        disableDiscovery={isIPhoneDevice}
      >
        <Box sx={{ p: isIPhoneDevice ? 1.5 : { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            ...iPhoneStyles.touchTarget,
          }}>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{ fontSize: isIPhoneDevice ? '1.05rem' : { xs: '1.1rem', sm: '1.25rem' } }}
            >
              Filters
            </Typography>
            <IconButton 
              onClick={() => setDrawerOpen(false)} 
              size="small"
              sx={{ ...iPhoneStyles.touchTarget }}
            >
              <Close />
            </IconButton>
          </Box>
          <FilterPanel
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            hyderabadOnly={hyderabadOnly}
            setHyderabadOnly={setHyderabadOnly}
            onResetFilters={handleResetFilters}
            expanded={expanded}
            onToggleSection={handleToggleSection}
          />
        </Box>
      </SwipeableDrawer>

      {/* Quantity Modal */}
      {modalOpen && selectedProduct && (
        <QuantityModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          product={selectedProduct}
          onConfirm={handleConfirmAddToCart}
        />
      )}

      {/* Performance Debug (Development only) */}
      {process.env.NODE_ENV === 'development' && !isIPhoneDevice && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            p: 1,
            borderRadius: 1,
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            zIndex: 9999,
            display: { xs: 'none', md: 'block' },
          }}
        >
          Render: {metrics.renderTime.toFixed(2)}ms | Products: {filteredProducts.length}
        </Box>
      )}
    </Box>
  );
};

export default Products;