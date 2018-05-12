const hash = require('object-hash');
const {
  buildAddressString,
  getAddressParts,
} = require('../../validateAddress');
const geocode = require('../../geocode');
const { DAL } = require('../../dataAccess');

exports.requires = ['externalLocation'];
exports.returns = ['location', 'isNew'];
exports.handler = async function translateToLocation({ externalLocation, source }) {
  const address = buildAddressString(
    externalLocation.Suite,
    externalLocation.Address,
    externalLocation.City,
    externalLocation.Province,
    externalLocation['Postal_code'],
  );

  const translatedLocation = getAddressParts(address);
  const addressHash = hash.sha1(translatedLocation);

  let location = await DAL.findLocation({ externalLocationId: addressHash });
  let isNew = false;

  if (!location) {
    location = Object.assign({}, translatedLocation, await geocode(address), {
      externalLocationId: addressHash,
      externalSource: source,
    });

    location = await DAL.insertLocation(location);
    isNew = true;
  }

  return { location, isNew };
};
