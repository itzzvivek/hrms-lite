import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getEmployees, createEmployee, deleteEmployee } from '../utils/api.js';
import Modal from '../components/Modal.jsx';
import Btn from '../components/Btn.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { Plus, Trash2, Users, Search, Mail, Hash, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const DEPARTMENTS = ['Engineering','Product','Design','Marketing','Sales','HR','Finance','Operations','Legal','Other'];

const INPUT_STYLE = {
  width:'100%', padding:'10px 14px', background:'var(--bg3)', border:'1px solid var(--border)',
  borderRadius:8, color:'var(--text)', fontSize:14, transition:'border-color 0.18s',
};

function AddEmployeeModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ employee_id:'', full_name:'', email:'', department: DEPARTMENTS[0] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: null }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.employee_id.trim()) e.employee_id = 'Employee ID is required.';
    if (!form.full_name.trim()) e.full_name = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format.';
    if (!form.department) e.department = 'Department is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await createEmployee(form);
      toast.success('Employee added successfully!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to add employee.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type='text', placeholder, as, form, errors, set }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>{label}</label>
      {as === 'select' ? (
        <select value={form[name]} onChange={e => set(name, e.target.value)}
          style={{ ...INPUT_STYLE, appearance:'none' }}>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      ) : (
        <input type={type} placeholder={placeholder} value={form[name]}
          onChange={e => set(name, e.target.value)}
          style={{ ...INPUT_STYLE, borderColor: errors[name] ? 'var(--red)' : 'var(--border)' }}
          onFocus={e => e.target.style.borderColor = errors[name] ? 'var(--red)' : 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = errors[name] ? 'var(--red)' : 'var(--border)'}
        />
      )}
      {errors[name] && <span style={{ fontSize:12, color:'var(--red)' }}>{errors[name]}</span>}
    </div>
  );

  return (
    <Modal title="Add New Employee" onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>Employee ID *</label>
          <input
            placeholder="e.g. EMP-001" value={form.employee_id}
            onChange={e => handleChange('employee_id', e.target.value)}
            style={{ ...INPUT_STYLE, borderColor: errors.employee_id ? 'var(--red)' : 'var(--border)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = errors.employee_id ? 'var(--red)' : 'var(--border)'}
          />
          {errors.employee_id && <span style={{ fontSize:12, color:'var(--red)' }}>{errors.employee_id}</span>}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>Full Name *</label>
          <input
            placeholder="e.g. Jane Smith" value={form.full_name}
            onChange={e => handleChange('full_name', e.target.value)}
            style={{ ...INPUT_STYLE, borderColor: errors.full_name ? 'var(--red)' : 'var(--border)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = errors.full_name ? 'var(--red)' : 'var(--border)'}
          />
          {errors.full_name && <span style={{ fontSize:12, color:'var(--red)' }}>{errors.full_name}</span>}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>Email Address *</label>
          <input
            type="email" placeholder="jane@company.com" value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            style={{ ...INPUT_STYLE, borderColor: errors.email ? 'var(--red)' : 'var(--border)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = errors.email ? 'var(--red)' : 'var(--border)'}
          />
          {errors.email && <span style={{ fontSize:12, color:'var(--red)' }}>{errors.email}</span>}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>Department *</label>
          <select
            value={form.department}
            onChange={e => handleChange('department', e.target.value)}
            style={{ ...INPUT_STYLE, appearance:'none' }}
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit} loading={loading} icon={Plus}>Add Employee</Btn>
        </div>
      </div>
    </Modal>
  );
}
function DeleteConfirmModal({ employee, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteEmployee(employee.id);
      toast.success('Employee deleted.');
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete.');
    } finally { setLoading(false); }
  };
  return (
    <Modal title="Delete Employee" onClose={onClose} width={420}>
      <p style={{ color:'var(--text2)', fontSize:14, marginBottom:20 }}>
        Are you sure you want to delete <strong style={{ color:'var(--text)' }}>{employee.full_name}</strong>?
        This will also delete all their attendance records.
      </p>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="danger" onClick={handleDelete} loading={loading} icon={Trash2}>Delete</Btn>
      </div>
    </Modal>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getEmployees()
      .then(r => setEmployees(r.data.results))
      .catch(() => toast.error('Failed to load employees.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = employees.filter(e =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:28, marginBottom:4 }}>Employees</h1>
          <p style={{ color:'var(--text2)', fontSize:14 }}>{employees.length} total employee{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <Btn variant="primary" onClick={() => setShowAdd(true)} icon={Plus}>Add Employee</Btn>
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:20, maxWidth:400 }}>
        <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, email, department..."
          style={{ ...INPUT_STYLE, paddingLeft:38 }}
        />
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No results found' : 'No employees yet'}
          description={search ? 'Try a different search term.' : 'Add your first employee to get started.'}
          action={!search && <Btn variant="primary" onClick={() => setShowAdd(true)} icon={Plus}>Add Employee</Btn>}
        />
      ) : (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Employee ID','Full Name','Email','Department','Present Days','Joined','Actions'].map(h => (
                    <th key={h} style={{
                      padding:'12px 16px', textAlign:'left',
                      fontSize:12, fontWeight:600, color:'var(--text3)',
                      textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <tr key={emp.id} style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    transition:'background 0.15s',
                  }}
                    onMouseOver={e => e.currentTarget.style.background='var(--surface2)'}
                    onMouseOut={e => e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{ fontFamily:'var(--font-display)', fontSize:13, color:'var(--accent)', fontWeight:600 }}>
                        {emp.employee_id}
                      </span>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                          width:32, height:32, borderRadius:'50%',
                          background:'var(--accent-dim)', color:'var(--accent)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, flexShrink:0,
                        }}>
                          {emp.full_name[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize:14, fontWeight:500 }}>{emp.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'14px 16px', color:'var(--text2)', fontSize:13 }}>{emp.email}</td>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{
                        padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:500,
                        background:'var(--surface2)', color:'var(--text2)', border:'1px solid var(--border)',
                      }}>{emp.department}</span>
                    </td>
                    <td style={{ padding:'14px 16px', color:'var(--green)', fontWeight:600, fontSize:14 }}>
                      {emp.present_days}
                    </td>
                    <td style={{ padding:'14px 16px', color:'var(--text3)', fontSize:13 }}>
                      {format(new Date(emp.created_at), 'MMM d, yyyy')}
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <Btn variant="danger" size="sm" onClick={() => setToDelete(emp)} icon={Trash2}>Delete</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onSaved={load} />}
      {toDelete && <DeleteConfirmModal employee={toDelete} onClose={() => setToDelete(null)} onDeleted={load} />}
    </div>
  );
}
