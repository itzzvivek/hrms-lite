import React from 'react';

export default function Spinner({ size = 24, color = 'var(--accent)' }) {
  return (
    <div
      style={{
        width: size, height: size,
        border: `2px solid var(--border2)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

export function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'300px', gap:12, color:'var(--text2)', fontSize:14 }}>
      <Spinner />
      Loading...
    </div>
  );
}
