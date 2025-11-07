const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
    try {
        const users = await User.find().lean();
        res.render('users/list', { 
            title: 'User Management', 
            users 
        });
    } catch {
        res.render('error', { subtext: 'Failed to load users.' });
    }
});

router.get('/login', (req, res) => {
    res.render('users/login', {title: 'Login'});
});

router.get('/register', (req, res) => {
    res.render('users/register', {title: 'Register'});
});

router.get('/profile', (req, res) => {
    res.render('users/profile', {title: 'My Profile'});
});

module.exports = router;