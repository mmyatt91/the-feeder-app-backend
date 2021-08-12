"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************ POST /token */
describe("POST /auth/token", function () {
  test("works", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username: "u1",
          password: "password1"
        });
    expect(resp.body).toEqual({
      "token": expect.any(String)
    });
  });

  test("unauthorized - wrong password", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username:  "u1",
          password: "nah"
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized - no such user", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username:  "imnothere",
          password: "password1"
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request - invalid data", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username:  1000,
          password: "nah"
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request - missing data", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username:  "u1"
        });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************ POST /register */
describe("POST /auth/register", function () {
  test("works for anonymous", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "new1",
          firstName: "NEWF",
          lastName: "NEWL",
          password: "newpwd",
          email: "new@email.com"
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      "token": expect.any(String)
    });
  });

  test("bad request - invalid data", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "new1",
          firstName: "NEWF",
          lastName: "NEWL",
          password: "newpwd",
          email: "newemail.com"
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request - missing data", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "new1",
          firstName: "NEWF",
        });
    expect(resp.statusCode).toEqual(400);
  });
});
