const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { protect, authorize } = require('../middleware/auth');

router.get('/students', protect, authorize('admin', 'vc'), async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;