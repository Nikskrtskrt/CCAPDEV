const request = require('supertest');
const app = require('../server');

describe("Testing User Profile Actions", () => {
    let agent;

    beforeAll(() => {
        agent = request.agent(app);
    });
    
    /*
    afterAll(() => {
    });
    */
   
    test("Testing log in with valid input", async () => { // Added async
        const loginData = {
            email: "registering@sample.com",
            password: "1234"
        };

        const result = await agent
            .post("/login") // Added endpoint
            .send(loginData);

        //console.log("Redirect Status: ", result.status);
        expect(result.statusCode).toBe(302); //302 because redirect
    });

    test("Testing log in with invalid input", async () => { // Added async
        const loginData = {
            email: "registering@sample.com",
            password: "guessed"
        };

        const result = await agent
            .post("/login") // Added endpoint
            .send(loginData);

        expect(result.statusCode).toBe(200); //200 because it sent a render to say invalid
    });
})
