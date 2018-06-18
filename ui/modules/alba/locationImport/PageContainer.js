import React from 'react';
import PropTypes from 'prop-types';
import Import from './Import';
import SessionController from './SessionController';
import PreImport from './PreImport';
import TSVCollector from './TSVCollector';
import Wizard from '../../../modules/layouts/wizard';
import { StateProvider } from './StateContext';
import { ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH } from '../../../../domain/models/enums/locationInterfaces';

const AlbaLocationImportPage = ({ congregationId, source, title }) => (
  <StateProvider source={source}>
    <Wizard
      title={`Import ${title} Locations`}
      steps={[
        {
          id: 'start',
          name: `Copy ${title} Locations`,
          render(props) {
            return <TSVCollector {...props} source={source} />;
          },
        },
        {
          id: 'prepare',
          name: 'Choose Congregations & Languages',
          render: props => <PreImport congregationId={congregationId} {...props} />,
        },
        {
          id: 'import',
          name: 'Import Locations',
          render: props => <SessionController>{session => <Import {...session} {...props} />}</SessionController>,
        },
      ]}
    />
  </StateProvider>
);

AlbaLocationImportPage.propTypes = {
  congregationId: PropTypes.number.isRequired,
  source: PropTypes.oneOf([ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH]),
  title: PropTypes.string.isRequired,
};

export default AlbaLocationImportPage;
