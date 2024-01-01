const express = require('express');
const controller = require('../controllers/viewController');

const router = express.Router();

router.get('/', controller.getOverview);
router.get('/tour/:slug', controller.getTourDetails);
router.get('/login', controller.getLoginForm);

module.exports = router;
