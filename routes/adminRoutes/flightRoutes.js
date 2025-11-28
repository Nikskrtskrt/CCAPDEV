const express   = require('express');
const router    = express.Router();

//models
const Flight            = require('../../models/Flight');
const FlightInstance    = require('../../models/FlightInstance');
const { isAuthenticated } = require('../../middlewares/authMiddleware');

router.get('/',isAuthenticated('Admin'), async (req, res) => {
    try {
        const flights = await Flight.find().lean();
        res.render('admin/flights/list', { title: 'Flight Templates', 
            flights,
            daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            });
    } catch (err){
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router; 