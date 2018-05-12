import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH } from '../../../../domain/models/enums/locationInterfaces';
import { withState } from './StateContext';

class TSVCollector extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = { source: ALBA };
  }

  componentDidMount() {
    this.props.stepApi.onBeforeGoToNext(this.submitLocations);
  }

  submitLocations(done) {
    this.setState({ loading: true }, async () => {
      try {
        await axios.post(`/alba/${this.state.source}/session`, { payload: this.state.locations });
        this.props.setSource(this.state.source);
        done();
      } catch (ex) {
        this.setState({ loading: false, error: ex });
      }
    });
  }

  render() {
    const { loading, error, source, locations } = this.state;
    return (
      <form style={{ flex: '1 auto' }}>
        <Dropdown
          label="Source"
          name="source"
          options={[
            { key: ALBA, text: 'Alba' },
            { key: SYTHETIC_ALBA__OLD_APEX_SPANISH, text: 'Old Apex Spanish' },
          ]}
          onChanged={(e) => this.setState({ source: e.key })}
          selectedKey={source}
        />
        <TextField
          label={<React.Fragment>Paste ALBA location export from <a target="_blank" href=" https://www.mcmxiv.com/alba/addresses">Alba</a></React.Fragment>}
          multiline
          rows={20}
          onChanged={(e) => this.setState({ locations: e })}
          value={locations}
        />
        {loading && <Spinner />}
        {error && <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>}
      </form>
    );
  }
}

TSVCollector.propTypes = {
  stepApi: PropTypes.shape({
    onBeforeGoToNext: PropTypes.func,
  })
};

export default withState(TSVCollector);
