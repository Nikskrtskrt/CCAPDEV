const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { baseModelName } = require('../models/Reservation');

let userAgent;
let adminAgent;

const BASE_USER_INFO = {
    firstName: "Her",
    lastName: "Shey",
    email: "testing@jest.com",
    password: "iLoveSupertest",
    passportNo: "ID0123456789ABCD",
}

const UPDATED_USER_INFO = {
    firstName: "Tobly",
    lastName: "Ron",
    email: "tobly_ron@snacks.com",
    passportNo: "70b1"
}

async function clean() {
    await User.findOneAndDelete(BASE_USER_INFO);
    await User.findOneAndDelete(UPDATED_USER_INFO);
}

beforeAll(async () => {
    await clean();
    userAgent = await request.agent(app);
});

afterAll(clean);

describe("Testing AuthRoutes.js (User) Routes", () => {
    test("Log in with invalid input (not registered)", async () => {
        const result = await userAgent
            .post("/login")
            .send(BASE_USER_INFO);

        expect(result.statusCode).toBe(200); //200 because it sent a render to say invalid
    });

    test("Registering", async () => {
        const result = await userAgent
            .post("/register")
            .send(BASE_USER_INFO)

        expect(result.statusCode).toBe(302);

        const userExists = await User.findOne(BASE_USER_INFO);
        expect(userExists.firstName).toBe(BASE_USER_INFO.firstName);
        expect(userExists.lastName).toBe(BASE_USER_INFO.lastName);
        expect(userExists.email).toBe(BASE_USER_INFO.email);
        expect(userExists.password).toBe(BASE_USER_INFO.password);
        expect(userExists.passportNo).toBe(BASE_USER_INFO.passportNo);
        expect(userExists.role).toBe("User");
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
        expect(result.statusCode).toBe(302); //302 because redirect
        expect(result.headers.location).toBe("/userDashboard");
    });

    test("Log out", async () => {
        const result = await userAgent
            .post("/logout")
            .send()

        expect(result.statusCode).toBe(200);
    })

    //test("Editing Name")
})


describe("Testing userProfile.js Routes", () => {
    beforeAll(async () => {
        await userAgent
            .post("/login")
            .send(BASE_USER_INFO);
    });

    afterAll(async () => {
        await userAgent
            .post("/logout")
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
        expect(userExists.password).toBe(BASE_USER_INFO.password);
        expect(userExists.passportNo).toBe(UPDATED_USER_INFO.passportNo);
        expect(userExists.role).toBe("User");
    });
})
