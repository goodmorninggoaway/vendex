import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { ActivityItem } from 'office-ui-fabric-react/lib/ActivityItem';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import Link from 'react-router-dom/Link';

class Import extends Component {
  constructor(props, context) {
    super(props, context);
    autobind(this);

    this.state = { importStatus: {}, importIndex: -1, results: [] };
    this.initialized = !!this.props.session;
  }

  componentDidMount() {
    if (this.initialized) {
      this.beginImportingLocations();
    }
  }

  componentDidUpdate() {
    if (!this.initialized && this.props.session) {
      this.initialized = true;
      this.beginImportingLocations();
    }
  }

  determineStartLocationIndex() {
    //const { session: { locations, locations: { length: rowCount } } } = this.props;
    //for (let i = rowCount; i > 0; i--) {
    //  if (locations[i - 1] && locations[i - 1].isDone) {
    //    return i;
    //  }
    //}

    return 0;
  }

  setStateAsync(arg) {
    return new Promise(resolve => this.setState(arg, resolve));
  }

  async beginImportingLocations() {
    const { session: { locations } } = this.props;
    const rowCount = locations.length;
    const { started, finished } = this.state.importStatus;
    if (finished || started) {
      return;
    }

    await this.setStateAsync({ importStatus: { started: true } });

    let i;
    for (i = this.determineStartLocationIndex(); i < rowCount; i++) {
      const location = locations[i];
      if (this.state.importStatus.stopped) {
        break;
      }

      const { Address_ID, Suite, Address, City, Province, Postal_code, Country, Notes, Kind, Status, Account, Language } = location.payload;
      const result = {
        id: Address_ID,
        activityDescription: `${Address || ''} ${Suite ? '#' + Suite : ''}, ${City || ''} ${Province || ''}`,
        comments: <span><strong className="ms-fontWeight-semibold">{Language || 'Unknown'}</strong> {Account}</span>
      };

      try {
        await this.setStateAsync({ importIndex: i });
        await axios.post(`/alba/location-import/${location.id}/process`);
        result.activityIcon = <Icon iconName="CheckMark" className="ms-fontColor-green" />;
      } catch (ex) {
        console.log(ex.response);
        result.activityIcon = <Icon iconName="Cancel" className="ms-fontColor-red" />
      }

      await this.setStateAsync(({ results }) => ({ results: [result, ...results] }));
    }

    if (i >= rowCount - 1) {
      await this.setStateAsync({ importStatus: { finished: true } });

      try {
        await this.setStateAsync({ importIndex: i });
        const { data } = await axios.post(`/alba/location-import/finish`);
      } catch (ex) {
        console.log(ex.response);
      }
    }
  }

  async stopImportingLocations() {
    this.setState({ importStatus: { stopped: true } });
  }

  render() {
    const { loading, error } = this.props;
    const { importStatus, importIndex, results } = this.state;
    if (loading) {
      return <Spinner />;
    }

    if (error) {
      return <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>;
    }

    const { session: { locations: { length: rowCount } } } = this.props;
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
            label={`Importing ${rowCount} locations.`}
            description={`${Math.floor(100 * importIndex / rowCount) || 1}% complete.`}
            percentComplete={importIndex / rowCount}
          />
        )}
        {importStatus.finished && (
          <MessageBar messageBarType={MessageBarType.success} isMultiline>
            Alba locations have been updated. <a href="/ui/territoryhelper/territories">Click here to move on to Territory Helper data.</a>
          </MessageBar>
        )}
        {results.map(x => <ActivityItem key={x.id} {...x} styles={{ root: { marginBottom: '8px' } }} />)}
      </div>
    );
  }
}

Import.propTypes = {
  session: PropTypes.shape({
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
  }),
  error: PropTypes.node,
  loading: PropTypes.bool,
};

export default Import;
