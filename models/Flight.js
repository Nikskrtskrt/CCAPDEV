const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({

    flightNo:   {type: String, required: true, unique: true},
    origin:     {type: String, required: true},
    destination:{type: String, required: true}, 
    
    daysOfWeek: [{type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], required: true}],
    departure:  {type: String, required: true}, 
    arrival:    {type: String, required: true},

    seasonStart:{type: Date, required: true},
    seasonEnd:  {type: Date, required: true},

    aircraft:   {type: String, required: true},
    capacity:   {type: Number, required: true},

    active:     {type: Boolean, default: true}
});

module.exports = mongoose.model('Flight', flightSchema);


