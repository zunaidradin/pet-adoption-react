const express = require('express');
const router = express.Router();
const petFoodController = require('../controllers/petFoodControllers.cjs');

router.get('/', petFoodController.getAllPetFood);

module.exports = router;
