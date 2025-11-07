const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, passportNo } = req.body;
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
    return res.status(400).json({ success: false, error: 'Email already registered' });
}

    const user = new User({fullName, email,password, passportNo, role: 'User'
        });

        await user.save();

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully!',
            userId: user._id 
        });
    } catch (err) {
        console.error('Registration failed:', err.message);
        res.status(400).json({ 
            success: false, 
            error: err.message 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password }).lean();
    
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }

        res.json({ success: true, message: 'Login successful!', user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role}
        });
    } catch (err) {
        console.error('Login failed:', err.message);
        res.status(500).json({success: false, error: 'Login failed' 
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.find().lean();
        res.json(users);
    } catch {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).lean();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        delete user.password;
        res.json(user);
    } catch {
        res.status(400).json({ error: 'Invalid user ID' });
    }
});

router.put('/:id', async (req, res) => {
try {
    const { fullName, email, passportNo, role } = req.body;
    const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;
        if (passportNo) updateData.passportNo = passportNo;
        if (role) updateData.role = role;
    await User.findByIdAndUpdate(req.params.id, updateData);
    res.json({success: true, message: 'Profile updated successfully'});
    } catch {
    res.status(400).json({success: false, error: 'Failed to update profile'});
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch {
        res.status(400).json({ success: false, error: 'Failed to delete user' 
        });
    }
});

module.exports = router;