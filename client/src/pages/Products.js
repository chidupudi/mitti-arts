// Products.jsx - Updated with Buy Now functionality
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
  FlashOn, // Icon for Buy Now button
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

// Terracotta color scheme
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

// Format price helper
const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ProductCard Component - Updated with Buy Now button
const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  onBuyNow, // New prop for Buy Now functionality
  onToggleWishlist, 
  onProductClick,
  isInWishlist
}) => {
  const isOutOfStock = product.stock === 0;
  const isHidden = product.hidden;
  const isUnavailable = isHidden || isOutOfStock;

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('[role="button"]')) {
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
        
        '&:hover': {
          transform: isUnavailable ? 'none' : 'translateY(-4px)',
          boxShadow: isUnavailable 
            ? 2 
            : `0 12px 28px ${terracottaColors.primary}25`,
        },
      }}
      onClick={handleCardClick}
    >
      {/* Status Ribbons */}
      {isHidden && (
        <Box
          sx={{
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
            top: 12,
            left: 12,
            zIndex: 2,
            fontWeight: 600,
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
            top: product.isFeatured ? 46 : 12,
            left: 12,
            zIndex: 2,
            fontWeight: 600,
            backgroundColor: '#9C27B0',
            color: 'white',
            pl: 0.5,
          }}
        />
      )}

      <CardMedia
        component="img"
        height="220"
        image={product.imgUrl || 'https://via.placeholder.com/300x220/D2691E/FFFFFF?text=Product'}
        alt={product.name}
        sx={{
          transition: 'transform 0.3s ease',
          filter: isUnavailable ? 'grayscale(30%)' : 'none',
          
          '&:hover': {
            transform: isUnavailable ? 'none' : 'scale(1.05)',
          },
        }}
      />

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
                color: terracottaColors.primary,
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {product.rating} ({product.reviews || 0})
          </Typography>
        </Box>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: terracottaColors.primary }}>
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
              <Chip
                label={`${product.discount}% OFF`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
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
          sx={{ display: 'block', mt: 1 }}
        >
          Code: {product.code}
        </Typography>
      </CardContent>

      {/* Updated CardActions with Buy Now button */}
      <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
        {/* Add to Cart Button */}
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
            borderRadius: 2,
            py: 1,
            fontWeight: 600,
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
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          {/* Buy Now Button */}
          <Button
            variant="contained"
            startIcon={<FlashOn />}
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow(product);
            }}
            disabled={isUnavailable}
            sx={{
              flex: 1,
              borderRadius: 2,
              py: 1,
              fontWeight: 600,
              fontSize: '0.85rem',
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
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              sx={{
                border: '1px solid',
                borderColor: isInWishlist ? terracottaColors.error : terracottaColors.divider,
                borderRadius: 2,
                p: 1,
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

// FilterPanel Component (unchanged)
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
                height: 20,
                width: 20,
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
              },
              '& .MuiSlider-rail': {
                backgroundColor: terracottaColors.divider,
              },
              '& .MuiSlider-valueLabel': {
                backgroundColor: terracottaColors.primary,
                '&:before': {
                  borderColor: terracottaColors.primary,
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Min: {formatPrice(priceRange[0])}
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
                py: 1.5 
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
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="priceLowToHigh">Price: Low to High</MenuItem>
            <MenuItem value="priceHighToLow">Price: High to Low</MenuItem>
            <MenuItem value="alphabetical">Alphabetical</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="newest">Newest First</MenuItem>
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
              p: 2,
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
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: terracottaColors.primary,
                      '&:hover': {
                        backgroundColor: `${terracottaColors.primary}20`,
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: terracottaColors.primary,
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" fontWeight={600}>
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
                      height: 20,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
              }
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
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
              padding: 2,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: `${terracottaColors.primary}08`,
              },
            }}
            onClick={() => onToggleSection(section.key)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {section.icon}
              <Typography variant="subtitle1" fontWeight={600}>
                {section.title}
              </Typography>
            </Box>
            <IconButton
              size="small"
              sx={{
                transform: expanded[section.key] ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                padding: 0.5,
              }}
            >
              <ExpandMore />
            </IconButton>
          </Box>
          
          <Collapse in={expanded[section.key]} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, pt: 0 }}>
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
          py: 1.5,
          borderRadius: 2,
          fontWeight: 600,
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
// QuantityModal Component (unchanged)
const QuantityModal = ({ 
  open, 
  onClose, 
  product, 
  onConfirm
}) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

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
          maxWidth: 500,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            Add to Cart
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {/* Product Information */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            backgroundColor: `${terracottaColors.primary}08`,
            borderRadius: 2,
            mt: 1,
          }}
        >
          <Avatar
            src={product.imgUrl}
            alt={product.name}
            variant="rounded"
            sx={{ width: 80, height: 80 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Code: {product.code}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: terracottaColors.primary }}>
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
                  <Chip
                    label={`${product.discount}% OFF`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
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
          <Typography variant="body2" color="text.secondary">
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
              <Typography variant="body2" fontWeight={600}>
                Available for delivery in Hyderabad only
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Quantity Selection */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Select Quantity
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            sx={{
              border: `2px solid ${terracottaColors.primary}`,
              borderRadius: 1.5,
              width: 40,
              height: 40,
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
              style: { textAlign: 'center', fontWeight: 600 }
            }}
            sx={{
              width: 100,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                fontWeight: 600,
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
              width: 40,
              height: 40,
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
          <Typography variant="body2" sx={{ mt: 1, color: terracottaColors.error }}>
            {error}
          </Typography>
        )}

        {/* Price Summary */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: `${terracottaColors.primary}15`,
            borderRadius: 1.5,
            border: `1px solid ${terracottaColors.primary}30`,
            mt: 2,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ color: terracottaColors.primary }}>
              {formatPrice(totalPrice)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              {quantity} × {formatPrice(product.price)}
            </Typography>
            {product.originalPrice > product.price && (
              <Typography variant="body2" fontWeight={600} sx={{ color: terracottaColors.success }}>
                You save {formatPrice((product.originalPrice - product.price) * quantity)}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
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
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
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

// Loading skeleton component (unchanged)
const ProductSkeleton = () => (
  <Grid container spacing={3}>
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
            height={220}
            sx={{ backgroundColor: `${terracottaColors.primaryLight}20` }}
          />
          <Box sx={{ p: 2 }}>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Skeleton variant="text" width="30%" height={20} />
              <Skeleton variant="text" width="25%" height={20} />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" height={36} sx={{ flexGrow: 1 }} />
              <Skeleton variant="rectangular" width={40} height={36} />
            </Box>
          </Box>
        </Paper>
      </Grid>
    ))}
  </Grid>
);

// Main Products Component - Updated with Buy Now functionality
const Products = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
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
  const [productsLoading, setProductsLoading] = useState(true);

  // Auth effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const price = Number(data.price);
          
          // Calculate discount
          let discount = 0;
          if (price >= 50 && price <= 300) discount = 10;
          else if (price > 300 && price <= 1000) discount = 20;
          else if (price > 1000) discount = 25;
          
          const originalPrice = Math.ceil(price / (1 - discount/100));
          
          // Determine stock status
          let stockStatus = 'normal';
          if (data.stock === 0) stockStatus = 'out_of_stock';
          else if (data.stock < 10) stockStatus = 'critical';
          else if (data.stock < 20) stockStatus = 'low';

          return {
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            price: price,
            originalPrice: originalPrice,
            discount: discount,
            code: data.code || '',
            stock: Number(data.stock) || 0,
            stockStatus: stockStatus,
            images: Array.isArray(data.images) ? data.images : [],
            imgUrl: Array.isArray(data.images) && data.images.length > 0 
              ? data.images[0] 
              : 'https://via.placeholder.com/300x220/D2691E/FFFFFF?text=Product',
            rating: data.rating || 4.0,
            reviews: data.reviews || 0,
            isFeatured: data.isFeatured || false,
            hidden: data.hidden || false,
            hyderabadOnly: data.hyderabadOnly || false,
          };
        });

        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch wishlist
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const wishlistRef = collection(db, 'wishlist');
        const q = query(wishlistRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const items = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.data().productId,
          wishlistDocId: doc.id,
        }));
        
        setWishlist(items);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist();
  }, [user]);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesSearch = debouncedSearchQuery === '' || 
        product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.code.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesLocation = !hyderabadOnly || (hyderabadOnly && product.hyderabadOnly === true);
      
      return matchesPrice && matchesSearch && matchesLocation;
    });

    // Apply sorting
    switch (sortBy) {
      case 'priceLowToHigh':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighToLow':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, priceRange, debouncedSearchQuery, sortBy, hyderabadOnly]);

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

  // New Buy Now handler
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
      // Add 1 quantity to cart
      await addDoc(collection(db, 'cart'), {
        userId: user.uid,
        productId: product.id,
        name: product.name,
        price: product.price,
        code: product.code,
        quantity: 1, // Always add 1 for Buy Now
        imgUrl: product.imgUrl,
        hyderabadOnly: product.hyderabadOnly,
      });

      showSnackbar(`${product.name} added to cart!`, 'success');
      
      // Navigate to cart page immediately
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      showSnackbar('Error adding to cart', 'error');
    }
  }, [user, navigate, showSnackbar]);

  const handleToggleWishlist = useCallback(async (product) => {
    if (!user) {
      showSnackbar('Please log in to manage your wishlist.', 'warning');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    const wishlistRef = collection(db, 'wishlist');
    const isInWishlist = wishlist.some(item => item.id === product.id);

    try {
      if (isInWishlist) {
        const itemToRemove = wishlist.find(item => item.id === product.id);
        if (itemToRemove?.wishlistDocId) {
          await deleteDoc(doc(db, 'wishlist', itemToRemove.wishlistDocId));
          setWishlist(prev => prev.filter(item => item.id !== product.id));
          showSnackbar('Removed from wishlist');
        }
      } else {
        const docRef = await addDoc(wishlistRef, {
          userId: user.uid,
          productId: product.id,
          name: product.name,
          imgUrl: product.imgUrl,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          rating: product.rating,
          reviews: product.reviews,
          code: product.code,
          hidden: product.hidden,
          stock: product.stock,
          hyderabadOnly: product.hyderabadOnly,
        });

        setWishlist(prev => [...prev, { ...product, wishlistDocId: docRef.id }]);
        showSnackbar('Added to wishlist');
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      showSnackbar('Error updating wishlist', 'error');
    }
  }, [user, wishlist, navigate, showSnackbar]);

  const handleConfirmAddToCart = useCallback(async (quantity) => {
    if (!selectedProduct || !user) return;

    if (selectedProduct.stock < quantity) {
      showSnackbar(`Only ${selectedProduct.stock} items available in stock.`, 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'cart'), {
        userId: user.uid,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        code: selectedProduct.code,
        quantity: quantity,
        imgUrl: selectedProduct.imgUrl,
        hyderabadOnly: selectedProduct.hyderabadOnly,
      });

      showSnackbar(`${selectedProduct.name} added to cart!`);
      setModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showSnackbar('Error adding to cart', 'error');
    }
  }, [selectedProduct, user, showSnackbar]);

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
      pt: 2
    }}>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
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
                }}
              >
                Discover Our Products
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Explore our curated collection of premium items
              </Typography>
            </Box>
          </Fade>

          {/* Search and Filter Bar */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${terracottaColors.backgroundLight}30 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${terracottaColors.primary}20`,
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              flexWrap: 'wrap',
            }}>
              {/* Search */}
              <Box sx={{ flexGrow: 1, minWidth: 250 }}>
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
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
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
                    px: 2,
                    py: 1.5,
                    fontWeight: 600,
                    borderColor: terracottaColors.primary,
                    color: hyderabadOnly ? 'white' : terracottaColors.primary,
                    backgroundColor: hyderabadOnly ? '#9C27B0' : 'transparent',
                    '&:hover': {
                      backgroundColor: hyderabadOnly ? '#7B1FA2' : 'rgba(156, 39, 176, 0.08)',
                      borderColor: hyderabadOnly ? '#7B1FA2' : '#9C27B0',
                    },
                  }}
                >
                  Hyderabad Only
                </Button>
              )}

              {/* Results Count */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: `${terracottaColors.primary}15`,
                px: 2,
                py: 1,
                borderRadius: 2,
              }}>
                <ViewModule sx={{ mr: 1, color: terracottaColors.primary }} />
                <Typography variant="body2" fontWeight={600} sx={{ color: terracottaColors.primaryDark }}>
                  {filteredProducts.length} Products
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', gap: 3 }}>
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
            ) : filteredProducts.length === 0 ? (
              <Paper
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 3,
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${terracottaColors.backgroundLight}30 100%)`,
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No products found matching your criteria
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleResetFilters}
                  sx={{ 
                    borderRadius: 2, 
                    px: 4,
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
              <Grid container spacing={3}>
                {filteredProducts.map((product, index) => (
                  <Grid item xs={12} sm={6} lg={4} xl={3} key={product.id}>
                    <Zoom in timeout={500 + index * 50}>
                      <Box>
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onBuyNow={handleBuyNow} // Pass the Buy Now handler
                          onToggleWishlist={handleToggleWishlist}
                          onProductClick={handleProductClick}
                          isInWishlist={wishlist.some(item => item.id === product.id)}
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
            width: 300,
            background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${terracottaColors.backgroundLight}50 100%)`,
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Filters
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} size="small">
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
    </Box>
  );
};

export default Products;