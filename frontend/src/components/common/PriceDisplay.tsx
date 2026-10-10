import React from 'react';
import { formatCurrency } from '../../utils/currency';

export const PriceDisplay: React.FC<{ cents: number; currency?: string }> = ({ cents, currency = 'INR' }) => {
  return <span style={{ fontWeight: 600 }}>{formatCurrency(cents, currency)}</span>;
};
