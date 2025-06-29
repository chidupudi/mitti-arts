// client/src/adminpages/Inventory.js - Updated with Season Management
import React from 'react';
import { Layout, Row, Col, Pagination, Spin, Button, Alert, Card, Space } from 'antd';
import { 
  ShoppingCartOutlined, 
  DashboardOutlined, 
  SwapOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Season Management
import { useSeason } from '../hooks/useSeason';

// Regular Inventory Components
import StatisticsCards from './components/Inventory/StatisticsCards';
import FilterPanel from './components/Inventory/FilterPanel';
import ProductCard from './components/Inventory/ProductCard';
import ProductTable from './components/Inventory/ProductTable';
import AddProductDialog from './components/Inventory/AddProductDiallog';
import EditProductDialog from './components/Inventory/EditProductDialog';
import DeleteConfirmationDialog from './components/Inventory/DeleteConfirmationDialog';
import EmptyState from './components/Inventory/EmptyState';
import NotificationSnackbar from './components/NotificationSnackbar';

// Ganesh Season Components
import GaneshInventory from './ganeshseason/GaneshInventory';

// Hooks
import { useInventory } from '../hooks/useInventory';

const { Content } = Layout;

const Inventory = () => {
  const navigate = useNavigate();
  const { currentSeason, isGaneshSeason, loading: seasonLoading } = useSeason();
  
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

  // Show loading while checking season
  if (seasonLoading) {
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

  // If it's Ganesh season, show Ganesh Inventory
  if (isGaneshSeason) {
    return <GaneshInventory />;
  }

  // Regular inventory loading
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

  // Normal Season - Regular Pottery Inventory
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Season Status Header */}
          <Card 
            style={{
              marginBottom: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
              border: '2px solid #66BB6A',
              color: 'white'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ color: 'white', margin: 0, marginBottom: '8px', fontSize: '24px', fontWeight: 'bold' }}>
                  🏺 Pottery Inventory Management
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '16px' }}>
                  Normal Season Active • All pottery items available for purchase
                </p>
              </div>
              
              <Space>
                <Button 
                  icon={<InfoCircleOutlined />}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                  onClick={() => navigate('/dashboard')}
                >
                  Season Settings
                </Button>
                <Button 
                  icon={<DashboardOutlined />}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
              </Space>
            </div>
          </Card>

          {/* Normal Season Notice */}
          <Alert
            message={
              <Space>
                <SwapOutlined />
                <span style={{ fontWeight: 'bold' }}>Normal Season Inventory</span>
              </Space>
            }
            description={
              <div>
                <p style={{ margin: 0, marginBottom: '8px' }}>
                  You are currently managing regular pottery items. During normal season:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>All pottery items are available for immediate purchase</li>
                  <li>Standard e-commerce checkout process</li>
                  <li>Regular delivery and payment workflow</li>
                  <li>Ganesh idols are hidden from customers</li>
                </ul>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#666' }}>
                  <strong>Note:</strong> Switch to Ganesh season from the Dashboard to manage Ganesh idols and lead capture system.
                </p>
              </div>
            }
            type="info"
            style={{ 
              marginBottom: '24px',
              borderRadius: '12px',
              border: '2px solid #E3F2FD'
            }}
            showIcon
          />

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