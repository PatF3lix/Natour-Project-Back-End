const express = require('express');
const controller = require('../controllers/reviewsController');
const authController = require('../controllers/authController');
//by default, each router only has access to the parameters of their specific routes, right.
//in order to get access to that parm in the tour router, the tourId, we need to physically merge
// the parameters
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  //But here, in this route, so in this URL, for this post, there's no tour id,
  //but we still want to get access to the tour id that is declared in the tour router previously
  .route('/')
  .get(controller.getAllReviews)
  .post(
    authController.restrictTo('user'),
    controller.setTourUserIds,
    controller.createReview,
  );

router
  .route('/:id')
  .get(controller.getReview)
  .patch(authController.restrictTo('user', 'admin'), controller.updateReview)
  .delete(authController.restrictTo('user', 'admin'), controller.deleteReview);

module.exports = router;
