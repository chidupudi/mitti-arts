// pages/productscomponents/CompactSearchFilter.js
import React, { memo } from 'react';
import {
  Input,
  Button,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  CloseOutlined,
  FilterOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

// Terracotta colors
const terracottaColors = {
  primary: '#D2691E',
  primaryLight: '#E8A857',
  primaryDark: '#A0522D',
  secondary: '#CD853F',
  accent: '#F4A460',
  background: '#FDFCFA',
  backgroundLight: '#FFEEE6',
  text: '#2C1810',
  textSecondary: '#6B4423',
  divider: '#E8D5C4',
  success: '#8BC34A',
  warning: '#FF9800',
  error: '#F44336',
  ganesh: '#FF8F00',
};

const CompactSearchFilter = memo(({ 
  searchQuery, 
  setSearchQuery, 
  filteredGaneshIdols, 
  isGaneshSearching, 
  handleGaneshDrawerToggle, 
  isMobile 
}) => {
  const customStyles = `
    .compact-search-filter {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid ${terracottaColors.ganesh}30;
      border-radius: 12px;
      padding: ${isMobile ? '12px' : '16px'};
      box-shadow: 0 4px 12px rgba(255, 143, 0, 0.1);
    }
    
    .compact-search-input .ant-input {
      border-radius: 8px;
      border-color: ${terracottaColors.ganesh}40;
      height: ${isMobile ? '40px' : '44px'};
    }
    
    .compact-search-input .ant-input:focus,
    .compact-search-input .ant-input-focused {
      border-color: ${terracottaColors.ganesh};
      box-shadow: 0 0 0 2px ${terracottaColors.ganesh}20;
    }
    
    .compact-filter-btn {
      border-radius: 8px;
      height: ${isMobile ? '40px' : '44px'};
      background: ${terracottaColors.ganesh};
      border-color: ${terracottaColors.ganesh};
      font-weight: 600;
    }
    
    .compact-filter-btn:hover {
      background: ${terracottaColors.primaryDark};
      border-color: ${terracottaColors.primaryDark};
    }
    
    .compact-results-tag {
      background: ${terracottaColors.ganesh}15;
      color: ${terracottaColors.ganesh};
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      font-weight: 600;
      height: ${isMobile ? '40px' : '44px'};
      display: flex;
      align-items: center;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="compact-search-filter" style={{ marginBottom: '16px' }}>
        <Row gutter={[8, 8]} align="middle">
          {/* Search Input - Takes most of the space */}
          <Col xs={18} sm={19} md={20} lg={20}>
            <Input
              className="compact-search-input"
              placeholder={isMobile ? "Search idols..." : "Search Ganesh idols..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined style={{ color: terracottaColors.ganesh }} />}
              suffix={searchQuery && (
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CloseOutlined />}
                  onClick={() => setSearchQuery('')}
                  style={{ 
                    color: terracottaColors.textSecondary,
                    minWidth: 'auto',
                    padding: '0 4px'
                  }}
                />
              )}
            />
          </Col>

          {/* Filter Button - Compact */}
          <Col xs={6} sm={5} md={4} lg={4}>
            <Button
              type="primary"
              className="compact-filter-btn"
              icon={<FilterOutlined />}
              onClick={handleGaneshDrawerToggle}
              block
              style={{ padding: '0 8px' }}
            >
              {!isMobile && 'Filter'}
            </Button>
          </Col>
        </Row>

        {/* Results count below on mobile for better UX */}
        

        {/* Results count on desktop */}
        {!isMobile && (
          <Row style={{ marginTop: '8px' }}>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Tag
                className="compact-results-tag"
                icon={<AppstoreOutlined />}
              >
                {filteredGaneshIdols.length} Idols
                {isGaneshSearching && '...'}
              </Tag>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
});

CompactSearchFilter.displayName = 'CompactSearchFilter';

export default CompactSearchFilter;