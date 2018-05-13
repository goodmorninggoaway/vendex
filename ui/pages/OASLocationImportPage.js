import React from 'react';
import PropTypes from 'prop-types';
import PageContainer from '../modules/alba/locationImport/PageContainer';
import { SYTHETIC_ALBA__OLD_APEX_SPANISH } from '../../domain/models/enums/locationInterfaces';

const OldApexSpanishLocationImportPage = ({ congregationId }) => (
  <PageContainer congregationId={congregationId} title="Old Apex Spanish" source={SYTHETIC_ALBA__OLD_APEX_SPANISH} />
);

OldApexSpanishLocationImportPage.propTypes = {
  congregationId: PropTypes.number.isRequired,
};

export default OldApexSpanishLocationImportPage;
