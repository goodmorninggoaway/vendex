import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';
import SessionImport from './locationImport/SessionImport';
import SessionController from './SessionController';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import Route from 'react-router-dom/Route';
import Redirect from 'react-router-dom/Redirect';
import NavLink from 'react-router-dom/NavLink';
import Switch from 'react-router-dom/Switch';
import SessionAnalysis from './locationImport/SessionAnalysis';
import ExportCollector from './locationImport/ExportCollector';
import NavBar from '../nav/NavBar';

class AlbaLocationImportPage extends Component {
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
    const { loading, session, error } = this.state;
    return (
      <div>
        <h4>Alba > Import Locations</h4>
        <NavBar>
          <NavLink to="/" exact>Start</NavLink>
          <NavLink to="/analyze">Analyze</NavLink>
          <NavLink to="/import">Import</NavLink>
          <NavLink to="/summary">Summary</NavLink>
        </NavBar>
        <Switch>
          <Route path="/analyze" component={SessionAnalysis} />
          <Route
            path="/import"
            render={() => (
              <SessionController>
                {({ session, error, loading, ...callbacks }) => {
                  if (loading) {
                    return <Spinner />;
                  }

                  if (error) {
                    return <MessageBar messageBarType={MessageBarType.error} isMultiline>{error}</MessageBar>;
                  }

                  return <SessionImport {...session} {...callbacks} />;
                }}
              </SessionController>
            )}
          />

          <Route render={props => <ExportCollector congregationId={congregationId} {...props} />} />
        </Switch>
      </div>
    );
  }
}

AlbaLocationImportPage.propTypes = {
  congregationId: PropTypes.number.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default AlbaLocationImportPage;
