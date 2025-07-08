// client/src/adminpages/ganeshseason/components/GaneshFilterPanel.js
import React from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  Space, 
  Tooltip,
  Typography,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const GaneshFilterPanel = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onAddIdol,
}) => {
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setSortBy('name');
  };

  return (
    <Card 
      style={{
        marginBottom: '24px',
        borderRadius: '16px',
        border: '2px solid #FFE0B2',
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 100%)',
        boxShadow: '0 4px 20px rgba(255, 143, 0, 0.08)',
      }}
      bodyStyle={{ padding: '20px' }}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Search Section */}
        <Col xs={24} sm={24} md={8} lg={6}>
          <Input
            placeholder="Search Ganesh idols by name, color, height..."
            prefix={<SearchOutlined style={{ color: '#FF8F00' }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{
              borderRadius: '8px',
              border: '2px solid #FFE0B2',
              '&:hover': {
                borderColor: '#FF8F00',
              },
              '&:focus': {
                borderColor: '#FF8F00',
                boxShadow: '0 0 0 2px rgba(255, 143, 0, 0.2)',
              }
            }}
            size="large"
          />
        </Col>

        {/* Filter Dropdown */}
        <Col xs={12} sm={8} md={4} lg={3}>
          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            style={{ width: '100%' }}
            size="large"
            placeholder="Filter"
            suffixIcon={<FilterOutlined style={{ color: '#FF8F00' }} />}
          >
            <Option value="all">
              <Space>
                🕉️ All Idols
              </Space>
            </Option>
            <Option value="visible">
              <Space>
                👁️ Visible Only
              </Space>
            </Option>
            <Option value="hidden">
              <Space>
                🚫 Hidden Only
              </Space>
            </Option>
            <Option value="traditional">
              <Space>
                🏛️ Traditional
              </Space>
            </Option>
            <Option value="modern">
              <Space>
                ⭐ Modern
              </Space>
            </Option>
            <Option value="premium">
              <Space>
                👑 Premium
              </Space>
            </Option>
            <Option value="available">
              <Space>
                ✅ Available
              </Space>
            </Option>
            <Option value="custom-order">
              <Space>
                🛠️ Custom Order
              </Space>
            </Option>
          </Select>
        </Col>

        {/* Sort Dropdown */}
        <Col xs={12} sm={8} md={4} lg={3}>
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: '100%' }}
            size="large"
            placeholder="Sort By"
          >
            <Option value="name">📝 Name A-Z</Option>
            <Option value="price">💰 Price: Low to High</Option>
            <Option value="priceDesc">💎 Price: High to Low</Option>
            <Option value="height">📏 Height</Option>
            <Option value="category">🏷️ Category</Option>
            <Option value="created">🗓️ Recently Added</Option>
          </Select>
        </Col>

        {/* View Mode Toggle */}
        <Col xs={8} sm={4} md={3} lg={2}>
          <Space.Compact style={{ width: '100%' }}>
            <Tooltip title="Grid View">
              <Button
                type={viewMode === 'grid' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('grid')}
                size="large"
                style={viewMode === 'grid' ? {
                  backgroundColor: '#FF8F00',
                  borderColor: '#FF8F00',
                  color: 'white'
                } : {
                  borderColor: '#FFE0B2',
                  color: '#FF8F00'
                }}
              />
            </Tooltip>
            <Tooltip title="Table View">
              <Button
                type={viewMode === 'table' ? 'primary' : 'default'}
                icon={<BarsOutlined />}
                onClick={() => setViewMode('table')}
                size="large"
                style={viewMode === 'table' ? {
                  backgroundColor: '#FF8F00',
                  borderColor: '#FF8F00',
                  color: 'white'
                } : {
                  borderColor: '#FFE0B2',
                  color: '#FF8F00'
                }}
              />
            </Tooltip>
          </Space.Compact>
        </Col>

        {/* Clear Filters Button */}
        <Col xs={8} sm={6} md={3} lg={2}>
          <Tooltip title="Clear all filters">
            <Button
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
              size="large"
              style={{
                width: '100%',
                borderColor: '#FFB74D',
                color: '#FF6F00',
              }}
            >
              Clear
            </Button>
          </Tooltip>
        </Col>

        {/* Add Ganesh Idol Button */}
        <Col xs={16} sm={8} md={6} lg={5}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddIdol}
            size="large"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(255, 143, 0, 0.3)',
            }}
          >
            🕉️ Add Ganesh Idol
          </Button>
        </Col>
      </Row>

      {/* Active Filters Display */}
      {(searchTerm || filterCategory !== 'all' || sortBy !== 'name') && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'rgba(255, 143, 0, 0.05)',
          borderRadius: '8px',
          border: '1px dashed #FFB74D'
        }}>
          <Text strong style={{ color: '#E65100', marginRight: '12px' }}>
            Active Filters:
          </Text>
          <Space wrap>
            {searchTerm && (
              <Text code style={{ background: '#FFE0B2', color: '#E65100', padding: '2px 8px', borderRadius: '4px' }}>
                Search: "{searchTerm}"
              </Text>
            )}
            {filterCategory !== 'all' && (
              <Text code style={{ background: '#FFE0B2', color: '#E65100', padding: '2px 8px', borderRadius: '4px' }}>
                Filter: {filterCategory}
              </Text>
            )}
            {sortBy !== 'name' && (
              <Text code style={{ background: '#FFE0B2', color: '#E65100', padding: '2px 8px', borderRadius: '4px' }}>
                Sort: {sortBy}
              </Text>
            )}
          </Space>
        </div>
      )}

      {/* Quick Filter Chips */}
      <div style={{ marginTop: '12px' }}>
        <Text style={{ color: '#FF6F00', fontWeight: '500', marginRight: '12px' }}>
          Quick Filters:
        </Text>
        <Space wrap>
          <Button
            size="small"
            type={filterCategory === 'traditional' ? 'primary' : 'default'}
            onClick={() => setFilterCategory(filterCategory === 'traditional' ? 'all' : 'traditional')}
            style={{
              borderRadius: '16px',
              fontSize: '12px',
              height: '28px',
              ...(filterCategory === 'traditional' ? {
                background: '#FF8F00',
                borderColor: '#FF8F00'
              } : {
                borderColor: '#FFE0B2',
                color: '#FF6F00'
              })
            }}
          >
            🏛️ Traditional
          </Button>
          <Button
            size="small"
            type={filterCategory === 'modern' ? 'primary' : 'default'}
            onClick={() => setFilterCategory(filterCategory === 'modern' ? 'all' : 'modern')}
            style={{
              borderRadius: '16px',
              fontSize: '12px',
              height: '28px',
              ...(filterCategory === 'modern' ? {
                background: '#FF8F00',
                borderColor: '#FF8F00'
              } : {
                borderColor: '#FFE0B2',
                color: '#FF6F00'
              })
            }}
          >
            ⭐ Modern
          </Button>
          <Button
            size="small"
            type={filterCategory === 'premium' ? 'primary' : 'default'}
            onClick={() => setFilterCategory(filterCategory === 'premium' ? 'all' : 'premium')}
            style={{
              borderRadius: '16px',
              fontSize: '12px',
              height: '28px',
              ...(filterCategory === 'premium' ? {
                background: '#FF8F00',
                borderColor: '#FF8F00'
              } : {
                borderColor: '#FFE0B2',
                color: '#FF6F00'
              })
            }}
          >
            👑 Premium
          </Button>
          <Button
            size="small"
            type={sortBy === 'price' ? 'primary' : 'default'}
            onClick={() => setSortBy(sortBy === 'price' ? 'name' : 'price')}
            style={{
              borderRadius: '16px',
              fontSize: '12px',
              height: '28px',
              ...(sortBy === 'price' ? {
                background: '#FF8F00',
                borderColor: '#FF8F00'
              } : {
                borderColor: '#FFE0B2',
                color: '#FF6F00'
              })
            }}
          >
            💰 By Price
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default GaneshFilterPanel;