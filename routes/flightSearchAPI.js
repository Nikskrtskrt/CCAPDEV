const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const FlightInstance = require('../models/FlightInstance');

// Get all unique origins
router.get('/origins', async (req, res) => {
    try {
        const flights = await Flight.find({ active: true }).lean();
        const origins = [...new Set(flights.map(f => f.origin))];
        res.json(origins);
    } catch (err) {
        console.error('Error fetching origins:', err);
        res.status(500).json({ error: 'Failed to fetch origins' });
    }
});

// Get destinations based on origin, CORRELATED
router.get('/destinations', async (req, res) => {
    try {
        const { origin } = req.query;
        
        if (!origin) {
            return res.status(400).json({ error: 'Origin is required' });
        }

        const flights = await Flight.find({ origin, active: true }).lean();
        const destinations = [...new Set(flights.map(f => f.destination))];
        res.json(destinations);
    } catch (err) {
        console.error('Error fetching destinations:', err);
        res.status(500).json({ error: 'Failed to fetch destinations' });
    }
});

// Search flights FILTERING ----------------
router.get('/', async (req, res) => {
    try {
        const { origin, destination, date } = req.query;

    // Build filter object
        let filter = { active: true };
        if (origin) filter.origin = origin;
        if (destination) filter.destination = destination;

    // Find all flights matching the filter
        let flights = await Flight.find(filter).lean();

    // If date is provided, filter by date and day of week
        if (date) {
            const searchDate = new Date(date);
            const dayIndex = searchDate.getDay();
            const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayOfWeek = daysMap[dayIndex];

            flights = flights.filter(flight => {
                // Check if flight operates on this day of week
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
    } catch (err) {
        console.error('Error searching flights:', err);
        res.status(500).json({ error: 'Failed to search flights' });
    }
});

router.get('/instances/:flightNo', async (req, res) => {
    try {
        const { flightNo } = req.params;
        const { date } = req.query;

        let filter = { flightNo, status: 'Scheduled' };

        if (date) {
            const searchDate = new Date(date);
            searchDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);

            filter.date = {
                $gte: searchDate,
                $lt: nextDay
            };
        }

        const instances = await FlightInstance.find(filter)
            .populate('template')
            .lean();

        res.json(instances);
    } catch (err) {
        console.error('Error fetching flight instances:', err);
        res.status(500).json({ error: 'Failed to fetch flight instances' });
    }
});

module.exports = router;