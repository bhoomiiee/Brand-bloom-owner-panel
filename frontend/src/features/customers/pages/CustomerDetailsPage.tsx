import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader';
import { useActiveStoreStore } from '../../../store/active-store.store';
import { customersApi, CustomerDetailResponse } from '../api/customers.api';
import { formatCurrency } from '../../../utils/currency';

export const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeStore } = useActiveStoreStore();
  const storeId = activeStore?.id;

  const [data, setData] = useState<CustomerDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!storeId || !id) return;
    setIsLoading(true);
    customersApi
      .getDetails(storeId, id)
      .then(res => {
        setData(res);
      })
      .catch(err => {
        setError(err.message || 'Failed to load customer profile');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [storeId, id]);

  const handleExport = async () => {
    if (!storeId || !id || !data) return;
    try {
      const exportJson = await customersApi.exportData(storeId, id);
      const jsonBlob = new Blob([JSON.stringify(exportJson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-gdpr-export-${data.customer.email}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!storeId || !id || !data) return;
    if (!window.confirm(`Permanently erase all personal data for ${data.customer.email} (GDPR Article 17)?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await customersApi.deleteData(storeId, id);
      alert('Customer data erased.');
      navigate('/customers');
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div style={{ color: '#94a3b8', padding: '48px', textAlign: 'center' }}>Loading customer file...</div>;
  }

  if (error || !data) {
    return (
      <div style={{ padding: '24px', background: '#1e293b', borderRadius: '12px' }}>
        <div style={{ color: '#ef4444', marginBottom: '16px' }}>{error || 'Customer not found'}</div>
        <Link to="/customers" style={{ color: '#6366f1' }}>← Back to Customers</Link>
      </div>
    );
  }

  const { customer, orders, consentHistory } = data;
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Customer Profile';
  const aovCents = customer.orderCount > 0 ? Math.round(customer.totalSpentCents / customer.orderCount) : 0;

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/customers" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>
          ← Back to Customer Directory
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', margin: '0' }}>{fullName}</h1>
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#064e3b', color: '#6ee7b7', fontSize: '12px', fontWeight: 600 }}>
              Active
            </span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
            {customer.email} {customer.phone && `• ${customer.phone}`} • Store: {activeStore?.name || customer.storeId} • Registered: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExport}
            style={{ padding: '8px 14px', background: '#1e3a8a', color: '#93c5fd', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
          >
            Export All Data (GDPR)
          </button>
          <button
            disabled={isDeleting}
            onClick={handleDelete}
            style={{ padding: '8px 14px', background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
          >
            {isDeleting ? 'Erasing...' : 'Erase Profile (GDPR)'}
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Segment</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', textTransform: 'capitalize' }}>
            {customer.segment.replace('_', ' ')}
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Total Spend</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
            {formatCurrency(customer.totalSpentCents)}
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Lifetime Orders</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>
            {customer.orderCount}
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Average Order Value</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>
            {formatCurrency(aovCents)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left column: Orders */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: '0 0 16px 0' }}>
            Order History ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>No orders recorded for this customer account.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map(order => (
                <div
                  key={order.id || order._id}
                  style={{
                    padding: '16px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                      Order #{order.orderNumber || order._id}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                      {order.discountCode && ` • Promo: ${order.discountCode}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                      {formatCurrency(order.totalCents || 0)}
                    </div>
                    <Link
                      to={`/orders/${order.id || order._id}`}
                      style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none' }}
                    >
                      View Order →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Addresses & Marketing Consent */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Addresses */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: '0 0 16px 0' }}>
              Saved Addresses ({customer.addresses?.length || 0})
            </h3>
            {customer.addresses?.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>No shipping addresses stored.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {customer.addresses?.map((addr, idx) => (
                  <div key={idx} style={{ padding: '12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{addr.label || 'Address'}</span>
                      {addr.isDefault && (
                        <span style={{ fontSize: '11px', background: '#312e81', color: '#c7d2fe', padding: '2px 6px', borderRadius: '4px' }}>Default</span>
                      )}
                    </div>
                    <div>{addr.street}</div>
                    <div>{addr.city}, {addr.state} {addr.postalCode}</div>
                    <div>{addr.country}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Marketing Consent & Audit Trail */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: '0 0 12px 0' }}>
              Marketing Consent Status
            </h3>
            <div style={{ marginBottom: '16px', padding: '12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Email Marketing:</span>
                <span style={{ fontWeight: 600, color: customer.marketingConsent?.emailOptIn ? '#34d399' : '#f87171' }}>
                  {customer.marketingConsent?.emailOptIn ? 'Opted In' : 'Opted Out'}
                </span>
              </div>
              {customer.marketingConsent?.optInDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                  <span>Opt-in timestamp:</span>
                  <span>{new Date(customer.marketingConsent.optInDate).toLocaleString()}</span>
                </div>
              )}
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', margin: '0 0 10px 0' }}>
              Consent Audit Trail ({consentHistory.length})
            </h4>
            {consentHistory.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>No recorded consent transition events.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {consentHistory.map(entry => (
                  <div key={entry.id || entry._id} style={{ padding: '8px', background: '#0f172a', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span style={{ fontWeight: 600 }}>{entry.action}</span>
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>Source: {entry.source} {entry.ipAddress && `• IP: ${entry.ipAddress}`}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
