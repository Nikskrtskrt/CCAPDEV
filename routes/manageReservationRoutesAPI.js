const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const FlightInstance = require('../models/FlightInstance');

router.get('/user', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const reservations = await Reservation.find({
            user: req.session.user._id 
        }).lean();

        const flightIds = reservations.map(reservation => reservation.flight);
        const flights = await FlightInstance.find({
            _id: { "$in": flightIds }
        }).lean();

        res.json({ reservations: reservations, flights: flights });
    } catch (err) {
        console.error("Error in GET /user:", err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const { mealType, seatNo, baggage } = req.body;

        const updatedReservation = await Reservation.findOneAndUpdate(
            { 
                _id: req.params.id, 
                user: req.session.user._id 
            }, 
            {
                $set: {
                    mealType,
                    seatNo,
                    baggage
                }
            },
            { new: true } 
        );

        if (!updatedReservation) {
            return res.status(404).json({ error: 'Reservation not found or access denied' });
        }

        res.json(updatedReservation); 
    } catch (err) {
        console.error("Error in PUT /:id :", err);
        res.status(500).json({ error: 'Error updating reservation' });
    }
});

router.put('/:id/cancel', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const cancelledReservation = await Reservation.findOneAndUpdate(
            { 
                _id: req.params.id, 
                user: req.session.user._id 
            },
            { $set: { status: 'Cancelled' } },
            { new: true }
        );

        if (!cancelledReservation) {
            return res.status(404).json({ error: 'Reservation not found or access denied' });
        }
        res.json({ message: 'Reservation successfully cancelled', reservation: cancelledReservation });

    } catch (err) {
        console.error("Error in CANCEL:", err);
        res.status(500).json({ error: 'Error cancelling reservation' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }   

        const deletedReservation = await Reservation.findOneAndDelete({
            _id: req.params.id,
            user: req.session.user._id 
        });

        if (!deletedReservation) {
            return res.status(404).json({ error: 'Reservation not found or access denied.' });
        }

        res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (err) {
        console.error("Error in DELETE:", err);
        res.status(500).json({ error: 'Error deleting reservation' });
    }
});

module.exports = router;