import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('ams_token');
        const savedUser = localStorage.getItem('ams_user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('ams_token', data.token);
        localStorage.setItem('ams_user', JSON.stringify(data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data.user);
        return data.user;
    };

    const signup = async (formData) => {
        const { data } = await axios.post('/api/auth/signup', formData);
        localStorage.setItem('ams_token', data.token);
        localStorage.setItem('ams_user', JSON.stringify(data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('ams_token');
        localStorage.removeItem('ams_user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};