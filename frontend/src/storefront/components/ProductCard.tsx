import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import { useCartStore } from '../../store/cart.store';

export const ProductCard: React.FC<{ product: any }> = ({ product }) => {
  const { storeSlug } = useParams();
  const { addItem } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      variantId: product.defaultVariantId || product._id,
      title: product.title,
      priceCents: product.basePriceCents,
      quantity: 1
    });
  };

  return (
    <Link to={`/store/${storeSlug}/product/${product.slug}`} style={{ display: 'flex', flexDirection: 'column', color: 'inherit' }}>
      <div style={{
        position: 'relative', aspectRatio: '3/4', background: '#f1f5f9', borderRadius: '12px',
        overflow: 'hidden', marginBottom: '12px'
      }}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'}
          alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <button
          onClick={handleQuickAdd}
          style={{
            position: 'absolute', bottom: '12px', right: '12px', padding: '8px 14px',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', border: 'none',
            borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
          }}
        >
          + Quick Add
        </button>
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{product.title}</h3>
      <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>
        {formatCurrency(product.basePriceCents)}
      </span>
    </Link>
  );
};
