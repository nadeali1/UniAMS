import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = {
    student: [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/submit', icon: '📝', label: 'Submit Application' },
        { path: '/my-applications', icon: '📁', label: 'My Applications' },
    ],
    admin: [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/applications', icon: '📋', label: 'Applications' },
    ],
    controller: [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/applications', icon: '📋', label: 'Applications' },
    ],
    coordinator: [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/applications', icon: '📋', label: 'Applications' },
    ],
    vc: [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/applications', icon: '📋', label: 'All Applications' },
    ],
};

const roleLabels = {
    student: 'Student',
    admin: 'Admin',
    controller: 'Controller',
    coordinator: 'Coordinator',
    vc: 'Vice Chancellor',
};

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;
    const items = navItems[user.role] || [];
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>🎓 UniAMS</h2>
                <span>Application Management</span>
            </div>
            <nav className="sidebar-nav">
                {items.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <p>{user.name}</p>
                        <span>{roleLabels[user.role]}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>⬅ Logout</button>
            </div>
        </aside>
    );
}