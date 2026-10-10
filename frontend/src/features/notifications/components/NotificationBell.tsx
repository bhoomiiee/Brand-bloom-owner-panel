import React, { useState } from 'react';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const mockNotifications = [
    { id: 1, title: 'New Customer Registered', time: '10m ago', unread: true },
    { id: 2, title: 'Order #1042 Dispatched', time: '1h ago', unread: true },
    { id: 3, title: 'Botanical Inventory Alert: 3 SKUs Low', time: '3h ago', unread: false }
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--bb-burgundy)',
          fontSize: '18px',
          borderRadius: '8px',
          transition: 'background 0.15s ease'
        }}
        title="Notifications"
      >
        🔔
        <span
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--bb-dusty-rose)',
            boxShadow: '0 0 0 2px var(--bb-white)'
          }}
        />
      </button>

      {isOpen && (
        <div
          className="bb-card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '280px',
            padding: '14px',
            zIndex: 50,
            background: 'var(--bb-white)',
            boxShadow: '0 12px 28px -4px rgba(99, 45, 64, 0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--bb-border)' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--bb-burgundy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🌸</span> Notifications
            </span>
            <span style={{ fontSize: '11px', background: 'var(--bb-soft-blush)', color: 'var(--bb-burgundy)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              2 new
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mockNotifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: n.unread ? 'var(--bb-soft-blush-light)' : 'transparent',
                  border: n.unread ? '1px solid rgba(189, 124, 145, 0.2)' : 'none'
                }}
              >
                <div style={{ fontSize: '12.5px', fontWeight: n.unread ? 600 : 500, color: 'var(--bb-dark-text)' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--bb-muted-text)', marginTop: '2px' }}>
                  {n.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
