import React from 'react';
import { Button } from './Button';

export const Pagination: React.FC<{ page: number; totalPages: number; onPageChange: (p: number) => void }> = ({
  page, totalPages, onPageChange
}) => {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
      <span style={{ fontSize: '13px', color: '#94a3b8' }}>Page {page} of {totalPages}</span>
      <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
    </div>
  );
};
