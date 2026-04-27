import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const categories = [
    { value: 'fee_waiver', label: '💰 Fee Waiver' },
    { value: 'scholarship', label: '🎓 Scholarship' },
    { value: 'leave', label: '🏖 Leave of Absence' },
    { value: 'transcript', label: '📄 Transcript Request' },
    { value: 'enrollment', label: '📝 Enrollment Certificate' },
    { value: 'other', label: '📋 Other' },
];

export default function SubmitApplication() {
    const [form, setForm] = useState({ title: '', description: '', category: 'other' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) return toast.error('Please fill all fields');
        setLoading(true);
        try {
            await axios.post('/api/applications', form);
            toast.success('Application submitted successfully! 🎉');
            navigate('/my-applications');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally { setLoading(false); }
    };

    return (
        <div>
            <div className="page-header">
                <h1>📝 Submit Application</h1>
                <p>Fill in the form below to send your application to the administration</p>
            </div>
            <div className="card" style={{ maxWidth: 640 }}>
                <div className="card-header">
                    <span className="card-title">New Application</span>
                    <span className="badge badge-pending">Goes to Admin & VC</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '12px 16px', background: 'var(--bg-card-2)', borderRadius: '10px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Application Flow:</span>
                    {['You', 'Admin', 'Controller', 'Coordinator', 'VC'].map((step, i, arr) => (
                        <React.Fragment key={step}>
                            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>{step}</span>
                            {i < arr.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>→</span>}
                        </React.Fragment>
                    ))}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Application Category</label>
                        <select className="form-control" name="category" value={form.category} onChange={handleChange}>
                            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Application Title</label>
                        <input className="form-control" name="title" placeholder="Brief title for your application" value={form.title} onChange={handleChange} required maxLength={100} />
                        <small className="text-muted">{form.title.length}/100 characters</small>
                    </div>
                    <div className="form-group">
                        <label>Description / Details</label>
                        <textarea className="form-control" name="description" rows={5} placeholder="Describe your request in detail..." value={form.description} onChange={handleChange} required />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? '⏳ Submitting...' : '🚀 Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}