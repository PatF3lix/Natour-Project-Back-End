const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//Middlewares for all the routes
app.use(morgan('dev'));

app.use(express.json());

app.use(function (req, res, next) {
  console.log('Hello from the middleware :D');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const rootRoute = '/api/v1';
const toursRoute = '/tours';
const usersRoute = '/users';

//mounting routers
app.use(`${rootRoute}${toursRoute}`, tourRouter);
app.use(`${rootRoute}${usersRoute}`, userRouter);

module.exports = app;
