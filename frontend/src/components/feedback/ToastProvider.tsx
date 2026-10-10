import React, { createContext, useContext, useState } from 'react';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

const ToastContext = createContext<{ showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }>({
  showToast: () => {}
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '12px 18px', borderRadius: '8px', background: t.type === 'error' ? '#ef4444' : '#10b981',
            color: '#fff', fontSize: '14px', fontWeight: 500, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
