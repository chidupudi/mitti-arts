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
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  MoreVert,
  Image as ImageIcon,
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

          {/* Product Code */}
          {product.code && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Code: {product.code}
            </Typography>
          )}

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