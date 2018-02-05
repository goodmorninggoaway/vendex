import React from 'react';
import { HashRouter } from 'react-router-dom';

const AppRoot = ({ children }) => (
  <HashRouter basename="/">{children}</HashRouter>
);

export default AppRoot;
