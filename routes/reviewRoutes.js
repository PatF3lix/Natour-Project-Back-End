const express = require('express');
const controller = require('../controllers/reviewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, controller.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    controller.createReview,
  );

module.exports = router;
