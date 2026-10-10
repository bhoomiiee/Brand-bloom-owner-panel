import React from 'react';

export const StoreFooter: React.FC = () => {
  return (
    <footer style={{ padding: '36px 40px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
        <div>Customer Account Portal • Secure Database Management</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Privacy & Security</span>
          <span>Terms of Service</span>
          <span>Support</span>
        </div>
      </div>
    </footer>
  );
};
