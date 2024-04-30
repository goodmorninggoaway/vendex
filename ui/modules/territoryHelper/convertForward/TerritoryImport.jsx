import React, { Component } from 'react';
import autobind from 'react-autobind';
import axios from 'axios';
import { MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/components/Spinner';
import { MessageBar } from 'office-ui-fabric-react/lib/components/MessageBar/MessageBar';

class TerritoryImport extends Component {
  constructor(...args) {
    super(...args);
    autobind(this);
    this.state = { importStatus: {} };
  }

  componentDidMount() {
    this.props.stepApi.onBeforeGoToNext(this.upload);
  }

  setStateAsync(arg) {
    return new Promise(resolve => this.setState(arg, resolve));
  }

  async upload(done) {
    await this.setStateAsync({ importStatus: { loading: true } });
    try {
      await axios.post('/territoryhelper/territories');
      done();
    } catch (ex) {
      await this.setStateAsync({ importStatus: { error: ex.response.data.message } });
    }
  }

  render() {
    const { importStatus: { loading, error } } = this.state;
    return (
      <React.Fragment>
        {!error && <MessageBar>Click next to begin importing Territory Helper territories.</MessageBar>}
        {loading && <Spinner size={SpinnerSize.large} label="Updating territories" />}
        {error && <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>}
      </React.Fragment>
    );
  }
}

export default TerritoryImport;
