const express   = require('express');
const router    = express.Router();
const User              = require('../models/User');
const Reservation       = require('../models/Reservation');
const FlightInstance    = require('../models/FlightInstance');

//For Debugging Purposes
router.get('/', async (req, res) => {
    try {
        //Note: Pass desired FlightInstance data
        //request.params.flightNo;
        const flightInstance = await FlightInstance.findOne({ flightNo: "FL100" }).lean();

        console.log(user, flightInstance);

        res.render('reservation/booking', {
            title: 'Reservation Form',
            flightInstance,
        });

    } catch {
        res.render('error', { subtext: 'Failed to load booking form.' });
    }
});

router.get('/:flightNo', async (req, res) => {
    try {
        //Note: Pass desired FlightInstance data
        //request.params.flightNo;
        const flightInstance = await FlightInstance.findOne({ flightNo: req.params.flightNo }).lean();

        res.render('reservation/booking', {
            title: 'Reservation Form', 
            flightInstance,
        });

    } catch {
        res.render('error', { subtext: 'Failed to load booking form.' });
    }
});

module.exports = router; 