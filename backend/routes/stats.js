const express = require('express');
const router = express.Router();
const Application = require('../models/application');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
    try {
        // const role = req.user.role;
        // let matchQuery = {};

        // if (role === 'student') {
        //     matchQuery = { student: req.user._id };
        // } else if (role !== 'vc') {
        //     matchQuery = { currentRole: role };
        // }

        const role = req.user.role;
        let matchQuery = {};

        if (role === 'student') {
            matchQuery = { student: req.user._id };
        } else if (role === 'admin' || role === 'vc') {
            matchQuery = {};
        } else {
            matchQuery = {
                $or: [
                    { visibleTo: role },
                    { currentRole: role }
                ]
            };
        }

        const all = await Application.find(matchQuery);
        const total = all.length;

        const stats = {
            total,
            pending: all.filter(a => a.status === 'pending').length,
            approved: all.filter(a => a.status === 'approved').length,
            rejected: all.filter(a => a.status === 'rejected').length,
            forwarded: all.filter(a => a.status === 'forwarded').length,
        };

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthly = await Application.aggregate([
            { $match: { ...matchQuery, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const categories = await Application.aggregate([
            { $match: matchQuery },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.json({ stats, monthly, categories });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;