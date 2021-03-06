import React from 'react';
import LoginTerritoryHelper from '../modules/territoryHelper/convertForward/LoginTerritoryHelper';
import TerritoryImport from '../modules/territoryHelper/convertForward/TerritoryImport';
import LocationImport from '../modules/territoryHelper/convertForward/LocationImport';
import LocationExport from '../modules/territoryHelper/convertForward/ConversionDownload';
import LocationUpload from '../modules/territoryHelper/convertForward/LocationUpload';
import ResolveTerritoryConflicts from '../modules/territoryHelper/convertForward/ResolveTerritoryConflicts';
import Wizard from '../modules/layouts/wizard';

const TerritoryHelperImportPage = () => (
  <Wizard
    title="Convert to Territory Helper Format"
    steps={[
      {
        id: 'login',
        name: 'Login Territory Helper',
        component: LoginTerritoryHelper,
      },
      {
        id: 'territories',
        name: 'Import Territories',
        component: TerritoryImport,
      },
      {
        id: 'locations',
        name: 'Import Locations',
        component: LocationImport,
      },
      {
        id: 'convert',
        name: 'Convert & Download',
        component: LocationExport,
      },
      {
        id: 'territoryConflicts',
        name: 'Resolve Territory Conflicts',
        component: ResolveTerritoryConflicts,
      },
      {
        id: 'upload',
        name: 'Send to Territory Helper',
        component: LocationUpload,
      },        
    ]}
  />
);

export default TerritoryHelperImportPage;
