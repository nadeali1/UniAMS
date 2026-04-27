import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', studentId: '', department: '' });
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            await signup(form);
            toast.success('Account created! Welcome aboard 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>🎓 UniAMS</h1>
                    <p>University Application Management System</p>
                </div>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-sub">Register as a student to submit applications</p>
                <form onSubmit={handleSubmit}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input className="form-control" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Student ID</label>
                            <input className="form-control" name="studentId" placeholder="STU-2024-001" value={form.studentId} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input className="form-control" name="email" type="email" placeholder="john@university.edu" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Department</label>
                        <select className="form-control" name="department" value={form.department} onChange={handleChange}>
                            <option value="">Select Department</option>
                            <option value="computer_science">Computer Science</option>
                            <option value="business">Business Administration</option>
                            <option value="engineering">Engineering</option>
                            <option value="medicine">Medicine</option>
                            <option value="law">Law</option>
                            <option value="arts">Arts & Humanities</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Password</label>
                            <input className="form-control" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input className="form-control" name="confirmPassword" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
                        </div>
                    </div>
                    <button className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? '⏳ Creating Account...' : '✅ Create Account'}
                    </button>
                </form>
                <p className="text-center text-muted mt-4">
                    Already have an account? <Link to="/login" className="auth-link">Sign in here</Link>
                </p>
            </div>
        </div>
    );
}