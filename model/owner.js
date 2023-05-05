const asyncHandler = require('express-async-handler')
const fs = require('fs').promises;

// Function to read owners data from file
const owner = async () => {
    try {
        const data = await fs.readFile('./jsons/owners.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
    }
};

// Function to add a new owner to the owners data file
const createOwner = async (newOwner) => {
    try {
        // Read the data from the file
        const data = await fs.readFile('./jsons/owners.json', 'utf8');
        const owners = JSON.parse(data);

        // Add the new owner to the array
        owners.push(newOwner);

        // Write the updated data back to the file
        await fs.writeFile('./jsons/owners.json', JSON.stringify(owners, null, 2));

        console.log('New owner added successfully');

        // Return the newly added owner
        return newOwner;
    } catch (err) {
        console.error(err);
    }
};

// Function to get a map of owners and their cars
const getOwnerCarsMap = async (newOwner) => {
    try {
        const ownersData = await owner();
        const ownerCarsMap = {};
        ownersData.forEach((owner) => {
            ownerCarsMap[owner.name] = owner.ownerCar.map((car) => car.id);
        });
        return ownerCarsMap;
    } catch (err) {
        console.error(err);
    }
};

// Function to get all cars and their details
const cars = async () => {
    try {
        const data = await owner();
        const cars = data.map(car => car?.ownerCar).flat()
        cars.sort((a, b) => a?.id - b?.id);
        return cars;
    } catch (err) {
        console.error(err);
    }
};

// Function to get a list of all car IDs with their owner names
const getAllCarIds = async () => {
    const ownersData = await owner();
    const carsData = ownersData.flatMap(owner =>
        owner.ownerCar.map(car => ({
            id: car.id,
            ownerName: owner.name
        }))
    );
    return carsData;
};

// Function to get a list of owners and their big cars
const bigCar = async () => {
    const data = await owner();
    const bigCarOwners = data.filter(owner => owner.ownerCar.some(car => car.type === 'big'))
        .map(owner => ({ name: owner.name, car: owner.ownerCar.find(car => car.type === 'big').id }));
    return bigCarOwners;
};

// Function to get a list of owners and their small cars
const smallCar = async () => {
    const data = await owner();
    const smallCarOwners = data.filter(owner => owner.ownerCar.some(car => car.type === 'small'))
        .map(owner => owner.ownerCar.find(car => car.type === 'small').id);
    return smallCarOwners;
};

// Function to get a list of all owners and their total toll paid
const allOnwerTollPaid = async () => {
    const data = await owner();
    const smallCarOwners = data.map(owner => { return { name: owner.name, total_toll_paid: owner.total_toll_paid } })
    return smallCarOwners;
};
const getCarData = async (carId) => {
    try {
        const ownersData = await owner(); // Get owners data
        for (const ownerData of ownersData) { // Iterate through owners data
            const matchingCar = ownerData.ownerCar.find((car) => car.id === carId); // Find car that matches given carId
            if (matchingCar) { // If a matching car is found, return owner name, car type and load volume
                return {
                    ownerName: ownerData.name,
                    type: matchingCar.type,
                    load_valume: matchingCar.load_valume,
                };
            }
        }
        return null; // Car not found
    } catch (err) {
        console.error(err);
        throw new Error('Failed to get car data'); // Throw an error if there's an issue getting car data
    }
}

const getOwnerCars = async () => {
    const ownersData = await owner(); // Get owners data
    const ownerCarsMap = {}; // Create an empty object to store owner names and their cars
    ownersData.forEach((owner) => { // Iterate through owners data
        ownerCarsMap[owner.name] = owner.ownerCar.map((car) => car.id); // Add owner name and their cars to ownerCarsMap
    });
    return ownerCarsMap; // Return ownerCarsMap
}

const fetchCarsByColor = async () => {
    try {
        const allCars = await cars(); // Get all cars data
        const filteredCars = allCars.filter(car => car?.color == 'blue' || car?.color == 'red'); // Filter cars by color
        return filteredCars; // Return filtered cars
    } catch (err) {
        console.error(err);
        throw new Error('Failed to get car data'); // Throw an error if there's an issue getting car data
    }
};

const listCarOlderOwnr = async () => {
    try {
        const owners = await owner(); // Get owners data
        const filterdOwners = owners.filter(owner => owner.age > 70).map(owner => owner.ownerCar); // Filter owners by age and map their cars
        return filterdOwners; // Return filtered owners
    } catch (err) {
        console.error(err);
        throw new Error('Failed to get car data'); // Throw an error if there's an issue getting car data
    }
};

module.exports = {
    owner,
    bigCar,
    smallCar,
    cars,
    getAllCarIds,
    allOnwerTollPaid,
    getCarData,
    getOwnerCars,
    fetchCarsByColor,
    createOwner,
    listCarOlderOwnr,
    getOwnerCarsMap
}
