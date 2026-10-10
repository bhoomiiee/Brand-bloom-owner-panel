import React from 'react';

export const MinimalTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="theme-minimal">{children}</div>;
};
