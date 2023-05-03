const express = require('express');
const router = express.Router();

const apiController = require('../controller/apiController');


router.get('/allOwner',apiController.allOwner.bind(apiController));

router.get('/allRoad',apiController.allRoad.bind(apiController));
router.get('/bigCarInStreet',apiController.bigCarInStreet.bind(apiController));

router.get('/carLastLocateNearStationOne',apiController.carLastLocateNearStationOne.bind(apiController));
router.get('/carAllTimeLocateNearStationOne',apiController.carAllTimeLocateNearStationOne.bind(apiController));

router.get('/allRoadmap',apiController.allRoadmap.bind(apiController));
router.get('/tollCarAtOneDay/:id',apiController.tollCarAtOneDay.bind(apiController));

router.get('/allStation',apiController.allStation.bind(apiController));

router.get('/tollAllCarEveryDay',apiController.tollAllCarsEveryDay.bind(apiController));

// router.get('/isOlderThan/:age',apiController.isOlderThan.bind(apiController));


module.exports = router;