const Tour = require('../models/tourModel');

//Route Handlers
exports.getAllTours = async (req, res) => {
  try {
    //build query
    //1A) filtering
    const queryObj = { ...req.query };
    //filtering url queries, in order to exclude certain fields from the queries
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //1B) advanced filtering
    let queryStr = JSON.stringify(queryObj);
    //replacing the gte,gt,lte,lt in query query string with the mondodb var $gte,$gt,$lte,$lt
    //using a regular expression
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Tour.find(JSON.parse(queryStr));

    //2) sorting
    if (req.query.sort) {
      //this permits the user to sort by more than one field
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      //default
      query = query.sort('-createdAt');
    }

    //3) Field limiting, in order to only get the desired property field from the mongo document
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      //this is called projecting
      query = query.select(fields);
    } else {
      //default putting the '-'in front of a property will exclude it
      //__v is a property used by mongodb, not usefull for the client
      query = query.select('-__v');
    }

    //4) Pagination
    //using the || operator to short circuit and set a default;, '* 1' in order to change string to number
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    /**limit: exactly the same as the limit that we defined in the quey string.
     * Skip: the amount of results that should be skipped before actually querying data.
     */
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      //return the number of documents
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    //execute the query
    const tours = await query;

    //send response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.addTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
