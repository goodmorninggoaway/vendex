import React from 'react';
import PropTypes from 'prop-types';
import Import from '../modules/alba/locationImport/Import';
import SessionController from '../modules/alba/locationImport/SessionController';
import PreImport from '../modules/alba/locationImport/PreImport';
import TSVCollector from '../modules/alba/locationImport/TSVCollector';
import Wizard from '../modules/layouts/wizard';
import { StateProvider } from '../modules/alba/locationImport/StateContext';

const AlbaLocationImportPage = ({ congregationId }) => (
  <StateProvider>
    <Wizard
      title="Alba"
      steps={[
        {
          id: 'start',
          name: 'Copy Alba Locations',
          component: TSVCollector,
        },
        {
          id: 'prepare',
          name: 'Verify Congregations & Languages',
          render: props => <PreImport congregationId={congregationId} {...props} />,
        },
        {
          id: 'import',
          name: 'Import Locations',
          render: props => <SessionController>{session => <Import {...session} {...props} />}</SessionController>
        },
      ]}
    />
  </StateProvider>
);

AlbaLocationImportPage.propTypes = {
  congregationId: PropTypes.number.isRequired,
};

export default AlbaLocationImportPage;
