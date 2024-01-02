const express = require('express');
const controller = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', controller.getOverview);
router.get('/tour/:slug', controller.getTourDetails);
router.get('/login', controller.getLoginForm);

module.exports = router;
