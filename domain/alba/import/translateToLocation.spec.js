const { expect } = require('chai');
const { stub } = require('sinon');
const proxyquire = require('proxyquire');

describe('translateToLocation', function () {
  let mockDAL;
  let translateToLocation;
  let mockGeocode;

  const externalLocation = {
    "Address_ID": 7271876,
    "Suite": null,
    "Address": "753 Davenbury way",
    "City": "Cary",
    "Province": "NC",
    "Postal_code": null,
    "Country": "USA",
    "Notes": null,
    "Kind": "Foreign-language",
    "Status": null,
    "Account": "Triangle Park Hindi",
    "Language": "Nepali"
  };

  const mockGeocodeResponse = {
    latitude: -20.22222222,
    longitude: 30.3333,
  };

  beforeEach(() => {
    mockGeocode = stub();
    mockDAL = {
      findLocation: stub(),
      insertLocation: stub(),
    };

    translateToLocation = proxyquire('./translateToLocation', {
      '../../../geocode': mockGeocode,
      '../../../dataAccess': { DAL: mockDAL },
    }).handler;
  });

  it('should parse and hash the address then create the location', async function () {
    mockGeocode.resolves(mockGeocodeResponse);

    await translateToLocation({ externalLocation });

    const actual = mockDAL.insertLocation.firstCall.args[0];

    expect(actual).to.deep.contain({
      latitude: mockGeocodeResponse.latitude,
      longitude: mockGeocodeResponse.longitude,
      number: '753',
      street: 'Davenbury way',
      city: 'Cary',
      state: 'NC',
      externalSource: 'ALBA',
    });

    expect(actual.externalLocationId).to.have.length.above(1);
    expect(mockDAL.insertLocation).to.have.been.calledOnce();
  });

  it('should not create a new location', async function () {
    mockGeocode.resolves(mockGeocodeResponse);
    mockDAL.findLocation.resolves({ locationId: 1 });

    await translateToLocation({ externalLocation });

    expect(mockDAL.insertLocation).not.to.have.been.called();
  });
});
