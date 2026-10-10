import React from 'react';

export const ProductImageGallery: React.FC<{ images: string[] }> = ({ images }) => {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {images.map((img, i) => (
        <img key={i} src={img} alt="Product" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
      ))}
    </div>
  );
};
