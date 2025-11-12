const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

router.get('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { mealType, seatNo, baggage } = req.body;

        const updatedReservation = await Reservation.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id }, 
            {
                $set: {
                    mealType,
                    seatNo: Number(seatNo) || 0,
                    baggage: Number(baggage) || 0
                }
            },
            { new: true } 
        );

        if (!updatedReservation) {
            return res.status(404).json({ error: 'Reservation not found or access denied' });
        }
        res.json(updatedReservation);

    } catch (err) {
        res.status(500).json({ error: 'Error updating reservation' });
    }
});

router.put('/:id/cancel', async (req, res) => {
    try {
        const cancelledReservation = await Reservation.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { $set: { status: 'Cancelled' } },
            { new: true }
        );

        if (!cancelledReservation) {
            return res.status(404).json({ error: 'Reservation not found or access denied' });
        }
        res.json({ message: 'Reservation successfully cancelled', reservation: cancelledReservation });

    } catch (err) {
        res.status(500).json({ error: 'Error cancelling reservation' });
    }
});

module.exports = router;