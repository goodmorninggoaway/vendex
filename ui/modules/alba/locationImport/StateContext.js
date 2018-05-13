import React from 'react';
import { ALBA } from '../../../../domain/models/enums/locationInterfaces';

const { Provider, Consumer } = React.createContext();

export function withState(WrappedComponent) {
  return function StateConsumer(props) {
    return (
      <Consumer>
        {state => <WrappedComponent {...state}{...props} />}
      </Consumer>
    );
  }
}

export class StateProvider extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      source: ALBA,
      setSource: source => this.setState({ source }),
    };
  }

  render() {
    return <Provider {...this.props} value={this.state} />;
  }
}
