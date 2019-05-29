import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { ActivityItem } from 'office-ui-fabric-react/lib/ActivityItem';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
const OPERATIONS = require('../../../../domain/models/enums/activityOperations');
const LOC_RESULT = require('../../../../domain/models/enums/locationActivityResult');

const operationToNameMap = {};
operationToNameMap[OPERATIONS.INSERT] = "Create";
operationToNameMap[OPERATIONS.UPDATE] = "Update";
operationToNameMap[OPERATIONS.DELETE] = "Delete";

class LocationUpload extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = { importStatus: {}, importIndex: -1, results: [], displayCount: 25, loading: true, error: false };
    this.initialized = false;
  }

  async componentDidMount() {
    try {
      this.setState({ loading: true });
      const { data } = await axios.get('/territoryhelper/get-latest-export');
      const exportActivityId = data && data.length > 0 ? data[0].exportActivityId : -1;
      const insertLocs = data.filter(l => l.operation === OPERATIONS.INSERT && l.result != LOC_RESULT.SUCCESS) || [];
      const updateLocs = data.filter(l => l.operation === OPERATIONS.UPDATE && l.result != LOC_RESULT.SUCCESS) || [];
      const deleteLocs = data.filter(l => l.operation === OPERATIONS.DELETE && l.result != LOC_RESULT.SUCCESS) || [];
      const locations = [...insertLocs, ...updateLocs, ...deleteLocs];
      this.setState({ locations, loading: false, exportActivityId });
    } catch (ex) {
      let error = 'Sorry, something went wrong.';
      if (ex.response && ex.response.data) {
        console.log(ex.response.data);
        error = ex.response.data.message;
      }

      this.setState({ error, loading: false });
    }
  }

  componentDidUpdate() {
    if (!this.initialized && !this.state.loading) {
      this.initialized = true;
      this.beginImportingLocations();
    }
  }

  setStateAsync(arg) {
    return new Promise(resolve => this.setState(arg, resolve));
  }

  async beginImportingLocations() {
    const { locations, exportActivityId } = this.state;
    const { started, finished } = this.state.importStatus;
    const rowCount = locations.length;
    if (finished || started) {
      return;
    }

    await this.setStateAsync({ importStatus: { started: true } });

    let i;
    for (i = 0; i < rowCount; i++) {
      const location = locations[i];
      if (this.state.importStatus.stopped) {
        break;
      }

      const thLocation = {
        ExportActivityId: location.exportActivityId,
        Id: location.id,
        CongregationId: location.congregationId,
        TerritoryId: location.territoryId,
        TypeId: location.typeId,
        Approved: true,
        StatusId: location.statusId,
        LanguageId: location.languageId || null,
        Address: location.address,
        Number: location.number,
        StreetName: location.streetName,
        City: location.city,
        County: location.county,
        PostalCode: location.postalCode,
        State: location.state,
        CountryCode: location.countryCode,
        LatLng: location.latLng,
        Notes: location.notes,
        DateLastVisited: location.dateLastVisited,
        RecordNum: location.recordNum,
        Operation: location.operation
      }
      const { operation, id, address, city, state, languageName } = location;
      const result = {
        id: i,
        activityDescription: `${operationToNameMap[operation]}: ${address || ''}, ${city || ''} ${state || ''}`,
        comments: <span><strong className="ms-fontWeight-semibold">{languageName || 'Unknown'}</strong></span>,
      };

      try {
        await this.setStateAsync({ importIndex: i });
        // Must have a territory id to insert or update
        if (thLocation.TerritoryId || location.operation === OPERATIONS.DELETE) {
          if (location.operation === OPERATIONS.INSERT) {
            await axios.post('/territoryHelper/th-locations', thLocation);
          } else if (location.operation === OPERATIONS.UPDATE) {
            await axios.put(`/territoryHelper/th-locations/${id}`, thLocation);
          } else if (location.operation === OPERATIONS.DELETE && id) {
            await axios.delete(`/territoryHelper/th-locations/${id}`, { data: thLocation });
          }
          result.activityIcon = <Icon iconName="CheckMark" className="ms-fontColor-green" />;
        } else {
          result.activityIcon = <Icon iconName="CheckMark" className="ms-fontColor-red" />;
        }
      } catch (ex) {
        console.log(ex.response);
        result.activityIcon = <Icon iconName="Cancel" className="ms-fontColor-red" />;
      }

      await this.setStateAsync(({ results }) => ({ results: [result].concat(results) }));
    }

    if (i >= rowCount - 1) {
      if (exportActivityId != -1) {
        await axios.patch(`/territoryHelper/update-export-summary/${exportActivityId}`);
      }
      await this.setStateAsync({ importStatus: { finished: true } });
    }
  }

  render() {
    const { loading, error, importStatus, importIndex, results, displayCount } = this.state;
    if (loading) {
      return <Spinner />;
    }

    if (error) {
      return <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>;
    }

    const { locations: { length: rowCount } } = this.state;
    return (
      <div>
        {importStatus.started && (
          <ProgressIndicator
            label={`Importing ${rowCount} locations.`}
            description={`${Math.floor(100 * importIndex / rowCount) || 1}% complete.`}
            percentComplete={importIndex / rowCount}
          />
        )}
        {importStatus.finished && (
          <MessageBar messageBarType={MessageBarType.success}>
            Territory Helper locations have been updated. <a href="/ui/territoryhelper/forward-conversion-history">Click here to see a summary of this update.</a>
          </MessageBar>
        )}
        {results.slice(0, displayCount).map(x => <ActivityItem key={x.id} {...x} styles={{ root: { marginBottom: '8px' } }} />)}
        {results.length > displayCount && <span>{results.length - displayCount} more are not shown</span>}
      </div>
    );
  }
}

export default LocationUpload;
