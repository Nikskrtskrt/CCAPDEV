const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const Reservation = require('../../models/Reservation');

router.post('/', async (req, res) => {
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

router.get('/:id', async (req, res) => {
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

router.put('/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, error: 'Failed to update user' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        await Reservation.deleteMany({ user: req.params.id });

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, error: 'Failed to delete user' });
    }
});

module.exports = router;
