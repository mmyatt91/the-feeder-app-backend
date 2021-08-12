const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testFavIds = []

async function commonBeforeAll() {
  await db.query("DELETE FROM users");

  await db.query("DELETE FROM favorites");

  await db.query(`
    INSERT INTO users (username, password, first_name, last_name, email, is_admin)
    VALUES('u1', $1, 'U1F', 'U1L', 'u1@email.com', 'false'),
          ('u2', $2, 'U2F', 'U2L', 'u2@email.com', 'false')
    RETURNING username`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)
  ]);

  // testFavId = "123";
  
  const resultsFavs = await db.query(`
    INSERT INTO favorites (username, recipe_id)
    VALUES ('u1', '01')
    RETURNING recipe_id`);
  
  testFavIds.splice(0,0, ...resultsFavs.rows.map(r => r.id));
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testFavIds
}