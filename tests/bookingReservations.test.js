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

beforeAll(async () => {
    //await clean();
    userAgent = await request.agent(app);
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
                user: BASE_USER_INFO,
            });

        expect(result.statusCode).toBe(400);
        await login();
    });

    test("Making a reservation - without a valid flightNo", async () => {
        const result = await userAgent
            .post(`/api/bookingReservation/ABC/${FLIGHT_DATE_STR}`)
            .send({
                user: BASE_USER_INFO,
            });

        expect(result.statusCode).toBe(400);
    });

    test("Making a reservation - valid booking", async () => {
        const result = await userAgent
            .post(`/api/bookingReservation/${FLIGHT_NO}/${FLIGHT_DATE_STR}`)
            .send({
                user: BASE_USER_INFO,
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
                user: BASE_USER_INFO,
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