const express   = require('express');
const router    = express.Router();

const User          = require('../../models/User');
const Reservation   = require('../../models/Reservation');
const FlightInstance= require('../../models/FlightInstance');

router.get('/profile', async(req ,res) =>{
    if(!req.session.user) return res.redirect('/login');
    
    const user = await User.findById(req.session.user._id).lean();
    /*
    const reservations = await Reservation.find({user: req.session.user._id})
        .populate('flight')
        .lean();

    
    // console.log('Current User logged in:');
    // console.log(req.session.user);
    console.log('Reservation for User: ' + req.session.user._id);
    console.log(reservations);
    */
    
    res.render('userViews/viewProfile',{
        title: 'User Profile', 
        user,
        //reservations
    }); 
});

router.post('/api/profile/update', async(req, res)=>{
    if(!req.session.user) return res.redirect('/login');
    await User.findByIdAndUpdate(req.session.user, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        passportNo: req.body.passportNo
    });

    req.session.user = await User.findById(req.session.user._id).lean();
    res.redirect('/profile');
});

router.delete('/api/reservations/:id', async(req,res)=>{
    try{
        await Reservation.findByIdAndDelete(req.params.id);
        res.json({success: true});
    }catch(err){
        res.json({success: false});
    }
});
module.exports = router;