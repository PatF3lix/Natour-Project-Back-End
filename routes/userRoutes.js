const express = require('express');
const controller = require('../controllers/usersController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//protect all the routes, after this point, middleware is run in sequence
router.use(authController.protect);

router.get('/me', controller.getMe, controller.getUser);
router.patch('/updateMe', controller.updateMe);
router.patch('/deleteMe', controller.deleteMe);
router.patch('/updatePassword', authController.updatePassword);

//the following routes should only be used by administrators
router.use(authController.restrictTo('admin'));

router.route('/').get(controller.getAllUsers).post(controller.createUser);
router
  .route(`/:id`)
  .get(controller.getUser)
  .patch(controller.updateUser)
  .delete(controller.delUser);

module.exports = router;
