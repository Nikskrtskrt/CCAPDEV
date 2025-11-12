const express = require('express');
const router = express.Router();

const Reservation = require('../models/Reservation');
const FlightInstance = require('../models/FlightInstance'); 

router.get('/', async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.params._id })
            .populate({
                path: 'flight', 
                populate: {
                    path: 'template', 
                    model: 'Flight',  
                    select: 'origin destination aircraft departure arrival' 
                }
            })
            .lean();

        res.render('reservation/manageReservations', {
            title: 'My Reservations',
            reservations
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading reservations');
    }
});

module.exports = router;