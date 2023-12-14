const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();
//3rd-party middleware
//morgan popular login middleware -> npm i morgan
app.use(morgan('dev'));

//MiddleWare
app.use(express.json());

app.use(function (req, res, next) {
  console.log('Hello from the middleware :D');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//array of tours Objects read from file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//Route Handlers
const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  if (!tour)
    return res.status(404).json({
      status: 'fail',
      message: 'invalid Id',
    });

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const addTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'invalid Id',
    });

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'invalid Id',
    });
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

//User route Handlers

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const delUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

// All routes
const rootRoute = '/api/v1';
const toursRoute = '/tours';
const usersRoute = '/users';

//1-create a new Router, this is called mounting the router on a route
const tourRouter = express.Router();
const userRouter = express.Router();

//2-Use middleware
app.use(`${rootRoute}${toursRoute}`, tourRouter);
app.use(`${rootRoute}${usersRoute}`, userRouter);

//tours
tourRouter.route('/').get(getAllTours).post(addTour);
tourRouter.route(`/:id`).get(getTour).patch(updateTour).delete(deleteTour);

//users
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route(`/:id`).get(getUser).patch(updateUser).delete(delUser);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
