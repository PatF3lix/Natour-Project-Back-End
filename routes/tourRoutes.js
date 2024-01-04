const express = require('express');
const controller = require('../controllers/toursController');
// const reviewController = require('../controllers/reviewsController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(controller.aliasTopTours, controller.getAllTours);

router.route('/tour-stats').get(controller.getTourStats);
router
  .route('/montly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    controller.getMontlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(controller.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(controller.getDistances);

router
  .route('/')
  .get(controller.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controller.addTour,
  );
router
  .route(`/:id`)
  .get(controller.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controller.uploadTourImages,
    controller.resizeTourImages,
    controller.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controller.deleteTour,
  );

//Nested Routes
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview,
//   );

module.exports = router;
