import React from 'react';
import { Layout, Row, Col, Pagination, Spin } from 'antd';

// Components
import StatisticsCards from './components/Inventory/StatisticsCards';
import FilterPanel from './components/Inventory/FilterPanel';
import ProductCard from './components/Inventory/ProductCard';
import ProductTable from './components/Inventory/ProductTable';
import AddProductDialog from './components/Inventory/AddProductDiallog';
import EditProductDialog from './components/Inventory/EditProductDialog';
import DeleteConfirmationDialog from './components/Inventory/DeleteConfirmationDialog';
import EmptyState from './components/Inventory/EmptyState';
import NotificationSnackbar from './components/NotificationSnackbar';

// Hooks
import { useInventory } from '../hooks/useInventory';

const { Content } = Layout;

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
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
                  <Row gutter={[24, 24]}>
                    {paginatedProducts.map((product) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                        <ProductCard
                          product={product}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteClick}
                          onToggleHide={handleToggleHide}
                        />
                      </Col>
                    ))}
                  </Row>

                  {/* Pagination */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginTop: '32px' 
                  }}>
                    <Pagination
                      current={page + 1}
                      pageSize={rowsPerPage}
                      total={filteredProducts.length}
                      onChange={(page, pageSize) => {
                        handleChangePage(null, page - 1);
                        if (pageSize !== rowsPerPage) {
                          handleChangeRowsPerPage({ target: { value: pageSize } });
                        }
                      }}
                      showSizeChanger
                      pageSizeOptions={['12', '24', '48', '96']}
                      showQuickJumper
                      showTotal={(total, range) => 
                        `${range[0]}-${range[1]} of ${total} products`
                      }
                    />
                  </div>
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
        </div>
      </Content>
    </Layout>
  );
};

export default Inventory;