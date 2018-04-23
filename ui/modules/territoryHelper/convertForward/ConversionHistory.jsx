import React, { Component } from 'react';
import autobind from 'react-autobind';
import axios from 'axios';
import { MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/components/Spinner';
import { MessageBar } from 'office-ui-fabric-react/lib/components/MessageBar';
import moment from 'moment';

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
      this.setState({ history: { data } });
    } catch (ex) {
      console.log(ex.response);
      await this.setStateAsync({ history: { error: ex.response.data.message } });
    }
  }

  render() {
    const { history: { loading, error, data } } = this.state;
    if (error) {
      return <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>;
    }

    if (loading) {
      return <Spinner size={SpinnerSize.large} label="Loading history" />
    }

    if (data) {
      return (
        <React.Fragment>
          <blockquote>Empty exports are excluded from this list</blockquote>

          <table style={{ whiteSpace: 'nowrap' }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>New</th>
                <th>Updated</th>
                <th>Deleted</th>
                <th />
              </tr>
            </thead>
            <tbody id="exports-list">
              {data.map(({ exportActivityId, timestamp, summary }) => (
                <tr key={exportActivityId}>
                  <td>{moment(timestamp).format('L LTS')}</td>
                  <td>{summary ? summary.inserts : 'N/A'}</td>
                  <td>{summary ? summary.updates : 'N/A'}</td>
                  <td>{summary ? summary.deletes : 'N/A'}</td>
                  <td><a href={`/ui/territoryhelper/exports/${exportActivityId}/download`}>Download</a></td>
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
