"use strict";

/** Recipes Routes */
const express = require("express");
const fetch = require('node-fetch');

const router = express.Router();

const BASE_URL = 'https://api.edamam.com/api/recipes/v2'
const API_ID = process.env.REACT_APP_API_ID
const API_KEY = process.env.REACT_APP_API_KEY

/** ROUTES FOR NON-ADMIN USERS AND ADMIN USERS */

/** GET Request => /recipes => { recipes }
 * 
 * Function: Retrieves Recipes Based on a Query
 * 
 * Returns: 
 * 
 * Authorization Required: Non-Admin or Admin
*/

router.get("/", async(req, res, next) => { 
  const query = req.query.q;
  console.log(query);
  try {
    const resp = await fetch (
      `${BASE_URL}?type=public&q=${query}&app_id=${API_ID}&app_key=${API_KEY}`);
    console.log(resp)
    const data = await resp.json()
    console.log(data);
    const recipes = data.hits;
    return res.json({ "recipes": recipes });
  } catch (err) {
    return next(err);
  }
});


/** GET Request => /recipes/[id] => { recipe }
 * 
 * Function: Retrieves A Single Recipe 
 * 
 * Returns: 
 * 
 * Authorization Required: Non-Admin or Admin
*/

router.get("/:id", async (req, res, next) => {
  const id = req.params.id
  console.log(req.params.id);
  try {
    const resp = await fetch (
      `${BASE_URL}/${id}?type=public&app_id=${API_ID}&app_key=${API_KEY}`);
    console.log(resp);
    const data = await resp.json();
    console.log(data);
    const recipe = data;
    return res.json(recipe)
  } catch (err) {
    return next(err);
  }
});




module.exports = router;