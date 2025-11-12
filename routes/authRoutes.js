const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/login', (req, res) =>{
    res.render('auth/login', {title:'login'})
});

router.post('/login', async(req, res)=>{
    const {email, password}=req.body;
    const user = await User.findOne({email, password}).lean();

    if(!user){
        return res.render('auth/login', {error: 'Invalid email or password', title: 'Login'});
    }

    req.session.user = user;

    if(user.role === 'Admin'){
        return res.redirect('/adminDashboard');
    }else{
        return res.redirect(`/userDashboard`);
    }
});

router.get('/register', (req, res) =>{
    res.render('auth/register', {title: 'Regsiter'});
});

router.post('/register', async(req, res) =>{
    try{
        const newUser = new User(req.body);
        await newUser.save();        
        res.redirect('/login');
    }catch(err){
        res.render('auth/register', {error: 'Error registering user', title: 'Register'});
    }
});

router.get('/adminDashboard', (req, res)=>{
    if(!req.session.user || req.session.user.role !== 'Admin'){
        return res.redirect('/login');
    }
    res.render('admin/adminDashboard', {title: 'Admin Dashboard'});
});

router.get('/userDashboard', (req, res) => {
    if (!req.session.user){
        return res.redirect('/login');
    }
    res.render('userDashboard', { title: 'User Dashboard', user: req.session.user
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;