"use strict";

/** Authentication Routes */
const express = require("express");
const jsonschema = require("jsonschema");
const router = new express.Router();

const User = require("../models/user");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { createToken } = require("../helpers/tokens");
const { BadRequestError } = require("../expressError");

/** POST Request => /auth/token: { username, password } => { token }
 * 
 * Function: Checks validity of req.body against JSON schema. If valid, authentication 
 * occurs and token is provided. If not valid, BadRequestError is thrown.
 * 
 * Returns: JWT Token to be used to authenticate future requests.
 * 
 * Authorization Required: None
*/

router.post("/token", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack)
      throw new BadRequestError(errs)
    }
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST Request -> /auth/token: { user } => { token }
 * 
 * Function: Checks validity of req.body against JSON Schema. If valid, registration of
 * new user occurs and token is provided. If not valid, BadRequestError is thrown.
 * 
 * Returns: JWT Token to be used to authenticate future requests.
 * 
 * Authorization Required: None
*/

router.post("/register", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack)
      throw new BadRequestError(errs)
    }
    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;