const express = require('express');
const controller = require('../controllers/toursController');

const router = express.Router();

/*param middleware*/
router.param('id', controller.checkID);

router
  .route('/')
  .get(controller.getAllTours)
  .post(controller.checkBody, controller.addTour); //chaining multiple middleware
router
  .route(`/:id`)
  .get(controller.getTour)
  .patch(controller.updateTour)
  .delete(controller.deleteTour);

module.exports = router;
