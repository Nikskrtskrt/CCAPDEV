const express   = require('express');
const router    = express.Router();
const User              = require('../models/User');
const Reservation       = require('../models/Reservation');
const FlightInstance    = require('../models/FlightInstance');
const Flight            = require('../models/Flight');

//For Debugging Purposes
router.get('/', async (req, res) => {
    try {
        //Note: Pass desired FlightInstance data
        //request.params.flightNo;
        const flight = await Flight.findOne({ flightNo: "FL100" }).lean();
        const flightInstance = await FlightInstance.findOne({ flightNo: "FL100" });
        //console.log(flightInstance);

        let flightInstanceToPass = flightInstance.toJSON();
        flightInstanceToPass.date = flightInstance.date.toDateString();
        
        //console.log(flightInstanceToPass);

        res.render('reservation/booking', {
            title: 'Reservation Form',
            flight,
            flightInstance: flightInstanceToPass,
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