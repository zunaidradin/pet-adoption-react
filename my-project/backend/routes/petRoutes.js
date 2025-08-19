const express = require('express');
const router = express.Router();
const petController = require('../controllers/petControllers');

router.get('/', petController.getAllPets);
router.post('/', petController.addPet);

module.exports = router;
