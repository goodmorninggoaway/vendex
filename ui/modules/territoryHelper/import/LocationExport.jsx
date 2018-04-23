import React, { Component } from 'react';
import autobind from 'react-autobind';
import axios from 'axios';
import { MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/components/Spinner';
import { MessageBar } from 'office-ui-fabric-react/lib/components/MessageBar';
import { DefaultButton } from 'office-ui-fabric-react/lib/components/Button';

class LocationImport extends Component {
  constructor(...args) {
    super(...args);
    autobind(this);
    this.state = { exportStatus: {} };
  }

  componentDidMount() {
    this.generateExport();
  }

  setStateAsync(arg) {
    return new Promise(resolve => this.setState(arg, resolve));
  }

  async ping(downloadUrl) {
    try {
      const { status, headers, data } = await axios.get(downloadUrl, { responseType: 'blob' });
      if (status === 204) {
        window.setTimeout(() => this.ping(downloadUrl), 2500);
        return;
      }

      if (status === 200) {
        this.setState({ exportStatus: { data: window.URL.createObjectURL(data), name: headers['x-vendex-filename'] } });
      }
    } catch (ex) {
      this.setState({ exportStatus: { error: 'Error generating an export file for Territory Helper.' } });
    }
  }

  async generateExport() {
    await this.setStateAsync({ exportStatus: { loading: true } });
    try {
      const { headers: { location } } = await axios.get('/territoryhelper/locations?format=xlsx');
      await this.ping(location);
    } catch (ex) {
      console.log(ex.response);
      await this.setStateAsync({ exportStatus: { error: ex.response.data.message } });
    }
  }

  render() {
    const { exportStatus: { loading, error, data, name } } = this.state;
    if (error) {
      return <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' }}>
        {loading && <Spinner size={SpinnerSize.large} label="Converting locations to Territory Helper format" />}
        {data && <DefaultButton href={data} download={name} primary text="Download" iconProps={{ iconName: 'ExcelDocument' }} />}
      </div>
    );
  }
}

export default LocationImport;
