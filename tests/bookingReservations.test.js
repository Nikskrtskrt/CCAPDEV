const bcrypt = require('bcrypt');
const request = require('supertest');
const AccountConstants = require('../tests/AccountConstants');

const app = require('../server');
const User = require('../models/User');
const Flight = require('../models/Flight');
const FlightInstance = require('../models/FlightInstance');
const Reservation = require('../models/Reservation');

const BASE_USER_INFO = AccountConstants.BASE_USER_INFO_3;
const BASE_USER_INFO_2 = AccountConstants.BASE_USER_INFO_2;
const BASE_ADMIN_INFO = AccountConstants.BASE_ADMIN_INFO;
const UPDATED_USER_INFO = AccountConstants.UPDATED_USER_INFO;

const now = new Date(Date.now());
now.setUTCHours(0, 0, 0, 0);
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);

const FLIGHT_NO = "Dummy100";
const FLIGHT_DATE_STR = tomorrow.toISOString().split('T')[0];
const PAST_FLIGHT_DATE = new Date("2023-01-01");
const PAST_FLIGHT_DATE_STR = PAST_FLIGHT_DATE.toISOString().split('T')[0];

const FLIGHT_INFO = {
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
}

let userAgent;
let userAgent2;
let user1;
let user2;

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

    await userAgent2
        .post("/login")
        .send(BASE_USER_INFO_2);

}

async function logout() {
    await userAgent
        .get("/logout")
        .send();

    await userAgent2
        .get("/logout")
        .send();
}

beforeAll(async () => {
    //await clean();
    userAgent = await request.agent(app);

    await userAgent
        .post("/register")
        .send(BASE_USER_INFO)

    userAgent2 = await request.agent(app);

    await userAgent2
        .post("/register")
        .send(BASE_USER_INFO_2);

    user1 = await User.findOne({ email: BASE_USER_INFO.email });
    user2 = await User.findOne({ email: BASE_USER_INFO_2.email });
});

afterAll(async () => {
    await logout();
    await User.deleteMany({ email: { $in: [BASE_USER_INFO.email, BASE_USER_INFO_2.email] } });
});

describe("Testing reservationRoutes.js and its API", () => {
    let dummyFlightInstance;
    let oldReservation;


    beforeAll(async () => {
        //await login();

        const dummyFlight = await new Flight(FLIGHT_INFO);
        await dummyFlight.save();

        const departureTime = createDateWithTime(tomorrow, "06:00");
        const arrivalTime = createDateWithTime(tomorrow, "07:00");

        const FLIGHT_INSTANCE_INFO = {
            template: dummyFlight._id,
            flightNo: FLIGHT_NO,

            date: tomorrow,
            departureTime: departureTime,
            arrivalTime: arrivalTime,

            aircraftNo: "DummyAircraft001",
            status: "Scheduled",
            seats: 2,
        }

        dummyFlightInstance = await new FlightInstance(FLIGHT_INSTANCE_INFO);
        await dummyFlightInstance.save();

        const PAST_FLIGHT_INSTANCE_INFO = {
            template: dummyFlight._id,
            flightNo: FLIGHT_NO,
            date: PAST_FLIGHT_DATE,
            departureTime: new Date("2023-01-01T06:00:00Z"),
            arrivalTime: new Date("2023-01-01T07:00:00Z"),
            seats: 2,
        }

        const pastFlightInstance = await new FlightInstance(PAST_FLIGHT_INSTANCE_INFO);
        await pastFlightInstance.save();


        const PAST_RESERVATION_INFO = {
            user: user1._id,
            flight: pastFlightInstance._id,
            mealType: 'Standard',
            seatNo: 'A1',
            baggage: 5,
            fareClass: 'Economy',
            totalPrice: 123,
            status: 'Confirmed'
        }
        oldReservation = await new Reservation(PAST_RESERVATION_INFO);
        await oldReservation.save();
    });

    afterAll(async () => {
        await logout();
        await Flight.deleteMany({ flightNo: FLIGHT_NO });
        await FlightInstance.deleteMany({ flightNo: FLIGHT_NO });
        await Reservation.deleteMany({ user: user1._id });
        await Reservation.deleteMany({ user: user2._id });
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
                    seatNo: "A2",
                    mealOption: "Vegetarian",
                    extraBaggageWeight: 5,
                }
            });

        expect(result.statusCode).toBe(400);
    });

    test("Making a reservation - booking on an unavailable seat", async () => {
        const result = await userAgent2
            .post(`/api/bookingReservation/${FLIGHT_NO}/${FLIGHT_DATE_STR}`)
            .send({
                user: BASE_USER_INFO_2,
                reservation: {
                    seatNo: "A1",
                    mealOption: "Kosher",
                    extraBaggageWeight: 0,
                }
            });

        expect(result.statusCode).toBe(400);
    });

    test("Cancelling reservation - in the past", async () => {
        const result = await userAgent2
            .patch(`/api/bookingReservation/${oldReservation._id}`)
            .send();

        expect(result.statusCode).toBe(400);
    });

    test("Cancelling reservation - valid", async () => {
        const findReservation = await Reservation.findOne({
            flight: dummyFlightInstance._id,
            user: user1._id,
        });

        const reservationId = findReservation._id;

        const result = await userAgent2
            .patch(`/api/bookingReservation/${reservationId}`)
            .send();

        expect(result.statusCode).toBe(201);
    });

    test("Cancelling reservation - already cancelled", async () => {
        const findReservation = await Reservation.findOne({
            flight: dummyFlightInstance._id,
            user: user1._id,
        });

        const reservationId = findReservation._id;

        const result = await userAgent
            .patch(`/api/bookingReservation/${reservationId}`)
            .send();

        expect(result.statusCode).toBe(400);
    });

    test("Making a reservation - on Cancelled Seat", async () => {
        const result = await userAgent2
            .post(`/api/bookingReservation/${FLIGHT_NO}/${FLIGHT_DATE_STR}`)
            .send({
                user: BASE_USER_INFO_2,
                reservation: {
                    seatNo: "A1",
                    mealOption: "Kosher",
                    extraBaggageWeight: 0,
                }
            });

        expect(result.statusCode).toBe(201);
    });
});