import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader';
import { useActiveStoreStore } from '../../../store/active-store.store';
import { customersApi, CustomerSummary } from '../api/customers.api';
import { formatCurrency } from '../../../utils/currency';
import { BotanicalCardAccent } from '../../../components/botanical/BotanicalDecorations';

export const CustomersPage: React.FC = () => {
  const { activeStore } = useActiveStoreStore();
  const storeId = activeStore?.id || activeStore?._id;

  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [segmentCounts, setSegmentCounts] = useState<any>({ all: 0, new: 0, repeat: 0, high_value: 0, inactive: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastOrderDate');

  const [metrics, setMetrics] = useState({ totalCustomers: 0, totalLifetimeValueCents: 0, averageCustomerValueCents: 0 });
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!storeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await customersApi.list(storeId, {
        search: search.trim() || undefined,
        segment: selectedSegment !== 'all' ? selectedSegment : undefined,
        sort: sortBy,
        page: pagination.page,
        limit: pagination.limit
      });

      setCustomers(res.customers || []);
      setSegmentCounts(res.segmentCounts || { all: 0, new: 0, repeat: 0, high_value: 0, inactive: 0 });
      setPagination(res.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
      if (res.metrics) {
        setMetrics(res.metrics);
      } else {
        const total = res.pagination?.total || (res.customers || []).length;
        const totalSpend = (res.customers || []).reduce((acc, c) => acc + (c.totalSpentCents || 0), 0);
        const avg = total > 0 ? Math.round(totalSpend / total) : 0;
        setMetrics({ totalCustomers: total, totalLifetimeValueCents: totalSpend, averageCustomerValueCents: avg });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, [storeId, search, selectedSegment, sortBy, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleExport = async (customer: CustomerSummary) => {
    if (!storeId) return;
    try {
      setExportMessage(`Exporting ${customer.email}...`);
      const data = await customersApi.exportData(storeId, customer.id);
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-gdpr-export-${customer.email}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportMessage(null);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
      setExportMessage(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!storeId || !deletingCustomer) return;
    setIsDeleting(true);
    try {
      await customersApi.deleteData(storeId, deletingCustomer.id);
      setDeletingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Customer CRM"
        subtitle="Manage store-scoped customer profiles, purchase lifecycles, and GDPR compliance"
      />

      {error && (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px 18px',
            background: 'var(--accent-danger-bg)',
            color: 'var(--accent-danger)',
            border: '1px solid rgba(166, 46, 64, 0.25)',
            borderRadius: '10px',
            fontSize: '14px'
          }}
        >
          {error}
        </div>
      )}

      {exportMessage && (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px 18px',
            background: 'var(--bb-soft-blush)',
            color: 'var(--bb-burgundy)',
            border: '1px solid rgba(189, 124, 145, 0.3)',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          {exportMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '28px'
        }}
      >
        <div className="bb-card" style={{ padding: '24px', position: 'relative' }}>
          <BotanicalCardAccent position="top-right" size={60} opacity={0.5} />
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bb-muted-text)' }}>
            Total Customers
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--bb-burgundy)',
              marginTop: '8px',
              letterSpacing: '-0.02em'
            }}
          >
            {metrics.totalCustomers}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--bb-dusty-rose)', marginTop: '4px', fontWeight: 500 }}>
            Active verified shoppers
          </div>
        </div>

        <div className="bb-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bb-muted-text)' }}>
            Total Lifetime Value
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--bb-burgundy)',
              marginTop: '8px',
              letterSpacing: '-0.02em'
            }}
          >
            {formatCurrency(metrics.totalLifetimeValueCents, activeStore?.currency || 'INR')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--accent-success)', marginTop: '4px', fontWeight: 600 }}>
            Gross recorded spend
          </div>
        </div>

        <div className="bb-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bb-muted-text)' }}>
            Average Customer Value
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--bb-dusty-rose)',
              marginTop: '8px',
              letterSpacing: '-0.02em'
            }}
          >
            {formatCurrency(metrics.averageCustomerValueCents, activeStore?.currency || 'INR')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--bb-muted-text)', marginTop: '4px' }}>
            AOV per acquired account
          </div>
        </div>
      </div>

      {/* Segment Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All Customers', count: segmentCounts.all },
          { key: 'new', label: 'New', count: segmentCounts.new },
          { key: 'repeat', label: 'Repeat', count: segmentCounts.repeat },
          { key: 'high_value', label: 'High Value â­', count: segmentCounts.high_value },
          { key: 'inactive', label: 'Inactive (>90d)', count: segmentCounts.inactive }
        ].map(tab => {
          const isActive = selectedSegment === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedSegment(tab.key);
                setPagination(p => ({ ...p, page: 1 }));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isActive ? 'var(--bb-burgundy)' : 'var(--bb-border)',
                background: isActive ? 'var(--bb-burgundy)' : 'var(--bb-white)',
                color: isActive ? 'var(--bb-white)' : 'var(--bb-dark-text)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 6px rgba(99, 45, 64, 0.2)' : 'var(--shadow-sm)'
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: isActive ? 'var(--bb-burgundy-dark)' : 'var(--bb-soft-blush)',
                  color: isActive ? 'var(--bb-white)' : 'var(--bb-burgundy)',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                {tab.count || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPagination(p => ({ ...p, page: 1 }));
          }}
          placeholder="Search customer by name or email..."
          style={{
            flex: 1,
            minWidth: '240px',
            padding: '10px 14px',
            background: 'var(--bb-white)',
            border: '1px solid var(--bb-border)',
            borderRadius: '10px',
            color: 'var(--bb-dark-text)',
            fontSize: '14px',
            boxShadow: 'inset 0 1px 2px rgba(61, 32, 43, 0.03)'
          }}
        />

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'var(--bb-white)',
            border: '1px solid var(--bb-border)',
            borderRadius: '10px',
            color: 'var(--bb-dark-text)',
            fontSize: '14px',
            boxShadow: 'inset 0 1px 2px rgba(61, 32, 43, 0.03)'
          }}
        >
          <option value="lastOrderDate">Sort by: Recent Order</option>
          <option value="totalSpentCents">Sort by: Total Spend</option>
          <option value="orderCount">Sort by: Order Count</option>
          <option value="createdAt">Sort by: Join Date</option>
        </select>
      </div>

      {/* Customer Table */}
      {isLoading ? (
        <div style={{ color: 'var(--bb-muted-text)', padding: '48px', textAlign: 'center' }}>
          Loading customer directory...
        </div>
      ) : customers.length === 0 ? (
        <div
          className="bb-card"
          style={{
            padding: '48px',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: '32px' }}>ðŸŒ¸</span>
          <h3 style={{ color: 'var(--bb-burgundy)', marginTop: '12px', marginBottom: '6px' }}>
            No customers found
          </h3>
          <p style={{ color: 'var(--bb-muted-text)', fontSize: '14px' }}>
            {search
              ? 'Try adjusting your search criteria.'
              : 'When shoppers create accounts or check out, they will appear here.'}
          </p>
        </div>
      ) : (
        <div
          className="bb-card"
          style={{
            overflowX: 'auto',
            padding: 0
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--bb-warm-offwhite)',
                  borderBottom: '1px solid var(--bb-border)',
                  color: 'var(--bb-burgundy)'
                }}
              >
                <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12.5px', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12.5px', textTransform: 'uppercase' }}>Phone</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12.5px', textTransform: 'uppercase' }}>Orders</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12.5px', textTransform: 'uppercase' }}>Total Spent</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12.5px', textTransform: 'uppercase' }}>Last Order</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12.5px', textTransform: 'uppercase' }}>Registered</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '12.5px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => {
                const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Customer';
                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: idx === customers.length - 1 ? 'none' : '1px solid var(--bb-border-subtle)',
                      background: idx % 2 === 0 ? 'var(--bb-white)' : '#FDFAFA',
                      color: 'var(--bb-dark-text)'
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--bb-burgundy)' }}>{fullName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--bb-muted-text)', marginTop: '2px' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--bb-muted-text)', fontSize: '13px' }}>
                      {c.phone || 'â€”'}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                      {c.orderCount || 0}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--bb-burgundy)' }}>
                      {formatCurrency(c.totalSpentCents || 0, activeStore?.currency || 'INR')}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--bb-muted-text)', fontSize: '13px' }}>
                      {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : 'Never'}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--bb-muted-text)', fontSize: '13px' }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleExport(c)}
                          style={{
                            padding: '6px 10px',
                            background: 'var(--bb-soft-blush)',
                            color: 'var(--bb-burgundy)',
                            border: '1px solid rgba(189, 124, 145, 0.3)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Export all data (GDPR Right of Access)"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => setDeletingCustomer(c)}
                          style={{
                            padding: '6px 10px',
                            background: 'var(--accent-danger-bg)',
                            color: 'var(--accent-danger)',
                            border: '1px solid rgba(166, 46, 64, 0.25)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Delete customer data (GDPR Right to be Forgotten)"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            style={{
              padding: '8px 16px',
              background: 'var(--bb-white)',
              border: '1px solid var(--bb-border)',
              borderRadius: '8px',
              color: 'var(--bb-dark-text)',
              cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: 600
            }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 16px', color: 'var(--bb-muted-text)', fontSize: '14px' }}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            style={{
              padding: '8px 16px',
              background: 'var(--bb-white)',
              border: '1px solid var(--bb-border)',
              borderRadius: '8px',
              color: 'var(--bb-dark-text)',
              cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 600
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete / GDPR Modal */}
      {deletingCustomer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(61, 32, 43, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            className="bb-card"
            style={{
              maxWidth: '480px',
              width: '90%',
              padding: '28px',
              boxShadow: 'var(--shadow-elevated)'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px', color: 'var(--accent-danger)' }}>
              Confirm GDPR Data Erasure
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--bb-dark-text)', lineHeight: '1.5', marginBottom: '16px' }}>
              Are you sure you want to permanently delete the profile, address, and marketing consent records for{' '}
              <strong>{deletingCustomer.email}</strong>?
            </p>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--bb-muted-text)',
                marginBottom: '24px',
                background: 'var(--bb-warm-offwhite)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--bb-border)'
              }}
            >
              Historical orders will be retained for fiscal and tax auditing purposes with customer identifiers scrubbed. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                style={{
                  padding: '9px 18px',
                  background: 'var(--bb-white)',
                  color: 'var(--bb-dark-text)',
                  border: '1px solid var(--bb-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                style={{
                  padding: '9px 18px',
                  background: 'var(--accent-danger)',
                  color: 'var(--bb-white)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Erase Customer Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
