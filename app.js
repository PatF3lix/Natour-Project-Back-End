const express = require('express');
const fs = require('fs');

const app = express();
/*middleware "express.json()" middle ware is basically a function that can modify
the incomming request data.
It's called middleware because it stand between the middle of the request and the response
it's just a step that the request goes through while it's being processed*/
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//get all tours
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

//get tour by Id
//'/api/v1/tours/:id' use req.params to get the variable value
//'/api/v1/tours/:id/:x?' use '?' at the end of a variable on the route to make it optional
app.get('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1; // '* 1' to convert a string to a number
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
});

//add new tour the req object is what hold all the information, about the request that was done
app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  /**Copy the values of all of the enumerable own properties from one
   * or more source objects to a target object.
   * Returns the target object. */
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      //201 is status code for create object
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

//update tour
app.patch('/api/v1/tours/:id', (req, res) => {
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
});

//delete tour
app.delete('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'invalid Id',
    });
  //204 status code mans no content, that because as a result we don't usually send any data back
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
