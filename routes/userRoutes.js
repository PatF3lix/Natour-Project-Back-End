const express = require('express');
const controller = require('../controllers/usersController');

const router = express.Router();

router.route('/').get(controller.getAllUsers).post(controller.createUser);
router
  .route(`/:id`)
  .get(controller.getUser)
  .patch(controller.updateUser)
  .delete(controller.delUser);

module.exports = router;
