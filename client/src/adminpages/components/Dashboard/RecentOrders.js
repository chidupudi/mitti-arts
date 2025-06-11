import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
} from '@mui/material';
import {
  ShoppingCart,
  AssignmentTurnedIn,
  CheckCircle,
  LocalShipping,
  InventoryRounded,
  Phone,
  Email,
  LocationOn,
  Person,
  Payment,
  Schedule,
  Cancel,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker, Space, Checkbox } from 'antd'; // Using Antd components
import { CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import OrderDetailsDialog from '../../components/AdminOrders/OrderDetailsDialog'; // Import the existing component

const ModernPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  background: 'linear-gradient(145deg, #FFFFFF 0%, #FEFEFE 100%)',
  border: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(10px)',
}));

// Utility functions
const getOrderDate = (order) => {
  try {
    if (order.createdAt?.toDate) {
      return order.createdAt.toDate();
    }
    if (order.createdAt?.seconds) {
      return new Date(order.createdAt.seconds * 1000);
    }
    return new Date(order.createdAt || new Date());
  } catch (e) {
    return new Date();
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// FIXED: Get check-in status independently (not from payment status)
const getCheckInStatus = (order, checkInStatuses) => {
  // Check if admin manually set the check-in status
  if (checkInStatuses && checkInStatuses[order.id] !== undefined) {
    return checkInStatuses[order.id];
  }
  // Otherwise check the order's adminCheckIn field
  return order.adminCheckIn || false;
};

// Enhanced status chip with proper colors and icons
const getEnhancedStatusChip = (status, type = 'payment') => {
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
            chipColor: 'success'
          };
        case 'PENDING':
        case 'INITIATED':
          return {
            label: 'Pending',
            color: '#ED6C02',
            backgroundColor: '#FFF3E0',
            borderColor: '#FF9800',
            icon: <Schedule sx={{ fontSize: 16 }} />,
            chipColor: 'warning'
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
            chipColor: 'error'
          };
        default:
          return {
            label: status || 'Unknown',
            color: '#757575',
            backgroundColor: '#F5F5F5',
            borderColor: '#BDBDBD',
            icon: <Payment sx={{ fontSize: 16 }} />,
            chipColor: 'default'
          };
      }
    } else if (type === 'delivery') {
      switch (statusUpper) {
        case 'DELIVERED':
          return {
            label: 'Delivered',
            color: '#2E7D32',
            backgroundColor: '#E8F5E8',
            borderColor: '#4CAF50',
            icon: <CheckCircle sx={{ fontSize: 16 }} />,
            chipColor: 'success'
          };
        case 'DISPATCHED':
        case 'SHIPPED':
        case 'IN_TRANSIT':
          return {
            label: 'In Transit',
            color: '#1976D2',
            backgroundColor: '#E3F2FD',
            borderColor: '#2196F3',
            icon: <LocalShipping sx={{ fontSize: 16 }} />,
            chipColor: 'info'
          };
        default:
          return {
            label: 'Pending',
            color: '#9C27B0',
            backgroundColor: '#F3E5F5',
            borderColor: '#BA68C8',
            icon: <Schedule sx={{ fontSize: 16 }} />,
            chipColor: 'secondary'
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

const OrderCard = ({ 
  order, 
  checkInStatuses, // FIXED: Now using independent check-in statuses
  deliveredOrders,
  deliveryDetailsMap,
  handleCheckInToggle, // FIXED: Now independent toggle function
  onCardClick
}) => {
  const theme = useTheme();
  const isDelivered = deliveredOrders[order.id];
  const isCheckedIn = getCheckInStatus(order, checkInStatuses); // FIXED: Independent check-in status
  const hasDeliveryDetails = deliveryDetailsMap[order.id];
  const isFailed = order.paymentStatus === 'FAILED' || order.paymentStatus === 'CANCELLED';

  // Determine card color based on payment status
  let cardBorderColor = theme.palette.warning.light;
  let cardBackground = 'linear-gradient(145deg, #FFF3E0 0%, #FFF8E1 100%)';
  
  if (isDelivered) {
    cardBorderColor = theme.palette.success.light;
    cardBackground = 'linear-gradient(145deg, #E8F5E9 0%, #F1F8E9 100%)';
  } else if (isCheckedIn) {
    cardBorderColor = theme.palette.primary.light;
    cardBackground = 'linear-gradient(145deg, #E3F2FD 0%, #E8F5E9 100%)';
  } else if (isFailed) {
    cardBorderColor = theme.palette.error.light;
    cardBackground = 'linear-gradient(145deg, #FFEBEE 0%, #FCE4EC 100%)';
  }

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `2px solid ${cardBorderColor}`,
        background: cardBackground,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
      onClick={() => onCardClick(order)}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Order Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography 
              variant="h6" 
              fontWeight="bold"
              color={
                isDelivered 
                  ? 'success.main'
                  : isCheckedIn 
                    ? 'primary.main' 
                    : isFailed
                      ? 'error.main'
                      : 'warning.main'
              }
            >
              #{order.orderNumber || order.id.slice(-8).toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getOrderDate(order).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
          
          {/* Status Chips */}
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
            {getEnhancedStatusChip(order.paymentStatus || 'PENDING', 'payment')}
            {order.deliveryStatus && (
              getEnhancedStatusChip(order.deliveryStatus, 'delivery')
            )}
          </Box>
        </Box>

        {/* Customer Info */}
        <Box mb={2} sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body1" fontWeight="600">
              {order.orderDetails?.personalInfo?.fullName || order.customerName || 'N/A'}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" mb={1}>
            <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {order.orderDetails?.personalInfo?.phone || order.customerPhone || 'N/A'}
            </Typography>
          </Box>
          
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            {formatCurrency(order.orderDetails?.totalAmount || 0)}
            {order.orderDetails?.items && (
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                • {order.orderDetails.items.length} item{order.orderDetails.items.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Typography>
        </Box>

        {/* Bottom Section */}
        <Box>
          {/* Delivery Information */}
          {hasDeliveryDetails && (
            <Box sx={{ 
              p: 1.5, 
              background: 'rgba(255,255,255,0.7)', 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              mb: 2
            }}>
              <Box display="flex" alignItems="center" mb={0.5}>
                <LocalShipping sx={{ color: 'primary.main', mr: 1, fontSize: 16 }} />
                <Typography variant="caption" fontWeight="bold">
                  {hasDeliveryDetails.company} - {hasDeliveryDetails.consignmentNumber}
                </Typography>
              </Box>
              {order.deliveryStatus === 'DELIVERED' && (
                <Typography variant="caption" color="success.main" fontWeight="bold">
                  ✅ Delivered
                </Typography>
              )}
            </Box>
          )}

          {/* Check In Status - Only show if not delivered and not failed */}
          {!isDelivered && !isFailed && (
            <Box display="flex" justifyContent="center">
              <Checkbox
                checked={isCheckedIn}
                onChange={(e) => {
                  e.stopPropagation();
                  handleCheckInToggle(order.id); // FIXED: Independent toggle
                }}
                style={{
                  color: isCheckedIn ? '#4caf50' : '#ff9800',
                }}
              >
                <Typography 
                  variant="body2" 
                  fontWeight="600"
                  sx={{ 
                    color: isCheckedIn ? 'success.main' : 'warning.main',
                    ml: 1
                  }}
                >
                  {isCheckedIn ? 'Checked In' : 'Check In'}
                </Typography>
              </Checkbox>
            </Box>
          )}

          {/* Delivered Status */}
          {isDelivered && (
            <Box sx={{ 
              p: 1.5, 
              background: 'rgba(46, 125, 50, 0.1)', 
              borderRadius: 2,
              border: `1px solid ${theme.palette.success.light}`,
              textAlign: 'center'
            }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <InventoryRounded sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  Delivered & Complete
                </Typography>
              </Box>
            </Box>
          )}

          {/* Failed Payment Status */}
          {isFailed && (
            <Box sx={{ 
              p: 1.5, 
              background: 'rgba(244, 67, 54, 0.1)', 
              borderRadius: 2,
              border: `1px solid ${theme.palette.error.light}`,
              textAlign: 'center'
            }}>
              <Typography variant="body2" fontWeight="bold" color="error.main">
                ❌ Payment Failed/Cancelled
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const RecentOrders = ({
  filteredOrders,
  checkInStatuses, // FIXED: Now using independent check-in statuses
  deliveredOrders,
  deliveryDetailsMap,
  dateFilter,
  setDateFilter,
  handleCheckInToggle, // FIXED: Now independent toggle function
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for order details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);

  // Handle card click to open order details
  const handleCardClick = (order) => {
    setSelectedOrderForDetails(order);
    setDetailsDialogOpen(true);
  };

  // Determine number of cards to show based on screen size
  const getCardsToShow = () => {
    if (isMobile) return 6; // 2 per row × 3 rows = 6 cards on mobile
    return 12; // 4 per row × 3 rows = 12 cards on desktop
  };

  const cardsToShow = getCardsToShow();
  const displayOrders = filteredOrders.slice(0, cardsToShow);

  return (
    <>
      <ModernPaper sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: 2,
          mb: 3 
        }}>
          <ShoppingCart sx={{ color: 'success.main', fontSize: 28 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              Recent Orders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track customer orders • Click any card for details • Showing latest {cardsToShow} orders
            </Typography>
          </Box>
          
          {/* Date Filter */}
          <Space>
            <DatePicker
              value={dateFilter ? moment(dateFilter) : null}
              onChange={(date) => setDateFilter(date ? date.toDate() : null)}
              suffixIcon={<CalendarOutlined style={{ color: theme.palette.primary.main }} />}
              style={{ 
                width: isMobile ? '100%' : 200,
                borderRadius: 8
              }}
              allowClear
              format="DD/MM/YYYY"
              placeholder="Filter by date"
            />
          </Space>
        </Box>

        {displayOrders.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              color: 'text.secondary'
            }}
          >
            <AssignmentTurnedIn sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6">
              {dateFilter ? 'No orders found for selected date' : 'No recent orders'}
            </Typography>
            <Typography variant="body2">
              Orders will appear here once customers start placing them
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {displayOrders.map(order => (
              <Grid 
                item 
                xs={6}  // 2 cards per row on mobile
                sm={6}  // 2 cards per row on small tablets
                md={4}  // 3 cards per row on medium tablets
                lg={3}  // 4 cards per row on large screens
                xl={3}  // 4 cards per row on extra large screens
                key={order.id}
              >
                <OrderCard 
                  order={order}
                  checkInStatuses={checkInStatuses} // FIXED: Pass independent check-in statuses
                  deliveredOrders={deliveredOrders}
                  deliveryDetailsMap={deliveryDetailsMap}
                  handleCheckInToggle={handleCheckInToggle} // FIXED: Pass independent toggle function
                  onCardClick={handleCardClick}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Show more orders link if there are more than displayed */}
        {filteredOrders.length > cardsToShow && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {cardsToShow} of {filteredOrders.length} orders
            </Typography>
          </Box>
        )}
      </ModernPaper>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        order={selectedOrderForDetails}
        searchQuery="" // No search query needed for dashboard
      />
    </>
  );
};

export default RecentOrders;