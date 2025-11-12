const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight:     { type: mongoose.Schema.Types.ObjectId, ref: 'FlightInstance', required: true },

    mealType:   { type: String, enum: ['Standard', 'Vegetarian', 'Kosher', 'Halal', 'Vegan'], default: 'Standard' },
    seatNo:     { type: String, default: 0 }, //changed to string as requested
    baggage:    { type: Number, default: 0 }, //in kilos as mentioned by sir

    fareClass:  { type: String, enum: ['Economy', 'Business', 'First'], default: 'Economy' },
    totalPrice: { type: Number, required: true },

    status:     { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' }
});

module.exports = mongoose.model('Reservation', reservationSchema);
