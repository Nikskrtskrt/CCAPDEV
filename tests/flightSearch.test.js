const bcrypt = require('bcrypt');
const request = require('supertest');
const AccountConstants = require('../tests/AccountConstants');

const app = require('../server');
const User = require('../models/User');
const Flight = require('../models/Flight');
const FlightInstance = require('../models/FlightInstance');
const Reservation = require('../models/Reservation');

const BASE_USER_INFO = AccountConstants.BASE_USER_INFO_4;

const now = new Date(Date.now());
now.setUTCHours(0, 0, 0, 0);
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);

const FLIGHT_NO = "FSTEST001";
const FLIGHT_DATE_STR = tomorrow.toISOString().split('T')[0];

const FLIGHT_INFO = {
    flightNo: FLIGHT_NO,
    origin: "Manila",
    destination: "Cebu",
    departure: "08:00",
    arrival: "09:30",
    aircraft: "Boeing 737",
    capacity: 180,
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    seasonStart: new Date("2025-01-01"),
    seasonEnd: new Date("2025-12-31"),
    active: true
};

let userAgent;
let testUser;
let testFlight;
let testFlightInstance;
let consoleErrorSpy;

beforeAll(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    userAgent = await request.agent(app);
});

afterAll(async () => {
    if (consoleErrorSpy) consoleErrorSpy.mockRestore();
    await logout();
});

function createDateWithTime(baseDate, timeStr) {
    const [hour, minute] = timeStr.split(':').map(Number);
    const dt = new Date(baseDate.getTime());
    dt.setUTCHours(hour, minute, 0, 0);
    return dt;
}

async function login() {
    await userAgent
        .post("/login")
        .send(BASE_USER_INFO);
}

async function logout() {
    await userAgent
        .get("/logout")
        .send();
}

beforeAll(async () => {
    userAgent = await request.agent(app);
    
    await userAgent
        .post("/register")
        .send(BASE_USER_INFO);
    
    testUser = await User.findOne({ email: BASE_USER_INFO.email });
    
    await login();
});

afterAll(async () => {
    await logout();
    await User.deleteMany({ email: BASE_USER_INFO.email });
    await Flight.deleteMany({ flightNo: FLIGHT_NO });
    await FlightInstance.deleteMany({ flightNo: FLIGHT_NO });
    await Reservation.deleteMany({ user: testUser._id });
});

describe("Testing flightSearchRoutes.js", () => {
    beforeAll(async () => {
        testFlight = await new Flight(FLIGHT_INFO);
        await testFlight.save();
    });

    afterAll(async () => {
        await Flight.deleteMany({ flightNo: FLIGHT_NO });
    });

    test("GET /search - should render search page with origins", async () => {
        const result = await userAgent
            .get('/search');
        
        expect(result.statusCode).toBe(200);
        expect(result.text).toContain('Search Flights');
        expect(result.text).toContain(FLIGHT_INFO.origin);
    });

    test("GET /search - should handle errors gracefully", async () => {
        const originalFind = Flight.find;
        Flight.find = jest.fn(() => ({
            lean: jest.fn().mockRejectedValue(new Error('Database error'))
        }));
        
        const result = await userAgent
            .get('/search');
        
        expect(result.statusCode).toBe(500);
        expect(result.text).toContain('Error');
        
        Flight.find = originalFind;
    });
});

describe("Testing flightSearchAPI.js - GET /api/search/origins", () => {
    beforeAll(async () => {
        testFlight = await new Flight(FLIGHT_INFO);
        await testFlight.save();
    });

    afterAll(async () => {
        await Flight.deleteMany({ flightNo: FLIGHT_NO });
    });

    test("Should return unique origins", async () => {
        const result = await userAgent
            .get('/api/search/origins');
        
        expect(result.statusCode).toBe(200);
        expect(Array.isArray(result.body)).toBe(true);
        expect(result.body).toContain(FLIGHT_INFO.origin);
    });

    test("Should only return active flights", async () => {
        const inactiveFlight = await new Flight({
            ...FLIGHT_INFO,
            flightNo: 'FL888',
            origin: 'Davao',
            active: false
        });
        await inactiveFlight.save();

        const result = await userAgent
            .get('/api/search/origins');
        
        expect(result.statusCode).toBe(200);
        expect(result.body).not.toContain('Davao');
        
        await Flight.deleteOne({ flightNo: 'FL888' });
    });

    test("Should handle database errors", async () => {
        const originalFind = Flight.find;
        Flight.find = jest.fn().mockRejectedValue(new Error('Database error'));
        
        const result = await userAgent
            .get('/api/search/origins');
        
        expect(result.statusCode).toBe(500);
        expect(result.body.error).toBe('Failed to fetch origins');
        
        Flight.find = originalFind;
    });
});

describe("Testing flightSearchAPI.js - GET /api/search/destinations", () => {
    beforeAll(async () => {
        testFlight = await new Flight(FLIGHT_INFO);
        await testFlight.save();
    });

    afterAll(async () => {
        await Flight.deleteMany({ flightNo: FLIGHT_NO });
    });

    test("Should return destinations for valid origin", async () => {
        const result = await userAgent
            .get(`/api/search/destinations?origin=${FLIGHT_INFO.origin}`);
        
        expect(result.statusCode).toBe(200);
        expect(Array.isArray(result.body)).toBe(true);
        expect(result.body).toContain(FLIGHT_INFO.destination);
    });

    test("Should return 400 if origin is missing", async () => {
        const result = await userAgent
            .get('/api/search/destinations');
        
        expect(result.statusCode).toBe(400);
        expect(result.body.error).toBe('Origin is required');
    });

    test("Should return empty array for origin with no destinations", async () => {
        const result = await userAgent
            .get('/api/search/destinations?origin=NonExistentCity');
        
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual([]);
    });

    test("Should only return destinations from active flights", async () => {
        const result = await userAgent
            .get(`/api/search/destinations?origin=${FLIGHT_INFO.origin}`);
        
        expect(result.statusCode).toBe(200);
        expect(result.body.length).toBeGreaterThan(0);
    });
});

describe("Testing flightSearchAPI.js - GET /api/search/times", () => {
    beforeAll(async () => {
        testFlight = await new Flight(FLIGHT_INFO);
        await testFlight.save();

        const departureTime = createDateWithTime(tomorrow, "08:00");
        const arrivalTime = createDateWithTime(tomorrow, "09:30");

        const FLIGHT_INSTANCE_INFO = {
            template: testFlight._id,
            flightNo: FLIGHT_NO,
            date: tomorrow,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            aircraftNo: FLIGHT_INFO.aircraft,
            status: "Scheduled",
            seats: FLIGHT_INFO.capacity,
        };

        testFlightInstance = await new FlightInstance(FLIGHT_INSTANCE_INFO);
        await testFlightInstance.save();
    });

    afterAll(async () => {
        await Flight.deleteMany({ flightNo: FLIGHT_NO });
        await FlightInstance.deleteMany({ flightNo: FLIGHT_NO });
        await Reservation.deleteMany({ user: testUser._id });
    });

    test("Should return available times for valid route and date", async () => {
        const result = await userAgent
            .get('/api/search/times')
            .query({
                origin: FLIGHT_INFO.origin,
                destination: FLIGHT_INFO.destination,
                date: FLIGHT_DATE_STR
            });
        
        expect(result.statusCode).toBe(200);
        expect(Array.isArray(result.body)).toBe(true);
        expect(result.body.length).toBeGreaterThan(0);
        expect(result.body[0].flightNo).toBe(FLIGHT_NO);
        expect(result.body[0].availableSeats).toBe(FLIGHT_INFO.capacity);
    });

    test("Should return 400 if required parameters are missing", async () => {
        const result = await userAgent
            .get('/api/search/times')
            .query({ origin: FLIGHT_INFO.origin });
        
        expect(result.statusCode).toBe(400);
        expect(result.body.error).toBe('Origin, destination, and date are required');
    });

    test("Should return empty array for dates outside season", async () => {
        const result = await userAgent
            .get('/api/search/times')
            .query({
                origin: FLIGHT_INFO.origin,
                destination: FLIGHT_INFO.destination,
                date: '2026-12-01'
            });
        
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual([]);
    });

    test("Should calculate available seats correctly with reservations", async () => {
        const RESERVATION_INFO = {
            user: testUser._id,
            flight: testFlightInstance._id,
            mealType: 'Standard',
            seatNo: 'A1',
            baggage: 5,
            fareClass: 'Economy',
            totalPrice: 500,
            status: 'Confirmed'
        };
        
        const testReservation = await new Reservation(RESERVATION_INFO);
        await testReservation.save();

        const result = await userAgent
            .get('/api/search/times')
            .query({
                origin: FLIGHT_INFO.origin,
                destination: FLIGHT_INFO.destination,
                date: FLIGHT_DATE_STR
            });
        
        expect(result.statusCode).toBe(200);
        expect(result.body[0].availableSeats).toBe(FLIGHT_INFO.capacity - 1);
        
        await Reservation.deleteOne({ _id: testReservation._id });
    });

    test("Should not include flights with zero available seats", async () => {
        const reservations = [];
        for (let i = 0; i < FLIGHT_INFO.capacity; i++) {
            reservations.push({
                user: testUser._id,
                flight: testFlightInstance._id,
                seatNo: `${Math.floor(i / 6) + 1}${String.fromCharCode(65 + (i % 6))}`,
                mealType: 'Standard',
                baggage: 5,
                fareClass: 'Economy',
                totalPrice: 500,
                status: 'Confirmed'
            });
        }
        await Reservation.insertMany(reservations);

        const result = await userAgent
            .get('/api/search/times')
            .query({
                origin: FLIGHT_INFO.origin,
                destination: FLIGHT_INFO.destination,
                date: FLIGHT_DATE_STR
            });

        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual([]);
        
        await Reservation.deleteMany({ user: testUser._id });
    });

    test("Should not include cancelled flight instances", async () => {
        await FlightInstance.findByIdAndUpdate(testFlightInstance._id, {
            status: 'Cancelled'
        });

        const result = await userAgent
            .get('/api/search/times')
            .query({
                origin: FLIGHT_INFO.origin,
                destination: FLIGHT_INFO.destination,
                date: FLIGHT_DATE_STR
            });

        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual([]);
        
        await FlightInstance.findByIdAndUpdate(testFlightInstance._id, {
            status: 'Scheduled'
        });
    });

    test("Should sort results by departure time", async () => {
        const laterFlight = await new Flight({
            ...FLIGHT_INFO,
            flightNo: 'FSTEST002',
            departure: '14:00',
            arrival: '15:30'
        });
        await laterFlight.save();

        const laterDepTime = createDateWithTime(tomorrow, "14:00");
        const laterArrTime = createDateWithTime(tomorrow, "15:30");

        const laterInstance = await new FlightInstance({
            template: laterFlight._id,
            flightNo: 'FSTEST002',
            date: tomorrow,
            departureTime: laterDepTime,
            arrivalTime: laterArrTime,
            aircraftNo: FLIGHT_INFO.aircraft,
            seats: FLIGHT_INFO.capacity,
            status: 'Scheduled'
        });
        await laterInstance.save();

        const result = await userAgent
            .get('/api/search/times')
            .query({
                origin: FLIGHT_INFO.origin,
                destination: FLIGHT_INFO.destination,
                date: FLIGHT_DATE_STR
            });

        expect(result.statusCode).toBe(200);
        expect(result.body.length).toBeGreaterThanOrEqual(2);
        
        const firstTime = new Date(result.body[0].departureTime).getTime();
        const secondTime = new Date(result.body[1].departureTime).getTime();
        expect(firstTime).toBeLessThan(secondTime);
        
        await Flight.deleteOne({ flightNo: 'FSTEST002' });
        await FlightInstance.deleteMany({ flightNo: 'FSTEST002' });
    });
});

describe("Testing flightSearchAPI.js - GET /api/search/instances/:flightNo", () => {
    beforeAll(async () => {
        testFlight = await new Flight(FLIGHT_INFO);
        await testFlight.save();

        const departureTime = createDateWithTime(tomorrow, "08:00");
        const arrivalTime = createDateWithTime(tomorrow, "09:30");

        const FLIGHT_INSTANCE_INFO = {
            template: testFlight._id,
            flightNo: FLIGHT_NO,
            date: tomorrow,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            aircraftNo: FLIGHT_INFO.aircraft,
            status: "Scheduled",
            seats: FLIGHT_INFO.capacity,
        };

        testFlightInstance = await new FlightInstance(FLIGHT_INSTANCE_INFO);
        await testFlightInstance.save();
    });

    afterAll(async () => {
        await Flight.deleteMany({ flightNo: FLIGHT_NO });
        await FlightInstance.deleteMany({ flightNo: FLIGHT_NO });
        await Reservation.deleteMany({ user: testUser._id });
    });

    test("Should return flight instances for valid flight number", async () => {
        const result = await userAgent
            .get(`/api/search/instances/${FLIGHT_NO}`);

        expect(result.statusCode).toBe(200);
        expect(Array.isArray(result.body)).toBe(true);
        expect(result.body.length).toBeGreaterThan(0);
        expect(result.body[0].flightNo).toBe(FLIGHT_NO);
    });

    test("Should filter instances by date when provided", async () => {
        const result = await userAgent
            .get(`/api/search/instances/${FLIGHT_NO}`)
            .query({ date: FLIGHT_DATE_STR });

        expect(result.statusCode).toBe(200);
        expect(result.body.every(inst => {
            const instDate = new Date(inst.date).toDateString();
            const queryDate = new Date(FLIGHT_DATE_STR).toDateString();
            return instDate === queryDate;
        })).toBe(true);
    });

    test("Should return empty array for non-existent flight number", async () => {
        const result = await userAgent
            .get('/api/search/instances/NONEXISTENT');

        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual([]);
    });

    test("Should include template information in response", async () => {
        const result = await userAgent
            .get(`/api/search/instances/${FLIGHT_NO}`);

        expect(result.statusCode).toBe(200);
        expect(result.body[0].template).toBeDefined();
        expect(result.body[0].template.origin).toBe(FLIGHT_INFO.origin);
    });

    test("Should calculate available seats correctly", async () => {
        const result = await userAgent
            .get(`/api/search/instances/${FLIGHT_NO}`)
            .query({ date: FLIGHT_DATE_STR });

        expect(result.statusCode).toBe(200);
        expect(result.body[0].availableSeats).toBeDefined();
        expect(typeof result.body[0].availableSeats).toBe('number');
        expect(result.body[0].availableSeats).toBeGreaterThanOrEqual(0);
    });
});