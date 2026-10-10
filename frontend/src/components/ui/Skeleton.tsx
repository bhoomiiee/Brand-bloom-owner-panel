import React from 'react';

export const Skeleton: React.FC<{ height?: number | string; width?: number | string; borderRadius?: string }> = ({
  height = '20px', width = '100%', borderRadius = '6px'
}) => {
  return (
    <div style={{
      height, width, borderRadius, background: 'rgba(255,255,255,0.06)'
    }} />
  );
};
