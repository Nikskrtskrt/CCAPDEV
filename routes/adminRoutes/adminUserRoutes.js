const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const Reservation = require('../../models/Reservation');
const { isAuthenticated } = require('../../middlewares/authMiddleware');

router.get('/', isAuthenticated('Admin'), async (req, res) => {
    try { 
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
