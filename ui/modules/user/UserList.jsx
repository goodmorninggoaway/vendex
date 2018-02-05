import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import { Spinner } from 'office-ui-fabric-react/lib-es2015/Spinner';
import { Route, Link } from 'react-router-dom';
import autobind from 'react-autobind';

import EditUser from './EditUser';

class UserList extends Component {
  constructor(...args) {
    super(...args);
    autobind(this);
    this.state = { tableExpansion: {} };
  }

  async componentDidMount() {
    const response = await fetch('/users');
    const users = await response.json();

    this.setState({ users });
  }

  async updateUser(user, index) {
    this.setState(({ tableExpansion }) => ({
      tableExpansion: { ...tableExpansion, [index]: false },
    }));
  }

  render() {
    const { users, tableExpansion } = this.state;
    if (!users) {
      return <Spinner />;
    }

    return (
      <ReactTable
        data={users}
        columns={[
          { accessor: 'userId', Header: 'ID' },
          { accessor: 'email', Header: 'Email' },
          { accessor: 'name', Header: 'Name' },
          { accessor: 'isActive', Header: 'Active' },
        ]}
        defaultPageSize={10}
        className="-striped -highlight"
        SubComponent={row => (
          <EditUser
            user={row.original}
            onSubmit={user => this.updateUser(user, row.index)}
          />
        )}
        expanded={tableExpansion}
        onExpandedChange={(newExpanded, index) =>
          this.setState({ tableExpansion: newExpanded })
        }
      />
    );
  }
}

UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.number,
    }),
  ),
};

export default UserList;
