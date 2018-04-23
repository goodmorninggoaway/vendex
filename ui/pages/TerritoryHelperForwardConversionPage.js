import React from 'react';
import TerritoryImport from '../modules/territoryHelper/convertForward/TerritoryImport';
import LocationImport from '../modules/territoryHelper/convertForward/LocationImport';
import LocationExport from '../modules/territoryHelper/convertForward/ConversionDownload';
import Wizard from '../modules/layouts/Wizard';

const TerritoryHelperImportPage = () => (
  <Wizard
    title="Territory Helper"
    steps={[
      {
        id: 'territories',
        name: 'Update Territories',
        component: TerritoryImport,
      },
      {
        id: 'locations',
        name: 'Update Locations',
        component: LocationImport,
      },
      {
        id: 'convert',
        name: 'Convert & Download',
        component: LocationExport,
      },
      {
        id: 'finish',
        name: 'Finish',
        render: () => <h1>Thumbs up</h1>,
      }
    ]}
  />
);

export default TerritoryHelperImportPage;
