const express = require('express');
const controller = require('../controllers/viewController');

const router = express.Router();

router.get('/', controller.getOverview);
router.get('/tour', controller.getTourDetails);

module.exports = router;
