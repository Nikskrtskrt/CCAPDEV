const request = require('supertest');
const app = require('../server');

describe("Testing User Profile Actions", () => {
    let agent;

    beforeAll(() => {
        agent = request.agent(app);
    });
    
    afterAll(async () => {
        await new Promise((resolve) => server.close(resolve));
    });

    test("Testing log in", async () => { // Added async
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
})
