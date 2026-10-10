import React from 'react';
import { Badge } from '../ui/Badge';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'PAID':
    case 'ACTIVE':
    case 'COMPLETED':
      return <Badge variant="success">{status}</Badge>;
    case 'PENDING':
    case 'DRAFT':
      return <Badge variant="warning">{status}</Badge>;
    case 'CANCELLED':
    case 'REFUNDED':
    case 'ARCHIVED':
      return <Badge variant="danger">{status}</Badge>;
    default:
      return <Badge variant="info">{status}</Badge>;
  }
};
