const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const Reservation = require('../../models/Reservation');

router.get('/', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'Admin') {
            return res.redirect('/login');
        }

        const users = await User.find().lean();
        res.render('admin/users/list', {
            title: 'User Management',
            users
        });
    } catch (err) {
        res.status(500).send('Failed to load users');
    }
});
module.exports = router;
