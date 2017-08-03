module.exports.toGeneric = (map, geocodeResult, sourceLocation) => {
    const simplyMatched = Object
        .entries(map)
        .reduce((memo, [key, value]) => {
            memo[key] = value ? sourceLocation[value] : null;
            return memo;
        }, {});
    return Object.assign({}, simplyMatched, geocodeResult);
};

module.exports.fromGeneric = (map, genericLocation) => Object
    .entries(map)
    .reduce((memo, [value, key]) => {
        memo[key] = value ? genericLocation[value] : null;
        return memo;
    }, {});