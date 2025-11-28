const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Flight = require('../models/Flight');
const FlightInstance = require('../models/FlightInstance');
const Reservation = require('../models/Reservation');

//const { baseModelName } = require('../models/Reservation');

let userAgent;
let adminAgent;

const BASE_USER_INFO = {
    firstName: "Her",
    lastName: "Shey",
    email: "testing@jest.com",
    password: "iLoveSupertest",
    passportNo: "ID0123456789ABCD",
}

const BASE_USER_INFO_2 = {
    firstName: "Cad",
    lastName: "Mury",
    email: "love@jest.com",
    password: "anotherSupertest",
    passportNo: "ID0123456789LMNO",
}

const BASE_ADMIN_INFO = {
    firstName: "Emmy",
    lastName: "Nem",
    email: "slimjimmy@wrap.com",
    password: "pleaseStandUp",
    passportNo: "ADMIN_ABRACADABRA",
}

const UPDATED_USER_INFO = {
    firstName: "Tobly",
    lastName: "Ron",
    email: "tobly_ron@snacks.com",
    passportNo: "70b1"
}

async function clean() {
    await User.findOneAndDelete({ email: BASE_USER_INFO.email });
    await User.findOneAndDelete({ email: UPDATED_USER_INFO.email });
}

beforeAll(async () => {
    await clean();
    userAgent = await request.agent(app);
});

afterAll(clean);

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

describe("Testing reservationRoutes.js and its API", () => {
    const now = new Date(Date.now());
    now.setUTCHours(0, 0, 0, 0);

    const FLIGHT_NO = "Dummy100";
    const FLIGHT_DATE_STR = now.toISOString().split('T')[0];
    let dummyFlight;
    let dummyFlightInstance;

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
        //await login();

        dummyFlight = await new Flight({
            flightNo: FLIGHT_NO,
            origin: "PlaceA",
            destination: "PlaceB",

            daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            departure: "06:00",
            arrival: "07:00",

            seasonStart: new Date("2025-01-01"),
            seasonEnd: new Date("2025-12-31"),

            aircraft: "DummyAircraft",
            capacity: 1,

            active: true
        });
        await dummyFlight.save();


        const departureTime = createDateWithTime(now, "06:00");
        const arrivalTime = createDateWithTime(now, "07:00");

        dummyFlightInstance = await new FlightInstance({
            template: dummyFlight._id,
            flightNo: FLIGHT_NO,

            date: now,
            departureTime: departureTime,
            arrivalTime: arrivalTime,

            aircraftNo: "DummyAircraft001",
            status: "Scheduled",
            seats: 1,
        });
        await dummyFlightInstance.save();


    });

    afterAll(async () => {
        await logout();
        await Flight.deleteMany({ flightNo: FLIGHT_NO });
        await FlightInstance.deleteMany({ flightNo: FLIGHT_NO });
        await Reservation.deleteMany({ user: userAgent._id });
    });

    test("Making a reservation - without a valid user", async () => {
        //await logout();
        const result = await userAgent
            .post(`/api/bookingReservation/${FLIGHT_NO}/${FLIGHT_DATE_STR}`)
            .send({
                user: UPDATED_USER_INFO,
            });

        expect(result.statusCode).toBe(400);
        await login();
    });

    test("Making a reservation - without a valid flightNo", async () => {
        const result = await userAgent
            .post(`/api/bookingReservation/ABC/${FLIGHT_DATE_STR}`)
            .send({
                user: UPDATED_USER_INFO,
            });

        expect(result.statusCode).toBe(400);
    });

    test("Making a reservation - valid booking", async () => {
        const result = await userAgent
            .post(`/api/bookingReservation/${FLIGHT_NO}/${FLIGHT_DATE_STR}`)
            .send({
                user: UPDATED_USER_INFO,
                reservation: {
                    seatNo: "A1",
                    mealOption: "Vegetarian",
                    extraBaggageWeight: 5,
                }
            });

        expect(result.statusCode).toBe(201);
    });

    test("Making a reservation - same user booking again", async () => {
        const result = await userAgent
            .post(`/api/bookingReservation/${FLIGHT_NO}/${FLIGHT_DATE_STR}`)
            .send({
                user: UPDATED_USER_INFO,
                reservation: {
                    seatNo: "A1",
                    mealOption: "Vegetarian",
                    extraBaggageWeight: 5,
                }
            });

        expect(result.statusCode).toBe(400);
    });

    test("Making a reservation - booking on an unavailable seat", async () => {

    });

    test("Cancelling reservation - in the past", async () => {

    });

    test("Cancelling reservation - valid", async () => {

    });

    test("Cancelling reservation - already cancelled", async () => {

    });

    test("Making a reservation - on Cancelled Seat", async () => {

    });
});