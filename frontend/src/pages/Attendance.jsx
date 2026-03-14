import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAttendance, getEmployees, markAttendance, deleteAttendance } from '../utils/api.js';
import Modal from '../components/Modal.jsx';
import Btn from '../components/Btn.jsx';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { Plus, Trash2, CalendarCheck, Filter, X, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const INPUT_STYLE = {
  padding:'9px 12px', background:'var(--bg3)', border:'1px solid var(--border)',
  borderRadius:8, color:'var(--text)', fontSize:13, outline:'none',
  transition:'border-color 0.18s',
};

// ✅ Custom date picker — click anywhere to open the native calendar
function DatePicker({ value, onChange, placeholder, max }) {
  const inputRef = React.useRef(null);

  const openPicker = () => {
    if (inputRef.current) {
      try { inputRef.current.showPicker(); }
      catch { inputRef.current.focus(); }
    }
  };

  return (
    <div
      onClick={openPicker}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '9px 10px 9px 12px',
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 8, cursor: 'pointer', userSelect: 'none',
        transition: 'border-color 0.18s',
        minWidth: 140, position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <span style={{ flex: 1, fontSize: 13, color: value ? 'var(--text)' : 'var(--text3)', pointerEvents: 'none' }}>
        {value ? format(parseISO(value + 'T00:00:00'), 'dd MMM yyyy') : placeholder}
      </span>
      <Calendar size={15} color="var(--text3)" style={{ flexShrink: 0, pointerEvents: 'none' }} />
      <input
        ref={inputRef}
        type="date"
        value={value}
        max={max}
        onChange={e => onChange(e.target.value)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        tabIndex={-1}
      />
    </div>
  );
}

function MarkAttendanceModal({ onClose, onSaved }) {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'Present' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [empLoading, setEmpLoading] = useState(true);

  useEffect(() => {
    getEmployees()
      .then(r => setEmployees(r.data.results))
      .finally(() => setEmpLoading(false));
  }, []);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.employee) e.employee = 'Please select an employee.';
    if (!form.date) e.date = 'Date is required.';
    if (!form.status) e.status = 'Status is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await markAttendance({ employee: form.employee, date: form.date, status: form.status });
      toast.success(res.status === 200 ? 'Attendance updated!' : 'Attendance marked!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to mark attendance.');
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Mark Attendance" onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>Employee *</label>
          {empLoading ? <div style={{ color:'var(--text3)', fontSize:13 }}>Loading employees…</div> : (
            <select value={form.employee} onChange={e => set('employee', e.target.value)}
              style={{ ...INPUT_STYLE, width:'100%', appearance:'none', padding:'10px 14px', borderColor: errors.employee ? 'var(--red)' : 'var(--border)' }}>
              <option value="">Select an employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>)}
            </select>
          )}
          {errors.employee && <span style={{ fontSize:12, color:'var(--red)' }}>{errors.employee}</span>}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>Date *</label>
          {/* ✅ DatePicker instead of raw <input type="date"> */}
          <DatePicker
            value={form.date}
            onChange={v => set('date', v)}
            placeholder="Select date"
            max={format(new Date(), 'yyyy-MM-dd')}
          />
          {errors.date && <span style={{ fontSize:12, color:'var(--red)' }}>{errors.date}</span>}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>Status *</label>
          <div style={{ display:'flex', gap:10 }}>
            {['Present', 'Absent'].map(s => (
              <button key={s} type="button" onClick={() => set('status', s)}
                style={{
                  flex:1, padding:'10px', borderRadius:8, border:'2px solid',
                  borderColor: form.status === s ? (s === 'Present' ? 'var(--green)' : 'var(--red)') : 'var(--border)',
                  background: form.status === s ? (s === 'Present' ? 'var(--green-dim)' : 'var(--red-dim)') : 'transparent',
                  color: form.status === s ? (s === 'Present' ? 'var(--green)' : 'var(--red)') : 'var(--text2)',
                  fontWeight:600, fontSize:14, cursor:'pointer', transition:'all 0.18s',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit} loading={loading} icon={CalendarCheck}>Mark Attendance</Btn>
        </div>
      </div>
    </Modal>
  );
}

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMark, setShowMark] = useState(false);
  const [filters, setFilters] = useState({ employee: '', date_from: '', date_to: '', status: '' });
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    const params = {};
    if (filters.employee) params.employee = filters.employee;
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.status) params.status = filters.status;
    setLoading(true);
    getAttendance(params)
      .then(r => setRecords(r.data.results))
      .catch(() => toast.error('Failed to load records.'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    getEmployees().then(r => setEmployees(r.data.results));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteAttendance(id);
      toast.success('Record deleted.');
      load();
    } catch {
      toast.error('Failed to delete.');
    } finally { setDeleting(null); }
  };

  const clearFilters = () => setFilters({ employee: '', date_from: '', date_to: '', status: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:28, marginBottom:4 }}>Attendance</h1>
          <p style={{ color:'var(--text2)', fontSize:14 }}>{records.length} record{records.length !== 1 ? 's' : ''} found</p>
        </div>
        <Btn variant="primary" onClick={() => setShowMark(true)} icon={Plus}>Mark Attendance</Btn>
      </div>

      {/* Filters */}
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12,
        padding:'16px 20px', marginBottom:0,
        display:'flex', flexWrap:'wrap', gap:12, alignItems:'center',
      }}>
        <Filter size={15} color="var(--text3)" />
        <select value={filters.employee} onChange={e => setFilters(f => ({ ...f, employee: e.target.value }))}
          style={{ ...INPUT_STYLE }}>
          <option value="">All Employees</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          style={{ ...INPUT_STYLE }}>
          <option value="">All Status</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
        {/* ✅ DatePicker replaces raw date inputs */}
        <DatePicker
          value={filters.date_from}
          onChange={v => setFilters(f => ({ ...f, date_from: v }))}
          placeholder="From date"
          max={filters.date_to || format(new Date(), 'yyyy-MM-dd')}
        />
        <DatePicker
          value={filters.date_to}
          onChange={v => setFilters(f => ({ ...f, date_to: v }))}
          placeholder="To date"
          max={format(new Date(), 'yyyy-MM-dd')}
        />
        {hasFilters && (
          <button onClick={clearFilters} style={{
            display:'flex', alignItems:'center', gap:6, padding:'8px 12px', borderRadius:8,
            background:'transparent', border:'1px solid var(--border)', color:'var(--text2)', fontSize:13, cursor:'pointer',
          }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Records Table */}
      {loading ? <PageLoader /> : records.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={hasFilters ? 'No records match filters' : 'No attendance records'}
          description={hasFilters ? 'Try adjusting your filters.' : 'Start marking attendance for your employees.'}
          action={!hasFilters && <Btn variant="primary" onClick={() => setShowMark(true)} icon={Plus}>Mark Attendance</Btn>}
        />
      ) : (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Employee','Employee ID','Date','Status','Actions'].map(h => (
                    <th key={h} style={{
                      padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600,
                      color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={rec.id} style={{ borderBottom: i < records.length-1 ? '1px solid var(--border)' : 'none', transition:'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background='var(--surface2)'}
                    onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'13px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                          width:30, height:30, borderRadius:'50%',
                          background:'var(--accent-dim)', color:'var(--accent)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, flexShrink:0,
                        }}>
                          {(rec.employee_name || '?')[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize:14, fontWeight:500 }}>{rec.employee_name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'13px 16px' }}>
                      <span style={{ fontFamily:'var(--font-display)', fontSize:12, color:'var(--accent)', fontWeight:600 }}>
                        {rec.employee_id_code}
                      </span>
                    </td>
                    <td style={{ padding:'13px 16px', color:'var(--text2)', fontSize:13, whiteSpace:'nowrap' }}>
                      {format(parseISO(rec.date + 'T00:00:00'), 'EEE, MMM d yyyy')}
                    </td>
                    <td style={{ padding:'13px 16px' }}>
                      <Badge label={rec.status} variant={rec.status.toLowerCase()} />
                    </td>
                    <td style={{ padding:'13px 16px' }}>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        disabled={deleting === rec.id}
                        style={{
                          display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:7,
                          background:'var(--red-dim)', color:'var(--red)', border:'1px solid rgba(255,95,126,0.25)',
                          fontSize:12, fontWeight:500, cursor:'pointer', opacity: deleting === rec.id ? 0.6 : 1,
                          transition:'all 0.18s',
                        }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showMark && <MarkAttendanceModal onClose={() => setShowMark(false)} onSaved={load} />}
    </div>
  );
}