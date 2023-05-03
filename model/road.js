const fs = require('fs').promises;

const road = async () => {
    try {
        const data = await fs.readFile('./jsons/roads.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
    }
};

const RoadUnderTwenty = async () => {
    try {
        const roads = await road();
        const data = roads.filter(data => data.width < 20);

        let allRoad = [];
        data.map(road => {
            const regex = /\(\((.*)\)\)/;
            const match = road.geom.match(regex);
            const coords = match[1];
            const fullRoad = coords.split(",");
            allRoad.push({ name: road.name, longitudeStart: fullRoad[0].split(" ")[0], latitudeStart: fullRoad[0].split(" ")[1], longitudeEnd: fullRoad[fullRoad.length - 1].split(" ")[1], latitudeEnd: fullRoad[fullRoad.length - 1].split(" ")[2], width: road.width });
        });

        return allRoad;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

const fullRouad = async () => {
    const roadData = await road();
    let allRoad = [];
    roadData.map(road => {
        const regex = /\(\((.*)\)\)/;
        const match = road.geom.match(regex);

        const coords = match[1];

        const fullRoad = coords.split(",");
        allRoad.push({ name: road.name, longitudeStart: fullRoad[0].split(" ")[0], latitudeStart: fullRoad[0].split(" ")[1], longitudeEnd: fullRoad[fullRoad.length - 1].split(" ")[1], latitudeEnd: fullRoad[fullRoad.length - 1].split(" ")[2], width: road.width });
    });
    return allRoad;
}



module.exports = {
    road,
    RoadUnderTwenty,
    fullRouad

}