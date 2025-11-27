const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { baseModelName } = require('../models/Reservation');

describe("Testing AuthRoutes (User) Routes", () => {
    let userAgent;
    let adminAgent;

    const BASE_USER_INFO = {
        firstName: "Her",
        lastName: "Shey",
        email: "testing@jest.com",
        password: "iLoveSupertest",
        passportNo: "ID0123456789ABCD",
    }

    beforeAll(() => {
        userAgent = request.agent(app);
    });
    
    
    afterAll(async () => {
        await User.findOneAndDelete(BASE_USER_INFO);
    });
    
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
        expect(userExists.firstName ).toBe(BASE_USER_INFO.firstName);
        expect(userExists.lastName  ).toBe(BASE_USER_INFO.lastName);
        expect(userExists.email     ).toBe(BASE_USER_INFO.email);
        expect(userExists.password  ).toBe(BASE_USER_INFO.password);
        expect(userExists.passportNo).toBe(BASE_USER_INFO.passportNo);
        expect(userExists.role      ).toBe("User");
    });

    test("Log in with valid input", async () => { // Added async
        const loginData = {
            email: "registering@sample.com",
            password: "1234"
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
