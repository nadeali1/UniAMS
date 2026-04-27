const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, studentId, department } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const user = await User.create({ name, email, password, studentId, department, role: 'student' });
        const token = signToken(user._id);

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

        const token = signToken(user._id);
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId, department: user.department }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    res.json({ user: req.user });
});

// @POST /api/auth/seed-staff
router.post('/seed-staff', async (req, res) => {
    try {
        const staffMembers = [
            { name: 'Admin User', email: 'admin@university.edu', password: 'Admin@123', role: 'admin' },
            { name: 'Controller', email: 'controller@university.edu', password: 'Controller@123', role: 'controller' },
            { name: 'Coordinator', email: 'coordinator@university.edu', password: 'Coordinator@123', role: 'coordinator' },
            { name: 'Vice Chancellor', email: 'vc@university.edu', password: 'VC@12345', role: 'vc' }
        ];
        for (const staff of staffMembers) {
            const exists = await User.findOne({ email: staff.email });
            if (!exists) await User.create(staff);
        }
        res.json({ message: 'Staff seeded successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;