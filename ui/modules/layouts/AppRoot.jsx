import React from 'react';
import { HashRouter } from 'react-router-dom';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

initializeIcons();

const AppRoot = ({ children }) => (
  <HashRouter basename="/">{children}</HashRouter>
);

export default AppRoot;
