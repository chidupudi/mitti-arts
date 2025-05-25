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
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  CloudUpload,
  Cancel as CancelIcon,
  LocationOn,
  ColorLens,
  Straighten,
  Scale,
  DeleteForever,
  AddPhotoAlternate,
} from '@mui/icons-material';

const EditProductDialog = ({
  open,
  onClose,
  product,
  onChange,
  onSave,
  onImageUpload,
}) => {
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

  return (
    <Dialog 
      open={open}
      onClose={onClose}
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', p: 3 }}>
        <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit />
          Edit Product
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
              value={product.name || ''}
              onChange={e => onChange('name', e.target.value)}
              error={!product.name}
              helperText={!product.name ? "Product name is required" : ""}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Product Code"
              fullWidth
              margin="normal"
              value={product.code || ''}
              onChange={e => onChange('code', e.target.value)}
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
              value={product.description || ''}
              onChange={e => onChange('description', e.target.value)}
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
              value={product.price || ''}
              onChange={e => onChange('price', e.target.value)}
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
              value={product.stock || 0}
              onChange={e => onChange('stock', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Category"
              fullWidth
              margin="normal"
              value={product.category || ''}
              onChange={e => onChange('category', e.target.value)}
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
              onChange={e => onChange('color', e.target.value)}
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
              onChange={e => onChange('dimensions', e.target.value)}
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
              onChange={e => onChange('weight', e.target.value)}
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
                    onChange={(e) => onChange('hyderabadOnly', e.target.checked)}
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhotoCamera />
              Product Images ({(product.images || []).filter(img => img && img !== 'loading').length}/8)
            </Typography>
            
            {/* Add Image Button */}
            {(product.images || []).length < 8 && (
              <Button 
                variant="outlined" 
                startIcon={<AddPhotoAlternate />}
                onClick={handleAddImageSlot}
                size="small"
              >
                Add Image Slot
              </Button>
            )}
          </Box>
          
          <Grid container spacing={2}>
            {(product.images || []).map((url, index) => (
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
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 4, 
                          right: 4, 
                          display: 'flex',
                          gap: 0.5
                        }}
                      >
                        {/* Delete Image Button */}
                        <IconButton
                          sx={{ 
                            bgcolor: 'white',
                            boxShadow: 1,
                          }}
                          size="small"
                          onClick={() => handleDeleteImage(index)}
                          color="error"
                        >
                          <DeleteForever />
                        </IconButton>
                      </Box>
                    </>
                  ) : (
                    <label style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => onImageUpload(e, index, true)}
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
          
          {/* Image management instructions */}
          {(product.images || []).length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                • Click on empty slots to upload new images
                <br />
                • Use the delete button (trash icon) to remove images
                <br />
                • Images are automatically saved when you upload them
              </Typography>
            </Box>
          )}
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
            background: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #654321 0%, #8B4513 100%)',
            },
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductDialog;