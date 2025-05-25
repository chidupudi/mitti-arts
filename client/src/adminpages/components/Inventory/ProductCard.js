import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Stack,
  Zoom,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  MoreVert,
  Image as ImageIcon,
  LocationOn,
  ColorLens,
  Straighten,
  Scale,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledProductCard = styled(Card)(({ theme, isHidden }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  opacity: isHidden ? 0.7 : 1,
  border: isHidden ? `2px solid ${theme.palette.warning.light}` : `1px solid ${theme.palette.grey[200]}`,
  '&::before': isHidden ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: theme.palette.warning.main,
    borderRadius: '16px 16px 0 0',
    zIndex: 1,
  } : {},
}));

const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleHide 
}) => {
  return (
    <Zoom in timeout={300}>
      <StyledProductCard isHidden={product.hidden}>
        {/* Product Image */}
        <Box sx={{ position: 'relative' }}>
          {product.images && product.images.length > 0 && product.images[0] ? (
            <CardMedia
              component="img"
              height="200"
              image={product.images[0]}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          ) : (
            <Box
              sx={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
              }}
            >
              <ImageIcon sx={{ fontSize: 64, color: 'grey.400' }} />
            </Box>
          )}
          
          {/* Status Ribbons */}
          {product.hidden && (
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
                backgroundColor: 'warning.main',
              }}
            >
              HIDDEN
            </Box>
          )}
          
          {/* Hyderabad-Only Badge */}
          {product.hyderabadOnly && (
            <Chip
              icon={<LocationOn />}
              label="Hyderabad Only"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 2,
                fontWeight: 600,
                backgroundColor: '#9C27B0',
                color: 'white',
                pl: 0.5,
              }}
            />
          )}
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          {/* Product Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {product.name}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // Handle menu open if needed
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2, 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden' 
            }}
          >
            {product.description || 'No description available'}
          </Typography>

          {/* Price and Stock */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
              ₹{product.price?.toLocaleString()}
            </Typography>
            <Chip 
              label={`Stock: ${product.stock}`}
              size="small"
              color={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "error"}
              variant="outlined"
            />
          </Box>

          {/* Product Specifications */}
          {(product.color || product.dimensions || product.weight) && (
            <>
              <Divider sx={{ mb: 1.5, mt: 1 }} />
              <Box sx={{ mb: 1.5 }}>
                {product.color && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <ColorLens fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {product.color}
                    </Typography>
                  </Box>
                )}
                
                {product.dimensions && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Straighten fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {product.dimensions}
                    </Typography>
                  </Box>
                )}
                
                {product.weight && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Scale fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {product.weight}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* Product Code */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Code: {product.code || 'N/A'}
          </Typography>

          {/* Status Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
            {product.hidden && (
              <Chip 
                label="Hidden" 
                size="small"
                color="warning" 
                variant="filled"
              />
            )}
            <Chip 
              label={product.inStock ? "In Stock" : "Out of Stock"} 
              size="small"
              color={product.inStock ? "success" : "error"}
              variant="outlined"
            />
            {product.hyderabadOnly && (
              <Chip 
                icon={<LocationOn sx={{ fontSize: '0.7rem' }} />}
                label="Hyderabad Only" 
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ '& .MuiChip-icon': { fontSize: '1rem' } }}
              />
            )}
          </Stack>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              size="small"
              startIcon={<Edit />}
              onClick={() => onEdit(product)}
              sx={{ flex: 1 }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color={product.hidden ? "success" : "warning"}
              startIcon={product.hidden ? <Visibility /> : <VisibilityOff />}
              onClick={() => onToggleHide(product.id)}
              sx={{ flex: 1 }}
            >
              {product.hidden ? 'Show' : 'Hide'}
            </Button>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(product)}
            >
              <Delete />
            </IconButton>
          </Box>
        </CardContent>
      </StyledProductCard>
    </Zoom>
  );
};

export default ProductCard;