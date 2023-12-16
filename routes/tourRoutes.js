const express = require('express');
const controller = require('../controllers/toursController');

const router = express.Router();

router.route('/').get(controller.getAllTours).post(controller.addTour); //chaining multiple middleware
router
  .route(`/:id`)
  .get(controller.getTour)
  .patch(controller.updateTour)
  .delete(controller.deleteTour);

module.exports = router;
