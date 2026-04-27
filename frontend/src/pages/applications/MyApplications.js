import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ApplicationDetailModal from '../../components/ApplicationDetailModal';

const statusBadge = (status) => <span className={`badge badge-${status}`}>{status}</span>;
const categoryLabel = (cat) => cat?.replace(/_/g, ' ') || 'Other';

export default function MyApplications() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        axios.get('/api/applications/my').then(r => { setApps(r.data); setLoading(false); });
    }, []);

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <div className="page-header">
                <div className="header-row">
                    <div>
                        <h1>📁 My Applications</h1>
                        <p>Track all your submitted applications and their current status</p>
                    </div>
                    <a href="/submit" className="btn btn-primary">+ New Application</a>
                </div>
            </div>
            {apps.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3 style={{ marginBottom: 8 }}>No Applications Yet</h3>
                        <p>You haven't submitted any applications yet.</p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th><th>Title</th><th>Category</th><th>Status</th><th>Current Level</th><th>Submitted</th><th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apps.map((app, i) => {
                                    const currentLevel =
                                        app.currentRole ||
                                        app.lastActionRole ||
                                        (app.status === 'approved' || app.status === 'rejected'
                                            ? app.lastActionRole
                                            : 'Pending');

                                return (
                                 
                                <tr key={app._id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.title}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>{app.description.slice(0, 50)}...</div>
                                    </td>
                                    <td><span style={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>{categoryLabel(app.category)}</span></td>
                                    <td>{statusBadge(app.status)}</td>
                                    <td>
                                        <span className="role-tag" style={{ textTransform: 'capitalize' }}>
                                            {currentLevel || '—'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                        {new Date(app.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td><button className="btn btn-outline btn-sm" onClick={() => setSelected(app)}>👁 View</button></td>
                                </tr>
                                )
             } )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {selected && <ApplicationDetailModal app={selected} onClose={() => setSelected(null)} role="student" />}
        </div>
    );
}