const express = require('express');
const fs = require('fs');

const app = express();
/*middleware "express.json()" middle ware is basically a function that can modify
the incomming request data.
It's called middleware because it stand between the middle of the request and the response
it's just a step that the request goes through while it's being processed*/
app.use(express.json());
const port = 3000;

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

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
