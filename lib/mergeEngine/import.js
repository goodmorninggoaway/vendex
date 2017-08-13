const DAL = require('../dataAccess/dal');

const importLocation = ({ location, congregationLocation }) => {
    const { externalLocationId } = location;
    const existingLocation = DAL.findLocation({ externalLocationId });

    if (existingLocation) {
        const { locationId } = existingLocation;
        const { congregationId } = congregationLocation;

        const existingCongregationLocation = DAL.findCongregationLocation({ locationId, congregationId });
        if (existingCongregationLocation) {
            // TODO make sure the status is the same or update it
        } else {
            congregationLocation = DAL.insertCongregationLocation({
                congregationLocation,
                locationId,
            });
        }
    } else {
        location = DAL.insertLocation(location);
        congregationLocation = DAL.insertCongregationLocation({
            ...congregationLocation,
            locationId: location.locationId
        });
    }

    return { location, congregationLocation };
};

module.exports = { importLocation };