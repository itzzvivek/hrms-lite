import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'64px 24px', gap:16, textAlign:'center',
    }}>
      {Icon && (
        <div style={{
          width:64, height:64, borderRadius:16,
          background:'var(--surface)', border:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'var(--text3)',
        }}>
          <Icon size={28} strokeWidth={1.5} />
        </div>
      )}
      <div>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color:'var(--text)', marginBottom:6 }}>{title}</div>
        {description && <div style={{ color:'var(--text2)', fontSize:14, maxWidth:320 }}>{description}</div>}
      </div>
      {action}
    </div>
  );
}
