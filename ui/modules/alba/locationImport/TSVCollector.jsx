import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH } from '../../../../domain/models/enums/locationInterfaces';
import { withState } from './StateContext';

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
        await axios.post(`/alba/${this.props.source}/session`, { payload: this.state.locations });
        done();
      } catch (ex) {
        this.setState({ loading: false, error: ex });
      }
    });
  }

  render() {
    const { loading, error, locations } = this.state;
    let label;
    switch (this.props.source) {
    case ALBA:
      label = <React.Fragment>Paste ALBA location export from <a target="_blank" href=" https://www.mcmxiv.com/alba/addresses">Alba</a></React.Fragment>;
      break;
    case SYTHETIC_ALBA__OLD_APEX_SPANISH:
      label = 'Paste locations after converting them to a spreadsheet';
      break;
    default:
      break;
    }

    return (
      <form style={{ flex: '1 auto' }}>
        <TextField label={label} multiline rows={20} onChanged={(e) => this.setState({ locations: e })} value={locations} />
        {loading && <Spinner />}
        {error && <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>}
      </form>
    );
  }
}

TSVCollector.propTypes = {
  stepApi: PropTypes.shape({
    onBeforeGoToNext: PropTypes.func,
  }),
  source: PropTypes.oneOf([ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH]),
};

export default withState(TSVCollector);
