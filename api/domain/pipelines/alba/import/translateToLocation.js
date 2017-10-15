const { buildAddressString, getAddressParts } = require('../../../validateAddress');
const hash = require('object-hash');
const geocode = require('../../../geocode');
const { DAL } = require('../../../dataAccess');

exports.requires = ['externalLocation'];
exports.returns = 'location';
exports.handler = async function translateToLocation({ externalLocation }) {
  const address = buildAddressString(
    externalLocation.Suite,
    externalLocation.Address,
    externalLocation.City,
    externalLocation.Province,
    externalLocation['Postal_code']
  );

  const translatedLocation = getAddressParts(address);
  const addressHash = hash.sha1(translatedLocation);

  let location = await DAL.findLocation({ externalLocationId: addressHash });
  // TODO mark the address as "encountered" so we can handle the negative space

  if (!location) {
    location = Object.assign(
      {},
      translatedLocation,
      await geocode(address),
      {
        externalLocationId: addressHash,
        externalSource: 'ALBA',
      }
    );

    location = await DAL.insertLocation(location);
  }

  return location;
};
