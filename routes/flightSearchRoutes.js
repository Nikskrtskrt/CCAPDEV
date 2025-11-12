const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

router.get('/', async (req, res) => {
    try {
        // Get all active flights to extract unique origins
        const flights = await Flight.find({ active: true }).lean();
        
        // Extract unique origins
        const origins = [...new Set(flights.map(f => f.origin))];
        
        res.render('flightSearch', { 
            title: 'Search Flights', 
            origins: origins.sort() 
        });
    } catch (err) {
        console.error('Error loading search page:', err);
        res.status(500).render('error', { 
            title: 'Error',
            subtext: 'Failed to load search page.' 
        });
    }
});

module.exports = router;