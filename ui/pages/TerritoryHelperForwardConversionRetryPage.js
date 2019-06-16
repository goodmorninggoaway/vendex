import React from 'react';
import LoginTerritoryHelper from '../modules/territoryHelper/convertForward/LoginTerritoryHelper';
import LocationUpload from '../modules/territoryHelper/convertForward/LocationUpload';
import ResolveTerritoryConflicts from '../modules/territoryHelper/convertForward/ResolveTerritoryConflicts';
import Wizard from '../modules/layouts/wizard';

// FIXME This is the same as TerritoryHelperForwardConversionPage with a few less steps.
// See if it is possible to use the same page for both. 
const TerritoryHelperImportRetryPage = () => (
  <Wizard
    title="Convert to Territory Helper Format"
    steps={[
      {
        id: 'login',
        name: 'Login Territory Helper',
        component: LoginTerritoryHelper,
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

export default TerritoryHelperImportRetryPage;
