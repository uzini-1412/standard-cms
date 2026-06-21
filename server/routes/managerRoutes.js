const express = require('express');
const router = express.Router();
const db = require('../database');
const managerController = require('../controllers/managerController');

router.get('/', managerController.getAllManagers);

module.exports = router;