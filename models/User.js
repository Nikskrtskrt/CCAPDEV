const mongoose = require('mongoose');

const userSchmea = new mongoose.Schema({
    fullName:   {type: String, required: true},
    email:      {type: String, required: true}, 
    password:   {type: String, required: true},
    passportNo: {type: String, required: true},

    role:       {type: String, enum: ['User', 'Admin'], default: 'Passenger'},
});

module.export = new mongoose.Schema('User', userSchema);