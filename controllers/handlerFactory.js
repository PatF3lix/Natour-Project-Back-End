// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) return next(new AppError('No tour found with that ID', 404));
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

//Create a Function which will then return a function,
//like the one above, but not only for the tourController, but for all controller.

//Design Pattern Factory

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

// const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//   new: true,
//   runValidators: true,
// });
// if (!tour) return next(new AppError('No tour found with that ID', 404));
// res.status(200).json({
//   status: 'success',
//   data: {
//     tour,
//   },
// });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

//   exports.addTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: doc,
      },
    });
  });

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) return next(new AppError('No tour found with that ID', 404));
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //execute the query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   //send response
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //Not suppose to be here, but to keep it simple
    //to allow for nexted GET review on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //execute the query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // const doc = await features.query.explain();

    //send response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
