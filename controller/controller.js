const { getCarData } = require("../model/owner");
const { getLocateCarWithId } = require("../model/roadmap");
const { getStationByName } = require("../model/station");

class Controller {

  //  A method that throws an error with a message and a specified HTTP status code.
  error(message, status = 500) {
    let error = new Error(message);
    error.status = status;
    throw error;
  }

  //  Send a success response with a JSON object including data, status code, and optional message
  successResponse(res, data, message = null, status = 200) {
    // Create the response object with the data, message, status, and time of the response
    const response = {
      data,
      message,
      status,
      timeResponse: new Date().toISOString() // Use the toISOString() method to format the date
    };
    // Send the response with the specified status code
    return res.status(status).json(response);
  }

  //  Send an error response with a JSON object including data, status code, and optional message
  errorResponse(res, data = [], message = null, status = 200) {
    // Create the response object with the data, message, status, and success flag set to false
    const response = {
      data,
      message,
      status,
      timeResponse: new Date().toISOString() // Use the toISOString() method to format the date
    };
    // Send the response with the specified status code
    return res.status(status).json(response);
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    const earthRadius = 6371000; // meters
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(this.deg2rad(point1.latitude)) * Math.cos(this.deg2rad(point2.latitude)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    return distance;
  }

  // Convert degrees to radians
  deg2rad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Function to calculate toll for a given array of car ids
  async calculateTollForCars(carIds) {
    const tollData = await Promise.all(carIds.map(async (carId) => {
      const tollOneStation = await this.tollCarOneStation(carId);
      const tollTwoStation = await this.tollCarTwoStation(carId);
      const tollThreeStation = await this.tollCarThreeStation(carId);
      const tollFourStation = await this.tollCarFourStation(carId);

      const carData = await getCarData(carId);

      let toll = 0;
      let tollBigCar = 0;

      toll = [tollOneStation, tollTwoStation, tollThreeStation, tollFourStation]
        .filter(toll => toll && toll.length > 0) // filter out empty toll arrays
        .reduce((sum, toll) => sum + toll[0].toll_per_cross, 0);

      // If car is of type 'big' and has a load volume specified, calculate toll for the additional load
      if (carData.type === 'big' && carData.load_valume != null) {
        tollBigCar = carData.load_valume * 300;
      }

      // Return an object containing the car ID, toll for crossing the stations, and toll for additional load
      return { carId: carId, toll: toll, tollBigCar: tollBigCar };
    }));

    // Return an array of toll data for all cars in the given array
    return tollData;
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
  async tollCarTwoStation(carId, date = null) {
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

}

module.exports = Controller;
