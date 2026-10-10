import React from 'react';

export const BoldTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="theme-bold">{children}</div>;
};
