const express = require('express');
const controller = require('../controllers/usersController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);

router.route('/').get(controller.getAllUsers).post(controller.createUser);
router
  .route(`/:id`)
  .get(controller.getUser)
  .patch(controller.updateUser)
  .delete(controller.delUser);

module.exports = router;
