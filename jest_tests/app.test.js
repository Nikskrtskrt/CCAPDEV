const http = require("http");
const app = require("../server");


// Testing user accounts
let agent

beforeAll((done) => {
  agent = http.createServer(app);
  agent.listen(0, () => {
    const port = agent.address().port;
    baseUrl = `http://localhost:${port}`;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});



test("Testing log in", async () => { // Added async
    const loginData = {
        email: "registering@sample.com",
        password: "1234"
    };

    const result = await agent
        .post("/login") // Added endpoint
        .send(loginData); 

    console.log("Redirect Status: ", result.status);
    expect(result.status).toBe(200);
});