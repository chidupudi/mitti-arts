import React from 'react';
import { Box, Container } from '@mui/material';
import StatsCards from './components/Dashboard/ChartsSection';
import ChartsSection from './components/Dashboard/ChartsSection';
import RecentOrders from './components/Dashboard/RecentOrders';
import DeliveryDetailsDialog from './components/Dashboard/DelivieryDetailsDialog';
import NotificationSnackbar from './components/NotificationSnackbar';
import LoadingScreen from './components/LoadingScreen';
import { useDashboardData } from '../hooks/useDashboardData';
import { useOrderManagement } from '../hooks/useOrderManagement';

const Dashboard = () => {
  // Custom hooks for data management
  const { 
    loading, 
    stats, 
    userMap, 
    productMap, 
    deliveryDetailsMap,
    deliveredOrders 
  } = useDashboardData();

  const {
    paymentStatuses,
    expandedOrder,
    setExpandedOrder,
    dateFilter,
    setDateFilter,
    deliveryDialogOpen,
    setDeliveryDialogOpen,
    selectedOrderForDelivery,
    setSelectedOrderForDelivery,
    processingOrder,
    snackbar,
    handlePaymentToggle,
    handleSaveDeliveryDetails,
    handleMarkDelivered,
    handleCloseSnackbar,
  } = useOrderManagement();

  const filteredOrders = stats.recentOrders.filter(order => {
    if (!dateFilter) return true;
    const orderDate = new Date(order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt);
    const filterDate = new Date(dateFilter);
    return (
      orderDate.getDate() === filterDate.getDate() &&
      orderDate.getMonth() === filterDate.getMonth() &&
      orderDate.getFullYear() === filterDate.getFullYear()
    );
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ py: 3 }}>
          {/* Statistics Cards */}
          <StatsCards 
            stats={stats} 
            deliveredOrders={deliveredOrders}
          />

          {/* Charts Section */}
          <ChartsSection 
            stats={stats} 
            deliveredOrders={deliveredOrders}
          />

          {/* Recent Orders */}
          <RecentOrders
            filteredOrders={filteredOrders}
            paymentStatuses={paymentStatuses}
            deliveredOrders={deliveredOrders}
            deliveryDetailsMap={deliveryDetailsMap}
            expandedOrder={expandedOrder}
            setExpandedOrder={setExpandedOrder}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            setSelectedOrderForDelivery={setSelectedOrderForDelivery}
            setDeliveryDialogOpen={setDeliveryDialogOpen}
            handlePaymentToggle={handlePaymentToggle}
            handleMarkDelivered={handleMarkDelivered}
            processingOrder={processingOrder}
          />
        </Box>
      </Container>

      {/* Delivery Details Dialog */}
      <DeliveryDetailsDialog
        open={deliveryDialogOpen}
        onClose={() => setDeliveryDialogOpen(false)}
        orderId={selectedOrderForDelivery}
        onSave={handleSaveDeliveryDetails}
        initialData={selectedOrderForDelivery ? deliveryDetailsMap[selectedOrderForDelivery] : null}
      />
      
      {/* Notification Snackbar */}
      <NotificationSnackbar 
        snackbar={snackbar}
        onClose={handleCloseSnackbar}
      />
    </>
  );
};

export default Dashboard;