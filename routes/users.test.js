"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testFavId,
  u1Token,
  u2Token,
  adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************ GET /users/:username */
describe("GET /users/:username", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
        favorites: [testFavId]
      },
    });
  });

  test("works for user", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
        favorites: [testFavId]
      },
    });
  });

  test("not found - no such user", async function () {
    const resp = await request(app)
        .get(`/users/nah`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("unauthorized - anonymous", async function () {
    const resp = await request(app)
        .get(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized - other user", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${u2Token}` );
    expect(resp.statusCode).toEqual(401);
  });
});

/************************ POST /users/:username/recipes/:id */
describe("POST /users/:username/recipes/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .post(`/users/u1/recipes/${testFavId}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ favorited: testFavId });
  });

  test("works for same user", async function () {
    const resp = await request(app)
        .post(`/users/u1/recipes/${testFavId}`)
        .set("authorization", `Bearer ${u1Token}`)
    expect(resp.body).toEqual({ favorited: testFavId });
  });

  test("not found - no such user", async function () {
    const resp = await request(app)
        .post(`/users/nah/recipes/${testFavId}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found - no such recipe", async function () {
    const resp = await request(app)
        .post(`/users/u1/recipes/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("unauthorized - anonymous", async function () {
    const resp = await request(app)
        .post(`/users/u1/recipes/${testFavId}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized - other users", async function () {
    const resp = await request(app)
        .post(`/users/u1/recipes/${testFavId}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request - invalid recipe id", async function () {
    const resp = await request(app)
        .post(`/users/u1/recipes/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************ GET /users/[username]/recipes/favorites  */
describe("GET /users/:username/recipes/favorites", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .get("/users/:username/recipes/favorites")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual([{
      username: "u1",
      recipeId: testFavId
    }]);
  });

  test("works for same user", async function () {
    const resp = await request(app)
        .get("/users/:username/recipes/favorites")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual([{
      username: "u1",
      recipeId: testFavId
    }]);
  });

  test("unauthorized - anonymous", async function () {
    const resp = await request(app)
        .get("/users/:username/recipes/favorites");
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized - non admin users", async function () {
    const resp = await request(app)
        .get("/users/:username/recipes/favorites")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************ DELETE /users/:username/recipes/:id */
describe("DELETE /users/:username/recipes/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/users/u1/recipes/${testFavId}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testFavId })
  });

  test("works for same user", async function () {
    const resp = await request(app)
        .delete(`/users/u1/recipes/${testFavId}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: testFavId})
  });

  test("not found - no such recipes", async function () {
    const resp = await request(app)
        .delete(`/users/u1/recipes/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("unauthorized - anonymous", async function () {
    const resp = await request(app)
        .delete(`/users/u1/recipes/${testFavId}`)
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized - other user", async function () {
    const resp = await request(app)
        .delete(`/users/u1/recipes/${testFavId}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401)
  });
});

/************************ PATCH /users/:username */
describe("PATCH /users/:username", function () {
  test("works - admins", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "UPDATE1F"
        })
        .set("authorization",  `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "UPDATE1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false
      }
    });
  });

  test("works - same user", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "UPDATE1F"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "UPDATE1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false
      }
    });
  });

  test("works - set new password", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          password: "new1pwd"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false
      }
    });
    const isSuccessful = await User.authenticate("u1", "new1pwd");
    expect(isSuccessful).toBeTruthy();
  });

  test("not found - no such user", async function () {
    const resp = await request(app)
        .patch(`/users/nah`)
        .send({
          firstName: "Nah"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404)
  });

  test("bad request - invalid data", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: 798
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauthorized - anonymous", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "UPDATE1F"
        });
    expect(resp.statusCode).toEqual(401)
  });

  test("unauthorized - other users", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "UPDATE1F"
        })
        .set("authorization", `Bearer ${u2Token}`)
    expect(resp.statusCode).toEqual(401);
  });
});

/************************ DELETE /users/:username */
describe("DELETE /users/:username", function () {
  test("works - admin", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("works - same user", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "u1" })
  });

  test("not found - no such user", async function () {
    const resp = await request(app)
        .delete(`/users/nah`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("unauthorized - anonymous", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized - other user", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401)
  });
});

/************************ GET /users */
describe("GET /users", function () {
  test("works - admins", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      users: [
        {
          username: "u1",
          firstName: "U1F",
          lastName: "U1L",
          email: "user1@user.com",
          isAdmin: false,
        },
        {
          username: "u2",
          firstName: "U2F",
          lastName: "U2L",
          email: "user2@user.com",
          isAdmin: false
        },
        {
          username: "u3",
          firstName: "U3F",
          lastName: "U3L",
          email: "user3@user.com",
          isAdmin: false
        }
      ]
    });
  });

  test("unauthorized - non-admin users", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized - anonymous", async function () {
    const resp = await request(app)
        .get("/users")
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************ POST /users */
describe("POST /users", function () {
  test("works - admin: add non-admin user", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "new1",
          firstName: "NEW1F",
          lastName: "NEW1L",
          password: "newpwd1",
          email: "new@email.com",
          isAdmin: false
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "new1",
        firstName: "NEW1F",
        lastName: "NEW1L",
        email: "new@email.com",
        isAdmin: false
      }, token: expect.any(String)
    });
  });

  test("works - admin: add admin user", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "new1",
          firstName: "NEW1F",
          lastName: "NEW1L",
          password: "newpwd1",
          email: "new@email.com",
          isAdmin: true
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "new1",
        firstName: "NEW1F",
        lastName: "NEW1L",
        email: "new@email.com",
        isAdmin: true
      }, token: expect.any(String)
    });
  });

  test("unauthorized - other users", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "new1",
          firstName: "NEW1F",
          lastName: "NEW1L",
          password: "newpwd1",
          email: "new@email.com",
          isAdmin: true
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized - anonymous", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "new1",
          firstName: "NEW1F",
          lastName: "NEW1L",
          password: "newpwd1",
          email: "new@email.com",
          isAdmin: true
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request - invalid data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "new1",
          firstName: "NEW1F",
          lastName: "NEW1L",
          password: "newpwd1",
          email: "new@email.com",
          isAdmin: true
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request - missing data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "new1"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});