const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const FlightInstance = require('../models/FlightInstance');
const Reservation = require('../models/Reservation');

//Get all unique origins, based on sirs suggestion
router.get('/origins', async (req, res) => {
try {
    const flights = await Flight.find({ active: true });
    const origins = [];
        
    //Extract unique origins manually
    for (let i = 0; i < flights.length; i++) {
        if (origins.indexOf(flights[i].origin) === -1) {
                origins.push(flights[i].origin);
        }
    }
        
        res.json(origins);
    } catch (err) {
        console.error('Error fetching origins:', err);
        res.status(500).json({ error: 'Failed to fetch origins' });
    }
});

//GET destinations based on origin
router.get('/destinations', async (req, res) => {
    try {
        const origin = req.query.origin;
        
        if (!origin) {
            return res.status(400).json({ error: 'Origin is required' });
        }

        const flights = await Flight.find({ origin: origin, active: true });
        const destinations = [];
        
        // Extract unique destinations manually
        for (let i = 0; i < flights.length; i++) {
        if (destinations.indexOf(flights[i].destination) === -1) {
            destinations.push(flights[i].destination);
        }
    }
        
        res.json(destinations);
    } catch (err) {
        console.error('Error fetching destinations:', err);
        res.status(500).json({ error: 'Failed to fetch destinations' });
    }
});

//GET available departure times for a specific route and date
router.get('/times', async (req, res) => {
    try {
        const origin = req.query.origin;
        const destination = req.query.destination;
        const date = req.query.date;

        if (!origin || !destination || !date) {
            return res.status(400).json({ error: 'Origin, destination, and date are required' });
        }

        //PARSED the date 
        const dateParts = date.split('-');
        const year = Number(dateParts[0]);
        const month = Number(dateParts[1]);
        const day = Number(dateParts[2]);
        const searchDate = new Date(year, month - 1, day);
        
        //GET day of week
        const dayIndex = searchDate.getDay();
        const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayOfWeek = daysMap[dayIndex];

        console.log('Searching for flights on ' + date + ' (' + dayOfWeek + ')');

        //FIND flight templates that match the route and operate on this day
        const flightTemplates = await Flight.find({
            origin: origin,
            destination: destination,
            active: true,
            daysOfWeek: dayOfWeek
        });

        //FILTER templates by season dates
        const validTemplates = [];
        for (let i = 0; i < flightTemplates.length; i++) {
            const flight = flightTemplates[i];
            const seasonStart = new Date(flight.seasonStart);
            const seasonEnd = new Date(flight.seasonEnd);
            
            // Set times to start/end of day for proper comparison
            seasonStart.setHours(0, 0, 0, 0);
            seasonEnd.setHours(23, 59, 59, 999);
            searchDate.setHours(0, 0, 0, 0);

            const isInSeason = searchDate >= seasonStart && searchDate <= seasonEnd;
            
            console.log('Flight ' + flight.flightNo + ': Season ' + seasonStart.toLocaleDateString() + ' to ' + seasonEnd.toLocaleDateString() + ', In season: ' + isInSeason);
            
            if (isInSeason) {
                validTemplates.push(flight);
            }
        }

        if (validTemplates.length === 0) {
            console.log('No valid templates found for this date');
            return res.json([]);
        }

        //CREATE date range for the search date
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

        console.log('Searching instances between ' + startOfDay + ' and ' + endOfDay);

        // EXTRACT flight numbers 
        const flightNos = [];
        for (let i = 0; i < validTemplates.length; i++) {
            flightNos.push(validTemplates[i].flightNo);
        }

        //FIND all flight instances for these templates on this date
        const instances = await FlightInstance.find({
            flightNo: { $in: flightNos },
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: 'Scheduled'
        });

        console.log('Found ' + instances.length + ' flight instances');

        //CALCULATES available seats 
        const availableFlights = [];
        
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            
            // Manually fetch the template 
            const template = await Flight.findOne({ flightNo: instance.flightNo });
            
            // Count confirmed reservations for this flight instance
            const reservationCount = await Reservation.countDocuments({
                flight: instance._id,
                status: 'Confirmed'
            });

            const availableSeats = instance.seats - reservationCount;

            console.log('Flight ' + instance.flightNo + ': ' + instance.seats + ' total seats, ' + reservationCount + ' booked, ' + availableSeats + ' available');

            // Only include flights with available seats
            if (availableSeats > 0) {
                availableFlights.push({
                _id: instance._id,
                flightNo: instance.flightNo,
                origin: template.origin,
                destination: template.destination,
                departureTime: instance.departureTime,
                arrivalTime: instance.arrivalTime,
                aircraft: template.aircraft,
                capacity: template.capacity,
                availableSeats: availableSeats,
                status: instance.status,
                date: instance.date
                });
            }
        }

        // Sort by departure time
        availableFlights.sort(function(a, b) {
            const timeA = new Date(a.departureTime);
            const timeB = new Date(b.departureTime);
            return timeA - timeB;
        });

        console.log('Returning ' + availableFlights.length + ' available flights');

        res.json(availableFlights);
    } catch (err) {
        console.error('Error fetching departure times:', err);
        res.status(500).json({ error: 'Failed to fetch departure times' });
    }
});

// Get flight instances for a specific flight number and date
router.get('/instances/:flightNo', async (req, res) => {
    try {
        const flightNo = req.params.flightNo;
        const date = req.query.date;

        const filter = { flightNo: flightNo, status: 'Scheduled' };

        if (date) {
            const dateParts = date.split('-');
            const year = Number(dateParts[0]);
            const month = Number(dateParts[1]);
            const day = Number(dateParts[2]);
            const searchDate = new Date(year, month - 1, day, 0, 0, 0, 0);
            const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

            filter.date = {
                $gte: searchDate,
                $lt: nextDay
            };
        }

        const instances = await FlightInstance.find(filter);

        // Calculate available seats for each instance 
        const instancesWithSeats = [];
        
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            
            // Manually fetch template
            const template = await Flight.findOne({ flightNo: instance.flightNo });
            
            const reservationCount = await Reservation.countDocuments({
                flight: instance._id,
                status: 'Confirmed'
            });

            instancesWithSeats.push({
                _id: instance._id,
                flightNo: instance.flightNo,
                date: instance.date,
                departureTime: instance.departureTime,
                arrivalTime: instance.arrivalTime,
                seats: instance.seats,
                status: instance.status,
                template: template,
                availableSeats: instance.seats - reservationCount
            });
        }

        res.json(instancesWithSeats);
    } catch (err) {
        console.error('Error fetching flight instances:', err);
        res.status(500).json({ error: 'Failed to fetch flight instances' });
    }
});

module.exports = router;