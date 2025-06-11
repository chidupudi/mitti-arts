import React from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  Space, 
  Tooltip 
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
} from '@ant-design/icons';

const { Option } = Select;

const FilterPanel = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onAddProduct,
}) => {
  return (
    <Card 
      style={{
        marginBottom: '24px',
        borderRadius: '16px',
        border: '1px solid #f0f0f0',
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}>
        <Space wrap size="middle" style={{ flex: 1 }}>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined style={{ color: '#D2691E' }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: '250px' }}
            allowClear
          />
          
          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            style={{ minWidth: '120px' }}
            placeholder="Filter"
          >
            <Option value="all">All Products</Option>
            <Option value="visible">Visible Only</Option>
            <Option value="hidden">Hidden Only</Option>
            <Option value="low-stock">Low Stock</Option>
          </Select>

          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ minWidth: '120px' }}
            placeholder="Sort By"
          >
            <Option value="name">Name</Option>
            <Option value="price">Price</Option>
            <Option value="stock">Stock</Option>
            <Option value="created">Created Date</Option>
          </Select>
        </Space>

        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddProduct}
            style={{
              background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
              border: 'none',
              borderRadius: '8px',
            }}
          >
            Add Product
          </Button>

          <Space.Compact>
            <Tooltip title="Grid View">
              <Button
                type={viewMode === 'grid' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('grid')}
                style={viewMode === 'grid' ? {
                  backgroundColor: '#D2691E',
                  borderColor: '#D2691E'
                } : {}}
              />
            </Tooltip>
            <Tooltip title="Table View">
              <Button
                type={viewMode === 'table' ? 'primary' : 'default'}
                icon={<BarsOutlined />}
                onClick={() => setViewMode('table')}
                style={viewMode === 'table' ? {
                  backgroundColor: '#D2691E',
                  borderColor: '#D2691E'
                } : {}}
              />
            </Tooltip>
          </Space.Compact>
        </Space>
      </div>
    </Card>
  );
};

export default FilterPanel;