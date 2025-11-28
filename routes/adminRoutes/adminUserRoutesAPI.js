const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Reservation = require('../../models/Reservation');

const { isAuthenticated, hasPermission } = require('../../middlewares/authMiddleware');

router.post('/', isAuthenticated('Admin'), async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.get('/:id', isAuthenticated('Admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).lean();
        const reservations = await Reservation.find({ user: req.params.id })
            .populate('flight')
            .lean();

        res.json({ user, reservations });
    } catch (err) {
        res.status(404).json({ error: 'User not found' });
    }
});

router.put('/:id', isAuthenticated('Admin'), async (req, res) => {
    try {
        const updates = req.body;

        if (updates.accessrole || updates.role) {
            if (!req.session.user.permissions.includes('edit-role')) {
                return res.status(403).json({ error: 'Missing permission: edit-role' });
            }
        }

        if (updates.permissions) {
            if (!req.session.user.permissions.includes('edit-permissions')) {
                return res.status(403).json({ error: 'Missing permission: edit-permissions' });
            }
        }
        
        if (updates.password) {
            const user = await User.findById(req.params.id);
            Object.assign(user, updates);
            await user.save(); 
        } else {
            await User.findByIdAndUpdate(req.params.id, updates);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, error: 'Failed to update user' });
    }
});

router.delete('/:id', 
    isAuthenticated('Admin'), 
    hasPermission('delete-user'), 
    async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);
            await Reservation.deleteMany({ user: req.params.id });

            res.json({ success: true });
        } catch (err) {
            res.status(400).json({ success: false, error: 'Failed to delete user' });
        }
});

module.exports = router;