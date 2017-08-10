module.exports.toGeneric = (source, map, geocodeResult, sourceLocation) => {
    const simplyMatched = Object
        .entries(map)
        .reduce((memo, [key, value]) => {
            memo[key] = value ? sourceLocation[value] : null;
            return memo;
        }, { source });

    return Object.assign({ id: `${source}-${geocodeResult.raw[0].place_id}` }, simplyMatched, geocodeResult);
};

module.exports.fromGeneric = (map, genericLocation) => Object
    .entries(map)
    .reduce((memo, [value, key]) => {
        memo[key] = value ? genericLocation[value] : null;
        return memo;
    }, {});