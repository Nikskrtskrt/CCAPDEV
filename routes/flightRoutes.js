const express   = require('express');
const router    = express.Router();

//models
const Flight            = require('../models/Flight');
const FlightInstance    = require('../models/FlightInstance');

router.get('/', async (req, res) => {
    try {
        const flights = await Flight.find().lean();
        res.render('flights/list', { title: 'Flight Templates', 
            flights,
            daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            });
    } catch {
        res.render('error', { subtext: 'Failed to load flights.' });
    }
});

router.get('/new', (req, res) => {
    res.render('flights/form', { title: 'Add New Flight' });
});

module.exports = router; 