import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BotanicalCornerFoliage, BotanicalFooter } from '../botanical/BotanicalDecorations';

export const OwnerLayout: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--bb-warm-offwhite)',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          position: 'relative',
          background: 'var(--bb-warm-offwhite)'
        }}
      >
        {/* Delicate botanical accent in page background top-right corner */}
        <BotanicalCornerFoliage position="top-right" size={260} opacity={0.35} />

        <Topbar />

        <main
          style={{
            flex: 1,
            padding: '32px 36px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Outlet />
        </main>

        {/* Decorative botanical footer */}
        <BotanicalFooter />
      </div>
    </div>
  );
};
