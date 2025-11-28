const express   = require('express');
const router    = express.Router();
const User      = require('../models/User');
const bcrypt    = require('bcrypt');

router.get('/login', (req, res)=>{
    if(req.session.user){
        return res.redirect(req.session.user.role === 'Admin' ? '/adminDashboard' : '/userDashboard');
    }
    res.render('auth/login', {title: 'Login'});
});

router.get('/register', (req,res)=>{
    if(req.session.user){
        return res.redirect('/userDashboard');
    }

    res.render('auth/register', {title: 'Register'});
});

router.get('/logout', (req, res)=>{
    req.session.destroy((err) =>{
        if(err) console.error('Logout error:', err);
        res.redirect('/login');
    });
});

router.post('/login', async(req, res) => {
    try{
        const{email, password} = req.body;

        const user = await User.findOne({email}).lean();
        if (!user){
            return res.status(401).json({success: false, error: 'Invalid credentials'});
        }

        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return res.status(401).json({success: false, error: 'Invalid email or password'});
        }

        req.session.user = {
            _id:        user._id, 
            firstName:  user.firstName,
            lastName:   user.lastName,
            email:      user.email,
            role:       user.role,
            passportNo: user.passportNo,
        }

        const redirectUrl = user.role === 'Admin' ? '/adminDashboard' : '/userDashboard';

        res.json({success: true, redirectUrl});
    } catch(err){
        console.error('Login Error:', err);
        res.status(500).json({success: false, error: 'Server error during login.'});
    }
});

router.post('/register', async(req, res)=> {
    try{
        const { firstName, lastName, email, password, passportNo } = req.body;

        const existingUser = await User.findOne({email}).lean();
        if(existingUser){
            return res.status(400).json({success: false, error: 'Email already registered'});
        } 

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            firstName,
            lastName,
            email,
            passportNo,
            password: hashedPassword,
            role: 'User'
        })

        await newUser.save();

        res.json({success: true, message: 'Registration successful'});

    } catch(err){
        console.error('Registraiton Error:', err);
        res.status(500).json({success: false, error: 'Error During Registration'});
    }
});

router.get('/userDashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    res.render('userDashboard', { 
        title: 'Dashboard', 
        user: req.session.user 
    });
});


router.get('/adminDashboard', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') {
        return res.redirect('/login');
    }
    res.render('admin/adminDashboard', { 
        title: 'Admin Dashboard', 
        user: req.session.user 
    });
});
module.exports = router; 