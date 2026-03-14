import React from 'react';

const variants = {
  present: { bg: 'var(--green-dim)', color: 'var(--green)', dot: '#22d3a0' },
  absent:  { bg: 'var(--red-dim)',   color: 'var(--red)',   dot: '#ff5f7e' },
  default: { bg: 'var(--surface)',   color: 'var(--text2)', dot: '#9898b8' },
};

export default function Badge({ label, variant = 'default' }) {
  const s = variants[variant.toLowerCase()] || variants.default;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'3px 10px', borderRadius:20,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 500,
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background: s.dot, flexShrink:0 }} />
      {label}
    </span>
  );
}
