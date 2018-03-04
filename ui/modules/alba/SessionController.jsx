import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import classnames from 'classnames';
import axios from 'axios';

class SessionController extends Component {
  constructor(props, context) {
    super(props, context);
    autobind(this);

    this.state = { session: null, loading: false, error: false };
  }

  async componentDidMount() {
    if (this.props.session) {
      this.setState({ session: this.props.session });
      return;
    }

    try {
      this.setState({ loading: true })
      const { data } = await axios.get('/alba/session');
      this.setState({ session: data, loading: false })
    } catch (error) {
      this.setState({ error, loading: false })
    }

  }

  render() {
    const { children: renderer } = this.props;
    return renderer(this.state);
  }
}

SessionController.propTypes = {
  /**
   * @param session {Object}
   * @param loading {Boolean}
   * @param error {String}
   * @return React Element
   */
  children: PropTypes.func.isRequired,

  /**
   * Passthrough a session object instead of loading
   */
  session: PropTypes.object,
};

export default SessionController;
