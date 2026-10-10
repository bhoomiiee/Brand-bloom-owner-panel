import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import { useCartStore } from '../../store/cart.store';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const ProductDetailsPage: React.FC = () => {
  const { storeSlug, productSlug } = useParams<{ storeSlug: string; productSlug: string }>();
  const { addItem } = useCartStore();

  const [productData, setProductData] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeSlug || !productSlug) return;
    setIsLoading(true);
    fetch(`${BASE_URL}/storefront/${storeSlug}/products/${productSlug}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setProductData(res.data);
          const firstInStock = res.data.variants?.find((v: any) => v.inStock) || res.data.variants?.[0];
          setSelectedVariant(firstInStock || null);
        } else {
          setError(res.error?.message || 'Product not found');
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to load product details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [storeSlug, productSlug]);

  if (isLoading) {
    return <div style={{ padding: '80px 20px', textAlign: 'center', color: '#6b7280' }}>Loading product details...</div>;
  }

  if (error || !productData?.product) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#111827' }}>Product Unavailable</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error || 'This product does not exist or has been archived.'}</p>
        <Link to={`/store/${storeSlug}`} style={{ color: '#4f46e5', fontWeight: 600 }}>← Return to Storefront</Link>
      </div>
    );
  }

  const { product, variants = [] } = productData;
  const currentPriceCents = selectedVariant?.priceCents || product.basePriceCents;
  const inStock = selectedVariant ? selectedVariant.inStock : true;

  const handleAdd = () => {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant._id,
      title: `${product.title} - ${selectedVariant.title || selectedVariant.sku}`,
      priceCents: currentPriceCents,
      quantity
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
      <div style={{ borderRadius: '16px', overflow: 'hidden', aspectRatio: '4/5', background: '#f1f5f9' }}>
        <img
          src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'}
          alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div>
        <Link to={`/store/${storeSlug}`} style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none', marginBottom: '12px', display: 'inline-block' }}>
          ← Back to Catalog
        </Link>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', color: '#111827' }}>{product.title}</h1>
        <div style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '20px' }}>
          {formatCurrency(currentPriceCents)}
        </div>
        <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '28px' }}>
          {product.description || 'Crafted with premium materials and attention to detail.'}
        </p>

        {variants.length > 1 && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Select Variant</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {variants.map((v: any) => (
                <button
                  key={v._id}
                  onClick={() => setSelectedVariant(v)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: selectedVariant?._id === v._id ? '2px solid #111827' : '1px solid #d1d5db',
                    background: selectedVariant?._id === v._id ? '#111827' : '#ffffff',
                    color: selectedVariant?._id === v._id ? '#ffffff' : '#374151',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {v.title || v.sku} {v.inStock ? '' : '(Out of Stock)'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Quantity:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            style={{ width: '70px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', textAlign: 'center' }}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!inStock}
          style={{
            width: '100%',
            padding: '16px',
            background: inStock ? '#111827' : '#9ca3af',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: inStock ? 'pointer' : 'not-allowed'
          }}
        >
          {inStock ? 'Add to Bag' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};
