const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
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

exports.getTourDetails = catchAsync(async (req, res, next) => {
  //1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne(req.params).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  //2) build templates
  //3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

//You could very well use populate, this will coded this wway to demonstrate
exports.getMyTours = catchAsync(async (req, res) => {
  // 1) Find all bookings
  const booking = await Booking.find({ user: req.user.id });

  // 2) find tours with the returned IDs
  const tourIDs = booking.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
