const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const User  = require('./models/User');
const Flight = require('./models/Flight');
const session = require('express-session');

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
app.use(session({
    secret: 'IHateVibeCodersWithAllMyBeing',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 //24 hours
    } 
}));

//routes
const flightRoutes = require('./routes/adminRoutes/flightRoutes');
app.use('/flights', flightRoutes);

const adminUserRoutes = require('./routes/adminRoutes/adminUserRoutes');
app.use('/users', adminUserRoutes);

const manageReservationRoutes = require('./routes/manageReservationRoutes'); 
app.use('/reservations', manageReservationRoutes);

//back-end api routes
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

const userRoutes = require('./routes/userRoutes/userProfile');
app.use('/', userRoutes);

const flightRoutesAPI = require('./routes/adminRoutes/flightRoutesAPI');
app.use('/api/flights', flightRoutesAPI);

const adminUserRoutesAPI = require('./routes/adminRoutes/adminUserRoutesAPI');
app.use('/api/users', adminUserRoutesAPI);

const manageReservationRoutesAPI = require('./routes/manageReservationRoutesAPI');
app.use('/api/reservations', manageReservationRoutesAPI);

const reservationRoutes = require('./routes/reservationRoutes');
app.use('/reservation', reservationRoutes);

const reservationRoutesAPI = require('./routes/reservationRoutesAPI');

const FlightInstance = require('./models/FlightInstance');
app.use('/api/bookingReservation', reservationRoutesAPI);

const flightSearchRoutes = require('./routes/flightSearchRoutes');
app.use('/search', flightSearchRoutes);

const flightSearchAPI = require('./routes/flightSearchAPI');
app.use('/api/search', flightSearchAPI);

//Home
app.get('/', (req, res) =>{
    res.render('home', {
        title: 'Welcome',
    });
});

app.listen(PORT, async () => {
    console.log(` Server running at http://localhost:${PORT}`);
});
