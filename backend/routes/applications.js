const express = require('express');
const router = express.Router();
const Application = require('../models/application');
const { protect, authorize } = require('../middleware/auth');

const nextRole = { admin: 'controller', controller: 'coordinator', coordinator: 'vc' };

// console.log("AUTHORIZE:", authorize);

// STUDENT: Submit application
// router.post('/', protect, authorize('student'), async (req, res) => {
router.post('/', protect, async (req, res) => {
    // console.log("REQ.USER:", req.user);
    try {
        const { title, description, category } = req.body;
        const app = await Application.create({
            student: req.user._id,
            studentName: req.user.name,
            studentEmail: req.user.email,
            studentId: req.user.studentId,
            title, description, category,
            visibleTo: ['admin', 'vc'],
            currentRole: 'admin',
            status: 'pending',
            adminStatus: 'pending',
            vcStatus: 'pending',
            history: [{
                actor: req.user._id,
                actorName: req.user.name,
                actorRole: 'student',
                action: 'submitted',
                comment: 'Application submitted'
            }]
        });
        res.status(201).json({ message: 'Application submitted', application: app });
    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).json({ message: err.message });
    }
});

// STUDENT: Get own applications
router.get('/my', protect, authorize('student'), async (req, res) => {
    try {
        const apps = await Application.find({ student: req.user._id }).sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// STAFF: Get applications visible to their role
// router.get('/', protect, authorize('admin', 'controller', 'coordinator', 'vc'), async (req, res) => {
//     try {
//         // let query = {};
//         const role = req.user.role;

//         const apps = await Application.find({
//             visibleTo: role
//         }).sort({ updatedAt: -1 });

//         // const role = req.user.role;
//         // if (role !== 'vc') {
//         //     query = { currentRole: role };
//         // }

//         // let query = {};

//         if (role === 'student') {
//             query = { student: req.user._id };
//         }

//         // if (role === 'vc') {
//         //     app.vcStatus = action;

//         //     if (action === 'approved' || action === 'rejected') {
//         //         app.status = action;          // FINAL STATUS
//         //         app.currentRole = null;       // STOP FLOW
//         //     }
//         // }


//         // const apps = await Application.find(query).sort({ updatedAt: -1 });
//         res.json(apps);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

router.get('/', protect, authorize('admin', 'controller', 'coordinator', 'vc'), async (req, res) => {
    try {
        const role = req.user.role;

        let query = {};

        // 🔥 ADMIN & VC → ALL DATA
        if (role === 'admin' || role === 'vc') {
            query = {};
        }
        // 🔒 CONTROLLER & COORDINATOR → FILTERED
        else {
            query = { visibleTo: role };
        }

        const apps = await Application.find(query).sort({ updatedAt: -1 });

        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single application by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: 'Application not found' });

        const role = req.user.role;
        if (role === 'student' && app.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(app);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/:id/action', protect, authorize('admin', 'controller', 'coordinator', 'vc'), async (req, res) => {
    try {
        const { action } = req.body;
        const role = req.user.role;

        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ message: 'Application not found' });

        const nextRole = {
            admin: 'controller',
            controller: 'coordinator',
            coordinator: 'vc'
        };

        // =========================
        // 🔥 VC OVERRIDE (ANYTIME)
        // =========================
        if (role === 'vc') {

            app.lastActionRole = app.currentRole;

            app.vcStatus = action;
            app.status = action;        // FINAL
            // app.currentRole = null; // STOP FLOW
            app.currentRole = 'vc';

            // app.history.push({
            //     action: action,
            //     role: 'vc',
            //     // user: req.user.name,
            //     actorName: req.user.name || req.user.email || role,
            //     actorRole: role,
            //     comment: `${action} by ${role}`,
            //     remark: `${action} by VC`,
            //     date: new Date()
            // });

            app.history.push({
                action: action,
                role: 'vc',
                actorName: req.user.name || req.user.email || role,
                actorRole: role,
                comment: req.body.comment || `${action} by ${role}`, // ✅ USER COMMENT
                timestamp: new Date() // ✅ SAME FIELD NAME
            });

            return res.json(await app.save());
        }

        // =========================
        // ❗ Only current role can act
        // =========================
        if (app.currentRole !== role) {
            return res.status(403).json({ message: 'Not your turn' });
        }

        // =========================
        // ✅ APPROVE (STOP FLOW)
        // =========================
        if (action === 'approved') {

            app.lastActionRole = role;
            app[`${role}Status`] = 'approved';

            // app.history.push({
            //     action: 'approved',
            //     actorName: req.user.name,
            //     actorRole: role,
            //     comment: 'Approved by ' + role,
            //     timestamp: new Date()
            // });

            app.history.push({
                action: action,
                actorName: req.user.name || req.user.email || role,
                actorRole: role,
                comment: req.body.comment || `${action} by ${role}`, // ✅ USER COMMENT
                timestamp: new Date() // ✅ SAME FIELD NAME
            });

            app.status = 'approved'; // so vc can still approve or reject
            app.currentRole = null;   // STOP

            return res.json(await app.save());
        }

        // =========================
        // ❌ REJECT (STOP FLOW)
        // =========================
        if (action === 'rejected') {

            app.lastActionRole = role;
            app[`${role}Status`] = 'rejected';

            // app.history.push({
            //     action: 'rejected',
            //     actorName: req.user.name,
            //     actorRole: role,
            //     comment: 'Rejected by ' + role,
            //     timestamp: new Date()
            // });

            app.history.push({
                action: action,
                actorName: req.user.name || req.user.email || role,
                actorRole: role,
                comment: req.body.comment || `${action} by ${role}`, // ✅ USER COMMENT
                timestamp: new Date() // ✅ SAME FIELD NAME
            });

            app.status = 'rejected';
            app.currentRole = null;   // STOP

            return res.json(await app.save());
        }

        // =========================
        // 🔁 FORWARD (NEXT ROLE)
        // =========================
        if (action === 'forwarded') {

            const next = nextRole[role];
            if (!next) return res.status(400).json({ message: 'Cannot forward further' });

            app[`${role}Status`] = 'forwarded';
            app.currentRole = next;
            app[`${next}Status`] = 'pending';
            app.status = 'forwarded';

            // app.history.push({
            //     action: 'forwarded',
            //     actorName: req.user.name,
            //     actorRole: role,
            //     comment: 'Forwarded by ' + role,
            //     timestamp: new Date()
            // });

            app.history.push({
                action: action,
                actorName: req.user.name || req.user.email || role,
                actorRole: role,
                comment: req.body.comment || `${action} by ${role}`, // ✅ USER COMMENT
                timestamp: new Date() // ✅ SAME FIELD NAME
            });

            // 👇 visibility
            if (!app.visibleTo.includes(next)) {
                app.visibleTo.push(next);
            }

            return res.json(await app.save());
        }

        return res.status(400).json({ message: 'Invalid action' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// STAFF: Take action on application
// router.patch('/:id/action', protect, authorize('admin', 'controller', 'coordinator', 'vc'), async (req, res) => {
//     try {
//         const { action, comment } = req.body;
//         console.log("ACTION RECEIVED:", action);

//         const role = req.user.role;
//         const app = await Application.findById(req.params.id);
//         if (!app) return res.status(404).json({ message: 'Application not found' });

//         if (role !== 'vc' && app.currentRole !== role) {
//             return res.status(403).json({ message: 'This application is not at your level' });
//         }

//         const historyEntry = {
//             actor: req.user._id,
//             actorName: req.user.name,
//             actorRole: role,
//             action,
//             comment: comment || '',
//             timestamp: new Date()
//         };

//         // if (action === 'approved') {
//         //     app[`${role}Status`] = 'approved';
//         //     app.status = 'approved';
//         // } else if (action === 'rejected') {
//         //     app[`${role}Status`] = 'rejected';
//         //     app.status = 'rejected';
//         // } else if (action === 'forwarded' && role !== 'vc') {
//         //     const next = nextRole[role];
//         //     if (!next) return res.status(400).json({ message: 'Cannot forward further' });
//         //     app[`${role}Status`] = 'forwarded';
//         //     app.currentRole = next;
//         //     app[`${next}Status`] = 'pending';
//         //     app.status = 'forwarded';
//         // } else {
//         //     return res.status(400).json({ message: 'Invalid action' });
//         // }

//         // VC OVERRIDE 🔥
//         if (role === 'vc') {
//             app.lastActionRole = app.currentRole;

//             app.vcStatus = action;

//             if (action === 'approved' || action === 'rejected') {
//                 app.status = action;
//                 app.currentRole = null; // STOP FLOW
//             }
//         }

//         // NORMAL ROLES
//         else {

//             // if (action === 'approved' || action === 'rejected') {
//             //     app.lastActionRole = app.currentRole;

//             //     app[`${role}Status`] = action;
//             //     app.status = action;
//             //     app.currentRole = null; // STOP FLOW
//             // }

//             // if (action === 'approved') {
//             //     app.lastActionRole = role;

//             //     app[`${role}Status`] = 'approved';

//             //     const next = nextRole[role];
//             //     app.currentRole = next;
//             //     app[`${next}Status`] = 'pending';

//             //     app.status = 'pending';

//             //     if (!app.visibleTo.includes(next)) {
//             //         app.visibleTo.push(next);
//             //     }
//             // }

//             // for approved

//             // id admin apprve that will be the final decision but Vc can over ride only 

//             if (action === 'approved') {

//                 app.lastActionRole = role;
//                 app[`${role}Status`] = 'approved';

//                 app.status = 'approved';   // ✅ FINAL
//                 app.currentRole = null;    // ❌ STOP FLOW
//             }


//             // if admin approve forward to controller and so on till Vc last decision

//             // if (action === 'approved') {

//             //     app.lastActionRole = role;
//             //     app[`${role}Status`] = 'approved';

//             //     const next = nextRole[role];

//             //     // ✅ Agar next role exist karta hai
//             //     if (next) {
//             //         app.currentRole = next;
//             //         app[`${next}Status`] = 'pending';
//             //         app.status = 'pending';

//             //         if (!app.visibleTo.includes(next)) {
//             //             app.visibleTo.push(next);
//             //         }
//             //     }

//             //     // ✅ Agar last role hai (VC)
//             //     else {
//             //         app.currentRole = null;
//             //         app.status = 'approved';
//             //     }
//             // }

//             // for reject

//             else if (action === 'rejected') {

//                 app.lastActionRole = role;

//                 app[`${role}Status`] = 'rejected';

//                 app.status = 'rejected';   // FINAL
//                 app.currentRole = null;    // STOP FLOW
//             }

//             // for Forward

//             else if (action === 'forwarded') {
//                 const next = nextRole[role];
//                 if (!next) return res.status(400).json({ message: 'Cannot forward further' });

//                 app[`${role}Status`] = 'forwarded';
//                 app.currentRole = next;
//                 app[`${next}Status`] = 'pending';
//                 app.status = 'forwarded';

//                 // 👇 ADD VISIBILITY
//                 if (!app.visibleTo.includes(next)) {
//                     app.visibleTo.push(next);
//                 }
//             }

//             else {
//                 return res.status(400).json({ message: 'Invalid action' });
//             }
//         }

//         app.history.push(historyEntry);
//         await app.save();
//         res.json({ message: `Application ${action}ed`, application: app });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

module.exports = router;