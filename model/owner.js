const fs = require('fs').promises;

const owner = async () => {
    try {
        const data = await fs.readFile('./jsons/owners.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
    }
};

const cars = async () => {
    try {
        const data = await owner();
        const cars = data.map(car => car.ownerCar).flat()
        cars.sort((a, b) => a.id - b.id);
        return cars;
    } catch (err) {
        console.error(err);
    }
};


const bigCar = async () => {
    const data = await owner();
    const bigCarOwners = data.filter(owner => owner.ownerCar.some(car => car.type === 'big'))
        .map(owner => ({ name: owner.name, car: owner.ownerCar.find(car => car.type === 'big').id }));
    return bigCarOwners;
}


const smallCar = async () => {
    const data = await owner();
    const smallCarOwners = data.filter(owner => owner.ownerCar.some(car => car.type === 'small'))
        .map(owner =>  owner.ownerCar.find(car => car.type === 'small').id );
    return smallCarOwners;
}

const isOlderThan = (age) => {
    return function (person) {
        return person.age > age;
    }
}

module.exports = {
    owner,
    isOlderThan,
    bigCar,
    smallCar,
    cars

}