import React, { Component } from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { DefaultButton } from 'office-ui-fabric-react/lib-es2015/Button';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import ToggleField from '../../forms/ToggleField';
import ReactTable from 'react-table';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import axios from 'axios';
import autobind from 'react-autobind';

class ResolveTerritoryConflicts extends Component {

  constructor(props) {
    super(props);
    autobind(this);
    this.state = { importStatus: { loading: true, error: false }, locationUpdates: {} };
    this.initialized = false;
  }

  async componentDidMount() {
    this.props.stepApi.onBeforeGoToNext(this.upload);
    let { data } = await axios.get('/territoryhelper/territory-conflicts')
    data = data.map((conflict, index) => { conflict.index = index; return conflict; });
    this.setState({ territoryConflicts: data, importStatus: { loading: false }})
  }

  async upload(done) {
    this.setState({ importStatus: { loading: true } });
    try {
      const { locationUpdates } = this.state;
      const updates = Object.values(locationUpdates);
      if (updates.length > 0) {
        await axios.patch('/territoryhelper/resolve-territory-conflicts', Object.values(updates));
      }
      done();
    } catch (ex) {
      this.setState({ importStatus: { error: ex.response.data.message } });
    }
  }

  handleTerritoryChanged(newValue, row) {
    const { key } = newValue;
    const { locationUpdates } = this.state;
    const { recordNum, locId, exportActivityId, index } = row.original;
    locationUpdates[index] = { exportActivityId, locId, recordNum, assignedTerritory: key };
    this.setState({ locationUpdates });
  }

  render() {
    const { territoryConflicts, importStatus: { loading, error } } = this.state;
    if (!loading && territoryConflicts.length == 0) {
      return <MessageBar messageBarType={MessageBarType.success}>There are no territory conflicts. Move on to the next step.</MessageBar>
    }

    return (
      <div>
        {loading && <Spinner />}
        <div style={{ marginBottom: '1em' }}>
          <MessageBar isMultiline>
            The following locations are within the boundaries of multiple territories.
            Using the latitude and longitude or address values for each location find out which territory the location belongs in and select it from the drop down.
          </MessageBar>
        </div>
        {error && <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>}
        {!loading && <ReactTable
          data={territoryConflicts}
          columns={[
            {
              accessor: 'territories',
              Header: 'Territories',
              width: 200,
              Cell: row => (
                <Dropdown
                  style={{ marginBottom: '10px' }}
                  options={row.value.map(t => ({ key: t.externalTerritoryId, text: t.externalTerritoryName }))}
                  onChanged={value => { this.handleTerritoryChanged(value, row); }} />
              )
            },
            { accessor: 'latitude', Header: 'Latitude', width: 200 },
            { accessor: 'longitude', Header: 'Longitude', width: 200 },
            {
              id: 'addressCol',
              accessor: d => `${d.number || ''} ${d.streetName || ''}, ${d.city || ''}, ${d.state || ''}`,
              Header: 'Address'
            },
            { accessor: 'recordNum', Header: 'Record Number', show: false }
          ]}
          defaultPageSize={100}
          className="-striped -highlight"
          minRows={1}
        />}
      </div>
    );
  }
}

export default ResolveTerritoryConflicts;
