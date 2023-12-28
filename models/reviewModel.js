const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tours',
      required: ['Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Reviewmust belong to a user'],
    },
  },
  {
    //in order to showcase virtual fields, that are not in the db but calculated during runtime in output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//this function will populate the guides field for every find()
reviewSchema.pre(/^find/, function (next) {
  //populate: specifies paths which should be populated with other documents.
  //Paths are populated after the query executes and a response is received.
  //to specifie fileds you want to exclude or include pass in an object like so
  //   this.populate({
  //     path: 'user',
  //     select: 'name',
  //   }).populate({
  //     path: 'tour',
  //     select: '-guides name photo',
  //   });

  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
