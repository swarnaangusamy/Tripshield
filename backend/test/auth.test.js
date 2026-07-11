const request = require("supertest");
const { expect } = require("chai");
const app = require("../server"); // your server.js

describe("AUTH API TESTING", () => {
  
  it("should return 400 for missing login fields", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "", password: "" });

    expect(res.status).to.equal(400);
  });

  it("should attempt login with sample credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "123456"
      });

    // Accept valid or invalid depending on DB contents
    expect([200, 401, 404]).to.include(res.status);

    if (res.status === 200) {
      expect(res.body).to.have.property("token");
    }
  });

});
