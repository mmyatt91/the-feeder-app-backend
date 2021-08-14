# Capstone 2 - The Feeder App (Backend)

A Recipe Directory Built from the Edaman Recipe Search API 

See App on Heroku: https://feeder-app-backend.herokuapp.com/

## Overview: 
A web application that allows users to search for recipes based on ingredients, diet types, health restrictions, and more. 

## Tech Stack:
- Backend: 
Node.js

- Middleware:
Express, 
Cors,
Morgan

- Libraries:
Bcrypt,
Colors,
Dotenv,
JSONSchema,
Node-fetch,
Nodemon,
PG,
Supertest,
JSONWebtoken

- API Used for Data Source: 
https://api.edaman.com

## App Features Include:
### Main Feature
- Searching for recipes using keywords, i.e. vegan, low-calorie, chicken, etc.
### Bonus Features
- Favoriting/Unfavoriting recipes that are saved to the user's favorite page
- Update and make changes to a User's Profile
- Redirects users to the full recipe based on the url source of each recipe rendered.

## The Feeder App

- The Feeder App - Recipes (Search) page:
![Alt text](app_shot2.png?raw=true "App Homepage")


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

Start Backend from Terminal
### `npm start`

Open [http://localhost:4000](http://localhost:4000) to view it in the browser.

Test Backend
### `jest`
### `supertest`
