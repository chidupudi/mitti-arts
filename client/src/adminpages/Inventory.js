import React from 'react';
import {
  Box,
  Container,
  Grid,
  TablePagination,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

// Components
import StatisticsCards from './components/Inventory/StatisticsCards';
import FilterPanel from './components/Inventory/FilterPanel';
import ProductCard from './components/Inventory/ProductCard';
import ProductTable from './components/Inventory/ProductCard';
import AddProductDialog from './components/Inventory/AddProductDiallog';
import EditProductDialog from './components/Inventory/EditProductDialog';
import DeleteConfirmationDialog from './components/Inventory/DeleteConfirmationDialog';
import EmptyState from './components/Inventory/EmptyState';
import NotificationSnackbar from './components/NotificationSnackbar';
import LoadingScreen from './components/LoadingScreen';

// Theme and Hooks
import { terracottaTheme } from '../theme/terracottaTheme';
import { useInventory } from '../hooks/useInventory';

const Inventory = () => {
  const {
    // Data
    filteredProducts,
    paginatedProducts,
    statistics,
    loading,
    error,
    
    // Dialog states
    addDialogOpen,
    setAddDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    productToDelete,
    
    // Form states
    newProduct,
    setNewProduct,
    editProduct,
    
    // Filter states
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    filterCategory,
    setFilterCategory,
    page,
    rowsPerPage,
    
    // Snackbar
    snackbar,
    handleCloseSnackbar,
    
    // Actions
    handleAddProduct,
    handleDeleteClick,
    handleConfirmDelete,
    handleToggleHide,
    handleEditProduct,
    handleEditChange,
    handleSaveEdit,
    handleImageUpload,
    handleChangePage,
    handleChangeRowsPerPage,
  } = useInventory();

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
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Statistics Cards */}
          <StatisticsCards statistics={statistics} />

          <FilterPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onAddProduct={() => setAddDialogOpen(true)}
          />

          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <EmptyState 
              searchTerm={searchTerm} 
              onAddProduct={() => setAddDialogOpen(true)} 
            />
          ) : (
            <>
              {viewMode === 'grid' ? (
                <>
                  <Grid container spacing={3}>
                    {paginatedProducts.map((product) => (
                      <Grid item xs={12} sm={6} lg={4} xl={3} key={product.id}>
                        <ProductCard
                          product={product}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteClick}
                          onToggleHide={handleToggleHide}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  {/* Pagination */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <TablePagination
                      component="div"
                      count={filteredProducts.length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[12, 24, 48, 96]}
                    />
                  </Box>
                </>
              ) : (
                <ProductTable
                  products={paginatedProducts}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  totalCount={filteredProducts.length}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteClick}
                  onToggleHide={handleToggleHide}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              )}
            </>
          )}

          {/* Add Product Dialog */}
          <AddProductDialog
            open={addDialogOpen}
            onClose={() => setAddDialogOpen(false)}
            product={newProduct}
            setProduct={setNewProduct}
            onSave={handleAddProduct}
            onImageUpload={handleImageUpload}
          />

          {/* Edit Product Dialog */}
          <EditProductDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            product={editProduct}
            onChange={handleEditChange}
            onSave={handleSaveEdit}
            onImageUpload={handleImageUpload}
          />

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            product={productToDelete}
            onConfirm={handleConfirmDelete}
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

export default Inventory;