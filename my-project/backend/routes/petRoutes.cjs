const express = require('express');
const router = express.Router();
const petController = require('../controllers/petControllers.cjs');

router.get('/', petController.getAllPets);
router.post('/', petController.addPet);

module.exports = router;
