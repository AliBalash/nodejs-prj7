const fs = require('fs').promises;

const roadmap = async () => {
    try {
        const data = await fs.readFile('./jsons/roadmaps.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
    }
};

const locateCar = async () => {
    const roadmapData = await roadmap();
    const data = roadmapData.map(roadmap => {
        const regex = /(\d+\.\d+)\s(\d+\.\d+)/;
        const match = roadmap.location.match(regex);
        const [longitude, latitude] = [match[1], match[2]];
        return { car: roadmap.car, longitude: longitude, latitude: latitude, date: roadmap.date };
    });
    return data;
}

const getLocateCarWithId = async (id) => {
    const allroad = await roadmap();
    const findRoad = allroad.filter(data => data.car == id);

    const data = findRoad.map(roadmap => {
        const regex = /(\d+\.\d+)\s(\d+\.\d+)/;
        const match = roadmap.location.match(regex);
        const [longitude, latitude] = [match[1], match[2]];
        return { car: roadmap.car, longitude: longitude, latitude: latitude, date: roadmap.date };
    });

    return data;
}

module.exports = {
    roadmap,
    locateCar,
    getLocateCarWithId
}