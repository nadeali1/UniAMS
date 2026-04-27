import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const staffCredentials = [
    { role: 'Admin', email: 'admin@university.edu', password: 'Admin@123' },
    { role: 'Controller', email: 'controller@university.edu', password: 'Controller@123' },
    { role: 'Coordinator', email: 'coordinator@university.edu', password: 'Coordinator@123' },
    { role: 'Vice Chancellor', email: 'vc@university.edu', password: 'VC@12345' },
];

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showHints, setShowHints] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back! 👋');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    const quickFill = (email, password) => setForm({ email, password });

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>🎓 UniAMS</h1>
                    <p>University Application Management System</p>
                </div>
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-sub">Sign in to your account to continue</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input className="form-control" name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="form-control" name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
                    </div>
                    <button className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? '⏳ Signing in...' : '🔐 Sign In'}
                    </button>
                </form>
                <div className="auth-divider">or</div>
                <p className="text-center text-muted">
                    New student? <Link to="/signup" className="auth-link">Create an account</Link>
                </p>
                <div style={{ marginTop: '24px' }}>
                    <button type="button" className="btn btn-outline btn-full btn-sm" onClick={() => setShowHints(!showHints)}>
                        {showHints ? '▲ Hide' : '▼ Show'} Staff Demo Credentials
                    </button>
                    {showHints && (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {staffCredentials.map(c => (
                                <button key={c.role} type="button" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }} onClick={() => quickFill(c.email, c.password)}>
                                    <span className="role-tag">{c.role}</span> {c.email}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}