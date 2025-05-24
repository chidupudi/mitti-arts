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
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  CloudUpload,
  Cancel as CancelIcon,
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
            />
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
            />
          </Grid>
        </Grid>

        {/* Image Upload Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhotoCamera />
            Product Images
          </Typography>
          <Grid container spacing={2}>
            {product.images?.slice(0, 4).map((url, index) => (
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
                          const newImages = [...(product.images || [])];
                          newImages[index] = '';
                          onChange('images', newImages);
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