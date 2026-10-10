import React from 'react';

export const OrderTimeline: React.FC<{ events: any[] }> = ({ events }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <h4>Timeline</h4>
      {events?.map((e, idx) => (
        <div key={idx} style={{ padding: '8px 0', fontSize: '13px', color: '#94a3b8' }}>
          Transitioned to <strong>{e.toStatus}</strong> by {e.actor}
        </div>
      ))}
    </div>
  );
};
