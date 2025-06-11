import React from 'react';
import { Modal, Typography, Alert, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DeleteConfirmationDialog = ({
  open,
  onClose,
  product,
  onConfirm,
}) => {
  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          Confirm Delete
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={onConfirm}
      okText="Delete Product"
      cancelText="Cancel"
      okType="danger"
      width={400}
    >
      <div style={{ marginTop: '16px' }}>
        <Alert
          message="This action cannot be undone!"
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        
        <Text style={{ fontSize: '16px' }}>
          Are you sure you want to delete{' '}
          <Text strong>{product?.name}</Text>?
        </Text>
        
        <div style={{ marginTop: '8px' }}>
          <Text type="secondary">
            This will permanently remove the product from your inventory.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationDialog;