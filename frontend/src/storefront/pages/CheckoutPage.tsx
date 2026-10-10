import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCartStore } from '../../store/cart.store';
import { formatCurrency } from '../../utils/currency';

import { useCustomerAuthStore } from '../../store/customer-auth.store';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const CheckoutPage: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { items, totalCents, clearCart } = useCartStore();
  const { customer, isAuthenticated } = useCustomerAuthStore();

  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [storeId, setStoreId] = useState<string | null>(null);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const [serverTotals, setServerTotals] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prepopulate if customer is authenticated
  useEffect(() => {
    if (isAuthenticated && customer) {
      if (!email) setEmail(customer.email);
      const defaultAddr = customer.addresses?.find((a: any) => a.isDefault) || customer.addresses?.[0];
      if (defaultAddr) {
        if (!street) setStreet(defaultAddr.street || '');
        if (!city) setCity(defaultAddr.city || '');
        if (!state) setState(defaultAddr.state || '');
        if (!postalCode) setPostalCode(defaultAddr.postalCode || '');
      }
    }
  }, [isAuthenticated, customer]);

  useEffect(() => {
    if (!storeSlug) return;
    fetch(`${BASE_URL}/storefront/${storeSlug}/config`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data?.store?.id) {
          setStoreId(res.data.store.id);
        }
      })
      .catch(err => {
        console.error('Failed to load store for checkout', err);
      });
  }, [storeSlug]);

  useEffect(() => {
    if (!storeId || items.length === 0) return;
    fetch(`${BASE_URL}/checkout/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeId,
        items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
        promotionCode: appliedPromo?.code || undefined
      })
    })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setServerTotals(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to calculate server totals', err);
      });
  }, [storeId, items, appliedPromo]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim() || !storeSlug) return;

    setPromoError(null);
    setIsValidatingPromo(true);

    try {
      const subtotal = totalCents();
      const res = await fetch(
        `${BASE_URL}/storefront/${storeSlug}/promotions/validate?code=${encodeURIComponent(promoCodeInput.trim())}&subtotalCents=${subtotal}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Invalid promotion code');
      }

      setAppliedPromo(data.data.promotion);
      setPromoCodeInput('');
    } catch (err: any) {
      setPromoError(err.message || 'Promotion code not valid');
      setAppliedPromo(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '640px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#111827' }}>Your bag is empty</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Add items to your cart before proceeding to checkout.</p>
        <Link to={`/store/${storeSlug}`} style={{ color: '#4f46e5', fontWeight: 600 }}>← Return to Storefront</Link>
      </div>
    );
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) {
      setError('Store information could not be verified.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        storeId,
        customerEmail: email,
        customerId: customer?.id || undefined,
        promotionCode: appliedPromo?.code || undefined,
        items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
        shippingAddress: {
          street: street || '100 Main St',
          city: city || 'New York',
          state: state || 'NY',
          postalCode: postalCode || '10001',
          country: 'US'
        }
      };

      const res = await fetch(`${BASE_URL}/checkout/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message || 'Checkout failed. Please check inventory and try again.');
      }

      const order = body.data?.order || body.data;
      const orderNumber = order.orderNumber || order._id;

      clearCart();
      navigate(`/store/${storeSlug}/order-confirmed/${orderNumber}`);
    } catch (err: any) {
      setError(err.message || 'Payment processing error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedTotal = serverTotals?.totalCents ?? totalCents();

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px', color: '#111827' }}>Checkout</h1>

      {error && (
        <div style={{ marginBottom: '20px', padding: '14px 18px', background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', borderRadius: '8px', fontSize: '14px' }}>
          <strong>Checkout Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {isAuthenticated && customer ? (
          <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '14px', color: '#065f46' }}>
            ✓ Signed in as <strong>{customer.email}</strong>. This order will automatically link to your customer profile!
          </div>
        ) : (
          <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#475569' }}>
            Already have an account? <Link to={`/store/${storeSlug}/account/login`} style={{ color: '#4f46e5', fontWeight: 600 }}>Sign in</Link> to use your saved addresses and track this order.
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="customer@example.com"
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Shipping Street Address</label>
          <input
            type="text"
            value={street}
            onChange={e => setStreet(e.target.value)}
            placeholder="123 Orchard Ave, Apt 4"
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>City</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="New York"
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>State</label>
            <input
              type="text"
              value={state}
              onChange={e => setState(e.target.value)}
              placeholder="NY"
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Postal Code</label>
            <input
              type="text"
              value={postalCode}
              onChange={e => setPostalCode(e.target.value)}
              placeholder="10001"
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Promo Code Box */}
        <div style={{ padding: '16px', background: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#6b21a8', marginBottom: '6px' }}>Promotional Code</label>
          {appliedPromo ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f3e8ff', borderRadius: '6px', fontSize: '14px', color: '#581c87' }}>
              <span>🎟️ Code <strong>{appliedPromo.code}</strong> applied ({appliedPromo.type === 'PERCENTAGE' ? `${appliedPromo.value}% OFF` : `${formatCurrency(appliedPromo.value)} OFF`})</span>
              <button
                type="button"
                onClick={handleRemovePromo}
                style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={promoCodeInput}
                onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME10"
                style={{ flex: 1, padding: '10px 12px', border: '1px solid #d8b4fe', borderRadius: '6px', fontSize: '14px', textTransform: 'uppercase' }}
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={isValidatingPromo || !promoCodeInput.trim()}
                style={{ padding: '10px 18px', background: '#7e22ce', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
              >
                {isValidatingPromo ? 'Checking...' : 'Apply'}
              </button>
            </div>
          )}
          {promoError && (
            <div style={{ marginTop: '8px', color: '#b91c1c', fontSize: '13px' }}>
              {promoError}
            </div>
          )}
        </div>

        <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151' }}>Order Summary ({items.length} items)</h4>
          {items.map(item => (
            <div key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#4b5563' }}>
              <span>{item.title} × {item.quantity}</span>
              <span>{formatCurrency(item.priceCents * item.quantity)}</span>
            </div>
          ))}

          {serverTotals?.discountCents > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#059669', fontWeight: 600 }}>
              <span>Discount ({appliedPromo?.code || 'Applied'})</span>
              <span>- {formatCurrency(serverTotals.discountCents)}</span>
            </div>
          )}

          {serverTotals?.taxCents > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#6b7280' }}>
              <span>Estimated Tax</span>
              <span>{formatCurrency(serverTotals.taxCents)}</span>
            </div>
          )}

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#111827' }}>
            <span>Total Due (Server Authoritative)</span>
            <span>{formatCurrency(calculatedTotal)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '16px',
            background: isSubmitting ? '#9ca3af' : '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Processing Payment & Stock...' : `Pay & Complete Purchase (${formatCurrency(calculatedTotal)})`}
        </button>
      </form>
    </div>
  );
};
