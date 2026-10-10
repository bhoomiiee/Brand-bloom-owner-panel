import React from 'react';
import { ThemeCard } from './ThemeCard';

export const ThemeGallery: React.FC<{ activeTheme: string; onSelect: (id: string) => void }> = ({ activeTheme, onSelect }) => {
  const themes = [
    { id: 'minimal', name: 'Minimal', desc: 'Clean, high-contrast typography first' },
    { id: 'editorial', name: 'Editorial', desc: 'Serif headings, warm magazine layout' },
    { id: 'bold', name: 'Bold', desc: 'Vibrant neon accents, dark backgrounds' },
    { id: 'boutique', name: 'Boutique', desc: 'Artisanal earth tones, luxury styling' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {themes.map(t => (
        <ThemeCard key={t.id} theme={t} isSelected={activeTheme === t.id} onSelect={() => onSelect(t.id)} />
      ))}
    </div>
  );
};
