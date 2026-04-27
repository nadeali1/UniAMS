import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ApplicationDetailModal from '../../components/ApplicationDetailModal';
import toast from 'react-hot-toast';

const statusBadge = (status) => <span className={`badge badge-${status}`}>{status}</span>;
const categoryLabel = (cat) => cat?.replace(/_/g, ' ') || 'Other';
const roleTitle = {
    admin: 'Admin Panel', controller: 'Controller Panel',
    coordinator: 'Coordinator Panel', vc: 'Vice Chancellor — All Applications',
};

export default function StaffApplications() {
    const { user } = useAuth();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('all');

    const fetchApps = () => {
        setLoading(true);
        axios.get('/api/applications').then(r => { setApps(r.data); setLoading(false); });
    };

    useEffect(() => { fetchApps(); }, []);

    const handleAction = async (appId, action, comment) => {
        try {
            await axios.patch(`/api/applications/${appId}/action`, { action, comment });
            toast.success(`Application ${action}ed successfully`);
            setSelected(null);
            fetchApps();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
    const counts = {
        all: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        approved: apps.filter(a => a.status === 'approved').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
        forwarded: apps.filter(a => a.status === 'forwarded').length,
    };

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <div className="page-header">
                <h1>📋 {roleTitle[user?.role]}</h1>
                <p>Review, approve, reject, or forward applications assigned to your level</p>
            </div>
            <div className="stats-grid" style={{ marginBottom: 20 }}>
                {[
                    { key: 'all', label: 'Total', icon: '📋', color: 'blue' },
                    { key: 'pending', label: 'Pending', icon: '⏳', color: 'yellow' },
                    { key: 'approved', label: 'Approved', icon: '✅', color: 'green' },
                    { key: 'rejected', label: 'Rejected', icon: '❌', color: 'red' },
                    { key: 'forwarded', label: 'Forwarded', icon: '➡️', color: 'cyan' },
                ].map(s => (
                    <div key={s.key} className={`stat-card ${s.color}`} style={{ cursor: 'pointer', outline: filter === s.key ? '2px solid var(--primary)' : 'none' }} onClick={() => setFilter(s.key)}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value">{counts[s.key]}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>
            <div className="tabs">
                {['all', 'pending', 'approved', 'rejected', 'forwarded'].map(f => (
                    <button key={f} className={`tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                    </button>
                ))}
            </div>
            <div className="card">
                {filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📭</div><p>No {filter === 'all' ? '' : filter} applications found</p></div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th><th>Student</th><th>Title</th><th>Category</th><th>Status</th>
                                    {user?.role === 'vc' && <th>At Level</th>}
                                    <th>Submitted</th><th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((app, i) => (
                                    <tr key={app._id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{app.studentName}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{app.studentId || app.studentEmail}</div>
                                        </td>
                                        <td style={{ maxWidth: 200 }}>
                                            <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{app.title}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: 2 }}>{app.description?.slice(0, 45)}...</div>
                                        </td>
                                        <td><span style={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>{categoryLabel(app.category)}</span></td>
                                        <td>{statusBadge(app.status)}</td>
                                        {user?.role === 'vc' && <td><span className="role-tag" style={{ textTransform: 'capitalize' }}>{app.currentRole || app.lastActionRole || '-'}</span></td>}
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                            {new Date(app.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td><button className="btn btn-primary btn-sm" onClick={() => setSelected(app)}>📂 Review</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {selected && <ApplicationDetailModal app={selected} role={user?.role} onClose={() => setSelected(null)} onAction={handleAction} />}
        </div>
    );
}