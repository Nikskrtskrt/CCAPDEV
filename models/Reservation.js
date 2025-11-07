const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user:   {type: mongoose.Schema.Type.ObjectId, ref: 'User', required: true},
    flight: {type: mongoose.Schema.Type.ObjectId, ref: 'FlightInstance', required: true},

    mealType:   {type: String, enum: ['Standard', 'Vegetarian', 'Kosher', 'Halal', 'Vegan'], default: 'Standard'},
    seatNo:     {type: Number, default: 0},
    
    fareClass:  {type: String, enum: ['Economy', 'Business', 'First'], default: 'Economy'},
    totalPrice: {type: Number, required: true},
    
    status:     {type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed'}
});

module.export = new mongoose.Schema('Reservation', reservationSchema);