import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

const COLORS = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444', forwarded: '#3b82f6' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const roleLabels = { student: 'Student', admin: 'Admin', controller: 'Controller', coordinator: 'Coordinator', vc: 'Vice Chancellor' };

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/stats').then(r => { setData(r.data); setLoading(false); });
    }, []);

    if (loading) return <div className="spinner" />;
    if (!data) return null;

    const { stats, monthly, categories } = data;

    const pieData = [
        { name: 'Pending', value: stats.pending, color: COLORS.pending },
        { name: 'Approved', value: stats.approved, color: COLORS.approved },
        { name: 'Rejected', value: stats.rejected, color: COLORS.rejected },
        { name: 'Forwarded', value: stats.forwarded, color: COLORS.forwarded },
    ].filter(d => d.value > 0);

    const monthlyData = monthly.map(m => ({ name: MONTHS[(m._id.month - 1)], Applications: m.count }));
    const categoryData = categories.map(c => ({ name: c._id?.replace(/_/g, ' ') || 'Other', count: c.count }));

    return (
        <div>
            <div className="page-header">
                <h1>📊 Dashboard</h1>
                <p>Welcome back, <strong>{user.name}</strong> — <span className="role-tag">{roleLabels[user.role]}</span></p>
            </div>
            <div className="stats-grid">
                <div className="stat-card blue"><div className="stat-icon">📋</div><div className="stat-value">{stats.total}</div><div className="stat-label">Total</div></div>
                <div className="stat-card yellow"><div className="stat-icon">⏳</div><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending</div></div>
                <div className="stat-card green"><div className="stat-icon">✅</div><div className="stat-value">{stats.approved}</div><div className="stat-label">Approved</div></div>
                <div className="stat-card red"><div className="stat-icon">❌</div><div className="stat-value">{stats.rejected}</div><div className="stat-label">Rejected</div></div>
                <div className="stat-card cyan"><div className="stat-icon">➡️</div><div className="stat-value">{stats.forwarded}</div><div className="stat-label">Forwarded</div></div>
            </div>
            <div className="grid-2 mb-4">
                <div className="card">
                    <div className="card-header"><span className="card-title">Status Breakdown</span></div>
                    {pieData.length === 0 ? <div className="empty-state"><div className="empty-icon">🥧</div><p>No data yet</p></div> : (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', color: '#f1f5f9' }} />
                                <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className="card">
                    <div className="card-header"><span className="card-title">By Category</span></div>
                    {categoryData.length === 0 ? <div className="empty-state"><div className="empty-icon">📊</div><p>No data yet</p></div> : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={categoryData} margin={{ left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', color: '#f1f5f9' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
            <div className="card">
                <div className="card-header"><span className="card-title">Monthly Submissions (Last 6 Months)</span></div>
                {monthlyData.length === 0 ? <div className="empty-state"><div className="empty-icon">📈</div><p>No monthly data yet</p></div> : (
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={monthlyData} margin={{ left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', color: '#f1f5f9' }} />
                            <Line type="monotone" dataKey="Applications" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}