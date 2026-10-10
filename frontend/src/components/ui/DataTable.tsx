import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

export function DataTable<T>({ columns, data }: { columns: Column<T>[]; data: T[] }) {
  return (
    <div
      style={{
        overflowX: 'auto',
        width: '100%',
        borderRadius: '12px',
        border: '1px solid var(--bb-border)',
        background: 'var(--bb-white)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
        <thead>
          <tr
            style={{
              background: 'var(--bb-warm-offwhite)',
              borderBottom: '1px solid var(--bb-border)',
              color: 'var(--bb-burgundy)'
            }}
          >
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  padding: '13px 18px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, i) => (
            <tr
              key={i}
              style={{
                borderBottom: i === data.length - 1 ? 'none' : '1px solid var(--bb-border-subtle)',
                background: i % 2 === 0 ? 'var(--bb-white)' : '#FDFAFA',
                color: 'var(--bb-dark-text)',
                transition: 'background 0.15s ease'
              }}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '13px 18px' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
