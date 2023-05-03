// Import the 'controller' module and other required modules
let controller = require('./controller')
// Import the necessary modules and models
const { owner, bigCar, smallCar } = require('../model/owner')
const { road, RoadUnderTwenty } = require('../model/road')
const { roadmap, locateCar, getLocateCarWithId } = require('../model/roadmap')
const { station, getStationByName } = require('../model/station')

// Export an instance of the 'apiController' class, which inherits from 'controller'
module.exports = new class apiController extends controller {

    // Async function to retrieve all data from the 'owner' model
    async allOwner(req, res) {
        const ownerData = await owner();  // Retrieve data using the 'owner' model
        res.json(ownerData);  // Send data as a JSON response to the client
    }

    // Async function to retrieve all data from the 'road' model
    async allRoad(req, res) {
        const roadData = await road();  // Retrieve data using the 'road' model
        res.json(roadData);  // Send data as a JSON response to the client
    }


    //Retrieves all the roadmap data and sends it in the response as a JSON object.
    async allRoadmap(req, res) {
        const roadmapData = await roadmap();
        res.json(roadmapData);
    }

    // Retrieves all the station data and sends it in the response as a JSON object.
    async allStation(req, res) {
        const stationData = await station();
        res.json(stationData);
    }

    async allRoadmap(req, res) {
        // Fetches all roadmap data from the database
        const roadmapData = await roadmap();
        // Sends the roadmap data back as a JSON response
        res.json(roadmapData);
    }

    async bigCarInStreet(req, res) {
        try {
            // Fetch all data for big cars from the database
            const bigCarData = await bigCar();

            // Fetch all data for roads that are under 20 meters wide from the database
            const fullRoadData = await RoadUnderTwenty();

            // Fetch all data for car locations from the database
            const locateCarData = await locateCar();

            // Extract the list of car IDs from the bigCarData
            const locBigCar = bigCarData.map(car => car.car);

            // Filter the location data for only the big cars in the list
            const locationBigCarFiltered = locateCarData.filter(location => locBigCar.includes(location.car));

            // Filter the location data to only include locations that are on a road that is under 20 meters wide
            const filteredLocations = locationBigCarFiltered.filter(loc => {
                return fullRoadData.some(road => {
                    return locBigCar.includes(loc.car) &&
                        loc.longitude >= road.longitudeStart &&
                        loc.longitude <= road.longitudeEnd &&
                        loc.latitude >= road.latitudeStart &&
                        loc.latitude <= road.latitudeEnd;
                });
            });

            // Add the name of the road to the filtered locations
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

            // Send the resulting data as a JSON response
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

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


    // List cars within 600 meters of one station via last location
    async carLastLocateNearStationOne(req, res) {
        try {
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
                return res.status(404).json({ error: 'No small cars found within 600 meters of the station' });
            }

            return res.json(locationsWithin600m);

        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // List cars within 600 meters of one station via all time
    async carAllTimeLocateNearStationOne(req, res) {
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
                return res.status(404).json({ error: 'No small cars found within 600 meters of the station' });
            }

            return res.json(locationsWithin600m);

        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // This method calculates the toll data for a specific car on a single day, across multiple toll stations
    async tollCarAtOneDay(req, res) {
        try {
            const date = "2021-06-08";
            // Get the toll data for each station in parallel
            const [tollOneStation, tollTwoStation, tollCarThreeStation, tollCarFourStation] = await Promise.all([
                this.tollCarOneStation(req.params.id, date),
                this.tollCarTowStation(req.params.id, date),
                this.tollCarThreeStation(req.params.id, date),
                this.tollCarFourStation(req.params.id, date)
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
            // Return the toll data as a JSON response
            return res.json(total_toll);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // This method calculates the toll data for a specific car at toll station One
    async tollCarOneStation(carId, date = null) {
        try {
            // Fetch all location data for the specified car
            let locateCarData = await getLocateCarWithId(carId);

            // Filter the location data to only include data from the specified date
            if (date) {
                // Filter the location data to only include data from the specified date
                locateCarData = locateCarData.filter(
                    (item) => item.date.startsWith(date)
                );
                // If there is no location data for the specified date, return null
                if (locateCarData.length === 0) {
                    return null;
                }
            }

            // Fetch data for the toll station
            const getStationByNameData = await getStationByName("عوراضی 1");

            // If no data is found for the toll station, throw an error
            if (!getStationByNameData) {
                throw new Error("Station not found with name");
            }

            // Calculate the toll for each location data point that is within 70 meters of the toll station
            const tollStation = locateCarData
                .filter(
                    (item) =>
                        this.calculateDistance(
                            { latitude: item.latitude, longitude: item.longitude },
                            {
                                latitude: getStationByNameData.latitude,
                                longitude: getStationByNameData.longitude,
                            }
                        ) < 70
                )
                .map((item) => ({
                    car: item.car,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    date: item.date,
                    toll_per_cross: getStationByNameData.toll,
                }))
                .sort((a, b) => a.car - b.car);

            return tollStation;
        } catch (err) {
            console.error(err);
            throw new Error("Internal server error");
        }
    }
    // This method calculates the toll data for a specific car at toll station Two (similar to tollCarOneStation)
    async tollCarTowStation(carId, date = null) {
        try {
            // Fetch all location data for the specified car
            let locateCarData = await getLocateCarWithId(carId);

            if (date) {
                // Filter the location data to only include data from the specified date
                locateCarData = locateCarData.filter(
                    (item) => item.date.startsWith(date)
                );
                // If there is no location data for the specified date, return null
                if (locateCarData.length === 0) {
                    return null;
                }
            }



            // Fetch data for the toll station
            const getStationByNameData = await getStationByName('عوارضی 2');

            // If no data is found for the toll station, throw an error
            if (!getStationByNameData) {
                throw new Error("Station not found with name");
            }

            // Calculate the toll for each location data point that is within 70 meters of the toll station
            const tollStation = locateCarData
                .filter(
                    (item) =>
                        this.calculateDistance(
                            { latitude: item.latitude, longitude: item.longitude },
                            {
                                latitude: getStationByNameData.latitude,
                                longitude: getStationByNameData.longitude,
                            }
                        ) < 70
                )
                .map((item) => ({
                    car: item.car,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    date: item.date,
                    toll_per_cross: getStationByNameData.toll,
                }))
                .sort((a, b) => a.car - b.car);

            return tollStation;
        } catch (err) {
            console.error(err);
            throw new Error("Internal server error");
        }
    }
    // This method calculates the toll data for a specific car at toll station Three (similar to tollCarOneStation)
    async tollCarThreeStation(carId, date = null) {
        try {
            // Fetch all location data for the specified car
            let locateCarData = await getLocateCarWithId(carId);

            // Filter the location data to only include data from the specified date
            if (date) {
                // Filter the location data to only include data from the specified date
                locateCarData = locateCarData.filter(
                    (item) => item.date.startsWith(date)
                );
                // If there is no location data for the specified date, return null
                if (locateCarData.length === 0) {
                    return null;
                }
            }
            // Fetch data for the toll station
            const getStationByNameData = await getStationByName('عوارضی 3');

            // If no data is found for the toll station, throw an error
            if (!getStationByNameData) {
                throw new Error("Station not found with name");
            }

            // Calculate the toll for each location data point that is within 70 meters of the toll station
            const tollStation = locateCarData
                .filter(
                    (item) =>
                        this.calculateDistance(
                            { latitude: item.latitude, longitude: item.longitude },
                            {
                                latitude: getStationByNameData.latitude,
                                longitude: getStationByNameData.longitude,
                            }
                        ) < 70
                )
                .map((item) => ({
                    car: item.car,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    date: item.date,
                    toll_per_cross: getStationByNameData.toll,
                }))
                .sort((a, b) => a.car - b.car);

            return tollStation;
        } catch (err) {
            console.error(err);
            throw new Error("Internal server error");
        }
    }
    // This method calculates the toll data for a specific car at toll station Four (similar to tollCarOneStation)
    async tollCarFourStation(carId, date = null) {
        try {
            // Fetch all location data for the specified car
            let locateCarData = await getLocateCarWithId(carId);

            // Filter the location data to only include data from the specified date
            if (date) {
                // Filter the location data to only include data from the specified date
                locateCarData = locateCarData.filter(
                    (item) => item.date.startsWith(date)
                );
                // If there is no location data for the specified date, return null
                if (locateCarData.length === 0) {
                    return null;
                }
            }
            // Fetch data for the toll station
            const getStationByNameData = await getStationByName('عوارضی 4');

            // If no data is found for the toll station, throw an error
            if (!getStationByNameData) {
                throw new Error("Station not found with name");
            }

            // Calculate the toll for each location data point that is within 70 meters of the toll station
            const tollStation = locateCarData
                .filter(
                    (item) =>
                        this.calculateDistance(
                            { latitude: item.latitude, longitude: item.longitude },
                            {
                                latitude: getStationByNameData.latitude,
                                longitude: getStationByNameData.longitude,
                            }
                        ) < 70
                )
                .map((item) => ({
                    car: item.car,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    date: item.date,
                    toll_per_cross: getStationByNameData.toll,
                }))
                .sort((a, b) => a.car - b.car);

            return tollStation;
        } catch (err) {
            console.error(err);
            throw new Error("Internal server error");
        }
    }


    async tollAllCarsEveryDay(req, res) {
        try {

            const carIds = [1, 2, 3, 4, 5, 6, 7]; // Assuming carIds is an array of car ids passed in the request body
            
            // Calculate toll for each car in parallel
            const tollData = await Promise.all(carIds.map(async (carId) => {
                const tollOneStation = await this.tollCarOneStation(carId);
                const tollTwoStation = await this.tollCarTowStation(carId);
                const tollCarThreeStation = await this.tollCarThreeStation(carId);
                const tollCarFourStation = await this.tollCarFourStation(carId);

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

                return { carId, tollData: total_toll };
            }));

            // Return the toll data for all cars as a JSON response
            return res.json(tollData);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }




}




