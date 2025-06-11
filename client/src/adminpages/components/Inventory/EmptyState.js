import React from 'react';
import { Card, Typography, Button, Empty } from 'antd';
import { PlusOutlined, ShopOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const EmptyState = ({ searchTerm, onAddProduct }) => {
  return (
    <Card 
      style={{ 
        textAlign: 'center',
        borderRadius: '12px',
        border: '2px dashed #d9d9d9',
        backgroundColor: '#fafafa',
        padding: '48px 24px',
      }}
    >
      <Empty
        image={<ShopOutlined style={{ fontSize: '80px', color: '#d9d9d9' }} />}
        imageStyle={{ height: 100 }}
        description={
          <div>
            <Title level={3} type="secondary" style={{ marginBottom: '8px' }}>
              {searchTerm ? 'No products found' : 'No products yet'}
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              {searchTerm 
                ? `No products match "${searchTerm}". Try adjusting your search.`
                : 'Start building your inventory by adding your first product.'
              }
            </Text>
          </div>
        }
      >
        {!searchTerm && (
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={onAddProduct}
            style={{
              background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
              border: 'none',
              borderRadius: '8px',
              height: '48px',
              padding: '0 32px',
              fontSize: '16px',
              fontWeight: 600,
              marginTop: '16px',
            }}
          >
            Add Your First Product
          </Button>
        )}
      </Empty>
    </Card>
  );
};

export default EmptyState;