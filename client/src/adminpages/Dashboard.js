import React from 'react';
import { Box, Container } from '@mui/material';
import StatsCards from './components/Dashboard/StatsCards';
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

  // FIXED: Use independent check-in management system
  const {
    checkInStatuses, // FIXED: Now independent of payment status
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
    handleCheckInToggle, // FIXED: Now independent toggle function
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

          {/* Recent Orders - Updated component */}
          <RecentOrders
            filteredOrders={filteredOrders}
            checkInStatuses={checkInStatuses} // FIXED: Pass independent check-in statuses
            deliveredOrders={deliveredOrders}
            deliveryDetailsMap={deliveryDetailsMap}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            handleCheckInToggle={handleCheckInToggle} // FIXED: Pass independent toggle function
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