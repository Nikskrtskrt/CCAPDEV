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

        //console.log(flightInstance);

        res.render('reservation/booking', {
            title: 'Reservation Form',
            flightInstance,
        });

    } catch(err) {
        res.status(400).json({ success: false, error: err.message });
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

    } catch(err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.get('/:flightNo/:userId', async (req, res) => {
    try {
        //Note: Pass desired FlightInstance data
        //request.params.flightNo;
        const flightInstance = await FlightInstance.findOne({ flightNo: req.params.flightNo }).lean();

        res.render('reservation/booking', {
            title: 'Reservation Form', 
            flightInstance,
        });

    } catch(err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router; 