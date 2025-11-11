const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

router.get('/', async (req, res) => {
  try {
const flights = await Flight.find({ active: true }).lean();
//GETS ARRAY OF ALL ORIGINS; Dropdown should show each city only once, not repeated
    const origins = [...new Set(flights.map(f => f.origin))];

    //Convert to ISO string THEN SPLITS IT FOR THE YY/DD/MM
    const today = new Date().toISOString().split('T')[0];
    res.render('flightSearch', { 
      title: 'Search Flights', 
      origins: origins,
      currentDate: today
    });
  } catch (err) {
    console.error('Error loading search page:', err);
    res.render('error', { subtext: 'Failed to load search page.' });
  }
});

module.exports = router;