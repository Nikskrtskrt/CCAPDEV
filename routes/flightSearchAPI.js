const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const FlightInstance = require('../models/FlightInstance');
const Reservation = require('../models/Reservation');

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

// Get destinations based on origin
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

// Get available departure times for a specific route and date
router.get('/times', async (req, res) => {
    try {
        const { origin, destination, date } = req.query;

        if (!origin || !destination || !date) {
            return res.status(400).json({ error: 'Origin, destination, and date are required' });
        }

        // Parse the date in local timezone to avoid offset issues
        const [year, month, day] = date.split('-').map(Number);
        const searchDate = new Date(year, month - 1, day);
        
        // Get day of week
        const dayIndex = searchDate.getDay();
        const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayOfWeek = daysMap[dayIndex];

        console.log(`Searching for flights on ${date} (${dayOfWeek})`);

        // Find flight templates that match the route and operate on this day
        const flightTemplates = await Flight.find({
            origin,
            destination,
            active: true,
            daysOfWeek: dayOfWeek
        }).lean();

        // Filter templates by season dates
        const validTemplates = flightTemplates.filter(flight => {
        const seasonStart = new Date(flight.seasonStart);
        const seasonEnd = new Date(flight.seasonEnd);
            
        // Set times to start/end of day for proper comparison
        seasonStart.setHours(0, 0, 0, 0);
        seasonEnd.setHours(23, 59, 59, 999);
        searchDate.setHours(0, 0, 0, 0);

        const isInSeason = searchDate >= seasonStart && searchDate <= seasonEnd;
            
        console.log(`Flight ${flight.flightNo}: Season ${seasonStart.toLocaleDateString()} to ${seasonEnd.toLocaleDateString()}, In season: ${isInSeason}`);
            
        return isInSeason;
        });

        if (validTemplates.length === 0) {
        console.log('No valid templates found for this date');
        return res.json([]);
        }

        // Create date range for the search date (start and end of day)
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

        console.log(`Searching instances between ${startOfDay} and ${endOfDay}`);

        // Find all flight instances for these templates on this date
        const flightNos = validTemplates.map(t => t.flightNo);
        const instances = await FlightInstance.find({
        flightNo: { $in: flightNos },
        date: {
            $gte: startOfDay,
            $lte: endOfDay
            },
            status: 'Scheduled'
        }).populate('template').lean();

        console.log(`Found ${instances.length} flight instances`);

        // For each instance, calculate available seats
        const availableFlights = await Promise.all(instances.map(async (instance) => {
            // Count confirmed reservations for this flight instance
            const reservationCount = await Reservation.countDocuments({
            flight: instance._id,
            status: 'Confirmed'
            });

            const availableSeats = instance.seats - reservationCount;

            console.log(`Flight ${instance.flightNo}: ${instance.seats} total seats, ${reservationCount} booked, ${availableSeats} available`);

            // Only include flights with available seats
            if (availableSeats > 0) {
                return {
                _id: instance._id,
                flightNo: instance.flightNo,
                origin: instance.template.origin,
                destination: instance.template.destination,
                departureTime: instance.departureTime,
                arrivalTime: instance.arrivalTime,
                aircraft: instance.template.aircraft,
                capacity: instance.template.capacity,
                availableSeats: availableSeats,
                status: instance.status,
                date: instance.date
                };
            }
            return null;
        }));

        // Filter out null values and sort by departure time
        const filteredFlights = availableFlights
            .filter(f => f !== null)
            .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

        console.log(`Returning ${filteredFlights.length} available flights`);

        res.json(filteredFlights);
    } catch (err) {
        console.error('Error fetching departure times:', err);
        res.status(500).json({ error: 'Failed to fetch departure times' });
    }
});

// Get flight instances for a specific flight number and date
router.get('/instances/:flightNo', async (req, res) => {
    try {
        const { flightNo } = req.params;
        const { date } = req.query;

        let filter = { flightNo, status: 'Scheduled' };

        if (date) {
            const [year, month, day] = date.split('-').map(Number);
            const searchDate = new Date(year, month - 1, day, 0, 0, 0, 0);
            const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

            filter.date = {
                $gte: searchDate,
                $lt: nextDay
            };
        }

        const instances = await FlightInstance.find(filter)
            .populate('template')
            .lean();

        // Calculate available seats for each instance
        const instancesWithSeats = await Promise.all(instances.map(async (instance) => {
            const reservationCount = await Reservation.countDocuments({
                flight: instance._id,
                status: 'Confirmed'
            });

            return {
                ...instance,
                availableSeats: instance.seats - reservationCount
            };
        }));

        res.json(instancesWithSeats);
    } catch (err) {
        console.error('Error fetching flight instances:', err);
        res.status(500).json({ error: 'Failed to fetch flight instances' });
    }
});

module.exports = router;
