/* eslint-disable */

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

/**This file has the main purpose of holding all the Express configuration needed
 * to make the application */
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//**Global middeware */
//Serving Static files
//we basically define that all the static assets will always automatically be served
//from a folder called public
app.use(express.static(path.join(__dirname, 'public')));

const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org/',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.5.1/axios.min.js',
  'http://127.0.0.1:3000/api/v1/users/login',
  'https://cdnjs.cloudflare.com',
  'https://js.stripe.com/v3/',
  'https://js.stripe.com/',
];
const framesSrcUrls = ['https://js.stripe.com/'];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org/',
  'https://fonts.googleapis.com/',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
];
const connectSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org/',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.5.1/axios.min.js',
  'http://127.0.0.1:3000/api/v1/users/login',
  'https://cdnjs.cloudflare.com',
  'ws://localhost:56331/',
  'https://js.stripe.com/v3/',
  'https://js.stripe.com/',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// app.use(cors());
// app.options('*', cors());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", ...framesSrcUrls],
    },
  }),
);

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//protection from brute force and Dos (Denial of service), limit requests from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
//parses data from cookie
app.use(cookieParser());

//Data Sanitization agaisnt noSql query injection
//install express-mongo-sanitize & xss-clean
app.use(mongoSanitizer());

//data Sanitization agaisnt xss
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// app.use((req, res, next) => {
//   console.log('Hello from the middleware :D');
//   next();
// });

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

const rootRoute = '/api/v1';
const toursRoute = '/tours';
const usersRoute = '/users';
const reviewsRoute = '/reviews';
const bookings = '/bookings';
const overviewRoute = '/';
const tourDetailsRoute = '/tour';

//mounting routers
//Api Routes
app.use(`${rootRoute}${toursRoute}`, tourRouter);
app.use(`${rootRoute}${usersRoute}`, userRouter);
app.use(`${rootRoute}${reviewsRoute}`, reviewRouter);
app.use(`${rootRoute}${bookings}`, bookingRouter);
//Web pages Routes
app.use(`${overviewRoute}`, viewRouter);
app.use(`${tourDetailsRoute}`, viewRouter);

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
