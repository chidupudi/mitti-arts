// client/src/adminpages/ganeshseason/GaneshInventory.js
import React from 'react';
import { Layout, Row, Col, Pagination, Spin, Button, Typography, Space, Alert } from 'antd';
import { PlusOutlined, DashboardOutlined, TeamOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Components
import GaneshStatisticsCards from './components/GaneshStatisticsCards';
import GaneshFilterPanel from './components/GaneshFilterPanel';
import GaneshIdolCard from './components/GaneshIdolCard';
import GaneshIdolTable from './components/GaneshIdolTable';
import AddGaneshIdolDialog from './components/AddGaneshIdolDialog';
import EditGaneshIdolDialog from './components/EditGaneshIdolDialog';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import EmptyGaneshState from './components/EmptyGaneshState';
import NotificationSnackbar from '../components/NotificationSnackbar';

// Hooks
import { useGaneshInventory } from '../../hooks/useGaneshInventory';
import { useSeason } from '../../hooks/useSeason';

const { Content } = Layout;
const { Title, Text } = Typography;

const GaneshInventory = () => {
  const navigate = useNavigate();
  const { currentSeason, isGaneshSeason } = useSeason();
  
  const {
    // Data
    ganeshIdols,
    filteredIdols,
    paginatedIdols,
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
    idolToDelete,
    
    // Form states
    newIdol,
    setNewIdol,
    editIdol,
    
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
    handleAddIdol,
    handleDeleteClick,
    handleConfirmDelete,
    handleToggleHide,
    handleEditIdol,
    handleEditChange,
    handleSaveEdit,
    // REMOVED: handleImageUpload - now handled directly in components
    handleChangePage,
    handleChangeRowsPerPage,
  } = useGaneshInventory();

  // Redirect if not Ganesh season
  if (!isGaneshSeason) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Content style={{ padding: '24px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
            <Alert
              message="Ganesh Season Not Active"
              description={
                <div>
                  <Text>
                    The Ganesh season management is only available when Ganesh season is active. 
                    Current season: <strong>{currentSeason}</strong>
                  </Text>
                  <div style={{ marginTop: '20px' }}>
                    <Button 
                      type="primary" 
                      icon={<DashboardOutlined />}
                      onClick={() => navigate('/dashboard')}
                      style={{
                        background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                        border: 'none',
                        marginRight: '12px'
                      }}
                    >
                      Go to Dashboard
                    </Button>
                    <Button 
                      icon={<ShoppingCartOutlined />}
                      onClick={() => navigate('/inventory')}
                    >
                      Regular Inventory
                    </Button>
                  </div>
                </div>
              }
              type="warning"
              showIcon
              style={{
                borderRadius: '12px',
                padding: '24px'
              }}
            />
          </div>
        </Content>
      </Layout>
    );
  }

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
          {/* Header Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
                  🕉️ Ganesh Idol Inventory
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                  Manage Ganesh idols for the festive season • Lead capture & advance payment system
                </Text>
              </div>
              
              <Space>
                <Button 
                  icon={<TeamOutlined />}
                  onClick={() => navigate('/ganesh-leads')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  View Leads
                </Button>
                <Button 
                  icon={<ShoppingCartOutlined />}
                  onClick={() => navigate('/ganesh-orders')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                >
                  Ganesh Orders
                </Button>
              </Space>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert
              message="Error Loading Ganesh Idols"
              description={error}
              type="error"
              style={{ marginBottom: '24px' }}
              showIcon
            />
          )}

          {/* Statistics Cards */}
          <GaneshStatisticsCards statistics={statistics} />

          {/* Filter Panel */}
          <GaneshFilterPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onAddIdol={() => setAddDialogOpen(true)}
          />

          {/* Idols Display */}
          {filteredIdols.length === 0 ? (
            <EmptyGaneshState 
              searchTerm={searchTerm} 
              onAddIdol={() => setAddDialogOpen(true)} 
            />
          ) : (
            <>
              {viewMode === 'grid' ? (
                <>
                  <Row gutter={[24, 24]}>
                    {paginatedIdols.map((idol) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={idol.id}>
                        <GaneshIdolCard
                          idol={idol}
                          onEdit={handleEditIdol}
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
                      total={filteredIdols.length}
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
                        `${range[0]}-${range[1]} of ${total} Ganesh idols`
                      }
                      style={{
                        '& .ant-pagination-item-active': {
                          backgroundColor: '#FF8F00',
                          borderColor: '#FF8F00',
                        },
                      }}
                    />
                  </div>
                </>
              ) : (
                <GaneshIdolTable
                  idols={paginatedIdols}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  totalCount={filteredIdols.length}
                  onEdit={handleEditIdol}
                  onDelete={handleDeleteClick}
                  onToggleHide={handleToggleHide}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              )}
            </>
          )}

          {/* Add Ganesh Idol Dialog */}
          <AddGaneshIdolDialog
            open={addDialogOpen}
            onClose={() => setAddDialogOpen(false)}
            idol={newIdol}
            setIdol={setNewIdol}
            onSave={handleAddIdol}
            // REMOVED: onImageUpload prop - now handled internally
          />

          {/* Edit Ganesh Idol Dialog */}
          <EditGaneshIdolDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            idol={editIdol}
            onChange={handleEditChange}
            onSave={handleSaveEdit}
            // REMOVED: onImageUpload prop - now handled internally
          />

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            idol={idolToDelete}
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

export default GaneshInventory;