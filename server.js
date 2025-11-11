const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const Flight = require('./models/Flight');
const User = require('./models/User'); // for testing, remove as needed
const FlightInstance = require('./models/FlightInstance'); // for testing, remove as needed
const Reservation = require('./models/Reservation'); // for testing, remove as needed

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/flightAdminDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.engine('handlebars', exphbs.engine({
    helpers: {
        formatDate: (date) => {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString();
        },
        eq: (a, b) => a === b
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// MOCK USER FOR TESTING:
app.use(async (req, res, next) => {
    let testUser = await User.findOne({ email: 'laqr@gmail.com' });
    if (!testUser) {
        console.log('Creating mock user...');
        testUser = await User.create({
            fullName: 'Luis Roa',
            email: 'laqr@gmail.com',
            password: 'password123', 
            passportNo: 'A12345678',
            role: 'User' 
        });
        console.log('Mock user created with ID:', testUser._id);
    }
    req.user = testUser; 
    res.locals.user = testUser; 
    next();
});
// END OF TEST USER, REMOVE AS NEEDED

//routes
const flightRoutes = require('./routes/flightRoutes');
app.use('/flights', flightRoutes);

const flightRoutesAPI = require('./routes/flightRoutesAPI');
app.use('/api/flights', flightRoutesAPI);

const adminUserRoutes = require('./routes/adminUserRoutes');
app.use('/users', adminUserRoutes);

const adminUserRoutesAPI = require('./routes/adminUserRoutesAPI');
app.use('/api/users', adminUserRoutesAPI);

const manageReservationRoutes = require('./routes/manageReservationRoutes'); 
app.use('/reservations', manageReservationRoutes);

const manageReservationRoutesAPI = require('./routes/manageReservationRoutesAPI');
app.use('/api/reservations', manageReservationRoutesAPI);

const flightSearchRoutes = require('./routes/flightSearchRoutes');
app.use('/search', flightSearchRoutes);

const flightSearchAPI = require('./routes/flightSearchAPI');
app.use('/api/search', flightSearchAPI);


//Home
app.get('/', (req, res) =>{
    res.render('home', {
        title: 'Admin Dashboard',
        isAdmin: req.user.role === 'Admin' // for testing, remove as needed
    });
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

    try {
        console.log('Checking for test reservation...');

        const mockUser = await User.findOne({ email: 'laqr@gmail.com' });
        if (!mockUser) {
            console.log("Mock user not found, can't create reservation.");
            return;
        }

        const flightTemplate = await Flight.findOne({ flightNo: 'FL100' });
        if (!flightTemplate) {
            console.log("Flight template FL100 not found, can't create instance.");
            return;
        }

        let testInstance = await FlightInstance.findOne({ flightNo: 'FL100' });
        if (!testInstance) {
            console.log('Creating test flight instance...');
            testInstance = await FlightInstance.create({
                template: flightTemplate._id,
                flightNo: flightTemplate.flightNo,
                date: new Date('2025-11-12'),
                departureTime: new Date('2025-11-12T08:00:00'),
                arrivalTime: new Date('2025-11-12T09:30:00'),
                aircraftNo: 'RP-C1234',
                seats: flightTemplate.capacity
            });
            console.log('Test instance created.');
        }

        const existingRes = await Reservation.findOne({ user: mockUser._id, flight: testInstance._id });
        if (!existingRes) {
            console.log('Creating test reservation...');
            await Reservation.create({
                user: mockUser._id,
                flight: testInstance._id,
                mealType: 'Standard',
                seatNo: 14,
                baggage: 15,
                fareClass: 'Economy',
                totalPrice: 2500,
                status: 'Confirmed'
            });
            console.log('Test reservation created for user:', mockUser.email);
        } else {
            console.log('Test reservation already exists.');
        }

    } catch (err) {
        console.error('Error creating test reservation data:', err);
    }
});
