import React from 'react';
import PropTypes from 'prop-types';
import HashRouter from 'react-router-dom/HashRouter';
import Route from 'react-router-dom/Route';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

initializeIcons();

const AppRoot = ({ children: Page, path, ...props }) => (
  <HashRouter basename="/">
    <Route render={rrProps => <Page {...props} {...rrProps} />} />
  </HashRouter>
);

AppRoot.propTypes = {
  children: PropTypes.func.isRequired,
};

export default AppRoot;
