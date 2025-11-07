const express   = require('express');
const router    = express.Router();
const Flight    = require('../models/Flight');
const FlightInstance = require('../models/FlightInstance');

router.post('/', async (req, res) => {
    try {
        const flight = new Flight(req.body);
        await flight.save();
        res.status(201).json({ success: true, message: 'Flight template added!' });
    } catch (err) {
        console.error('Flight creation failed:', err.message);
        res.status(400).json({ success: false, error: err.message });
    }
});

// router.get('/', async (req, res) => {
//     try {
//         const flights = await Flight.find().lean();
//         res.json(flights);
//     } catch {
//         res.status(500).json({ error: 'Failed to fetch flights' });
//     }
// });

router.get('/:id', async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id).lean();
        if (!flight) return res.status(404).json({ error: 'Flight not found' });
        res.json(flight);
    } catch {
        res.status(400).json({ error: 'Invalid flight ID' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        await Flight.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true });
    } catch {
        res.status(400).json({ success: false, error: 'Failed to update flight' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Flight.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch {
        res.status(400).json({ success: false, error: 'Failed to delete flight' });
    }
});

router.post('/:id/generate', async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id).lean();
        if (!flight) return res.status(404).json({ error: 'Template not found' });

        const { seasonStart, seasonEnd, daysOfWeek, departure, arrival } = flight;
        const start = new Date(seasonStart);
        const end = new Date(seasonEnd);
        const generated = [];

        
        function createDateWithTime(baseDate, timeStr) {
            const [hour, minute] = timeStr.split(':').map(Number);
            const dt = new Date(baseDate.getTime()); 
            dt.setHours(hour, minute, 0, 0); 
            return dt;
        }

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
            if (daysOfWeek.includes(weekday)) {
                const depDate = createDateWithTime(d, departure);
                const arrDate = createDateWithTime(d, arrival);

                const exists = await FlightInstance.findOne({
                    template: flight._id,
                    departureTime: depDate
                });

                if (!exists) {
                    generated.push({
                        template: flight._id,
                        flightNo: flight.flightNo,
                        date: new Date(d.getTime()),
                        departureTime: depDate,
                        arrivalTime: arrDate,
                        aircraftNo: flight.aircraft,
                        seats: flight.capacity
                    });
                }
            }
        }

        if (generated.length) {
            await FlightInstance.insertMany(generated);
        }

        res.json({ success: true, message: `${generated.length} instances created.` });
    } catch (err) {
        console.error('Generate route failed:', err);
        res.status(500).json({ error: 'Failed to generate flights' });
    }
});

module.exports = router;