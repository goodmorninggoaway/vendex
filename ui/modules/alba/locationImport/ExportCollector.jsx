import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';

class ExportCollector extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = {};
  }

  async submitLocations(e) {
    e.preventDefault();

    this.setState({ loading: true });
    const { locations: body } = this.state;

    try {
      const { data } = await axios.post('/alba/session', { payload: body });
      this.setState({ loading: false, session: data });
      this.props.history.push('/review');
      Materialize.toast('Locations successfully imported.', 5000);
    } catch (ex) {
      this.setState({ loading: false, error: ex });
      Materialize.toast(`Error importing locations. ${ex}`, 5000);
    }
  }

  render() {
    const { congregationId } = this.props;
    const { loading, error } = this.state;
    return (
      <div>
        <blockquote>
          Setup relationships with other congregations by{' '}
          <a href="/ui/congregations">adding</a> the congregation, then <a href={`/ui/congregations/${congregationId}`}>your congregation</a> to link them.
          You should only import locations for congregations with whom you've agreed to share locations.
        </blockquote>
        <blockquote>
          Importing locations from Alba can take a long time to complete the initial import. Estimate about 1-2 seconds per location.
          Note that you may see an import error if it takes more than 30s to complete; It is still running in the background.
        </blockquote>
        <blockquote>
          If an address exists more than once in the import data, the last one wins.
        </blockquote>
        <form>
          <div className="row">
            <label htmlFor="alba-export-tsv">
              Paste ALBA location export from <a target="_blank" href=" https://www.mcmxiv.com/alba/addresses">Alba</a>:
              <textarea onChange={(e) => this.setState({ locations: e.target.value })} />
            </label>
          </div>

          <div className="row">
            <button onClick={this.submitLocations}>Import</button>
          </div>

          {loading && <Spinner />}
          {error && <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>}
        </form>
      </div>
    );
  }
}

ExportCollector.propTypes = {
  congregationId: PropTypes.number.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default ExportCollector;
