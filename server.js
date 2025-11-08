const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const Flight = require('./models/Flight');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/flightAdminDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

//routes
const flightRoutes = require('./routes/flightRoutes');
app.use('/flights', flightRoutes);

const flightRoutesAPI = require('./routes/flightRoutesAPI');
app.use('/api/flights', flightRoutesAPI);

const adminUserRoutes = require('./routes/adminUserRoutes');
app.use('/users', adminUserRoutes);

const adminUserRoutesAPI = require('./routes/adminUserRoutesAPI');
app.use('/api/users', adminUserRoutesAPI);

const reservationRoutes = require('./routes/reservationRoutes');
app.use('/reservation', reservationRoutes);

const reservationRoutesAPI = require('./routes/reservationRoutesAPI');
const FlightInstance = require('./models/FlightInstance');
app.use('/api/reservations', reservationRoutesAPI);

//Home
app.get('/', (req, res) =>{
    res.render('home', {title: 'Admin Dashboard'});
});

app.listen(PORT, async () => {
    console.log(` Server running at http://localhost:${PORT}`);

    const count = await Flight.countDocuments();
    if (count === 0) {
        console.log('Seeding test flights...');
        await Flight.insertMany([
            {
            flightNo: 'FL100',
            origin: 'Manila',
            destination: 'Cebu',
            daysOfWeek: ['Mon','Wed','Fri'],
            departure: '08:00',
            arrival: '09:30',
            seasonStart: new Date('2025-11-01'),
            seasonEnd: new Date('2025-12-31'),
            aircraft: 'A320',
            capacity: 180
            },
            {
            flightNo: 'FL101',
            origin: 'Cebu',
            destination: 'Manila',
            daysOfWeek: ['Tue','Thu','Sat'],
            departure: '10:00',
            arrival: '11:30',
            seasonStart: new Date('2025-11-01'),
            seasonEnd: new Date('2025-12-31'),
            aircraft: 'A320',
            capacity: 180
            },
            {
            flightNo: 'FL102',
            origin: 'Manila',
            destination: 'Davao',
            daysOfWeek: ['Mon','Tue','Wed','Thu','Fri'],
            departure: '12:00',
            arrival: '14:00',
            seasonStart: new Date('2025-11-01'),
            seasonEnd: new Date('2025-12-31'),
            aircraft: 'B737',
            capacity: 160
            }
        ]);

        console.log('Test flights seeded.');
    }

    const countInstances = await FlightInstance.countDocuments();
    if (countInstances === 0) {
        console.log('Seeding testing flight instances...');

        const flight1 = await Flight.findOne({ flightNo: 'FL100' });
        //const flight2 = await Flight.findOne({ flightNo: 'FL101' });
        //const flight3 = await Flight.findOne({ flightNo: 'FL102' });

        await FlightInstance.insertMany([
            {
                template:       flight1._id,
                flightNo:       flight1.flightNo,
                date:           new Date('2025-11-30'),
                departureTime:  new Date(2025, 10, 30, 8, 0),
                arrivalTime:    new Date(2025, 10, 30, 9, 30),
    
                aircraftNo:     'A1234',
                status:         'Scheduled',

                seats:          flight1.capacity,
            },
        ]);
        console.log('Test flight instances seeded.');
    }
});
