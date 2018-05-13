import React, { Component } from 'react';
import autobind from 'react-autobind';
import axios from 'axios';
import { MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/components/Spinner';
import { MessageBar } from 'office-ui-fabric-react/lib/components/MessageBar/MessageBar';

class LocationImport extends Component {
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
    if (!this.fileEl.value.length) {
      this.setState({ importStatus: { error: 'You need to attach a location file.' } });
      return;
    }

    await this.setStateAsync({ importStatus: { loading: true } });
    try {
      await axios.post('/territoryhelper/locations', new FormData(this.formEl));
      done();
    } catch (ex) {
      await this.setStateAsync({ importStatus: { error: ex.response.data.message } });
    }
  }

  render() {
    const { importStatus: { loading, error } } = this.state;
    return (
      <React.Fragment>
        <form ref={el => this.formEl = el}>
          <label htmlFor="th-territory-file">
            <p>Choose a <a target="_blank" href="https://territoryhelper.com/en/ImportExport">Territory Helper</a> location export file to upload</p>
            <input type="file" name="file" ref={el => this.fileEl = el} />
          </label>
        </form>
        {loading && <Spinner size={SpinnerSize.large} label="Updating locations" />}
        {error && <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>}
      </React.Fragment>
    );
  }
}

export default LocationImport;
