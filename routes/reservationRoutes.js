const express   = require('express');
const router    = express.Router();
const User              = require('../models/User');
const Reservation       = require('../models/Reservation');
const FlightInstance    = require('../models/FlightInstance');
const Flight            = require('../models/Flight');


async function handleGetRequest(req, res, flightNo, date) {
    try {
        //Note: Pass desired FlightInstance data
        //request.params.flightNo;
        const flight = await Flight.findOne({ flightNo: flightNo }).lean();
        const flightInstance = await FlightInstance.findOne({ flightNo: flightNo, date: date  });
        //console.log(flightInstance);

        let flightInstanceToPass = flightInstance.toJSON();
        flightInstanceToPass.date = flightInstance.date.toDateString();
        
        //console.log(flightInstanceToPass);

        res.render('reservation/booking', {
            title: 'Reservation Form',
            user: req.session.user,
            flightInstance: flightInstanceToPass,
            flight,
        });

    } catch(err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

//For Debugging purposes
router.get('/', async (req, res) => {
    handleGetRequest(req, res, "FL100", 2025-11-30);
});

router.get('/:flightNo/:date', async (req, res) => {
    handleGetRequest(req, res, req.params.flightNo, req.params.date);
});

module.exports = router; 