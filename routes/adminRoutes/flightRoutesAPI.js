const express = require('express');
const router = express.Router();
const Flight = require('../../models/Flight');
const FlightInstance = require('../../models/FlightInstance');
const { isAuthenticated, hasPermission } = require('../../middlewares/authMiddleware');

router.post('/', 
    isAuthenticated('Admin'), 
    hasPermission('edit-flight'), 
    async (req, res) => {
        try {
            const flight = new Flight(req.body);
            await flight.save();

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

            if (generated.length) await FlightInstance.insertMany(generated);

            res.status(201).json({ success: true, message: `Flight created with ${generated.length} instances!` });
        } catch (err) {
            console.error('Flight creation failed:', err.message);
            res.status(400).json({ success: false, error: err.message });
        }
});

router.get('/:id', isAuthenticated('Admin'), async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id).lean();
        const instances = await FlightInstance.find({ template: flight._id }).lean();
        res.json({ flight, instances });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to load flight details' });
    }
});

router.put('/:id', 
    isAuthenticated('Admin'), 
    hasPermission('edit-flight'), 
    async (req, res) => {
        try {
            await Flight.findByIdAndUpdate(req.params.id, req.body);
            res.json({ success: true });
        } catch {
            res.status(400).json({ success: false, error: 'Failed to update flight' });
        }
});

router.delete('/:id', 
    isAuthenticated('Admin'), 
    hasPermission('edit-flight'), 
    async (req, res) => {
        try {
            await Flight.findByIdAndDelete(req.params.id);
            await FlightInstance.deleteMany({ template: req.params.id });
            res.json({ success: true });
        } catch {
            res.status(400).json({ success: false, error: 'Failed to delete flight' });
        }
});

router.delete('/instance/:id', 
    isAuthenticated('Admin'), 
    hasPermission('edit-flight'), 
    async (req, res) => {
        try {
            await FlightInstance.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } catch {
            res.status(400).json({ success: false, error: 'Failed to delete instance' });
        }
});

module.exports = router;