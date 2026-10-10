import React from 'react';

export const ImportPreview: React.FC<{
  previewRows: any[];
  totalRows: number;
  validationErrors?: any[];
}> = ({ previewRows, totalRows, validationErrors = [] }) => {
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ color: '#f8fafc', margin: 0 }}>Import Preview</h4>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
          Found {totalRows} total rows (showing sample of {previewRows.length})
        </span>
      </div>

      {validationErrors.length > 0 && (
        <div style={{ marginBottom: '16px', padding: '12px', background: '#7f1d1d', borderRadius: '8px', fontSize: '13px', color: '#fecaca' }}>
          <strong>Validation warnings ({validationErrors.length}):</strong>
          <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
            {validationErrors.slice(0, 5).map((e: any, idx: number) => (
              <li key={idx}>Row {e.row}: {e.error}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
              <th style={{ padding: '8px' }}>Title</th>
              <th style={{ padding: '8px' }}>SKU</th>
              <th style={{ padding: '8px' }}>Price</th>
              <th style={{ padding: '8px' }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #334155', color: '#f8fafc' }}>
                <td style={{ padding: '8px' }}>{row.title || row.Title || '-'}</td>
                <td style={{ padding: '8px', color: '#94a3b8' }}>{row.sku || row.SKU || '-'}</td>
                <td style={{ padding: '8px' }}>${((row.basePriceCents || row.priceCents || (parseFloat(row.Price || row.price || 0) * 100)) / 100).toFixed(2)}</td>
                <td style={{ padding: '8px' }}>{row.stockOnHand || row.Stock || row.stock || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
