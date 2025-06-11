// Updated OrdersTable.js with enhanced status display and proper flow
import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Button,
  Box,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  KeyboardArrowRight,
  ShoppingCart,
  Payment,
  Schedule,
  Cancel,
  Warning,
  Info,
  CancelOutlined,
  HourglassEmpty,
  TrendingUp,
  Done,
} from '@mui/icons-material';
import { Checkbox, Space } from 'antd';

// Utility function to get order date
const getOrderDate = (order) => {
  try {
    if (!order.createdAt) return new Date();
    if (order.createdAt?.toDate) {
      return order.createdAt.toDate();
    }
    if (order.createdAt?.seconds) {
      return new Date(order.createdAt.seconds * 1000);
    }
    return new Date(order.createdAt);
  } catch (e) {
    console.error("Error parsing date:", e);
    return new Date();
  }
};

// Get check-in status independently
const getCheckInStatus = (order, checkInStatuses) => {
  if (checkInStatuses && checkInStatuses[order.id] !== undefined) {
    return checkInStatuses[order.id];
  }
  return order.adminCheckIn || false;
};

// Enhanced status chip with proper colors and icons for order flow
const getEnhancedStatusChip = (status, type = 'order') => {
  const getStatusConfig = () => {
    const statusUpper = status?.toUpperCase() || '';
    
    if (type === 'payment') {
      switch (statusUpper) {
        case 'COMPLETED':
        case 'SUCCESS':
        case 'PAID':
          return {
            label: 'Paid',
            color: '#2E7D32',
            backgroundColor: '#E8F5E8',
            borderColor: '#4CAF50',
            icon: <CheckCircle sx={{ fontSize: 16 }} />,
          };
        case 'PENDING':
        case 'INITIATED':
          return {
            label: 'Pending',
            color: '#ED6C02',
            backgroundColor: '#FFF3E0',
            borderColor: '#FF9800',
            icon: <Schedule sx={{ fontSize: 16 }} />,
          };
        case 'FAILED':
        case 'CANCELLED':
        case 'REFUNDED':
          return {
            label: statusUpper === 'REFUNDED' ? 'Refunded' : statusUpper === 'CANCELLED' ? 'Cancelled' : 'Failed',
            color: '#D32F2F',
            backgroundColor: '#FFEBEE',
            borderColor: '#F44336',
            icon: <Cancel sx={{ fontSize: 16 }} />,
          };
        default:
          return {
            label: status || 'Unknown',
            color: '#757575',
            backgroundColor: '#F5F5F5',
            borderColor: '#BDBDBD',
            icon: <Info sx={{ fontSize: 16 }} />,
          };
      }
    } else if (type === 'order') {
      switch (statusUpper) {
        case 'DELIVERED':
          return {
            label: 'Delivered',
            color: '#2E7D32',
            backgroundColor: '#E8F5E8',
            borderColor: '#4CAF50',
            icon: <Done sx={{ fontSize: 16 }} />,
          };
        case 'IN_TRANSIT':
          return {
            label: 'In Transit',
            color: '#1976D2',
            backgroundColor: '#E3F2FD',
            borderColor: '#2196F3',
            icon: <LocalShipping sx={{ fontSize: 16 }} />,
          };
        case 'CHECKED_IN':
          return {
            label: 'Checked In',
            color: '#7B1FA2',
            backgroundColor: '#F3E5F5',
            borderColor: '#9C27B0',
            icon: <TrendingUp sx={{ fontSize: 16 }} />,
          };
        case 'PROCESSING':
        case 'CONFIRMED':
          return {
            label: 'Processing',
            color: '#ED6C02',
            backgroundColor: '#FFF3E0',
            borderColor: '#FF9800',
            icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
          };
        case 'PENDING':
        case 'AWAITING_PAYMENT':
          return {
            label: 'Pending',
            color: '#795548',
            backgroundColor: '#EFEBE9',
            borderColor: '#8D6E63',
            icon: <Schedule sx={{ fontSize: 16 }} />,
          };
        case 'CANCELLED':
        case 'REFUNDED':
          return {
            label: statusUpper === 'REFUNDED' ? 'Refunded' : 'Cancelled',
            color: '#D32F2F',
            backgroundColor: '#FFEBEE',
            borderColor: '#F44336',
            icon: <Cancel sx={{ fontSize: 16 }} />,
          };
        default:
          return {
            label: status || 'Unknown',
            color: '#757575',
            backgroundColor: '#F5F5F5',
            borderColor: '#BDBDBD',
            icon: <Info sx={{ fontSize: 16 }} />,
          };
      }
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      sx={{
        color: config.color,
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
        fontWeight: 500,
        '& .MuiChip-icon': {
          color: config.color
        }
      }}
    />
  );
};

// Order Status Progress Component
const OrderStatusProgress = ({ status, isCheckedIn }) => {
  const getStatusLevel = () => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
      case 'PROCESSING':
      case 'CONFIRMED':
        return isCheckedIn ? 2 : 1;
      case 'CHECKED_IN':
        return 2;
      case 'IN_TRANSIT':
        return 3;
      case 'DELIVERED':
        return 4;
      case 'CANCELLED':
        return 0;
      default:
        return 1;
    }
  };

  const level = getStatusLevel();
  const steps = ['Processing', 'Checked In', 'In Transit', 'Delivered'];
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {steps.map((step, index) => (
        <Box
          key={step}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: index < level ? '#4CAF50' : '#E0E0E0',
            transition: 'background-color 0.3s ease'
          }}
        />
      ))}
      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
        {level > 0 ? `${level}/4` : 'Cancelled'}
      </Typography>
    </Box>
  );
};

// Amount display with color coding
const AmountDisplay = ({ amount }) => {
  const getAmountStyle = () => {
    if (amount >= 10000) {
      return {
        color: '#2E7D32', // High value - Green
        fontWeight: 600
      };
    } else if (amount >= 5000) {
      return {
        color: '#1976D2', // Medium-high value - Blue
        fontWeight: 500
      };
    } else if (amount >= 1000) {
      return {
        color: '#ED6C02', // Medium value - Orange
        fontWeight: 500
      };
    } else {
      return {
        color: '#757575', // Low value - Grey
        fontWeight: 400
      };
    }
  };

  const style = getAmountStyle();

  return (
    <Typography 
      variant="body2" 
      sx={{
        color: style.color,
        fontWeight: style.fontWeight
      }}
    >
      ₹{amount?.toFixed(2) || '0.00'}
    </Typography>
  );
};

const OrdersTable = ({
  filteredOrders,
  page,
  rowsPerPage,
  deliveryDetailsMap,
  checkInStatuses,
  handleCheckInToggle,
  handleMarkDelivered,
  handleViewOrderDetails,
  setSelectedOrderForDelivery,
  setDeliveryDialogOpen,
  handleChangePage,
  handleChangeRowsPerPage,
  handleCancelOrderClick,
  error,
}) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2, borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3, border: '2px dashed', borderColor: 'grey.300' }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No orders found matching the current filters
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Try adjusting your search criteria or filters to find orders.
        </Typography>
      </Paper>
    );
  }

  // Function to determine if actions should be disabled based on status
  const getActionState = (order) => {
    const isCancelled = order.status === 'CANCELLED' || order.paymentStatus === 'CANCELLED';
    const isDelivered = order.status === 'DELIVERED';
    const isCheckedIn = getCheckInStatus(order, checkInStatuses);
    const hasDeliveryDetails = !!order.deliveryDetails;
    const isInTransit = order.status === 'IN_TRANSIT';

    return {
      isCancelled,
      isDelivered,
      isCheckedIn,
      hasDeliveryDetails,
      isInTransit,
      canCheckIn: !isCancelled && !isDelivered,
      canAddDelivery: isCheckedIn && !isCancelled && !isDelivered,
      canMarkDelivered: isInTransit && !isCancelled && !isDelivered,
      canCancel: !isCancelled && !isDelivered
    };
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
      <TableContainer>
        <Table stickyHeader aria-label="orders table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Amount</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Payment Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Order Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Progress</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Delivery</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => {
                const actionState = getActionState(order);
                
                return (
                  <TableRow 
                    key={order.id}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      opacity: actionState.isCancelled ? 0.7 : 1,
                      '&:hover': { backgroundColor: 'rgba(210, 105, 30, 0.04)' }
                    }}
                    onClick={() => handleViewOrderDetails(order)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {order.orderNumber}
                      </Typography>
                      {actionState.isCancelled && (
                        <Chip 
                          label="CANCELLED" 
                          size="small" 
                          color="error" 
                          sx={{ mt: 0.5, fontSize: '0.7rem' }}
                        />
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {getOrderDate(order).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getOrderDate(order).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {order.orderDetails?.personalInfo?.fullName || order.customerName || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.orderDetails?.personalInfo?.phone || order.customerPhone || 'N/A'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <AmountDisplay amount={order.orderDetails?.totalAmount} />
                    </TableCell>
                    
                    <TableCell align="center">
                      {getEnhancedStatusChip(order.paymentStatus || 'PENDING', 'payment')}
                    </TableCell>
                    
                    <TableCell align="center">
                      {getEnhancedStatusChip(order.status || 'PENDING', 'order')}
                    </TableCell>
                    
                    <TableCell align="center">
                      <OrderStatusProgress 
                        status={order.status} 
                        isCheckedIn={actionState.isCheckedIn}
                      />
                    </TableCell>
                    
                    <TableCell align="center">
                      {actionState.isCancelled ? (
                        <Chip 
                          label="Cancelled" 
                          icon={<Cancel />}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      ) : order.deliveryDetails ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title={`${order.deliveryDetails.company} - ${order.deliveryDetails.consignmentNumber}`}>
                              <Chip 
                                icon={<LocalShipping />} 
                                label="Set" 
                                size="small"
                                sx={{
                                  color: '#1976D2',
                                  backgroundColor: '#E3F2FD',
                                  border: '1px solid #2196F3',
                                  '& .MuiChip-icon': {
                                    color: '#1976D2'
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderForDelivery(order.id);
                                  setDeliveryDialogOpen(true);
                                }} 
                              />
                            </Tooltip>
                            
                            {actionState.canMarkDelivered && (
                              <Tooltip title="Mark as Delivered">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: '#2E7D32',
                                    '&:hover': {
                                      backgroundColor: 'rgba(46, 125, 50, 0.08)'
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkDelivered(order.id);
                                  }}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {actionState.isDelivered && (
                              <Chip 
                                label="Delivered" 
                                icon={<CheckCircle />}
                                size="small"
                                sx={{
                                  color: '#2E7D32',
                                  backgroundColor: '#E8F5E8',
                                  border: '1px solid #4CAF50',
                                  '& .MuiChip-icon': {
                                    color: '#2E7D32'
                                  }
                                }}
                              />
                            )}
                          </Box>
                          
                          {order.deliveryStatus && (
                            getEnhancedStatusChip(order.deliveryStatus, 'order')
                          )}
                        </Box>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<LocalShipping />}
                          disabled={!actionState.canAddDelivery}
                          sx={{
                            borderColor: actionState.canAddDelivery ? '#CD5C5C' : '#ccc',
                            color: actionState.canAddDelivery ? '#CD5C5C' : '#999',
                            '&:hover': {
                              borderColor: actionState.canAddDelivery ? '#B84A4A' : '#ccc',
                              backgroundColor: actionState.canAddDelivery ? 'rgba(205, 92, 92, 0.04)' : 'transparent'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (actionState.canAddDelivery) {
                              setSelectedOrderForDelivery(order.id);
                              setDeliveryDialogOpen(true);
                            }
                          }}
                        >
                          {actionState.canAddDelivery ? 'Set Details' : 'Check In First'}
                        </Button>
                      )}
                    </TableCell>
                    
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                        {!actionState.isCancelled && (
                          <>
                            {/* Check In Checkbox */}
                            <Space>
                              <Checkbox
                                checked={actionState.isCheckedIn}
                                disabled={!actionState.canCheckIn}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (actionState.canCheckIn) {
                                    handleCheckInToggle(order.id);
                                  }
                                }}
                                style={{
                                  color: actionState.isCheckedIn ? '#2E7D32' : '#757575',
                                }}
                              >
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: actionState.isCheckedIn ? '#2E7D32' : '#757575',
                                    fontWeight: actionState.isCheckedIn ? 600 : 400,
                                    ml: 0.5
                                  }}
                                >
                                  Check In
                                </Typography>
                              </Checkbox>
                            </Space>
                            
                            {/* Cancel Order Button */}
                            {actionState.canCancel && (
                              <Tooltip title="Cancel Order">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelOrderClick(order);
                                  }}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: 'rgba(211, 47, 47, 0.08)'
                                    }
                                  }}
                                >
                                  <CancelOutlined />
                                </IconButton>
                              </Tooltip>
                            )}
                          </>
                        )}
                        
                        <IconButton 
                          sx={{
                            color: '#CD5C5C',
                            '&:hover': {
                              backgroundColor: 'rgba(205, 92, 92, 0.08)'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrderDetails(order);
                          }}
                          size="small"
                        >
                          <KeyboardArrowRight />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredOrders.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        sx={{
          '& .MuiTablePagination-toolbar': {
            backgroundColor: '#F8F9FA'
          }
        }}
      />
    </Paper>
  );
};

export default OrdersTable;