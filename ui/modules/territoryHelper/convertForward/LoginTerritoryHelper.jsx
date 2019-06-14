import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { ActivityItem } from 'office-ui-fabric-react/lib/ActivityItem';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';

class LoginTerritoryHelper extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = { importStatus: {}, importIndex: -1, results: [], displayCount: 25, loading: true, error: false };
    this.initialized = false;
    this.props.stepApi.hideNextButton(true);
  }

  async componentDidMount() {
    try {
      await axios.get('/territoryhelper/th-my-profile');
      this.props.stepApi.goNextStep();
    } catch (ex) {
      if (ex.response && ex.response.data) {
        console.log(ex.response.data);
      }
    }
  }

  setStateAsync(arg) {
    return new Promise(resolve => this.setState(arg, resolve));
  }

  render() {
    const TH_URL = process.env.TH_URL;
    const TH_CLIENT_ID = process.env.TH_CLIENT_ID;
    const thAuthorizeUrl = `${TH_URL}/api/auth?response_type=code&client_id=${TH_CLIENT_ID}&redirect_uri=` + encodeURIComponent(`${window.location.protocol}//${window.location.host}/territoryhelper/authorize`);
    return (
      <div>
        Click <a href={thAuthorizeUrl}>here</a> to login to Territory Helper.
      </div>
    );
  }
}

export default LoginTerritoryHelper;
