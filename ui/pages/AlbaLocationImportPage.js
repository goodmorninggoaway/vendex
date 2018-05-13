import React from 'react';
import PropTypes from 'prop-types';
import PageContainer from '../modules/alba/locationImport/PageContainer';
import { ALBA } from '../../domain/models/enums/locationInterfaces';

const AlbaLocationImportPage = ({ congregationId }) => (
  <PageContainer congregationId={congregationId} title="Alba" source={ALBA} />
);

AlbaLocationImportPage.propTypes = {
  congregationId: PropTypes.number.isRequired,
};

export default AlbaLocationImportPage;
