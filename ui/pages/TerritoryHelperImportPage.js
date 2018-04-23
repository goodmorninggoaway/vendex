import React from 'react';
import PropTypes from 'prop-types';
import TerritoryImport from '../modules/territoryHelper/import/TerritoryImport';
import Wizard from '../modules/layouts/Wizard';

const TerritoryHelperImportPage = () => (
  <Wizard
    title="Territory Helper Import"
    steps={[
      {
        id: 'start',
        name: 'Update Territories',
        component: TerritoryImport,
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
