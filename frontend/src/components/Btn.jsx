import React from 'react';
import Spinner from './Spinner.jsx';

export default function Btn({ children, onClick, variant = 'primary', loading, disabled, icon: Icon, type = 'button', size = 'md', style: extraStyle }) {
  const base = {
    display:'inline-flex', alignItems:'center', gap:8,
    fontFamily:'var(--font-body)', fontWeight:500, borderRadius:8,
    transition:'all 0.18s', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    border:'none',
    ...(size === 'sm' ? { padding:'6px 14px', fontSize:13 } : { padding:'10px 18px', fontSize:14 }),
    ...extraStyle,
  };

  const styles = {
    primary: { background:'var(--accent)', color:'white' },
    danger:  { background:'var(--red-dim)', color:'var(--red)', border:'1px solid rgba(255,95,126,0.3)' },
    ghost:   { background:'var(--surface)', color:'var(--text2)', border:'1px solid var(--border)' },
    outline: { background:'transparent', color:'var(--accent)', border:'1px solid var(--accent)' },
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} style={{ ...base, ...styles[variant] }}>
      {loading ? <Spinner size={14} color={variant === 'primary' ? 'white' : 'var(--accent)'} /> : (Icon && <Icon size={15} strokeWidth={2} />)}
      {children}
    </button>
  );
}
