import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const OrderConfirmationPage: React.FC = () => {
  const { storeSlug, orderId } = useParams();

  return (
    <div style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '28px' }}>
        ✓
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>Thank you for your order!</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Your order <strong>#{orderId}</strong> has been received and is being prepared for shipment.
      </p>
      <Link to={`/store/${storeSlug}`} style={{ padding: '12px 24px', background: '#111827', color: '#fff', borderRadius: '6px', fontWeight: 600 }}>
        Return to Store
      </Link>
    </div>
  );
};
