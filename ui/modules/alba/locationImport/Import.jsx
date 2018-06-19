import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { ActivityItem } from 'office-ui-fabric-react/lib/ActivityItem';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH } from '../../../../domain/models/enums/locationInterfaces';
import { withState } from './StateContext';

class Import extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = { importStatus: {}, importIndex: -1, results: [], displayCount: 25 };
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
    for (i = 0; i < rowCount; i++) {
      const location = locations[i];
      if (this.state.importStatus.stopped) {
        break;
      }

      const { Address_ID, Suite, Address, City, Province, Postal_code, Country, Notes, Kind, Status, Account, Language } = location.payload;
      const result = {
        id: location.id,
        activityDescription: `${Address || ''} ${Suite ? '#' + Suite : ''}, ${City || ''} ${Province || ''}`,
        comments: <span><strong className="ms-fontWeight-semibold">{Language || 'Unknown'}</strong> {Account}</span>,
      };

      try {
        await this.setStateAsync({ importIndex: i });
        await axios.post(`/alba/${this.props.source}/location-import/${location.id}/process`);
        result.activityIcon = <Icon iconName="CheckMark" className="ms-fontColor-green" />;
      } catch (ex) {
        console.log(ex.response);
        result.activityIcon = <Icon iconName="Cancel" className="ms-fontColor-red" />;
      }

      await this.setStateAsync(({ results }) => ({ results: [result].concat(results) }));
    }

    if (i >= rowCount - 1) {
      await this.setStateAsync({ importStatus: { finished: true } });

      try {
        await this.setStateAsync({ importIndex: i });
        const { data } = await axios.post(`/alba/${this.props.source}/location-import/finish`);
      } catch (ex) {
        console.log(ex.response);
      }
    }
  }

  render() {
    const { loading, error } = this.props;
    const { importStatus, importIndex, results, displayCount } = this.state;
    if (loading) {
      return <Spinner />;
    }

    if (error) {
      return <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>;
    }

    const { session: { locations: { length: rowCount } } } = this.props;
    return (
      <div>
        <div style={{ marginBottom: '1em' }}>
          <MessageBar>
            If a location is duplicated, the last one to be imported "wins".
          </MessageBar>
        </div>
        {importStatus.started && (
          <ProgressIndicator
            label={`Importing ${rowCount} locations.`}
            description={`${Math.floor(100 * importIndex / rowCount) || 1}% complete.`}
            percentComplete={importIndex / rowCount}
          />
        )}
        {importStatus.finished && (
          <MessageBar messageBarType={MessageBarType.success} isMultiline>
            Alba locations have been updated. <a href="/ui/territoryhelper/forward-conversion">Click here to move on to Territory Helper data.</a>
          </MessageBar>
        )}
        {results.slice(0, displayCount).map(x => <ActivityItem key={x.id} {...x} styles={{ root: { marginBottom: '8px' } }} />)}
        {results.length > displayCount && <span>{results.length - displayCount} more are not shown</span>}
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
  source: PropTypes.oneOf([ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH]),
};

Import.defaultProps = {
  source: ALBA,
};

export default withState(Import);
