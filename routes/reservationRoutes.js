const express   = require('express');
const router    = express.Router();
const User              = require('../models/User');
const Reservation       = require('../models/Reservation');
const FlightInstance    = require('../models/FlightInstance');

router.get('/', async (req, res) => {
    try {
        res.render('reservation/booking', {
            title: 'Booking Form', 

        });
    } catch {
        res.render('error', { subtext: 'Failed to load booking form.' });
    }
});

module.exports = router; 