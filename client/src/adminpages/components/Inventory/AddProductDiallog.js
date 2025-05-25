import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Grid,
  Box,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add,
  Save,
  Cancel,
  PhotoCamera,
  CloudUpload,
  Cancel as CancelIcon,
  LocationOn,
  ColorLens,
  Straighten,
  Scale,
} from '@mui/icons-material';

const AddProductDialog = ({
  open,
  onClose,
  product,
  setProduct,
  onSave,
  onImageUpload,
}) => {
  // Function to handle form field changes
  const handleChange = (field, value) => {
    setProduct({ ...product, [field]: value });
  };

  return (
    <Dialog 
      open={open}
      onClose={onClose}
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
        <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Add />
          Add New Product
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Product Name"
              fullWidth
              margin="normal"
              required
              value={product.name}
              onChange={e => handleChange('name', e.target.value)}
              error={!product.name}
              helperText={!product.name ? "Product name is required" : ""}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Product Code"
              fullWidth
              margin="normal"
              value={product.code}
              onChange={e => handleChange('code', e.target.value)}
              placeholder="SKU or product code"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={product.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Detailed product description..."
            />
          </Grid>

          {/* Pricing and Inventory */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
              Pricing & Inventory
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Price"
              fullWidth
              margin="normal"
              type="number"
              required
              value={product.price}
              onChange={e => handleChange('price', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              error={!product.price}
              helperText={!product.price ? "Price is required" : ""}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Stock Quantity"
              fullWidth
              margin="normal"
              type="number"
              value={product.stock}
              onChange={e => handleChange('stock', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Category"
              fullWidth
              margin="normal"
              value={product.category}
              onChange={e => handleChange('category', e.target.value)}
              placeholder="Product category"
            />
          </Grid>

          {/* Product Specifications */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
              Product Specifications
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Color"
              fullWidth
              margin="normal"
              value={product.color || ''}
              onChange={e => handleChange('color', e.target.value)}
              placeholder="e.g., Natural Terracotta"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ColorLens fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Dimensions"
              fullWidth
              margin="normal"
              value={product.dimensions || ''}
              onChange={e => handleChange('dimensions', e.target.value)}
              placeholder="e.g., 10\ x 10\ x 1.5\"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Straighten fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Weight"
              fullWidth
              margin="normal"
              value={product.weight || ''}
              onChange={e => handleChange('weight', e.target.value)}
              placeholder="e.g., 0.8 kg"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Scale fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {/* Hyderabad-only delivery option */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
              Delivery Options
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'rgba(210, 105, 30, 0.08)',
              border: '1px dashed',
              borderColor: 'primary.main'
            }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={product.hyderabadOnly || false}
                    onChange={(e) => handleChange('hyderabadOnly', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1" fontWeight="medium">Hyderabad Only Delivery</Typography>
                  </Box>
                }
              />
              <Tooltip title="This product will be available for delivery only within Hyderabad city limits">
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  Restrict this product to be delivered only within Hyderabad
                </Typography>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Image Upload Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhotoCamera />
            Product Images (Upload up to 8 images)
          </Typography>
          <Grid container spacing={2}>
            {product.images.slice(0, 8).map((url, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Paper
                  sx={{
                    width: '100%',
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50',
                    },
                  }}
                >
                  {url === 'loading' ? (
                    <CircularProgress size={24} />
                  ) : url ? (
                    <>
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                      <IconButton
                        sx={{ 
                          position: 'absolute', 
                          top: 4, 
                          right: 4, 
                          bgcolor: 'white',
                          boxShadow: 1,
                        }}
                        size="small"
                        onClick={() => {
                          const newImages = [...product.images];
                          newImages[index] = '';
                          handleChange('images', newImages);
                        }}
                      >
                        <CancelIcon color="error" />
                      </IconButton>
                    </>
                  ) : (
                    <label style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => onImageUpload(e, index, false)}
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                      }}>
                        <CloudUpload sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Upload Image
                        </Typography>
                      </Box>
                    </label>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          startIcon={<Cancel />}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={onSave}
          variant="contained" 
          startIcon={<Save />}
          sx={{ 
            background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
            },
          }}
        >
          Add Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog;