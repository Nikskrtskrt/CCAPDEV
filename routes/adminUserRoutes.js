const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Reservation = require('../models/Reservation');

router.get('/', async (req, res) => {
    try {
        const users = await User.find().lean();
        res.render('users/list', {
            title: 'User Management',
            users
        });
    } catch (err) {
        res.status(500).send('Failed to load users');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).lean();
        const reservations = await Reservation.find({ user: req.params.id })
            .populate('flight')
            .lean();

        res.render('users/view', {
            title: 'View User',
            user,
            reservations
        });
    } catch (err) {
        res.status(500).send('Failed to load user');
    }
});

module.exports = router;
