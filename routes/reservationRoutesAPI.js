const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const FlightInstance = require('../models/FlightInstance');

const BASE_COST = 500;
const EXTRA_WEIGHT_PER_COST = 10
const SEAT_PRICES = {
    "window": 50,
    "aisle": 25,
    "middle": 0,
}
const SEAT_TYPE = {
    'A': "window",
    'B': "middle",
    'C': "aisle",
    'D': "aisle",
    'E': "middle",
    'F': "window",
}
const MEAL_PRICES = {
    "Standard": 0,
    "Vegetarian": 100,
    "Kosher": 150,
};

//Get - Reservations of User
//Post - Create new reservation
//Patch - Update some parts of reservation

//Get existing reservations for flight instance
router.get('/:flightNo', async (req, res) => {
    const flightInstance = await FlightInstance.findOne({ flightNo: req.params.flightNo }).lean();
    if (!flightInstance) {
        res.status(400).json({ success: false, message: 'Flight instance not found' });
        return
    }

    const reservations = await Reservation.find({ flight: flightInstance._id }).lean();
    res.json({ flight: flightInstance, reservations });
});

//Get existing reservations for user
router.get('/user/:userId', async (req, res) => {
    const reservations = await Reservation.find({ user: req.params.userId })
    res.json({ reservations });
});

//Create new reservation
router.post('/:flightNo', async (req, res) => {
    console.log('Received reservation post request:', req.body);

    //Verify if user exists
    const userDataSent = req.body.user;
    const user = await User.findOne({
        firstName: userDataSent.firstName,
        lastName: userDataSent.lastName,
        email: userDataSent.email,
        passportNo: userDataSent.passportNo,
    }).lean();
    if (!user) {
        console.log('User not found with details:', userDataSent);
        res.status(400).json({ success: false, message: 'User not found' });
        return
    }

    //Verify if flight instance exists
    const flightInstance = await FlightInstance.findOne({ flightNo: req.params.flightNo }).lean();
    if (!flightInstance) {
        console.log('Flight instance not found with flightNo:', req.params.flightNo);
        res.status(400).json({ success: false, message: 'Flight instance not found' });
        return
    }

    //Verify if user has not already booked the flight
    const existingReservation = await Reservation.findOne({
        user: user._id,
        flight: flightInstance._id,
    }).lean();
    if (existingReservation) {
        console.log('User has already booked this flight:', user._id, flightInstance._id);
        res.status(400).json({ success: false, message: 'User has already booked this flight' });
        return
    }

    //Verify if seat is available
    const reservationDataSent = req.body.reservation;
    const seatToBeTaken = await Reservation.findOne({
        flight: flightInstance._id,
        seatNo: reservationDataSent.seatNo,
        status: 'Confirmed',
    }).lean();
    if (seatToBeTaken) {
        console.log('Seat already taken:', seatToBeTaken._id);
        res.status(400).json({ success: false, message: 'Seat already taken' });
        return
    }

    try {
        const mealOption = reservationDataSent.mealOption;
        const seatNo = reservationDataSent.seatNo;
        const extraBaggageWeight = reservationDataSent.extraBaggageWeight;
        //const seatInt = seatNo.slice(0, -1).tonumber();
        const seatChar = seatNo.slice(-1).toUpperCase();
        
        let totalPrice = BASE_COST;
        totalPrice += SEAT_PRICES[SEAT_TYPE[seatChar]] || 0;
        totalPrice += MEAL_PRICES[mealOption] || 0;
        totalPrice += extraBaggageWeight / EXTRA_WEIGHT_PER_COST;
        

        const newReservation = new Reservation({
            user:           user._id,
            flight:         flightInstance._id,
            mealType:       mealOption,
            extraBaggage:   extraBaggageWeight,
            seatNo:         seatNo,
            fareClass:      'Economy', //TODO: Add more fare classes
            totalPrice:     totalPrice,
        });
        await newReservation.save();
        console.log('Reservation created successfully for user:', user._id);
        res.status(201).json({ success: true, message: 'Reservation created!' });
    } catch {
        console.error('Reservation creation failed:', err.message);
        res.status(400).json({ success: false, error: err.message });
    }
});


//TODO: Do patch method
//Updates reservation info
router.patch('/:reservationId', async (req, res) => {
    //If already cancelled, do not update
});

module.exports = router; 