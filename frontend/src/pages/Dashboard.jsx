import React, { useEffect, useState } from 'react';
import { getDashboard } from '../utils/api.js';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { Users, UserCheck, UserX, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  if (error) return (
    <div style={{ padding:40, textAlign:'center', color:'var(--red)' }}>{error}</div>
  );

  const { total_employees, today, departments, recent_attendance } = data;

  return (
    <div className="page-enter">
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, marginBottom:4 }}>Dashboard</h1>
        <p style={{ color:'var(--text2)', fontSize:14 }}>
          Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:32 }}>
        <StatCard label="Total Employees" value={total_employees} icon={Users} colorKey="accent" />
        <StatCard label="Present Today" value={today.present} icon={UserCheck} colorKey="green" sub={`of ${total_employees} employees`} />
        <StatCard label="Absent Today" value={today.absent} icon={UserX} colorKey="red" />
        <StatCard label="Not Marked" value={today.unmarked} icon={Calendar} colorKey="yellow" sub="attendance pending" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Department Breakdown */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <Building2 size={18} color="var(--accent)" />
            <h3 style={{ fontSize:16 }}>Departments</h3>
          </div>
          {departments.length === 0 ? (
            <p style={{ color:'var(--text3)', fontSize:14 }}>No departments yet.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {departments.map(d => {
                const pct = total_employees > 0 ? Math.round((d.count / total_employees) * 100) : 0;
                return (
                  <div key={d.department}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13 }}>
                      <span style={{ color:'var(--text)' }}>{d.department}</span>
                      <span style={{ color:'var(--text2)' }}>{d.count} ({pct}%)</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:'var(--bg3)', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:3, width:`${pct}%`, background:'var(--accent)', transition:'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <Calendar size={18} color="var(--accent)" />
            <h3 style={{ fontSize:16 }}>Recent Attendance</h3>
          </div>
          {recent_attendance.length === 0 ? (
            <p style={{ color:'var(--text3)', fontSize:14 }}>No attendance records yet.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:280, overflowY:'auto' }}>
              {recent_attendance.map(a => (
                <div key={a.id} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'8px 0', borderBottom:'1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{a.employee_name}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{format(new Date(a.date + 'T00:00:00'), 'MMM d, yyyy')}</div>
                  </div>
                  <Badge label={a.status} variant={a.status.toLowerCase()} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
