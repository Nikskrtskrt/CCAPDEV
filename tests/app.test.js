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
const UPDATED_USER_INFO_NEEDS_PERMS = AccountConstants.UPDATED_USER_INFO_NEEDS_PERMS;

const FLIGHT_INFO = {
    flightNo: "ADMIN_TEST_100",
    origin: "PlaceA",
    destination: "PlaceB",

    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    departure: "06:00",
    arrival: "07:00",

    seasonStart: new Date("2025-01-01"),
    seasonEnd: new Date("2025-12-31"),

    aircraft: "DummyAircraftAdmin",
    capacity: 1,

    active: true
}

const UPDATED_FLIGHT_INFO = {
    flightNo: "ADMIN_TEST_200",
    origin: "PlaceC",
    destination: "PlaceD",
}

async function cleanTestUsers() {
    await User.findOneAndDelete({ email: BASE_USER_INFO.email });
    await User.findOneAndDelete({ email: UPDATED_USER_INFO.email });
    await User.findOneAndDelete({ email: BASE_ADMIN_INFO.email });
}



beforeAll(async () => {
    await cleanTestUsers();
    userAgent = await request.agent(app);
    adminAgent = await request.agent(app);


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

describe("Testing adminUserRoutes.js and its API Routes", () => {
    let regularUser
    let findAdmin
    
    beforeAll(async () => {
        await userAgent
            .post("/login")
            .send(BASE_USER_INFO);

        regularUser = await User.findOne({ email: UPDATED_USER_INFO.email });

        await adminAgent
            .post("/register")
            .send(BASE_ADMIN_INFO);
        
        findAdmin = await User.findOne({ email: BASE_ADMIN_INFO.email });
        findAdmin.role = "Admin";
        await findAdmin.save();

        await adminAgent
            .post("/login")
            .send(BASE_ADMIN_INFO);
    });

    afterAll(async () => {
        await userAgent
            .get("/logout")
            .send();
        await adminAgent
            .get("/logout")
            .send();
    });

    test("Getting user list - Admin", async () => {
        const result = await adminAgent
            .get("/users")
            .send();

        expect(result.statusCode).toBe(200);
    });

    test("Getting user list - Non valid role (User)", async () => {
        const result = await userAgent
            .get("/users")
            .send();

        expect(result.statusCode).toBe(302);
    });

    test("Getting user details - exists", async () => {
        const result = await adminAgent
            .get(`/api/users/${regularUser._id}`)
            .send();
        expect(result.statusCode).toBe(200);
        expect(result.body.user.email).toBe(UPDATED_USER_INFO.email);
    });

    test("Deleting user - no perms", async () => {
        const result = await adminAgent
            .delete(`/api/users/${regularUser._id}`)
            .send();

        expect(result.statusCode).toBe(401);

        const userExists = await User.findOne({ email: UPDATED_USER_INFO.email });
        expect(userExists).not.toBeNull();
    });

    test("Deleting user - valid", async () => {
        await findAdmin.permissions.push('delete-user');
        await findAdmin.save();

        await adminAgent
            .post("/logout")
            .send();

        await adminAgent
            .post("/login")
            .send(BASE_ADMIN_INFO);
        
        const result = await adminAgent
            .delete(`/api/users/${regularUser._id}`)
            .send();

        expect(findAdmin.permissions).toContain('delete-user');
        expect(result.statusCode).toBe(200);

        const userExists = await User.findOne({ email: UPDATED_USER_INFO.email });
        expect(userExists).toBeNull();
    });

    test("Deleting user - invalid id", async () => {
        const result = await adminAgent
            .delete(`/api/users/abc`)
            .send();

        expect(result.statusCode).toBe(400);
    });

    test("Getting user details - does not exists", async () => {
        const result = await adminAgent
            .get(`/api/users/${regularUser._id}`)
            .send();
        expect(result.statusCode).toBe(200);
    });

    test("Creating user", async () => {
        const result = await adminAgent
            .post(`/api/users/`)
            .send(BASE_USER_INFO);

        expect(result.statusCode).toBe(201);
        regularUser = await User.findOne({ email: BASE_USER_INFO.email });
        expect(regularUser).not.toBeNull();
    });

    test("Editing user - without perms", async () => {
        const result = await adminAgent
            .put(`/api/users/${regularUser._id}`)
            .send(UPDATED_USER_INFO_NEEDS_PERMS);

        expect(result.statusCode).toBe(403);
        const userExists = await User.findOne({ email: BASE_USER_INFO.email });
        expect(userExists).not.toBeNull();
    });

    test("Editing user - with perms", async () => {
        await findAdmin.permissions.push('edit-role', 'edit-permissions');
        await findAdmin.save();

        await adminAgent
            .post("/logout")
            .send();

        await adminAgent
            .post("/login")
            .send(BASE_ADMIN_INFO);

        const result = await adminAgent
            .put(`/api/users/${regularUser._id}`)
            .send(UPDATED_USER_INFO_NEEDS_PERMS);

        expect(result.statusCode).toBe(200);
        const userExists = await User.findOne({ email: BASE_USER_INFO.email });
        expect(userExists).not.toBeNull();
        expect(userExists.role).toBe("Admin");
    });
});

describe("Testing flightRoutesAPI.js Routes", () => {
    let flightExists;
    let findAdmin
    
    beforeAll(async () => {
        findAdmin = await User.findOne({ email: BASE_ADMIN_INFO.email });
        findAdmin.role = "Admin";
        await findAdmin.save();

        await adminAgent
            .post("/login")
            .send(BASE_ADMIN_INFO);
    });

    afterAll(async () => {
        await Flight.deleteMany({ flightNo: FLIGHT_INFO.flightNo });
        await FlightInstance.deleteMany({ flightNo: FLIGHT_INFO.flightNo });
        await Flight.deleteMany({ flightNo: UPDATED_FLIGHT_INFO.flightNo });
        await FlightInstance.deleteMany({ flightNo: UPDATED_FLIGHT_INFO.flightNo });
    });

    test("Creating a flight", async () => {
        await findAdmin.permissions.push('edit-flight');
        await findAdmin.save();

        await adminAgent
            .post("/logout")
            .send();

        await adminAgent
            .post("/login")
            .send(BASE_ADMIN_INFO);

        const result = await adminAgent
            .post(`/api/flights`)
            .send(FLIGHT_INFO);

        expect(result.statusCode).toBe(201);
        flightExists = await Flight.findOne({ flightNo: FLIGHT_INFO.flightNo });
        expect(flightExists).not.toBeNull();
    });

    test("Updating a flight", async () => {
        await adminAgent
            .put(`/api/flights/${flightExists._id}`)
            .send(UPDATED_FLIGHT_INFO);

        const updatedFlight = await Flight.findById(flightExists._id);
        expect(updatedFlight.flightNo).toBe(UPDATED_FLIGHT_INFO.flightNo);
        expect(updatedFlight.origin).toBe(UPDATED_FLIGHT_INFO.origin);
        expect(updatedFlight.destination).toBe(UPDATED_FLIGHT_INFO.destination);
    });

    test("Deleting an instance of a flight", async () => {
        const flightInstance = await FlightInstance.findOne({ template: flightExists._id });
        expect(flightInstance).not.toBeNull();

        const result = await adminAgent
            .delete(`/api/flights/instance/${flightInstance._id}`)
            .send();
        expect(result.statusCode).toBe(200);

        const instanceExists = await FlightInstance.findById(flightInstance._id);
        expect(instanceExists).toBeNull();
    });

    test("Deleting a flight", async () => {
        const result = await adminAgent
            .delete(`/api/flights/${flightExists._id}`)
            .send();

        expect(result.statusCode).toBe(200);

        const flightExistsAfter = await Flight.findById(flightExists._id);
        expect(flightExistsAfter).toBeNull();
    });
});

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