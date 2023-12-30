const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

//1 unique review per user for each tour, a user will not be able to create 2 reviews for the same tour.
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

//created a static method to calculate the average and number of ratings for the tour ID
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      //group together all reviews that have matching tour id
      //then calculate the sum and store it in nRatings
      //then calculate the averageRating of these reviews and store the result in avgRating
      $group: {
        _id: '$tour',
        nRatings: { $num: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  //2) find current tour then update it, "saved stats to current tour"
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    //default values
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//this middlware is used, to calculate the tour rating after every post review by a user
//once a review is saved into the db, it will then calculate the average
reviewSchema.post('save', function () {
  //In order to use this function, we called it after a new Review has been created,
  //for that we need to use this.constructor, vecause this is what point to the current model.
  this.constructor.calcAverageRatings(this.tour);
});

/**both following middleware function are implemented for:
 * findByIdAndUpdate &
 * findByIdAndDelete
 */
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //saving the tour id to the document, in order to use it in the following post function
  this.r = await this.findOne();
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // does not work here, query has already executed
  // this.r = await this.findOne();
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
