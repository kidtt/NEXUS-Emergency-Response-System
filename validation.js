const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password) => {
    return (
        typeof password === "string" &&
        password.length >= 8
    );
};

const isValidId = (id) => {
    return Number.isInteger(Number(id)) && Number(id) > 0;
};

const isValidEnum = (value, allowedValues) => {
    return allowedValues.includes(value);
};

const isValidCoordinates = (latitude, longitude) => {
    if (
        latitude === undefined ||
        latitude === null ||
        longitude === undefined ||
        longitude === null
    ) {
        return true;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidId,
    isValidEnum,
    isValidCoordinates
};