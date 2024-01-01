const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
// const Review = require('../models/reviewModel');

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
  //1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne(req.params).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  //2) build templates

  //3) Render template using data from 1)
  res.status(200).render('tour', {
    title: req.params.slug,
    tour,
  });
});

// exports.getTourDetails = (req, res) => {
//   res.status(200).render('tour', {
//     title: 'The Forest Hiker Tour',
//   });
// };
