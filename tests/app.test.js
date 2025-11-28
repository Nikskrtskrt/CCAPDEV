const bcrypt = require('bcrypt');
const request = require('supertest');
const AccountConstants = require('../tests/AccountConstants');

const app = require('../server');
const User = require('../models/User');
const Flight = require('../models/Flight');
const FlightInstance = require('../models/FlightInstance');
const Reservation = require('../models/Reservation');

//const { baseModelName } = require('../models/Reservation');

let userAgent;
let adminAgent;

const BASE_USER_INFO = AccountConstants.BASE_USER_INFO;
const BASE_USER_INFO_2 = AccountConstants.BASE_USER_INFO_2;
const BASE_ADMIN_INFO = AccountConstants.BASE_ADMIN_INFO;
const UPDATED_USER_INFO = AccountConstants.UPDATED_USER_INFO;

//*added* Variables for flight search tests
let flightSearchAgent;
let testFlight;
let testFlightInstance;
let testUser;

const TEST_FLIGHT_DATA = {
    flightNo: 'FL999',
    origin: 'Manila',
    destination: 'Cebu',
    departure: '08:00',
    arrival: '09:30',
    aircraft: 'Boeing 737',
    capacity: 180,
    daysOfWeek: ['Mon', 'Wed', 'Fri'],
    seasonStart: '2025-01-01',
    seasonEnd: '2025-12-31',
    active: true
};
//*added* Create a test user for flight search tests
const TEST_USER_DATA = {
    firstName: 'Test',
    lastName: 'User',
    email: 'flightsearch@test.com',
    password: 'TestPassword123',
    passportNo: 'TEST123456',
    role: 'User'
};
//

async function cleanTestUsers() {
    await User.findOneAndDelete({ email: BASE_USER_INFO.email });
    await User.findOneAndDelete({ email: UPDATED_USER_INFO.email });
}

//*added* Clean up function to remove test data
async function cleanTestData() {
    await Flight.deleteMany({ flightNo: 'FL999' });
    await FlightInstance.deleteMany({ flightNo: 'FL999' });
    await User.deleteOne({ email: TEST_USER_DATA.email });
    await Reservation.deleteMany({ user: testUser?._id });
}
//

beforeAll(async () => {
    await cleanTestUsers();
    userAgent = await request.agent(app);
});

afterAll(cleanTestUsers);

describe("Testing authRoutes.js (User) Routes", () => {
    test("Log in with invalid input (not registered)", async () => {
        const result = await userAgent
            .post("/login")
            .send(BASE_USER_INFO);

        expect(result.statusCode).toBe(401);
    });

    test("Registering", async () => {
        const result = await userAgent
            .post("/register")
            .send(BASE_USER_INFO)

        expect(result.statusCode).toBe(200);

        const userExists = await User.findOne({ email: BASE_USER_INFO.email });
        expect(userExists.firstName).toBe(BASE_USER_INFO.firstName);
        expect(userExists.lastName).toBe(BASE_USER_INFO.lastName);
        expect(userExists.email).toBe(BASE_USER_INFO.email);
        //expect(userExists.password).toBe(BASE_USER_INFO.password);
        expect(userExists.passportNo).toBe(BASE_USER_INFO.passportNo);
        expect(userExists.role).toBe("User");

        const match = await bcrypt.compare(BASE_USER_INFO.password, userExists.password);
        expect(match).toBe(true);
    });

    test("Registering (Again)", async () => {
        const result = await userAgent
            .post("/register")
            .send(BASE_USER_INFO)

        expect(result.statusCode).toBe(400);
    });

    test("Log in with valid input", async () => {
        const loginData = {
            email: BASE_USER_INFO.email,
            password: BASE_USER_INFO.password,
        };

        const result = await userAgent
            .post("/login")
            .send(loginData);

        //console.log("Redirect Status: ", result.status);
        expect(result.statusCode).toBe(200); //302 because redirect
        //expect(result.headers.location).toBe("/userDashboard");
    });

    test("Log out", async () => {
        const result = await userAgent
            .get("/logout")
            //.post("/logout")
            .send()

        expect(result.statusCode).toBe(302);
        expect(result.headers.location).toBe("/login");
    })

    //test("Editing Name")
});


describe("Testing userProfile.js Routes", () => {
    beforeAll(async () => {
        await userAgent
            .post("/login")
            .send(BASE_USER_INFO);
    });

    afterAll(async () => {
        await userAgent
            .get("/logout")
            .send();
    })

    test("Update all information", async () => {
        const result = await userAgent
            .post("/api/profile/update")
            .send(UPDATED_USER_INFO)

        expect(result.statusCode).toBe(302); //Redirects to self

        const userExists = await User.findOne(UPDATED_USER_INFO);
        console.log(userExists)
        expect(userExists.firstName).toBe(UPDATED_USER_INFO.firstName);
        expect(userExists.lastName).toBe(UPDATED_USER_INFO.lastName);
        expect(userExists.email).toBe(UPDATED_USER_INFO.email);
        //expect(userExists.password).toBe(BASE_USER_INFO.password);
        expect(userExists.passportNo).toBe(UPDATED_USER_INFO.passportNo);
        expect(userExists.role).toBe("User");

        const match = await bcrypt.compare(BASE_USER_INFO.password, userExists.password);
        expect(match).toBe(true);
    });

});


//*added* FLIGHT SEARCH TESTS
describe('Flight Search Tests Setup and Execution', () => {
    //test data before running flight search tests
    beforeAll(async () => {
        await cleanTestData();
        flightSearchAgent = request.agent(app);
        const hashedPassword = await bcrypt.hash(TEST_USER_DATA.password, 10);
        testUser = await User.create({
            ...TEST_USER_DATA,
            password: hashedPassword
        });
        await flightSearchAgent
            .post('/login')
            .send({
                email: TEST_USER_DATA.email,
                password: TEST_USER_DATA.password
            });
        testFlight = await Flight.create(TEST_FLIGHT_DATA);
    });

    afterAll(async () => {
        await cleanTestData();
    });

    //Flight Search Routes
    describe('Testing flightSearchRoutes.js', () => {
        test('GET /search - should render search page with origins', async () => {
            const result = await flightSearchAgent
            .get('/search')
            .expect(200);
            expect(result.text).toContain('Search Flights');
            expect(result.text).toContain(TEST_FLIGHT_DATA.origin);
        });

        test('GET /search - should handle errors gracefully', async () => {
            const originalFind = Flight.find;
            Flight.find = jest.fn().mockRejectedValue(new Error('Database error'));
            const result = await flightSearchAgent
            .get('/search')
            .expect(500);
            expect(result.text).toContain('Error');
            Flight.find = originalFind;
        });
    });

    //Origins API
    describe('Testing flightSearchAPI.js - GET /api/search/origins', () => {
        test('Should return unique origins', async () => {
            const result = await flightSearchAgent
            .get('/api/search/origins')
            .expect(200);
            expect(Array.isArray(result.body)).toBe(true);
            expect(result.body).toContain(TEST_FLIGHT_DATA.origin);
        });

        test('Should only return active flights', async () => {
            await Flight.create({
                ...TEST_FLIGHT_DATA,
                flightNo: 'FL888',
                origin: 'Davao',
                active: false
            });

            const result = await flightSearchAgent
            .get('/api/search/origins')
            .expect(200);
            expect(result.body).not.toContain('Davao');
        });

        test('Should handle database errors', async () => {
            const originalFind = Flight.find;
            Flight.find = jest.fn().mockRejectedValue(new Error('Database error'));
            const result = await flightSearchAgent
            .get('/api/search/origins')
            .expect(500); 
            expect(result.body.error).toBe('Failed to fetch origins');
            Flight.find = originalFind;
        });
    });

    //Destinations API
    describe('Testing flightSearchAPI.js - GET /api/search/destinations', () => {
        test('Should return destinations for valid origin', async () => {
            const result = await flightSearchAgent
            .get(`/api/search/destinations?origin=${TEST_FLIGHT_DATA.origin}`)
            .expect(200);
            expect(Array.isArray(result.body)).toBe(true);
            expect(result.body).toContain(TEST_FLIGHT_DATA.destination);
        });

        test('Should return 400 if origin is missing', async () => {
            const result = await flightSearchAgent
            .get('/api/search/destinations')
            .expect(400);
            expect(result.body.error).toBe('Origin is required');
        });

        test('Should return empty array for origin with no destinations', async () => {
            const result = await flightSearchAgent
            .get('/api/search/destinations?origin=NonExistentCity')
            .expect(200);
            expect(result.body).toEqual([]);
        });

        test('Should only return destinations from active flights', async () => {
            const result = await flightSearchAgent
                .get(`/api/search/destinations?origin=${TEST_FLIGHT_DATA.origin}`)
                .expect(200);
            
            expect(result.body.length).toBeGreaterThan(0);
        });
    });

    describe('Testing flightSearchAPI.js - GET /api/search/times', () => {
        beforeAll(async () => {
            const testDate = new Date('2025-12-01');
            const depTime = new Date(testDate);
            depTime.setHours(8, 0, 0, 0);
            const arrTime = new Date(testDate);
            arrTime.setHours(9, 30, 0, 0);

            testFlightInstance = await FlightInstance.create({
                template: testFlight._id,
                flightNo: TEST_FLIGHT_DATA.flightNo,
                date: testDate,
                departureTime: depTime,
                arrivalTime: arrTime,
                aircraftNo: TEST_FLIGHT_DATA.aircraft,
                seats: TEST_FLIGHT_DATA.capacity,
                status: 'Scheduled'
            });
        });

        test('Should return available times for valid route and date', async () => {
            const result = await flightSearchAgent
                .get('/api/search/times')
                .query({
                    origin: TEST_FLIGHT_DATA.origin,
                    destination: TEST_FLIGHT_DATA.destination,
                    date: '2025-12-01'
                })
                .expect(200);
            
            expect(Array.isArray(result.body)).toBe(true);
            expect(result.body.length).toBeGreaterThan(0);
            expect(result.body[0].flightNo).toBe(TEST_FLIGHT_DATA.flightNo);
            expect(result.body[0].availableSeats).toBe(TEST_FLIGHT_DATA.capacity);
        });

        test('Should return 400 if required parameters are missing', async () => {
            const result = await flightSearchAgent
            .get('/api/search/times')
            .query({ origin: TEST_FLIGHT_DATA.origin })
            .expect(400);
            expect(result.body.error).toBe('Origin, destination, and date are required');
        });

        test('Should return empty array for dates outside season', async () => {
            const result = await flightSearchAgent
                .get('/api/search/times')
                .query({
                    origin: TEST_FLIGHT_DATA.origin,
                    destination: TEST_FLIGHT_DATA.destination,
                    date: '2026-12-01'
                })
                .expect(200);
            expect(result.body).toEqual([]);
        });

        test('Should return empty array for non-operating days', async () => {
            const result = await flightSearchAgent
                .get('/api/search/times')
                .query({
                    origin: TEST_FLIGHT_DATA.origin,
                    destination: TEST_FLIGHT_DATA.destination,
                    date: '2025-12-02'
                })
                .expect(200);
            expect(result.body).toEqual([]);
        });

        test('Should calculate available seats correctly with reservations', async () => {
            await Reservation.create({
                user: testUser._id,
                flight: testFlightInstance._id,
                seatNo: '1A',
                mealType: 'Standard',
                baggage: 7,
                fareClass: 'Economy',
                totalPrice: 500,
                status: 'Confirmed'
            });

            const result = await flightSearchAgent
                .get('/api/search/times')
                .query({
                    origin: TEST_FLIGHT_DATA.origin,
                    destination: TEST_FLIGHT_DATA.destination,
                    date: '2025-12-01'
                })
                .expect(200);
            expect(result.body[0].availableSeats).toBe(TEST_FLIGHT_DATA.capacity - 1);
        });

        test('Should not include flights with zero available seats', async () => {
            const reservations = [];
            for (let i = 0; i < TEST_FLIGHT_DATA.capacity - 1; i++) {
                reservations.push({
                    user: testUser._id,
                    flight: testFlightInstance._id,
                    seatNo: `${Math.floor(i / 6) + 1}${String.fromCharCode(65 + (i % 6))}`,
                    mealType: 'Standard',
                    baggage: 7,
                    fareClass: 'Economy',
                    totalPrice: 500,
                    status: 'Confirmed'
                });
            }
            await Reservation.insertMany(reservations);

            const result = await flightSearchAgent
                .get('/api/search/times')
                .query({
                    origin: TEST_FLIGHT_DATA.origin,
                    destination: TEST_FLIGHT_DATA.destination,
                    date: '2025-12-01'
                })
                .expect(200);

            expect(result.body).toEqual([]);
        });

        test('Should not include cancelled flight instances', async () => {
            await FlightInstance.findByIdAndUpdate(testFlightInstance._id, {
                status: 'Cancelled'
            });

            const result = await flightSearchAgent
                .get('/api/search/times')
                .query({
                    origin: TEST_FLIGHT_DATA.origin,
                    destination: TEST_FLIGHT_DATA.destination,
                    date: '2025-12-01'
                })
                .expect(200);

            expect(result.body).toEqual([]);
        });

        test('Should sort results by departure time', async () => {
            await FlightInstance.findByIdAndUpdate(testFlightInstance._id, {
                status: 'Scheduled'
            });

            const laterDate = new Date('2025-12-01');
            const laterDepTime = new Date(laterDate);
            laterDepTime.setHours(14, 0, 0, 0);
            const laterArrTime = new Date(laterDate);
            laterArrTime.setHours(15, 30, 0, 0);

            const laterFlight = await Flight.create({
                ...TEST_FLIGHT_DATA,
                flightNo: 'FL997',
                departure: '14:00',
                arrival: '15:30'
            });

            await FlightInstance.create({
                template: laterFlight._id,
                flightNo: 'FL997',
                date: laterDate,
                departureTime: laterDepTime,
                arrivalTime: laterArrTime,
                aircraftNo: TEST_FLIGHT_DATA.aircraft,
                seats: TEST_FLIGHT_DATA.capacity,
                status: 'Scheduled'
            });

            const result = await flightSearchAgent
                .get('/api/search/times')
                .query({
                    origin: TEST_FLIGHT_DATA.origin,
                    destination: TEST_FLIGHT_DATA.destination,
                    date: '2025-12-01'
                })
                .expect(200);

            expect(result.body.length).toBeGreaterThanOrEqual(2);
            const firstTime = new Date(result.body[0].departureTime).getTime();
            const secondTime = new Date(result.body[1].departureTime).getTime();
            expect(firstTime).toBeLessThan(secondTime);
        });
    });

    //Instances API
    describe('Testing flightSearchAPI.js - GET /api/search/instances/:flightNo', () => {
        test('Should return flight instances for valid flight number', async () => {
            const result = await flightSearchAgent
                .get(`/api/search/instances/${TEST_FLIGHT_DATA.flightNo}`)
                .expect(200);

            expect(Array.isArray(result.body)).toBe(true);
            expect(result.body.length).toBeGreaterThan(0);
            expect(result.body[0].flightNo).toBe(TEST_FLIGHT_DATA.flightNo);
        });

        test('Should filter instances by date when provided', async () => {
            const result = await flightSearchAgent
                .get(`/api/search/instances/${TEST_FLIGHT_DATA.flightNo}`)
                .query({ date: '2025-12-01' })
                .expect(200);

            expect(result.body.every(inst => {
                const instDate = new Date(inst.date).toDateString();
                const queryDate = new Date('2025-12-01').toDateString();
                return instDate === queryDate;
            })).toBe(true);
        });

        test('Should return empty array for non-existent flight number', async () => {
            const result = await flightSearchAgent
                .get('/api/search/instances/NONEXISTENT')
                .expect(200);

            expect(result.body).toEqual([]);
        });

        test('Should include template information in response', async () => {
            const result = await flightSearchAgent
                .get(`/api/search/instances/${TEST_FLIGHT_DATA.flightNo}`)
                .expect(200);

            expect(result.body[0].template).toBeDefined();
            expect(result.body[0].template.origin).toBe(TEST_FLIGHT_DATA.origin);
        });

        test('Should calculate available seats correctly', async () => {
            const result = await flightSearchAgent
                .get(`/api/search/instances/${TEST_FLIGHT_DATA.flightNo}`)
                .query({ date: '2025-12-01' })
                .expect(200);

            expect(result.body[0].availableSeats).toBeDefined();
            expect(typeof result.body[0].availableSeats).toBe('number');
            expect(result.body[0].availableSeats).toBeGreaterThanOrEqual(0);
        });
    });
});
//END OF FLIGHT SEARCH TESTS
//

// *added* Manage Reservations Test Cases
describe("Testing manageReservationRoutesAPI.js Routes", () => {
    let testReservation;
    let testFlightInstance;
    let testFlightTemplate;
    let userId;

    beforeAll(async () => {
        try {
            let user = await User.findOne({ email: BASE_USER_INFO.email });
            if (!user) {
                 await userAgent.post("/register").send(BASE_USER_INFO);
                 user = await User.findOne({ email: BASE_USER_INFO.email });
            }
            userId = user._id;

            await userAgent.post("/login").send(BASE_USER_INFO);

            testFlightTemplate = await Flight.create({
                flightNo: "TEST-FLIGHT-API", 
                origin: "Manila",
                destination: "Ceby",
                departure: "08:00",    
                arrival: "10:00",      
                aircraft: "AIR 123",
                capacity: 150,
                daysOfWeek: ["Mon", "Wed", "Fri"],
                seasonStart: new Date("2020-01-01"),
                seasonEnd: new Date("2030-12-31"),
                active: true
            });
    
            testFlightInstance = await FlightInstance.create({
                template: testFlightTemplate._id, 
                flightNo: "TEST-FLIGHT-API",
                date: new Date(),
                departureTime: new Date(),
                arrivalTime: new Date(new Date().getTime() + 4 * 60 * 60 * 1000),
                status: 'Scheduled',
                seats: 150
            });

            testReservation = await Reservation.create({
                user: userId,
                flight: testFlightInstance._id, 
                seatNo: 1,
                mealType: 'Standard',
                baggage: 1,
                fareClass: 'Economy',
                totalPrice: 5000,
                status: 'Confirmed'
            });

        } catch (error) {
            console.error("Setup failed in manageReservationRoutesAPI:", error);
            throw error;
        }
    });

    afterAll(async () => {
        if (testReservation) await Reservation.findByIdAndDelete(testReservation._id);
        if (testFlightInstance) await FlightInstance.findByIdAndDelete(testFlightInstance._id);
        if (testFlightTemplate) await Flight.findByIdAndDelete(testFlightTemplate._id);
        
        await userAgent.get("/logout").send();
    });

    test("Retrieve user reservations", async () => {
        const result = await userAgent.get("/api/reservations/user"); 

        if (result.statusCode !== 200) {
            console.log("Status:", result.statusCode);
            console.log("Body:", result.body);
        }

        expect(result.statusCode).toBe(200);
        expect(result.body.reservations).toBeDefined();
        expect(Array.isArray(result.body.reservations)).toBe(true);
        expect(result.body.reservations.length).toBeGreaterThan(0);
        
        const ids = result.body.reservations.map(r => r._id.toString());
        expect(ids).toContain(testReservation._id.toString());
    });

    test("Update reservation details", async () => {
        const updateData = {
            mealType: "Vegetarian",
            seatNo: 2,
            baggage: 2
        };

        const result = await userAgent
            .put(`/api/reservations/${testReservation._id}`)
            .send(updateData);

        expect(result.statusCode).toBe(200);
        expect(result.body.mealType).toBe("Vegetarian");
        
        const updatedRes = await Reservation.findById(testReservation._id);
        expect(updatedRes.mealType).toBe("Vegetarian");
    });

    test("Cancel a reservation", async () => {
        const result = await userAgent
            .put(`/api/reservations/${testReservation._id}/cancel`);

        expect(result.statusCode).toBe(200);
        
        const cancelledRes = await Reservation.findById(testReservation._id);
        expect(cancelledRes.status).toBe("Cancelled");
    });

    test("Delete a reservation", async () => {
        const result = await userAgent
            .delete(`/api/reservations/${testReservation._id}`);

        expect(result.statusCode).toBe(200);

        const deletedRes = await Reservation.findById(testReservation._id);
        expect(deletedRes).toBeNull();
    });
});