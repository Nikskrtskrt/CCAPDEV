const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

// Get destinations based on origin
router.get('/destinations', async (req, res) => {
  try {
    const { origin } = req.query;
    const flights = await Flight.find({ origin }).lean();
    const destinations = [...new Set(flights.map(f => f.destination))];
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// Search flights
router.get('/', async (req, res) => {
  try {
    const { origin, destination, date } = req.query;
    let filter = {};
    if (origin) filter.origin = origin;
    if (destination) filter.destination = destination;
/*
dateFilteringgggggg---------------------------------
 let flights = await Flight.find(filter).lean();

// If date is provided, filter by date
if (date) {
  const searchDate = new Date(date);

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayIndex = searchDate.getDay();
  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeek = daysMap[dayIndex];:
      
  // 1. Flight operates on this day of week
  // 2. Date is within the season (between seasonStart and seasonEnd)
    flights = flights.filter(flight => {
        // Check if flight operates on this day
    const operatesOnDay = flight.daysOfWeek.includes(dayOfWeek);
        
        // Check if date is within season
    const seasonStart = new Date(flight.seasonStart);
    const seasonEnd = new Date(flight.seasonEnd);
        
        // Set time to midnight for accurate date comparison
    seasonStart.setHours(0, 0, 0, 0);
    seasonEnd.setHours(23, 59, 59, 999);
    searchDate.setHours(0, 0, 0, 0);
        
      const withinSeason = searchDate >= seasonStart && searchDate <= seasonEnd;
        
      return operatesOnDay && withinSeason;
      });
    }

    res.json(flights);
----------------------------------------------------
*/ 

//REMOVE FROM HERE....
    const flights = await Flight.find(filter).lean();
    res.json(flights);
//to HERE... if decided to keep the date filtering option
  } catch (err) {
    res.status(500).json({ error: 'Failed to search flights' });
  }
});

module.exports = router;