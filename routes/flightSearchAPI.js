const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const FlightInstance = require('../models/FlightInstance');

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

// Search flights-----------------------------------------
router.get('/', async (req, res) => {
  try {
    const { origin, destination, date, passengers = 1 } = req.query;
    
    // VALIDATIONS
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Find matching flight templates first
let templates = await Flight.find({ origin, destination, active: true }).lean();
    if (templates.length === 0) {
      return res.json([]);
    }
    // Validate date format and get day of week
    const searchDate = new Date(date);
    if (isNaN(searchDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    const dayIndex = searchDate.getDay();
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = daysMap[dayIndex];
    
    //filtering templatessss--------------------
    templates = templates.filter(flight => {
      const operatesOnDay = flight.daysOfWeek.includes(dayOfWeek);
      
      const seasonStart = new Date(flight.seasonStart);
      const seasonEnd = new Date(flight.seasonEnd);
      seasonStart.setHours(0, 0, 0, 0);
      seasonEnd.setHours(23, 59, 59, 999);
      searchDate.setHours(0, 0, 0, 0);
      
      const withinSeason = searchDate >= seasonStart && searchDate <= seasonEnd;
      
      return operatesOnDay && withinSeason;
    });

    if (templates.length === 0) {
      return res.json([]);
    }
    //--------------------------------------------
    // Get template IDs
    const templateIds = templates.map(t => t._id);
    
    //Set date range for the search day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find actual flight instances for these templates on the specific date
    const instances = await FlightInstance.find({
      template: { $in: templateIds },
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: 'Scheduled',
      seats: { $gte: Number(passengers) } // Check available seats
    }).populate('template').lean();
    //SEARCHES ACTUAL FLIGHT INSTANCES-----------------------------
    //Format response with combined data from instance and template
    const results = instances.map(inst => ({
      instanceId: inst._id,
      templateId: inst.template._id,
      flightNo: inst.flightNo,
      origin: inst.template.origin,
      destination: inst.template.destination,
      date: inst.date,
      departureTime: inst.departureTime,
      arrivalTime: inst.arrivalTime,
      aircraft: inst.aircraftNo,
      availableSeats: inst.seats,
      capacity: inst.template.capacity,
      // Include formatted times for display
      departureTimeFormatted: new Date(inst.departureTime).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      arrivalTimeFormatted: new Date(inst.arrivalTime).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }));

    res.json(results);
  } catch (err) {
    console.error('Flight search error:', err);
    res.status(500).json({ error: 'Failed to search flights' });
  }
});

module.exports = router;