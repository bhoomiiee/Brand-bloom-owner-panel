import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerApi } from '../api/customer.api';
import { useCustomerAuthStore, CustomerAddress } from '../../store/customer-auth.store';
import { formatCurrency } from '../../utils/currency';

export const CustomerAccountPage: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { customer, isAuthenticated, updateCustomer, logout } = useCustomerAuthStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'preferences'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Address form
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');

  // Preferences
  const [emailOptIn, setEmailOptIn] = useState(customer?.marketingConsent?.emailOptIn ?? true);
  const [prefMessage, setPrefMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !customer) {
      navigate(`/store/${storeSlug}/account/login`);
      return;
    }

    if (storeSlug) {
      loadOrders();
    }
  }, [isAuthenticated, storeSlug]);

  const loadOrders = async () => {
    if (!storeSlug) return;
    setIsLoadingOrders(true);
    try {
      const data = await customerApi.getOrders(storeSlug);
      setOrders(Array.isArray(data) ? data : ((data as any)?.orders || []));
    } catch {
      // Ignored
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleClaimOrders = async () => {
    if (!storeSlug || isClaiming) return;
    setIsClaiming(true);
    setClaimMessage(null);
    try {
      const res = await customerApi.claimGuestOrders(storeSlug);
      setClaimMessage(`Success: ${res.claimedCount} previous order(s) claimed and linked to your account!`);
      loadOrders();
      // Refresh profile
      const prof = await customerApi.getProfile(storeSlug);
      updateCustomer(prof);
    } catch (err: any) {
      setClaimMessage(err.message || 'Failed to claim orders');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug) return;
    try {
      const updated = await customerApi.addAddress(storeSlug, {
        fullName,
        street,
        city,
        state,
        country,
        postalCode
      });
      updateCustomer(updated);
      setIsAddingAddress(false);
      setFullName('');
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!storeSlug) return;
    try {
      const updated = await customerApi.deleteAddress(storeSlug, addressId);
      updateCustomer(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to remove address');
    }
  };

  const handleSavePreferences = async () => {
    if (!storeSlug) return;
    try {
      const updated = await customerApi.updateConsent(storeSlug, emailOptIn);
      updateCustomer(updated);
      setPrefMessage('Marketing preferences updated successfully!');
      setTimeout(() => setPrefMessage(null), 3000);
    } catch (err: any) {
      setPrefMessage(err.message || 'Failed to update preferences');
    }
  };

  const handleLogout = () => {
    logout();
    navigate(`/store/${storeSlug}`);
  };

  if (!customer) return null;

  return (
    <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 24px' }}>
      {/* Account Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bb-border)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--bb-burgundy)' }}>
            Hello, {customer.firstName}!
          </h1>
          <p style={{ margin: 0, color: 'var(--bb-muted-text)', fontSize: '14px' }}>
            {customer.email} | Total Orders: <strong style={{ color: 'var(--bb-dark-text)' }}>{orders.length}</strong> | Lifetime Spend:{' '}
            <strong style={{ color: 'var(--bb-burgundy)' }}>{formatCurrency(customer.totalSpendCents || 0)}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleClaimOrders}
            disabled={isClaiming}
            style={{
              padding: '9px 16px',
              background: 'var(--bb-soft-blush)',
              color: 'var(--bb-burgundy)',
              border: '1px solid rgba(189, 124, 145, 0.4)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isClaiming ? 'not-allowed' : 'pointer'
            }}
          >
            {isClaiming ? 'Checking...' : '🔄 Link Past Guest Orders'}
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '9px 16px',
              background: 'var(--bb-white)',
              color: '#b91c1c',
              border: '1px solid var(--bb-border)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {claimMessage && (
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#166534', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '24px', fontWeight: 500 }}>
          {claimMessage}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--bb-border)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '2.5px solid var(--bb-burgundy)' : '2.5px solid transparent',
            fontWeight: activeTab === 'orders' ? 700 : 500,
            color: activeTab === 'orders' ? 'var(--bb-burgundy)' : 'var(--bb-muted-text)',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Orders &amp; Tracking ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'addresses' ? '2.5px solid var(--bb-burgundy)' : '2.5px solid transparent',
            fontWeight: activeTab === 'addresses' ? 700 : 500,
            color: activeTab === 'addresses' ? 'var(--bb-burgundy)' : 'var(--bb-muted-text)',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Saved Addresses ({customer.addresses?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'preferences' ? '2.5px solid var(--bb-burgundy)' : '2.5px solid transparent',
            fontWeight: activeTab === 'preferences' ? 700 : 500,
            color: activeTab === 'preferences' ? 'var(--bb-burgundy)' : 'var(--bb-muted-text)',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Marketing Preferences
        </button>
      </div>

      {/* TAB: ORDERS */}
      {activeTab === 'orders' && (
        <div>
          {isLoadingOrders ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', margin: '0 0 8px 0' }}>No orders found yet</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>Start shopping to see your orders and tracking status here.</p>
              <button
                onClick={() => navigate(`/store/${storeSlug}`)}
                style={{ padding: '10px 20px', background: '#111827', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Browse Store
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((o) => (
                <div key={o._id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Order #{o.orderNumber}</span>
                      <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '12px' }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: o.status === 'PAID' ? '#dcfce7' : '#f3f4f6',
                        color: o.status === 'PAID' ? '#166534' : '#374151'
                      }}>
                        {o.status}
                      </span>
                      <strong style={{ fontSize: '15px', color: '#111827' }}>{formatCurrency(o.totalCents)}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {o.items?.map((item: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563' }}>
                        <span>{item.quantity}x {item.title}</span>
                        <span>{formatCurrency(item.priceCents * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {o.shippingAddress && (
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', fontSize: '12px', color: '#6b7280' }}>
                      <strong>Shipping to:</strong> {o.shippingAddress.fullName}, {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.postalCode}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Saved Delivery Addresses</h2>
            {!isAddingAddress && (
              <button
                onClick={() => setIsAddingAddress(true)}
                style={{ padding: '8px 16px', background: '#111827', color: '#ffffff', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add Address
              </button>
            )}
          </div>

          {isAddingAddress && (
            <form onSubmit={handleAddAddress} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0' }}>New Delivery Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input
                  placeholder="Full Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                />
                <input
                  placeholder="Street Address"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  required
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                />
                <input
                  placeholder="City"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                />
                <input
                  placeholder="State / Province"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                />
                <input
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  required
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                />
                <input
                  placeholder="Country"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  required
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#111827', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {customer.addresses?.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>No saved addresses. Add an address for faster checkout.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {customer.addresses?.map((addr) => (
                <div key={addr.id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', background: '#ffffff', position: 'relative' }}>
                  {addr.isDefault && (
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px', marginBottom: '8px', display: 'inline-block' }}>
                      DEFAULT
                    </span>
                  )}
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700 }}>{addr.fullName}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}>
                    {addr.street}<br />
                    {addr.city}, {addr.state} {addr.postalCode}<br />
                    {addr.country}
                  </p>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    style={{ marginTop: '12px', background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div style={{ maxWidth: '540px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>Communication & Privacy</h2>

          {prefMessage && (
            <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
              {prefMessage}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailOptIn}
                onChange={e => setEmailOptIn(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <div>
                <strong style={{ fontSize: '14px', color: '#111827', display: 'block' }}>Email Marketing Updates</strong>
                <span style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
                  Receive announcements about new collections, seasonal sales, and tailored discount vouchers.
                </span>
              </div>
            </label>
          </div>

          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px', lineHeight: 1.4 }}>
            Transactional order updates and receipts are essential for your purchases and will always be delivered regardless of marketing settings.
          </div>

          <button
            onClick={handleSavePreferences}
            style={{ padding: '10px 20px', background: '#111827', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
};
