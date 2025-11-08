const express   = require('express');
const router    = express.Router();
const User              = require('../models/User');
const Reservation       = require('../models/Reservation');
const FlightInstance    = require('../models/FlightInstance');

//Get - Reservations of User
//Post - Create new reservation
//Patch - Update some parts of reservation

//TODO: Do get method
router.get('/', async (req, res) => {

});

router.post('/', async (req, res) => {
    try {
        const newReservation = new Reservation(req.body);
        await newReservation.save();
        res.status(201).json({ success: true, message: 'Reservation created!' });
    } catch {
        console.error('Reservation creation failed:', err.message);
        res.status(400).json({ success: false, error: err.message });
    }
});


//TODO: Do patch method
router.patch('/:id', async (req, res) => {

});

module.exports = router; 