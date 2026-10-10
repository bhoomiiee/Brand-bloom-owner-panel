import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCartStore } from '../../store/cart.store';
import { formatCurrency } from '../../utils/currency';

export const CartPage: React.FC = () => {
  const { storeSlug } = useParams();
  const { items, removeItem, totalCents } = useCartStore();

  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Your shopping bag is empty</h2>
        <Link to={`/store/${storeSlug}`} style={{ color: '#6366f1', fontWeight: 600 }}>Explore products →</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Shopping Bag</h1>
      <div style={{ borderTop: '1px solid #e5e7eb' }}>
        {items.map(item => (
          <div key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <h4 style={{ fontWeight: 600 }}>{item.title}</h4>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Qty: {item.quantity}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{formatCurrency(item.priceCents * item.quantity)}</div>
              <button onClick={() => removeItem(item.variantId)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 700 }}>
        <span>Subtotal</span>
        <span>{formatCurrency(totalCents())}</span>
      </div>
      <Link to={`/store/${storeSlug}/checkout`}>
        <button style={{
          width: '100%', padding: '16px', background: '#111827', color: '#fff',
          border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '24px'
        }}>
          Proceed to Checkout
        </button>
      </Link>
    </div>
  );
};
