import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Import from './locationImport/Import';
import SessionController from './SessionController';
import PreImport from './locationImport/PreImport';
import TSVCollector from './locationImport/TSVCollector';
import Wizard from '../layouts/Wizard';

class AlbaLocationImportPage extends Component {
  render() {
    return (
      <Wizard
        title="Alba"
        steps={[
          {
            id: 'start',
            name: 'Copy Alba Locations',
            render: props => <TSVCollector {...this.props} {...props} />,
          },
          {
            id: 'prepare',
            name: 'Verify Congregations & Languages',
            render: props => <PreImport {...props} />,
          },
          {
            id: 'import',
            name: 'Import Locations',
            render: props => <SessionController>{session => <Import {...session} {...props} />}</SessionController>
          },
        ]}
      />
    );
  }
}

AlbaLocationImportPage.propTypes = {
  congregationId: PropTypes.number.isRequired,
};

export default AlbaLocationImportPage;
