import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart,
  AssignmentTurnedIn,
  CheckCircle,
  LocalShipping,
  InventoryRounded,
  ExpandMore,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';

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

const RecentOrders = ({
  filteredOrders,
  paymentStatuses,
  deliveredOrders,
  deliveryDetailsMap,
  expandedOrder,
  setExpandedOrder,
  dateFilter,
  setDateFilter,
  setSelectedOrderForDelivery,
  setDeliveryDialogOpen,
  handlePaymentToggle,
  handleMarkDelivered,
  processingOrder,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
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
            Manage and track customer orders
          </Typography>
        </Box>
        
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
      </Box>

      {filteredOrders.length === 0 ? (
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
        <Grid container spacing={2}>
          {filteredOrders.map(order => {
            const isDelivered = deliveredOrders[order.id];
            const isPaid = paymentStatuses[order.id];
            const hasDeliveryDetails = deliveryDetailsMap[order.id];
            const isExpanded = expandedOrder === order.id;

            return (
              <Grid item xs={12} lg={6} xl={4} key={order.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: `2px solid ${
                      isDelivered 
                        ? theme.palette.success.light
                        : isPaid 
                          ? theme.palette.primary.light
                          : theme.palette.warning.light
                    }`,
                    background: isDelivered 
                      ? 'linear-gradient(145deg, #E8F5E9 0%, #F1F8E9 100%)'
                      : isPaid 
                        ? 'linear-gradient(145deg, #FFF8E1 0%, #FFFDE7 100%)'
                        : 'linear-gradient(145deg, #FFF3E0 0%, #FFF8E1 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Order Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold"
                          color={
                            isDelivered 
                              ? 'success.main'
                              : isPaid 
                                ? 'primary.main' 
                                : 'warning.main'
                          }
                        >
                          #{order.id.slice(-8).toUpperCase()}
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
                      <Box display="flex" alignItems="center" gap={1}>
                        {isDelivered ? (
                          <Chip
                            label="Delivered"
                            color="success"
                            icon={<CheckCircle />}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        ) : (
                          <Chip
                            label={isPaid ? 'Paid' : 'Pending'}
                            color={isPaid ? 'primary' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                        <IconButton
                          size="small"
                          sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                        >
                          <ExpandMore />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Customer Info */}
                    <Box mb={2}>
                      <Typography variant="body1" fontWeight="600">
                        {order.orderDetails?.personalInfo?.fullName || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(order.orderDetails?.totalAmount || 0)}
                        {order.orderDetails?.items && (
                          <> • {order.orderDetails.items.length} item{order.orderDetails.items.length !== 1 ? 's' : ''}</>
                        )}
                      </Typography>
                    </Box>

                    {/* Payment Toggle */}
                    {!isDelivered && (
                      <Box mb={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isPaid}
                              onChange={(e) => {
                                e.stopPropagation();
                                handlePaymentToggle(order.id);
                              }}
                              color="success"
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight="600">
                              Payment {isPaid ? 'Completed' : 'Pending'}
                            </Typography>
                          }
                        />
                      </Box>
                    )}

                    {/* Delivery Section */}
                    {isPaid && !isDelivered && (
                      <Box mb={2}>
                        {hasDeliveryDetails ? (
                          <Box sx={{ 
                            p: 2, 
                            background: 'rgba(255,255,255,0.7)', 
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`
                          }}>
                            <Box display="flex" alignItems="center" mb={1}>
                              <LocalShipping sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                              <Typography variant="subtitle2" fontWeight="bold">
                                Delivery Details
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>{hasDeliveryDetails.company}</strong><br />
                              Tracking: {hasDeliveryDetails.consignmentNumber}
                            </Typography>
                            
                            <Box display="flex" gap={1}>
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderForDelivery(order.id);
                                  setDeliveryDialogOpen(true);
                                }}
                              >
                                Update
                              </Button>
                              <Button
                                size="small" 
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkDelivered(order.id);
                                }}
                                disabled={processingOrder === order.id}
                              >
                                {processingOrder === order.id ? 'Processing...' : 'Mark Delivered'}
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<LocalShipping />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderForDelivery(order.id);
                              setDeliveryDialogOpen(true);
                            }}
                            fullWidth
                          >
                            Add Delivery Details
                          </Button>
                        )}
                      </Box>
                    )}

                    {/* Delivered Status */}
                    {isDelivered && (
                      <Box sx={{ 
                        p: 2, 
                        background: 'rgba(46, 125, 50, 0.1)', 
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.success.light}`
                      }}>
                        <Box display="flex" alignItems="center">
                          <InventoryRounded sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            Delivered & Stock Updated
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {order.deliveredAt 
                            ? new Date(order.deliveredAt.seconds * 1000).toLocaleString('en-IN')
                            : 'Recently delivered'
                          }
                        </Typography>
                      </Box>
                    )}

                    {/* Expanded Details */}
                    <Collapse in={isExpanded} timeout={300}>
                      <Box mt={3}>
                        <Divider sx={{ mb: 2 }} />
                        
                        {/* Contact Information */}
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Contact Information
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center">
                              <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {order.orderDetails?.personalInfo?.phone || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center">
                              <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {order.orderDetails?.personalInfo?.email || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Delivery Address */}
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Delivery Address
                        </Typography>
                        <Box display="flex" alignItems="flex-start" mb={2}>
                          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary', mt: 0.5 }} />
                          <Typography variant="body2">
                            {order.orderDetails?.deliveryAddress?.addressLine1 || 'N/A'}<br />
                            {order.orderDetails?.deliveryAddress?.addressLine2 && (
                              <>{order.orderDetails.deliveryAddress.addressLine2}<br /></>
                            )}
                            {order.orderDetails?.deliveryAddress?.landmark && (
                              <>Landmark: {order.orderDetails.deliveryAddress.landmark}<br /></>
                            )}
                            {order.orderDetails?.deliveryAddress?.city}, {order.orderDetails?.deliveryAddress?.state}<br />
                            Pincode: {order.orderDetails?.deliveryAddress?.pincode}
                          </Typography>
                        </Box>

                        {/* Order Items */}
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Order Items
                        </Typography>
                        <List dense>
                          {order.orderDetails?.items?.map((item, index) => (
                            <ListItem key={index} sx={{ px: 0 }}>
                              <ListItemAvatar>
                                <Avatar 
                                  src={item.image || ''} 
                                  sx={{ width: 40, height: 40 }}
                                >
                                  {item.name?.[0]}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="body2" fontWeight="600">
                                    {item.name}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="body2" color="text.secondary">
                                    {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </ModernPaper>
  );
};

export default RecentOrders;