import React, { Component } from 'react';
import autobind from 'react-autobind';
import axios from 'axios';
import { MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/components/Spinner';
import { MessageBar } from 'office-ui-fabric-react/lib/components/MessageBar';
import moment from 'moment';
import { Icon } from 'office-ui-fabric-react/lib/components/Icon';
import { Toggle } from 'office-ui-fabric-react/lib/components/Toggle';

class ConversionHistory extends Component {
  constructor(...args) {
    super(...args);
    autobind(this);
    this.state = { history: { loading: true } };
  }

  componentDidMount() {
    this.getHistory();
  }

  setStateAsync(arg) {
    return new Promise(resolve => this.setState(arg, resolve));
  }

  async getHistory() {
    await this.setStateAsync({ history: { loading: true } });
    try {
      const { data } = await axios.get('/territoryhelper/forward-conversions');
      data.forEach(e => {
        // the summary was added later
        if (!e.summary) {
          e.hasData = true;
          return;
        }

        const { inserts, updates, deletes } = e.summary;
        e.hasData = !!(inserts || deletes || updates);
      });
      this.setState({ history: { data } });
    } catch (ex) {
      console.log(ex.response);
      await this.setStateAsync({ history: { error: ex.response.data.message } });
    }
  }

  render() {
    const { history: { loading, error, data }, showAll } = this.state;
    if (error) {
      return <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>;
    }

    if (loading) {
      return <Spinner size={SpinnerSize.large} label="Loading history" />
    }

    if (data) {
      const visibleData = showAll ? data : data.filter(e => e.hasData);

      return (
        <React.Fragment>
          <blockquote>Empty exports are excluded from this list</blockquote>

          <Toggle
            checked={showAll}
            offText="Conversions with no locations are hidden"
            onText="All conversions are visible"
            onChanged={checked => this.setState({ showAll: checked })}
          />

          <table style={{ whiteSpace: 'nowrap' }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>New</th>
                <th>Updated</th>
                <th>Deleted</th>
              </tr>
            </thead>
            <tbody id="exports-list">
              {visibleData.map(({ exportActivityId, timestamp, summary, hasData }) => (
                <tr key={exportActivityId}>
                  <td>
                    {hasData && (
                      <a href={`/ui/territoryhelper/exports/${exportActivityId}/download`}>
                        <Icon iconName="ExcelDocument" style={{ marginRight: '8px' }} />
                        {moment(timestamp).format('L LTS')}
                      </a>
                    )}
                    {!hasData && (
                      <React.Fragment>
                        <Icon iconName="ChromeClose" style={{ marginRight: '8px' }} />
                        {moment(timestamp).format('L LTS')}
                      </React.Fragment>
                    )}
                  </td>
                  <td>{summary ? summary.inserts : 'N/A'}</td>
                  <td>{summary ? summary.updates : 'N/A'}</td>
                  <td>{summary ? summary.deletes : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </React.Fragment>
      );
    }

    return null;
  }
}

export default ConversionHistory;
