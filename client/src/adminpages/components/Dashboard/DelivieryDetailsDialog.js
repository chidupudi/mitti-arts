import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Grid,
  Box,
  Typography,
} from '@mui/material';
import { LocalShipping } from '@mui/icons-material';

const DeliveryDetailsDialog = ({ open, onClose, orderId, onSave, initialData }) => {
  const [deliveryDetails, setDeliveryDetails] = useState({
    company: '',
    consignmentNumber: '',
    tentativeDate: '',
    remarks: ''
  });

  useEffect(() => {
    if (initialData) {
      setDeliveryDetails(initialData);
    } else {
      setDeliveryDetails({
        company: '',
        consignmentNumber: '',
        tentativeDate: '',
        remarks: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!deliveryDetails.company || !deliveryDetails.consignmentNumber) {
      alert('Please fill in required fields (Company and Consignment Number)');
      return;
    }
    onSave(orderId, deliveryDetails);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center">
          <LocalShipping sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            {initialData ? 'Update Delivery Details' : 'Add Delivery Details'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              required
              fullWidth
              label="Delivery Company"
              name="company"
              value={deliveryDetails.company}
              onChange={handleChange}
              variant="outlined"
            >
              {['DTDC', 'Blue Dart', 'Delhivery', 'FedEx', 'DHL', 'Amazon Logistics', 'Other'].map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Consignment Number"
              name="consignmentNumber"
              value={deliveryDetails.consignmentNumber}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Tentative Delivery Date"
              name="tentativeDate"
              value={deliveryDetails.tentativeDate}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Remarks"
              name="remarks"
              value={deliveryDetails.remarks}
              onChange={handleChange}
              variant="outlined"
              placeholder="Any special instructions or notes for delivery"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {initialData ? 'Update' : 'Save'} Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeliveryDetailsDialog;