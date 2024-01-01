const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1) Get tour data from collection
  const tours = await Tour.find();

  //2) Build template

  //3) render that template from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

// exports.getOverview = (req, res) => {
//   res.status(200).render('overview', {
//     title: 'All Tours',
//   });
// };

exports.getTourDetails = catchAsync(async (req, res, next) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
  });
});

// exports.getTourDetails = (req, res) => {
//   res.status(200).render('tour', {
//     title: 'The Forest Hiker Tour',
//   });
// };
