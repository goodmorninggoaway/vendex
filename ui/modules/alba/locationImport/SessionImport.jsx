import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import classnames from 'classnames';
import ReactTable from 'react-table';
import axios from 'axios';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';

class SessionImport extends Component {
  constructor(props, context) {
    super(props, context);
    autobind(this);

    this.state = { importStatus: {}, importIndex: -1 };
  }

  async processLocation(locationId) {
    try {
      const { data } = await axios.post(`/alba/session/locations/${locationId}/process`);
      this.props.updateLocation(data);
    } catch (ex) {
      console.log(ex);
    }
  }

  determineStartLocationIndex() {
    let { importIndex } = this.state;
    const { rowCount, locations } = this.props;

    for (let i = rowCount; i > 0; i--) {
      if (locations[i - 1] && locations[i - 1].isDone) {
        return i;
      }
    }

    return 0;
  }

  beginImportingLocations() {
    const { started, finished } = this.state.importStatus;
    if (finished || started) {
      return;
    }

    this.setState({ importStatus: { started: true } }, async () => {
      const { rowCount, locations, refreshSession } = this.props;

      let i;
      for (i = this.determineStartLocationIndex(); i < rowCount; i++) {
        const location = locations[i];
        if (this.state.importStatus.stopped) {
          refreshSession();
          break;
        }

        try {
          this.setState({ importIndex: i });
          await axios.post(`/alba/location-import/${location.id}/process`);
        } catch (ex) {
          console.log(ex.response);
        }
      }

      if (i >= rowCount - 1) {
        this.setState({ importStatus: { finished: true } });

        try {
          this.setState({ importIndex: i });
          const { data } = await axios.post(`/alba/location-import/finish`);
          console.log(data);
        } catch (ex) {
          console.log(ex);
        }
      }
    });
  }

  async stopImportingLocations() {
    this.setState({ importStatus: { stopped: true } });
  }

  render() {
    const { locations, rowCount } = this.props;
    const { importStatus, importIndex } = this.state;

    return (
      <div>
        {importStatus.started
          ? <DefaultButton onClick={this.stopImportingLocations} iconProps={{ iconName: 'CircleStopSolid' }}>Stop Import</DefaultButton>
          : (
            <DefaultButton onClick={this.beginImportingLocations} iconProps={{ iconName: 'BoxPlaySolid' }}>
              {this.determineStartLocationIndex() ? 'Resume' : 'Start'} Import
            </DefaultButton>
          )
        }
        {importStatus.started && (
          <ProgressIndicator
            label={`Processing ${importIndex + 1} of ${rowCount}`}
            percentComplete={importIndex / rowCount}
          />
        )}
        <ReactTable
          data={locations}
          columns={[
            { Header: 'Address ID', accessor: 'payload.Address_ID' },
            { Header: 'Suite', accessor: 'payload.Suite' },
            { Header: 'Address', accessor: 'payload.Address' },
            { Header: 'City', accessor: 'payload.City' },
            { Header: 'Province', accessor: 'payload.Province' },
            { Header: 'Postal_code', accessor: 'payload.Postal_code' },
            { Header: 'Country', accessor: 'payload.Country' },
            { Header: 'Notes', accessor: 'payload.Notes' },
            { Header: 'Kind', accessor: 'payload.Kind' },
            { Header: 'Status', accessor: 'payload.Status' },
            { Header: 'Account', accessor: 'payload.Account' },
            { Header: 'Language', accessor: 'payload.Language' },
            {
              Header: 'Actions',
              id: 'actions',
              show: false,
              Cell: ({ original: { id } }) => <button onClick={() => this.processLocation(id)}>Process</button>
            }
          ]}
        />
      </div>
    );
  }
}

SessionImport.propTypes = {
  locations: PropTypes.arrayOf(PropTypes.shape({
    payload: PropTypes.shape({
      Address_ID: PropTypes.string.isRequired,
      Suite: PropTypes.string.isRequired,
      Address: PropTypes.string.isRequired,
      City: PropTypes.string.isRequired,
      Province: PropTypes.string.isRequired,
      Postal_code: PropTypes.string.isRequired,
      Country: PropTypes.string.isRequired,
      Notes: PropTypes.string.isRequired,
      Kind: PropTypes.string.isRequired,
      Status: PropTypes.string.isRequired,
      Account: PropTypes.string.isRequired,
      Language: PropTypes.string.isRequired,
    }),
  })),
  updateLocation: PropTypes.func.isRequired,
  refreshSession: PropTypes.func.isRequired,
};

export default SessionImport;
