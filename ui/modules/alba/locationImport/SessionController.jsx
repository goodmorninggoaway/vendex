import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';
import { withState } from './StateContext';
import { ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH } from '../../../../domain/models/enums/locationInterfaces';

class SessionController extends Component {
  constructor(props, context) {
    super(props, context);
    autobind(this);

    this.state = { session: null, loading: true, error: false };
  }

  async componentDidMount() {
    if (this.props.session) {
      this.setState({ session: this.props.session });
      return;
    }

    try {
      this.setState({ loading: true });
      const { data } = await axios.get(`/alba/${this.props.source}/session`);
      this.setState({ session: data, loading: false })
    } catch (ex) {
      let error = 'Sorry, something went wrong.';
      if (ex.response && ex.response.data) {
        console.log(ex.response.data);
        error = ex.response.data.message;
      }

      this.setState({ error, loading: false })
    }
  }

  render() {
    return this.props.children(this.state);
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

  source: PropTypes.oneOf([ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH]),
};

export default withState(SessionController);
