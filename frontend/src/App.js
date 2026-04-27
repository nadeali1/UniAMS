import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/SideBar';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import SubmitApplication from './pages/applications/SubmitApplication';
import MyApplications from './pages/applications/MyApplications';
import StaffApplications from './pages/applications/StaffApplications';

import './index.css';

const STAFF_ROLES = ['admin', 'controller', 'coordinator', 'vc'];

function AppLayout({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <AppLayout>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/submit" element={<ProtectedRoute roles={['student']}><SubmitApplication /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute roles={['student']}><MyApplications /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute roles={STAFF_ROLES}><StaffApplications /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f1f5f9',
              border: '1px solid #1e2d45',
              borderRadius: '10px',
              fontSize: '0.88rem',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}