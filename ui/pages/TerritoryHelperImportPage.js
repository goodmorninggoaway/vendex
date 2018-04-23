import React from 'react';
import PropTypes from 'prop-types';
import TerritoryImport from '../modules/territoryHelper/import/TerritoryImport';
import LocationImport from '../modules/territoryHelper/import/LocationImport';
import LocationExport from '../modules/territoryHelper/import/LocationExport';
import Wizard from '../modules/layouts/Wizard';

const TerritoryHelperImportPage = () => (
  <Wizard
    title="Territory Helper Import"
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
        name: 'Download',
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
