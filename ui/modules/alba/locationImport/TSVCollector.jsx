import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

class TSVCollector extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = {};
  }

  componentDidMount() {
    this.props.stepApi.onBeforeGoToNext(this.submitLocations);
  }

  submitLocations(done) {
    this.setState({ loading: true }, async () => {
      try {
        await axios.post('/alba/session', { payload: this.state.locations });
        done();
      } catch (ex) {
        this.setState({ loading: false, error: ex });
        Materialize.toast(`Error importing locations. ${ex}`, 5000);
      }
    });
  }

  render() {
    const { loading, error } = this.state;
    return (
      <form style={{ flex: '1 auto' }}>
        <div className="row">
          <label htmlFor="alba-export-tsv">
            Paste ALBA location export from <a target="_blank" href=" https://www.mcmxiv.com/alba/addresses">Alba</a>:
            <textarea onChange={(e) => this.setState({ locations: e.target.value })} style={{ height: '50vh' }} />
          </label>
        </div>
        {loading && <Spinner />}
        {error && <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>}
      </form>
    );
  }
}

TSVCollector.propTypes = {
  congregationId: PropTypes.number.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  stepApi: PropTypes.shape({
    onBeforeGoToNext: PropTypes.func,
  })
};

export default TSVCollector;
