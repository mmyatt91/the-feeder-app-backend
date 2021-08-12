"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testFavIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*********************************** authenticate */
describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isAdmin: false
    });
  });

  test("unauthorized - no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauthorized - wrong passord", async function () {
    try {
      await User.authenticate("u1", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/*********************************** register */
describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "Test",
    lastName: "Tester",
    email: "test@test.com",
    isAdmin: false,
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password"
    });
    expect(user).toEqual(newUser);
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("works: adds admin", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
      isAdmin: true
    });
    expect(user).toEqual({ ...newUser, isAdmin: true });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password"
      });
      await User.register({
        ...newUser,
        password: "password"
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/*********************************** getAll */
describe("getAll", function () {
  test("works", async function () {
    const users = await User.getAll();
    expect(users).toEqual([
      {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "u1@email.com",
        isAdmin: false
      },
      {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "u2@email.com",
        isAdmin: false
      }
    ])
  })
})

/*********************************** getUser */
describe("getUser", function () {
  test("works", async function () {
    let user = await User.getUser("u1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isAdmin: false,
      favorites: [testFavIds[0]],
    });
  });

  test("not found - no such user", async function () {
    try {
      await User.getUser("nah");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*********************************** update */
describe("update", function () {
  const updateData = {
    firstName: "NewF",
    lastName: "NewL",
    email: "new@email.com",
    isAdmin: true
  };

  test("works", async function () {
    let user = await User.update("u1", updateData);
    expect(user).toEqual({
      username: "u1",
      ...updateData
    });
  });

  test("works: set password", async function () {
    let user = await User.update("u1", {
      password: "new"
    });
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isAdmin: false
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });
    
    test("not found - no such user", async function () {
      try {
        await User.update("nope", {
          firstName: "test"
        });
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });

    test("bad request - no data", async function () {
      expect.assertions(1);
      try {
        await User.update("u1", {});
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });

/*********************************** delete */
describe("delete", function () {
  test("works", async function () {
    await User.delete("u1");
    const res = await db.query(
      "SELECT * FROM users WHERE username='u1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found - no such user", async function () {
    try {
      await User.delete("nah");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*********************************** makeFavorite */
describe("makeFavorite", function () {
  test("works", async function () {
    await User.makeFavorite("u1", testFavIds[0]);
    
    const res = await db.query(
      "SELECT * FROM favorites WHERE recipe_id=$1", [testFavIds[0]]);
    expect(res.rows).toEqual([{
      recipe_id: testFavIds[0],
      username: "u1"
    }]);
  });

  test("not found - no such user", async function () {
    try {
      await User.makeFavorite("nope", testFavIds[0], "favorited");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*********************************** getFavorites */
describe("getFavorites", function () {
  test("works", async function () {
    const favs = await User.getFavorites("u1");
    expect(favs).toEqual([{
        username: "u1",
        recipeId: testFavIds[0]
    }]);
  });
});

/*********************************** deleteFavorite */
describe("deleteFavorite", function () {
  test("works", async function () {
    await User.deleteFavorite("u1", testFavIds[0]);
    const res = await db.query(
      "SELECT recipe_id FROM favorites WHERE recipe_id=$1", [testFavId]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found - no such recipe", async function () {
    try {
      await User.deleteFavorite("u1", 0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});