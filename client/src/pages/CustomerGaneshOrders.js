// client/src/pages/CustomerGaneshOrders.js - Customer view for Ganesh orders
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Payment,
  Schedule,
  CheckCircle,
  LocalShipping,
  Phone,
  WhatsApp,
  Email,
  Receipt,
  ExpandMore,
  Info,
  Refresh,
  CelebrationOutlined,
  MonetizationOn,
  Build,
  DeliveryDining
} from '@mui/icons-material';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../Firebase/Firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSeason } from '../hooks/useSeason';
import { useNavigate } from 'react-router-dom';

const CustomerGaneshOrders = () => {
  const [user] = useAuthState(auth);
  const { isGaneshSeason } = useSeason();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user's Ganesh leads and orders
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch leads
        const leadsQuery = query(
          collection(db, 'ganeshLeads'),
          where('customerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const leadsSnapshot = await getDocs(leadsQuery);
        const leadsData = leadsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLeads(leadsData);

        // Fetch orders
        const ordersQuery = query(
          collection(db, 'ganeshOrders'),
          where('customerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Re-fetch data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'info';
      case 'contacted': return 'warning';
      case 'converted': return 'success';
      case 'lost': return 'error';
      case 'pending_advance': return 'warning';
      case 'advance_paid': return 'info';
      case 'in_production': return 'primary';
      case 'ready_for_delivery': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'Inquiry Submitted';
      case 'contacted': return 'Team Contacted You';
      case 'converted': return 'Order Confirmed';
      case 'lost': return 'Inquiry Closed';
      case 'pending_advance': return 'Advance Payment Pending';
      case 'advance_paid': return 'Advance Paid';
      case 'in_production': return 'In Production';
      case 'ready_for_delivery': return 'Ready for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getOrderProgress = (status) => {
    const progressMap = {
      'pending_advance': 25,
      'advance_paid': 50,
      'in_production': 75,
      'ready_for_delivery': 90,
      'delivered': 100,
      'cancelled': 0
    };
    return progressMap[status] || 0;
  };

  const OrderCard = ({ order }) => (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={order.idolDetails?.image}
                sx={{ width: 60, height: 60 }}
              >
                🕉️
              </Avatar>
              <Box>
                <Typography variant="h6" noWrap>
                  {order.idolDetails?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Order #{order.id.slice(-8).toUpperCase()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="body2" color="text.secondary">Final Price</Typography>
            <Typography variant="h6" color="primary">
              ₹{order.finalPrice?.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Advance: ₹{order.advanceAmount?.toLocaleString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Chip 
              label={getStatusText(order.status)}
              color={getStatusColor(order.status)}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="body2" color="text.secondary">Payment</Typography>
            <Chip 
              label={order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setSelectedOrder(order);
                  setDetailsOpen(true);
                }}
                startIcon={<Info />}
              >
                Details
              </Button>
              
              {order.paymentStatus === 'pending' && order.status === 'pending_advance' && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<Payment />}
                  onClick={() => navigate(`/phonepe?orderId=${order.id}&type=ganesh-advance`)}
                >
                  Pay Advance
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Order Progress
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getOrderProgress(order.status)}%
            </Typography>
          </Box>
          <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
            <Box
              sx={{
                width: `${getOrderProgress(order.status)}%`,
                bgcolor: order.status === 'cancelled' ? 'error.main' : 'primary.main',
                height: '100%',
                borderRadius: 1,
                transition: 'width 0.3s ease'
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const LeadCard = ({ lead }) => (
    <Card sx={{ mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'orange.main' }}>🕉️</Avatar>
              <Box>
                <Typography variant="h6" noWrap>
                  {lead.idolDetails?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inquiry #{lead.id.slice(-8).toUpperCase()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="body2" color="text.secondary">Price Range</Typography>
            <Typography variant="body1">
              ₹{lead.idolDetails?.priceMin?.toLocaleString()} - ₹{lead.idolDetails?.priceMax?.toLocaleString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Chip 
              label={getStatusText(lead.status)}
              color={getStatusColor(lead.status)}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="body2" color="text.secondary">Submitted</Typography>
            <Typography variant="caption">
              {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Box display="flex" gap={1}>
              <Tooltip title="Call Us">
                <IconButton size="small" color="primary" href="tel:+919876543210">
                  <Phone />
                </IconButton>
              </Tooltip>
              <Tooltip title="WhatsApp">
                <IconButton size="small" color="success" href="https://wa.me/919876543210" target="_blank">
                  <WhatsApp />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {lead.requirements && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Requirements:</Typography>
            <Typography variant="body2">{lead.requirements}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom>
            Please Login
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You need to login to view your Ganesh orders and inquiries.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Login Now
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!isGaneshSeason) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <CelebrationOutlined sx={{ fontSize: 64, color: '#FF8F00', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="primary">
            Ganesh Season Not Active
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Ganesh orders are only available during Ganesh season.
          </Typography>
          <Button variant="contained" href="/orders">
            View Regular Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
          color: 'white',
          p: 3,
          borderRadius: 2,
          mb: 3
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              🕉️ My Ganesh Orders
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Track your Ganesh idol inquiries and orders
            </Typography>
          </Box>
          <IconButton 
            color="inherit" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Box>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" color="primary">{leads.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Inquiries</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" color="success.main">{orders.length}</Typography>
            <Typography variant="body2" color="text.secondary">Active Orders</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" color="warning.main">
              {orders.filter(o => o.paymentStatus === 'pending').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Pending Payments</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" color="info.main">
              {orders.filter(o => o.status === 'delivered').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Completed</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Section */}
      {orders.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MonetizationOn color="success" />
            Active Orders ({orders.length})
          </Typography>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Paper>
      )}

      {/* Leads Section */}
      {leads.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="info" />
            Inquiries & Leads ({leads.length})
          </Typography>
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </Paper>
      )}

      {/* Empty State */}
      {orders.length === 0 && leads.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <CelebrationOutlined sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No Ganesh Orders Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Browse our Ganesh idol collection and submit your first inquiry!
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/ganesh-idols')}
            sx={{ background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)' }}
          >
            Browse Ganesh Idols
          </Button>
        </Paper>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Order Details - {selectedOrder.idolDetails?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  #{selectedOrder.id.slice(-8).toUpperCase()}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* Detailed order information */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Order Information
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Final Price</TableCell>
                          <TableCell>₹{selectedOrder.finalPrice?.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Advance Amount</TableCell>
                          <TableCell>₹{selectedOrder.advanceAmount?.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Remaining Amount</TableCell>
                          <TableCell>₹{selectedOrder.remainingAmount?.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Payment Status</TableCell>
                          <TableCell>
                            <Chip 
                              label={selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                              color={selectedOrder.paymentStatus === 'paid' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Order Status</TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusText(selectedOrder.status)}
                              color={getStatusColor(selectedOrder.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Idol Details
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>{selectedOrder.idolDetails?.name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell>{selectedOrder.idolDetails?.category}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Height</TableCell>
                          <TableCell>{selectedOrder.idolDetails?.height || 'Custom'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Material</TableCell>
                          <TableCell>{selectedOrder.idolDetails?.material || 'Eco-friendly Clay'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>

              {selectedOrder.notes && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>Order Notes:</Typography>
                  <Typography variant="body2">{selectedOrder.notes}</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              {selectedOrder.paymentStatus === 'pending' && (
                <Button
                  variant="contained"
                  startIcon={<Payment />}
                  onClick={() => {
                    setDetailsOpen(false);
                    navigate(`/phonepe?orderId=${selectedOrder.id}&type=ganesh-advance`);
                  }}
                >
                  Pay Advance
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default CustomerGaneshOrders;