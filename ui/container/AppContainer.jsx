import React, { Component } from 'react';
import autobind from 'react-autobind';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import AlbaLocationImportPage from '../pages/AlbaLocationImportPage';
import CongregationsPage from '../pages/CongregationsPage';
import OASLocationImportPage from '../pages/OASLocationImportPage';
import TerritoryHelperForwardConversionHistoryPage from '../pages/TerritoryHelperForwardConversionHistoryPage';
import TerritoryHelperForwardConversionPage from '../pages/TerritoryHelperForwardConversionPage';
import UserListPage from '../pages/UserListPage';

class AppContainer extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  render() {
    return (
      <BrowserRouter basename="/ui">
        <Switch>
          <Route path="/alba/locations" component={AlbaLocationImportPage} />
          <Route path="/oas/locations" component={OASLocationImportPage} />
          <Route path="/territoryhelper/forward-conversion" component={TerritoryHelperForwardConversionPage} />
          <Route path="/territoryhelper/forward-conversion-history" component={TerritoryHelperForwardConversionHistoryPage} />
          <Route path="/admin/congregations" component={CongregationsPage} />
          <Route path="/admin/users" component={UserListPage} />
        </Switch>
      </BrowserRouter>
    );
  }
}

AppContainer.propTypes = {};

export default AppContainer;
