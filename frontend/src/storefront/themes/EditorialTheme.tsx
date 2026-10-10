import React from 'react';

export const EditorialTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="theme-editorial">{children}</div>;
};
