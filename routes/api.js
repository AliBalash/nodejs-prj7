const express = require('express');
const router = express.Router();
const apiController = require('../controller/apiController');
const { addOwnerValidationRules } = require('../validation/OwnerValidationRules');

// GET routes
router.get('/allOwner', apiController.allOwner.bind(apiController));
router.get('/carOlderOwner', apiController.carOlderOwner.bind(apiController));
router.get('/allRoad', apiController.allRoad.bind(apiController));
router.get('/bigCarInStreet', apiController.bigCarInStreet.bind(apiController));
router.get('/carLastLocateNearStationOne', apiController.carLastLocateNearStationOne.bind(apiController));
router.get('/carAllTimeLocateNearStationOne', apiController.carAllTimeLocateNearStationOne.bind(apiController));
router.get('/allRoadmap', apiController.allRoadmap.bind(apiController));
router.get('/tollCarAtOneDay/:carId', apiController.tollCarAtOneDay.bind(apiController));
router.get('/allStation', apiController.allStation.bind(apiController));
router.get('/tollAllCars', apiController.tollAllCars.bind(apiController));
router.get('/redOrBlueCar', apiController.redOrBlueCar.bind(apiController));

// POST routes
router.post('/addOwner', addOwnerValidationRules, apiController.addNewOwner.bind(apiController));



module.exports = router;