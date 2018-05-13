import React from 'react';
import PropTypes from 'prop-types';
import { ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH } from '../../../../domain/models/enums/locationInterfaces';

const { Provider, Consumer } = React.createContext();

export function withState(WrappedComponent) {
  return function StateConsumer(props) {
    return (
      <Consumer>
        {state => <WrappedComponent {...state}{...props} />}
      </Consumer>
    );
  };
}

export class StateProvider extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      source: this.props.source || ALBA,
      setSource: source => this.setState({ source }),
    };
  }

  render() {
    return <Provider {...this.props} value={this.state} />;
  }
}

StateProvider.propTypes = {
  source: PropTypes.oneOf([ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH]),
};
