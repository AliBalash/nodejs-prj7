// Import the 'controller' module and other required modules
let controller = require('./controller')
// Import the necessary modules and models
const { owner, bigCar, smallCar, fetchCarsByColor, createOwner, listCarOlderOwner, getOwnerCarsMap } = require('../model/owner')
const { road, RoadUnderTwenty } = require('../model/road')
const { roadmap, locateCar } = require('../model/roadmap')
const { station, getStationByName } = require('../model/station')
const asyncHandler = require('express-async-handler')

const { validationResult } = require('express-validator');

// Export an instance of the 'apiController' class, which inherits from 'controller'
module.exports = new class apiController extends controller {

    // Async function to retrieve all data from the 'owner' model
    allOwner = asyncHandler(async (req, res) => {
        const ownerData = await owner(); // Retrieve data using the 'owner' model
        this.successResponse(res, ownerData); // Send data as a success JSON response to the client
    });

    // Async function to retrieve all data from the 'road' model
    allRoad = asyncHandler(async (req, res) => {
        const roadData = await road(); // Retrieve data using the 'road' model
        this.successResponse(res, roadData); // Send data as a success JSON response to the client
    });

    // Retrieves all the roadmap data and sends it in the response as a JSON object.
    allRoadmap = asyncHandler(async (req, res) => {
        const roadmapData = await roadmap();
        this.successResponse(res, roadmapData);
    });

    // Retrieves all the station data and sends it in the response as a JSON object.
    allStation = asyncHandler(async (req, res) => {
        const stationData = await station();
        this.successResponse(res, stationData);
    });

    // Handle the request to get big cars in streets
    bigCarInStreet = asyncHandler(async (req, res) => {
        // Retrieve data using the 'bigCar' model
        const bigCarData = await bigCar();

        // Retrieve data using the 'RoadUnderTwenty' model
        const fullRoadData = await RoadUnderTwenty();

        // Retrieve data using the 'locateCar' model
        const locateCarData = await locateCar();

        // Create an array of car names for big cars
        const locBigCar = bigCarData.map(car => car.car);

        // Filter location data to include only big car locations
        const locationBigCarFiltered = locateCarData.filter(location => locBigCar.includes(location.car));

        // Filter location data to include only locations on roads with a speed limit of less than or equal to 20 mph
        const filteredLocations = locationBigCarFiltered.filter(loc => {
            return fullRoadData.some(road => {
                return locBigCar.includes(loc.car) &&
                    loc.longitude >= road.longitudeStart &&
                    loc.longitude <= road.longitudeEnd &&
                    loc.latitude >= road.latitudeStart &&
                    loc.latitude <= road.latitudeEnd;
            });
        });

        // Get the road name for each location and create an array of objects with car, longitude, latitude, date, and roadName properties
        const result = await Promise.all(filteredLocations.map(async loc => {
            const road = fullRoadData.find(road => {
                return loc.longitude >= road.longitudeStart &&
                    loc.longitude <= road.longitudeEnd &&
                    loc.latitude >= road.latitudeStart &&
                    loc.latitude <= road.latitudeEnd;
            });
            const { car, longitude, latitude, date } = loc;
            const roadName = road ? road.name : null;
            return { car, longitude, latitude, date, roadName };
        }));

        // Send data as a success JSON response to the client
        this.successResponse(res, result);
    });

    // Method to add a new owner
    addNewOwner = asyncHandler(async (req, res) => {
        try {
            const valid = validationResult(req);
            if (!valid.isEmpty()) {
                return this.errorResponse(res, {
                    data: valid.array().map((err) => { return { path: err.path, message: err.msg } }),
                    message: 'Validation failed',
                    status: 400
                });
            }

            const { name, national_code, age, total_toll_paid, ownerCar } = req.body;

            const newOwner = await createOwner({ name, national_code, age, total_toll_paid, ownerCar });

            if (newOwner) {
                return this.successResponse(res, newOwner, 'Added New Owner Successfully', 200);
            }
        } catch (err) {
            this.errorResponse(res, { message: err.message, status: err.status });
        }
    });

    // Method to get a list of cars owned by older owners
    carOlderOwner = asyncHandler(async (req, res) => {
        try {
            // Get the list of cars owned by older owners
            const cars = await listCarOlderOwner();

            // Return a success response with the list of cars
            return this.successResponse(res, cars, 'Successfully retrieved the list of cars owned by older owners', 200);
        } catch (err) {
            // Return an error response with the error message and status
            return this.errorResponse(res, { message: err.message, status: err.status });
        }
    });

    // Async function to retrieve all data from the 'owner' model
    redOrBlueCar = asyncHandler(async (req, res) => {
        try {
            // Retrieve data using the 'fetchCarsByColor' function
            const cars = await fetchCarsByColor();

            // If the data was successfully retrieved, send a success response with the data
            return this.successResponse(res, cars, 'Successfully retrieved cars by color', 200);
        } catch (err) {
            // If an error occurs, send an error response
            return this.errorResponse(res, [], err.message, err.status);
        }
    });

    // List cars within 600 meters of one station via last location
    carLastLocateNearStationOne = asyncHandler(async (req, res) => {
        const smallCarData = await smallCar();
        const getStationByNameData = await getStationByName('عوراضی 1');
        const latestLocations = await this.getLatestLocations();

        const locationsWithin600m = [];

        for (const location of latestLocations) {
            if (smallCarData.includes(location.car)) {
                const distance = this.calculateDistance(
                    { latitude: location.latitude, longitude: location.longitude },
                    { latitude: getStationByNameData.latitude, longitude: getStationByNameData.longitude }
                );
                if (distance < 600) {
                    locationsWithin600m.push(location);
                }
            }
        }

        if (locationsWithin600m.length === 0) {
            return this.errorResponse(res, [], 'No small cars found within 600 meters of the station', 404);
        }

        return this.successResponse(res, locationsWithin600m);
    });

    // List cars within 600 meters of one station via all time
    carAllTimeLocateNearStationOne = asyncHandler(async (req, res) => {
        try {
            const smallCarData = await smallCar();
            const getStationByNameData = await getStationByName('عوراضی 1');
            const latestLocations = await locateCar();

            const locationsWithin600m = [];

            for (const location of latestLocations) {
                if (smallCarData.includes(location.car)) {
                    const distance = this.calculateDistance(
                        { latitude: location.latitude, longitude: location.longitude },
                        { latitude: getStationByNameData.latitude, longitude: getStationByNameData.longitude }
                    );
                    if (distance < 600) {
                        locationsWithin600m.push(location);
                        locationsWithin600m.sort((a, b) => a.car - b.car);
                    }
                }
            }

            if (locationsWithin600m.length === 0) {
                return this.errorResponse(res, [], 'No small cars found within 600 meters of the station', 404);
            }

            return this.successResponse(res, locationsWithin600m);

        } catch (err) {
            console.error(err);
            return this.errorResponse(res, [], 'Internal server error', 500);
        }
    });

    // This method calculates the toll data for a specific car on a single day, across multiple toll stations
    tollCarAtOneDay = asyncHandler(async (req, res) => {
        try {
            const date = "2021-06-08";
            const carId = req.params.carId;
            // Get the toll data for each station in parallel
            const [tollOneStation, tollTwoStation, tollCarThreeStation, tollCarFourStation] = await Promise.all([
                this.tollCarOneStation(carId, date),
                this.tollCarTwoStation(carId, date),
                this.tollCarThreeStation(carId, date),
                this.tollCarFourStation(carId, date)
            ]);

            // Combine the toll data for all stations into a single object
            const total_toll = {
                station_one: tollOneStation?.[0]?.toll_per_cross || 0,
                station_two: tollTwoStation?.[0]?.toll_per_cross || 0,
                station_three: tollCarThreeStation?.[0]?.toll_per_cross || 0,
                station_four: tollCarFourStation?.[0]?.toll_per_cross || 0,
                total: [tollOneStation, tollTwoStation, tollCarThreeStation, tollCarFourStation]
                    .filter(toll => toll && toll.length > 0) // filter out empty toll arrays
                    .reduce((sum, toll) => sum + toll[0].toll_per_cross, 0)
            };

            // Return the toll data as a JSON response using the successResponse method
            this.successResponse(res, total_toll);

        } catch (err) {
            console.error(err);
            // Return the error message as a JSON response using the errorResponse method
            this.errorResponse(res, [], 'Internal server error', 500);
        }
    });

    // Handler function for calculating toll for all cars
    tollAllCars = asyncHandler(async (req, res) => {
        try {
            const ownerCarsMap = await getOwnerCarsMap();
            const tollData = {};
            for (const ownerName in ownerCarsMap) {
                const carIds = ownerCarsMap[ownerName];
                const tollDataForOwner = await this.calculateTollForCars(carIds);

                const totalToll = tollDataForOwner.reduce((sum, toll) => {
                    return sum + toll.toll + toll.tollBigCar;
                }, 0);

                tollData[ownerName] = { total_toll: totalToll, detail: tollDataForOwner };
            }

            return this.successResponse(res, tollData);
        } catch (err) {
            console.error(err);
            return this.errorResponse(res, [], 'Internal server error', 500);
        }
    });


    //  this method in based lates log location each car in date that near to Station One
    async getLatestLocations() {
        try {
            // Fetch all location data from the database
            const locateCarData = await locateCar();
            // Create a Map of the latest location data for each car
            const latestLocations = new Map();
            for (const location of locateCarData) {
                const car = location.car;
                const date = new Date(location.date);
                if (!latestLocations.has(car) || date > latestLocations.get(car).date) {
                    latestLocations.set(car, { ...location, date });
                }
            }
            // Return an array of the latest location data for each car
            return [...latestLocations.values()];
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get latest locations');
        }
    }


}




