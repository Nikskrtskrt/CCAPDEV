const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

router.get('/', async (req, res) => {
  try {
    const flights = await Flight.find().lean();
    
    const origins = [...new Set(flights.map(f => f.origin))];
    res.render('flightSearch', { title: 'Search Flights', origins: origins });
  } catch (err) {
    res.render('error', { subtext: 'Failed to load search page.' });
  }
});

module.exports = router;