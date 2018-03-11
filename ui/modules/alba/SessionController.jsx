import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import classnames from 'classnames';
import axios from 'axios';
import replaceItem from 'redux-toolbelt-immutable-helpers/lib/replaceItem';

class SessionController extends Component {
  constructor(props, context) {
    super(props, context);
    autobind(this);

    this.state = { session: null, loading: false, error: false };
  }

  componentDidMount() {
    this.refreshSession();
  }

  updateLocation(id, location) {
    if (!this.state.session) {
      return;
    }

    this.setState(({ session }) => {
      const index = session.locations.findIndex(x => x.id === id);
      if (index === -1) {
        return { session };
      }

      return { session: { ...session, locations: replaceItem(session.locations, index, location) } };
    })
  }

  async refreshSession() {
    if (this.props.session) {
      this.setState({ session: this.props.session });
      return;
    }

    try {
      this.setState({ loading: true })
      const { data } = await axios.get('/alba/session');
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
    const { children: renderer } = this.props;
    return renderer({ ...this.state, updateLocation: this.updateLocation, refreshSession: this.refreshSession });
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
