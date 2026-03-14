import React from 'react';

export default function StatCard({ label, value, icon: Icon, colorKey = 'accent', sub }) {
  const colorMap = {
    accent: { hex: '#6c63ff', alpha: 'rgba(108,99,255,0.15)', var: 'var(--accent)' },
    green:  { hex: '#22d3a0', alpha: 'rgba(34,211,160,0.15)',  var: 'var(--green)' },
    red:    { hex: '#ff5f7e', alpha: 'rgba(255,95,126,0.15)',  var: 'var(--red)' },
    yellow: { hex: '#fbbf24', alpha: 'rgba(251,191,36,0.15)',  var: 'var(--yellow)' },
  };
  const c = colorMap[colorKey] || colorMap.accent;

  return (
    <div style={{
      background:'var(--surface)',
      border:'1px solid var(--border)',
      borderRadius:12,
      padding:'24px',
      display:'flex',
      flexDirection:'column',
      gap:12,
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div style={{ fontSize:12, color:'var(--text2)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
        {Icon && (
          <div style={{
            width:36, height:36, borderRadius:10,
            background: c.alpha,
            display:'flex', alignItems:'center', justifyContent:'center',
            color: c.var,
          }}>
            <Icon size={18} strokeWidth={1.8} />
          </div>
        )}
      </div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:800, color:'var(--text)', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'var(--text3)' }}>{sub}</div>}
    </div>
  );
}
