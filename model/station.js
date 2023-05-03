const fs = require('fs').promises;

const station = async () => {
    try {
        const data = await fs.readFile('./jsons/stations.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
    }
};


const getStationByName = async (name) => {
  try {
    const data = await station();
    const stationData = data.find(stat => stat.name === name);
    if (!stationData) {
      return null;
    }
    const regex = /(\d+\.\d+)\s(\d+\.\d+)/;
    const match = stationData.location.match(regex);
    const [longitude, latitude] = [match[1], match[2]];

    return { car: stationData.name, longitude: longitude, latitude: latitude , toll : stationData.toll_per_cross };

  } catch (err) {
    console.error(err);
  }
}



module.exports = {
    station,
    getStationByName
}