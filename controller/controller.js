class Controller {

  //  A method that throws an error with a message and a specified HTTP status code.
  error(message, status = 500) {
    let error = new Error(message);
    error.status = status;
    throw error;
  }

  // A method that returns a response object with data, message and HTTP status code.
  response(data = [], message, status = 200) {
    return {
      data,
      message,
      status,
    };
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

  
}

module.exports = Controller;
