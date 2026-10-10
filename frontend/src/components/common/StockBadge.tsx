import React from 'react';
import { Badge } from '../ui/Badge';

export const StockBadge: React.FC<{ onHand: number; threshold?: number }> = ({ onHand, threshold = 5 }) => {
  if (onHand <= 0) return <Badge variant="danger">Out of Stock</Badge>;
  if (onHand <= threshold) return <Badge variant="warning">Low Stock ({onHand})</Badge>;
  return <Badge variant="success">In Stock ({onHand})</Badge>;
};
