import React from 'react';
import TerritoryImport from '../modules/territoryHelper/convertForward/TerritoryImport';
import LocationImport from '../modules/territoryHelper/convertForward/LocationImport';
import LocationExport from '../modules/territoryHelper/convertForward/ConversionDownload';
import Wizard from '../modules/layouts/wizard';

const TerritoryHelperImportPage = () => (
  <Wizard
    title="Convert to Territory Helper Format"
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
      }
    ]}
  />
);

export default TerritoryHelperImportPage;
