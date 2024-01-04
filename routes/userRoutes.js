const express = require('express');
const controller = require('../controllers/usersController');
const authController = require('../controllers/authController');

/**images are not directly uploaded into the database, we just upload them
 * into our file system and then in the databse, we put the link basically to that image.
 */

const router = express.Router();

router.get('/logOut', authController.logOut);
router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//protect all the routes, after this point, middleware is run in sequence
router.use(authController.protect);

router.patch(
  '/updateMe',
  controller.uploadUserPhoto,
  controller.resizeUserPhoto,
  controller.updateMe,
);
router.patch('/updatePassword', authController.updatePassword);
router.patch('/deleteMe', controller.deleteMe);
router.get('/me', controller.getMe, controller.getUser);

//the following routes should only be used by administrators
router.use(authController.restrictTo('admin'));

router.route('/').get(controller.getAllUsers).post(controller.createUser);
router
  .route(`/:id`)
  .get(controller.getUser)
  .patch(controller.updateUser)
  .delete(controller.delUser);

module.exports = router;
