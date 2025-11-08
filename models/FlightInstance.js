const mongoose = require('mongoose');

const flightInstanceSchema = new mongoose.Schema({
    template:   {type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true}, 

    flightNo:   {type: String, required: true},
    date:       {type: Date, required: true},
    departureTime:   {type: Date, required: true},
    arrivalTime:{type: Date, reqruied:true},
    
    aircraftNo: {type: String},
    status:     {type: String, enum:['Scheduled', 'Cancelled', 'Completed'], default: 'Scheduled'},

    seats:      {type: Number, required: true}
})

module.exports = mongoose.model('FlightInstance', flightInstanceSchema);

