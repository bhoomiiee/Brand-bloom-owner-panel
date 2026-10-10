import React from 'react';
import { SearchInput } from '../../../components/common/SearchInput';

export const OrderFilters: React.FC<{ search: string; onSearchChange: (s: string) => void }> = ({
  search, onSearchChange
}) => {
  return <SearchInput value={search} onChange={onSearchChange} placeholder="Search orders..." />;
};
