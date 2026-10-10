import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { InventoryTable } from '../components/InventoryTable';
import { StockAdjustmentForm } from '../components/StockAdjustmentForm';
import { Modal } from '../../../components/ui/Modal';
import { inventoryApi } from '../api/inventory.api';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventoryApi.list();
      const formatted = (Array.isArray(data) ? data : []).map(i => ({
        ...i,
        sku: i.variantId?.sku || i.sku || 'SKU-UNKNOWN',
        onHand: i.onHand ?? 0,
        reserved: i.reserved ?? 0
      }));
      setItems(formatted);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory balances');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAdjust = async (delta: number, reason: string) => {
    if (!selectedItem) return;
    setError(null);
    try {
      const variantId = selectedItem.variantId?._id || selectedItem.variantId || selectedItem._id;
      await inventoryApi.adjust({
        variantId,
        delta,
        reason: reason || 'Manual adjustment'
      });
      setSelectedItem(null);
      await fetchInventory();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    }
  };

  return (
    <div>
      <PageHeader title="Inventory & Stock" subtitle="Manage stock balances and view reservation movements" />
      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      {isLoading ? (
        <div style={{ color: '#94a3b8', padding: '32px', textAlign: 'center' }}>Loading inventory records...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '48px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
          <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>No inventory tracked yet</h3>
          <p style={{ color: '#94a3b8' }}>Products and variants created in the catalog will automatically track stock here.</p>
        </div>
      ) : (
        <InventoryTable items={items} onAdjust={setSelectedItem} />
      )}
      <Modal isOpen={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} title="Stock Adjustment">
        <StockAdjustmentForm item={selectedItem} onSubmit={handleAdjust} />
      </Modal>
    </div>
  );
};
