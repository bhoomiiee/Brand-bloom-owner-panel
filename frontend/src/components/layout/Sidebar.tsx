import React from 'react';
import { NavLink } from 'react-router-dom';
import { useActiveStoreStore } from '../../store/active-store.store';
import { BotanicalSidebarFoliage, BotanicalLogoMark } from '../botanical/BotanicalDecorations';

export const Sidebar: React.FC = () => {
  const { activeStore } = useActiveStoreStore();
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Products', path: '/products', icon: '🏷️' },
    { label: 'Categories', path: '/categories', icon: '🗂️' },
    { label: 'Inventory', path: '/inventory', icon: '📦' },
    { label: 'Orders', path: '/orders', icon: '🛍️' },
    { label: 'Customers (CRM)', path: '/customers', icon: '👥' },
    { label: 'Campaigns', path: '/campaigns', icon: '📣' },
    { label: 'Promotions', path: '/promotions', icon: '🎟️' },
    { label: 'Marketing ROI', path: '/marketing/analytics', icon: '📈' },
    { label: 'Theme Studio', path: '/theme', icon: '🎨' },
    { label: 'Team', path: '/team', icon: '🤝' },
    { label: 'Analytics', path: '/analytics', icon: '📉' },
    { label: 'AI Assistant', path: '/assistant', icon: '✨' },
    { label: 'Settings', path: '/settings', icon: '⚙️' }
  ];

  return (
    <aside
      style={{
        width: '260px',
        background: 'var(--bb-burgundy)',
        borderRight: '1px solid var(--bb-burgundy-dark)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '4px 0 20px rgba(61, 32, 43, 0.15)',
        zIndex: 10
      }}
    >
      {/* Botanical Sidebar Foliage at bottom-left */}
      <BotanicalSidebarFoliage />

      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(241, 217, 223, 0.15)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BotanicalLogoMark size={28} />
          <div>
            <h2
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--bb-white)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}
            >
              {activeStore?.name || 'BrandBloom'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <span style={{ fontSize: '11px', color: 'var(--bb-soft-blush)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                Merchant Portal
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--bb-dusty-rose)' }} />
              <span style={{ fontSize: '10px', color: 'var(--bb-dusty-rose-light)' }}>Floral Edition</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          position: 'relative',
          zIndex: 1,
          overflowY: 'auto'
        }}
      >
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 14px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--bb-white)' : 'var(--bb-soft-blush)',
              background: isActive ? 'var(--bb-burgundy-dark)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--bb-dusty-rose)' : '3px solid transparent',
              boxShadow: isActive ? 'inset 0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            })}
          >
            <span style={{ fontSize: '14px', opacity: 0.9 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Storefront Link at bottom */}
      {activeStore?.slug && (
        <div
          style={{
            padding: '16px 14px',
            borderTop: '1px solid rgba(241, 217, 223, 0.15)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <a
            href={`/store/${activeStore.slug}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 14px',
              background: 'rgba(241, 217, 223, 0.12)',
              border: '1px solid rgba(241, 217, 223, 0.25)',
              borderRadius: '10px',
              color: 'var(--bb-soft-blush)',
              fontSize: '12.5px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s ease'
            }}
          >
            <span>↗</span>
            <span>Live Storefront</span>
          </a>
        </div>
      )}
    </aside>
  );
};
