const express = require('express');
const router = express.Router();
const petFoodController = require('../controllers/petFoodControllers');

router.get('/', petFoodController.getAllPetFood);

module.exports = router;