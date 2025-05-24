import React from 'react';
import { Box, Container } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import OrderFilters from './components/AdminOrders/OrderFilters';
import OrdersTable from './components/AdminOrders/OrderTable';
import OrdersCards from './components/AdminOrders/OrdersCards';
import DeliveryDetailsDialog from './components/AdminOrders/DeliveryDetailsDialog';
import OrderDetailsDialog from './components/AdminOrders/OrderDetailsDialog';
import NotificationSnackbar from './components/NotificationSnackbar';
import LoadingScreen from './components/LoadingScreen';
import { terracottaTheme } from '../theme/terracottaTheme';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { useMediaQuery } from '@mui/material';

const AdminOrders = () => {
  const isMedium = useMediaQuery(terracottaTheme.breakpoints.down('md'));
  
  // Custom hook for all admin orders logic
  const {
    // Data states
    orders,
    filteredOrders,
    loading,
    error,
    
    // Filter states
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    deliveryFilter,
    setDeliveryFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    orderStatusFilter,
    setOrderStatusFilter,
    
    // UI states
    filtersOpen,
    setFiltersOpen,
    showDateRange,
    setShowDateRange,
    expandedOrderId,
    setExpandedOrderId,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    
    // Dialog states
    deliveryDialogOpen,
    setDeliveryDialogOpen,
    selectedOrderForDelivery,
    setSelectedOrderForDelivery,
    detailsDialogOpen,
    setDetailsDialogOpen,
    selectedOrderForDetails,
    setSelectedOrderForDetails,
    
    // Data maps
    deliveryDetailsMap,
    snackbar,
    
    // Action handlers
    handlePaymentToggle,
    handleSaveDeliveryDetails,
    handleMarkDelivered,
    handleResetFilters,
    handleCloseSnackbar,
    handleChangePage,
    handleChangeRowsPerPage,
    handleViewOrderDetails,
  } = useAdminOrders();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={terracottaTheme}>
      <Box sx={{ 
        backgroundColor: 'background.default', 
        minHeight: '100vh',
        pb: 4
      }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
          {/* Filters Section */}
          <OrderFilters
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            sortBy={sortBy}
            setSortBy={setSortBy}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            dateRange={dateRange}
            setDateRange={setDateRange}
            deliveryFilter={deliveryFilter}
            setDeliveryFilter={setDeliveryFilter}
            paymentStatusFilter={paymentStatusFilter}
            setPaymentStatusFilter={setPaymentStatusFilter}
            orderStatusFilter={orderStatusFilter}
            setOrderStatusFilter={setOrderStatusFilter}
            showDateRange={showDateRange}
            setShowDateRange={setShowDateRange}
            handleResetFilters={handleResetFilters}
            ordersCount={orders.length}
            filteredCount={filteredOrders.length}
          />

          {/* Orders Display */}
          {isMedium ? (
            <OrdersCards
              filteredOrders={filteredOrders}
              page={page}
              rowsPerPage={rowsPerPage}
              expandedOrderId={expandedOrderId}
              setExpandedOrderId={setExpandedOrderId}
              searchQuery={searchQuery}
              deliveryDetailsMap={deliveryDetailsMap}
              handlePaymentToggle={handlePaymentToggle}
              handleMarkDelivered={handleMarkDelivered}
              handleViewOrderDetails={handleViewOrderDetails}
              setSelectedOrderForDelivery={setSelectedOrderForDelivery}
              setDeliveryDialogOpen={setDeliveryDialogOpen}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              error={error}
            />
          ) : (
            <OrdersTable
              filteredOrders={filteredOrders}
              page={page}
              rowsPerPage={rowsPerPage}
              deliveryDetailsMap={deliveryDetailsMap}
              handlePaymentToggle={handlePaymentToggle}
              handleMarkDelivered={handleMarkDelivered}
              handleViewOrderDetails={handleViewOrderDetails}
              setSelectedOrderForDelivery={setSelectedOrderForDelivery}
              setDeliveryDialogOpen={setDeliveryDialogOpen}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              error={error}
            />
          )}

          {/* Dialogs */}
          <DeliveryDetailsDialog
            open={deliveryDialogOpen}
            onClose={() => setDeliveryDialogOpen(false)}
            orderId={selectedOrderForDelivery}
            onSave={handleSaveDeliveryDetails}
            initialData={selectedOrderForDelivery ? deliveryDetailsMap[selectedOrderForDelivery] : null}
          />
          
          <OrderDetailsDialog
            open={detailsDialogOpen}
            onClose={() => setDetailsDialogOpen(false)}
            order={selectedOrderForDetails}
            searchQuery={searchQuery}
          />
          
          {/* Notification Snackbar */}
          <NotificationSnackbar 
            snackbar={snackbar}
            onClose={handleCloseSnackbar}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AdminOrders;