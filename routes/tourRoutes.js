const express = require('express');
const controller = require('../controllers/toursController');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(controller.aliasTopTours, controller.getAllTours);

router.route('/tour-stats').get(controller.getTourStats);
router.route('/montly-plan/:year').get(controller.getMontlyPlan);

router.route('/').get(controller.getAllTours).post(controller.addTour);
router
  .route(`/:id`)
  .get(controller.getTour)
  .patch(controller.updateTour)
  .delete(controller.deleteTour);

module.exports = router;
