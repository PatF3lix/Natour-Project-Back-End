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
router.route('/montly-plan/:year').get(controller.getMontlyPlan);

router
  .route('/')
  .get(authController.protect, controller.getAllTours)
  .post(controller.addTour);
router
  .route(`/:id`)
  .get(controller.getTour)
  .patch(controller.updateTour)
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
