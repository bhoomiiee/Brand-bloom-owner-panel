import React from 'react';

export const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  return <span title={content}>{children}</span>;
};
