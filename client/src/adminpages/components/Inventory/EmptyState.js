import React from 'react';
import {
  Paper,
  Typography,
  Button,
} from '@mui/material';
import {
  Inventory2,
  Add,
} from '@mui/icons-material';

const EmptyState = ({ searchTerm, onAddProduct }) => {
  return (
    <Paper 
      sx={{ 
        p: 8, 
        textAlign: 'center', 
        borderRadius: 3,
        border: '2px dashed',
        borderColor: 'grey.300',
        bgcolor: 'grey.50',
      }}
    >
      <Inventory2 sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
      <Typography variant="h5" color="text.secondary" gutterBottom>
        {searchTerm ? 'No products found' : 'No products yet'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {searchTerm 
          ? `No products match "${searchTerm}". Try adjusting your search.`
          : 'Start building your inventory by adding your first product.'
        }
      </Typography>
      {!searchTerm && (
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={onAddProduct}
          sx={{ 
            background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
            },
          }}
        >
          Add Your First Product
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;