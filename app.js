const express = require('express');
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

/**This file has the main purpose of holding all the Express configuration needed
 * to make the application */
const app = express();
//Middlewares for all the routes
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//protection from brute force and Dos (Denial of service)
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(express.json());
//Serving Static files
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('Hello from the middleware :D');
//   next();
// });

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

/*handling all routes that are not created in this api, in order to return a json object,
in case the user type in a route that doesn't exist.
If we are able to reach this point here, then it means that the request response cycle was not yet
finished at this point in our code, middle ware is added to the middle ware stack
as it is defined here in our code. It is sequentially read.
 'all' is used to catch all reequest types. get, post, del patch etc, with '*'
*/
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  //if the next func receives an argument, no matter what it is, express will automatically known
  // that there was an error, it will assume that whether we pass into next is an error.
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//**Part 1 error handling */
/*to define an error handling middleware, all we need to do is to give middleware function,
4 arguments and express will then automatically recognize it as an error handling middleware,
and therefore only call it when there is an error.
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //means internal server error
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});
*/

//**Part 2 error handling refactored*/
app.use(globalErrorHandler);

module.exports = app;
