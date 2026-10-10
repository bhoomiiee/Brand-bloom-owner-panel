import React from 'react';

/**
 * BrandBloom Botanical Art System — Option 4 Palette
 * Layered botanical vectors featuring Burgundy (#632D40), Dusty Rose (#BD7C91),
 * Soft Blush (#F1D9DF), and warm botanical tints with graceful organic curves.
 */

/**
 * 1. BotanicalSidebarFoliage
 * Large, elegant foliage composition positioned along the bottom-left of the sidebar.
 * Placed behind sidebar content with pointer-events: none.
 */
export const BotanicalSidebarFoliage: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className,
  style
}) => {
  return (
    <div
      className={`botanical-sway ${className || ''}`}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '240px',
        height: '280px',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        opacity: 0.35,
        ...style
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 240 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="sbStemGrad" x1="0" y1="280" x2="180" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F1D9DF" stopOpacity="0.8" />
            <stop offset="0.6" stopColor="#BD7C91" stopOpacity="0.6" />
            <stop offset="1" stopColor="#F1D9DF" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="sbLeafGrad1" x1="0" y1="200" x2="140" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#BD7C91" stopOpacity="0.85" />
            <stop offset="1" stopColor="#F1D9DF" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="sbLeafGrad2" x1="40" y1="280" x2="200" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F1D9DF" stopOpacity="0.75" />
            <stop offset="1" stopColor="#BD7C91" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="sbPetalGrad" x1="80" y1="120" x2="160" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FAF0F3" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#F1D9DF" stopOpacity="0.7" />
            <stop offset="1" stopColor="#BD7C91" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Primary graceful stem curving upwards */}
        <path
          d="M -10 290 Q 30 210 50 160 T 120 70 Q 150 30 190 10"
          stroke="url(#sbStemGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Secondary branching stem */}
        <path
          d="M 40 185 Q 85 160 130 145 T 180 120"
          stroke="url(#sbStemGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Tertiary lower stem */}
        <path
          d="M 15 250 Q 70 230 110 210"
          stroke="url(#sbStemGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Lower Leaves */}
        <path
          d="M 15 250 C 35 220 80 225 90 245 C 80 260 40 265 15 250 Z"
          fill="url(#sbLeafGrad2)"
        />
        <path
          d="M 50 235 C 75 205 120 215 125 235 C 110 248 70 250 50 235 Z"
          fill="url(#sbLeafGrad1)"
        />

        {/* Mid-height curving leaves */}
        <path
          d="M 45 170 C 50 130 100 125 115 145 C 105 165 70 178 45 170 Z"
          fill="url(#sbLeafGrad1)"
        />
        <path
          d="M 75 160 C 105 130 145 138 150 158 C 135 172 95 174 75 160 Z"
          fill="url(#sbLeafGrad2)"
        />
        <path
          d="M 120 148 C 145 120 180 125 188 140 C 175 155 140 158 120 148 Z"
          fill="url(#sbLeafGrad1)"
        />

        {/* Upper delicate leaves */}
        <path
          d="M 85 115 C 85 80 125 75 140 92 C 130 110 105 120 85 115 Z"
          fill="url(#sbLeafGrad2)"
        />
        <path
          d="M 115 75 C 130 45 170 48 175 68 C 160 80 130 84 115 75 Z"
          fill="url(#sbLeafGrad1)"
        />
        <path
          d="M 150 40 C 165 15 200 18 208 35 C 195 48 170 50 150 40 Z"
          fill="url(#sbLeafGrad2)"
        />

        {/* Soft blooming petals / buds at top branch */}
        <path
          d="M 185 15 C 198 2 215 8 218 22 C 208 30 192 26 185 15 Z"
          fill="url(#sbPetalGrad)"
        />
        <ellipse cx="205" cy="18" rx="8" ry="14" transform="rotate(35 205 18)" fill="url(#sbPetalGrad)" />
        <ellipse cx="140" cy="85" rx="5" ry="9" transform="rotate(-25 140 85)" fill="url(#sbPetalGrad)" opacity="0.8" />
        <ellipse cx="95" cy="140" rx="4" ry="7" transform="rotate(20 95 140)" fill="url(#sbPetalGrad)" opacity="0.6" />
      </svg>
    </div>
  );
};

/**
 * 2. BotanicalCornerFoliage
 * Versatile corner sprig for dashboard backgrounds, stores page corners, or page edges.
 */
export const BotanicalCornerFoliage: React.FC<{
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: number | string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({
  position = 'top-right',
  size = 220,
  opacity = 0.45,
  className,
  style
}) => {
  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'top-right':
        return { top: 0, right: 0, transform: 'none' };
      case 'top-left':
        return { top: 0, left: 0, transform: 'scaleX(-1)' };
      case 'bottom-right':
        return { bottom: 0, right: 0, transform: 'scaleY(-1)' };
      case 'bottom-left':
        return { bottom: 0, left: 0, transform: 'scale(-1, -1)' };
      default:
        return { top: 0, right: 0 };
    }
  };

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size * 0.9}px` : size,
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
        overflow: 'hidden',
        ...getPositionStyles(),
        ...style
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 220 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id={`crnStem_${position}`} x1="220" y1="0" x2="30" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#BD7C91" stopOpacity="0.8" />
            <stop offset="1" stopColor="#632D40" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={`crnLeaf1_${position}`} x1="180" y1="30" x2="80" y2="130" gradientUnits="userSpaceOnUse">
            <stop stopColor="#BD7C91" stopOpacity="0.75" />
            <stop offset="1" stopColor="#F1D9DF" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={`crnLeaf2_${position}`} x1="160" y1="10" x2="60" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#632D40" stopOpacity="0.6" />
            <stop offset="1" stopColor="#BD7C91" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={`crnPetal_${position}`} x1="120" y1="70" x2="40" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F1D9DF" stopOpacity="0.9" />
            <stop offset="1" stopColor="#BD7C91" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Graceful arching stem from corner */}
        <path
          d="M 230 -10 Q 170 30 130 80 T 50 150 Q 20 175 0 195"
          stroke={`url(#crnStem_${position})`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Secondary branch */}
        <path
          d="M 150 55 Q 115 70 85 100 T 45 130"
          stroke={`url(#crnStem_${position})`}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Cascading leaves */}
        <path
          d="M 195 10 C 165 15 150 42 165 52 C 182 48 198 30 195 10 Z"
          fill={`url(#crnLeaf1_${position})`}
        />
        <path
          d="M 170 30 C 135 32 125 58 140 68 C 158 65 172 48 170 30 Z"
          fill={`url(#crnLeaf2_${position})`}
        />
        <path
          d="M 140 65 C 108 68 98 92 112 104 C 130 100 142 85 140 65 Z"
          fill={`url(#crnLeaf1_${position})`}
        />
        <path
          d="M 110 88 C 80 92 72 114 85 125 C 102 122 112 106 110 88 Z"
          fill={`url(#crnLeaf2_${position})`}
        />
        <path
          d="M 75 120 C 48 126 42 148 55 158 C 70 154 78 138 75 120 Z"
          fill={`url(#crnLeaf1_${position})`}
        />

        {/* Delicate flower petals and buds */}
        <ellipse cx="60" cy="145" rx="8" ry="14" transform="rotate(-30 60 145)" fill={`url(#crnPetal_${position})`} />
        <ellipse cx="38" cy="165" rx="7" ry="11" transform="rotate(-40 38 165)" fill={`url(#crnPetal_${position})`} />
        <circle cx="22" cy="180" r="4.5" fill="#BD7C91" opacity="0.7" />
        <circle cx="95" cy="105" r="3" fill="#F1D9DF" opacity="0.8" />
        <circle cx="155" cy="45" r="3.5" fill="#F1D9DF" opacity="0.8" />
      </svg>
    </div>
  );
};

/**
 * 3. BotanicalHeaderLeaves
 * Elegant horizontal decorative leaves tailored for the top-right area of the Topbar / Dashboard header.
 */
export const BotanicalHeaderLeaves: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: '42px',
        width: '140px',
        pointerEvents: 'none',
        opacity: 0.6,
        ...style
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 140 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <path
          d="M 5 28 Q 45 15 85 22 T 135 12"
          stroke="#BD7C91"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M 25 24 C 28 14 42 15 44 23 C 38 27 30 27 25 24 Z"
          fill="#BD7C91"
          opacity="0.8"
        />
        <path
          d="M 50 19 C 55 10 70 12 71 21 C 65 24 56 23 50 19 Z"
          fill="#F1D9DF"
          opacity="0.9"
        />
        <path
          d="M 75 22 C 82 13 96 15 97 23 C 90 26 82 26 75 22 Z"
          fill="#BD7C91"
          opacity="0.75"
        />
        <path
          d="M 102 18 C 110 9 122 11 123 18 C 117 21 108 21 102 18 Z"
          fill="#F1D9DF"
          opacity="0.9"
        />
        <ellipse cx="132" cy="13" rx="4" ry="7" transform="rotate(40 132 13)" fill="#632D40" opacity="0.6" />
      </svg>
    </div>
  );
};

/**
 * 4. BotanicalCardAccent
 * Subtle, sophisticated leaf/petal sprig that sits softly in the corner of a card.
 */
export const BotanicalCardAccent: React.FC<{
  position?: 'top-right' | 'top-left' | 'bottom-right';
  size?: number;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({
  position = 'top-right',
  size = 72,
  opacity = 0.5,
  style
}) => {
  const getStyle = (): React.CSSProperties => {
    switch (position) {
      case 'top-right':
        return { top: 0, right: 0 };
      case 'top-left':
        return { top: 0, left: 0, transform: 'scaleX(-1)' };
      case 'bottom-right':
        return { bottom: 0, right: 0, transform: 'scaleY(-1)' };
      default:
        return { top: 0, right: 0 };
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
        overflow: 'hidden',
        ...getStyle(),
        ...style
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <path
          d="M 74 -2 Q 48 16 32 36 T 10 65"
          stroke="#BD7C91"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 60 8 C 46 10 40 22 47 28 C 56 26 62 18 60 8 Z"
          fill="#BD7C91"
          opacity="0.75"
        />
        <path
          d="M 45 22 C 32 25 28 36 34 41 C 42 39 47 31 45 22 Z"
          fill="#F1D9DF"
          opacity="0.9"
        />
        <path
          d="M 30 38 C 19 41 16 50 22 55 C 29 53 32 46 30 38 Z"
          fill="#BD7C91"
          opacity="0.65"
        />
        <circle cx="14" cy="60" r="3" fill="#632D40" opacity="0.6" />
      </svg>
    </div>
  );
};

/**
 * 5. BotanicalFooter
 * Flowing decorative footer with organic waves, curving vines, and floating petals.
 */
export const BotanicalFooter: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  return (
    <footer
      style={{
        width: '100%',
        marginTop: 'auto',
        position: 'relative',
        padding: '32px 32px 20px',
        borderTop: '1px solid var(--bb-border)',
        background: 'linear-gradient(180deg, transparent 0%, rgba(241, 217, 223, 0.25) 100%)',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Decorative flowing botanical wave background */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.4
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1200 80"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Gentle curving organic wave */}
          <path
            d="M 0 50 Q 300 20 600 45 T 1200 35 L 1200 80 L 0 80 Z"
            fill="#F1D9DF"
            opacity="0.5"
          />
          {/* Subtle floral vines along the wave */}
          <path
            d="M 40 48 Q 90 35 150 42 T 260 38"
            stroke="#BD7C91"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <ellipse cx="100" cy="38" rx="6" ry="3.5" transform="rotate(-15 100 38)" fill="#BD7C91" opacity="0.6" />
          <ellipse cx="180" cy="40" rx="6" ry="3.5" transform="rotate(20 180 40)" fill="#632D40" opacity="0.4" />

          <path
            d="M 920 42 Q 980 30 1040 38 T 1150 32"
            stroke="#BD7C91"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <ellipse cx="980" cy="34" rx="6" ry="3.5" transform="rotate(-10 980 34)" fill="#BD7C91" opacity="0.6" />
          <ellipse cx="1060" cy="36" rx="6" ry="3.5" transform="rotate(15 1060 36)" fill="#632D40" opacity="0.4" />
        </svg>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '1440px',
          margin: '0 auto',
          fontSize: '13px',
          color: 'var(--bb-muted-text)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BotanicalLogoMark size={20} />
          <span style={{ fontWeight: 600, color: 'var(--bb-burgundy)' }}>BrandBloom</span>
          <span>• Merchant Suite</span>
          <span style={{ color: 'var(--bb-border)' }}>|</span>
          <span style={{ fontStyle: 'italic', color: 'var(--bb-dusty-rose)' }}>Crafted with botanical elegance</span>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ color: 'var(--bb-muted-text)' }}>Burgundy &amp; Blush Edition</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

/**
 * 6. BotanicalLogoMark
 * Artistic floral bloom emblem for BrandBloom identity.
 */
export const BotanicalLogoMark: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }> = ({
  size = 28,
  color = '#BD7C91',
  style
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="blmPetalGrad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BD7C91" />
          <stop offset="1" stopColor="#632D40" />
        </linearGradient>
      </defs>
      {/* 4 layered petals forming a blooming flower */}
      <ellipse cx="16" cy="9" rx="4.5" ry="7.5" fill="url(#blmPetalGrad)" opacity="0.9" />
      <ellipse cx="16" cy="23" rx="4.5" ry="7.5" fill="url(#blmPetalGrad)" opacity="0.9" />
      <ellipse cx="9" cy="16" rx="7.5" ry="4.5" fill="url(#blmPetalGrad)" opacity="0.9" />
      <ellipse cx="23" cy="16" rx="7.5" ry="4.5" fill="url(#blmPetalGrad)" opacity="0.9" />
      {/* Diagonal overlapping petals for organic bloom */}
      <ellipse cx="11" cy="11" rx="4" ry="7" transform="rotate(-45 11 11)" fill="#F1D9DF" opacity="0.8" />
      <ellipse cx="21" cy="21" rx="4" ry="7" transform="rotate(-45 21 21)" fill="#F1D9DF" opacity="0.8" />
      <ellipse cx="21" cy="11" rx="4" ry="7" transform="rotate(45 21 11)" fill="#F1D9DF" opacity="0.8" />
      <ellipse cx="11" cy="21" rx="4" ry="7" transform="rotate(45 11 21)" fill="#F1D9DF" opacity="0.8" />
      {/* Center flower pistil */}
      <circle cx="16" cy="16" r="3.2" fill="#FFFFFF" />
      <circle cx="16" cy="16" r="1.8" fill="#632D40" />
    </svg>
  );
};
