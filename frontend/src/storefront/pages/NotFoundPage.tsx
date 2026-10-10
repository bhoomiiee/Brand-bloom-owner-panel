import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ padding: '120px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px' }}>404</h1>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>The page you are looking for does not exist.</p>
      <Link to="/" style={{ color: '#6366f1', fontWeight: 600 }}>← Return to Portal</Link>
    </div>
  );
};
