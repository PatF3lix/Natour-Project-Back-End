const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

/**This file has the main purpose of holding all the Express configuration needed to make the application */

const app = express();

//Middlewares for all the routes
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
//Serving Static files
app.use(express.static(`${__dirname}/public`));

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
