import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import { Spinner } from 'office-ui-fabric-react/lib-es2015/Spinner';
import {
  Button,
  CommandBarButton,
} from 'office-ui-fabric-react/lib-es2015/Button';
import { Modal } from 'office-ui-fabric-react/lib-es2015/Modal';
import { Route, Link } from 'react-router-dom';
import autobind from 'react-autobind';
import { updateItemById } from 'redux-toolbelt-immutable-helpers';
import EditUser from './EditUser';

class UserList extends Component {
  constructor(...args) {
    super(...args);
    autobind(this);
    this.state = {
      tableExpansion: {},
      showModal: false,
      modalType: null,
      selectedRowIndex: undefined,
      users: null,
    };
  }

  async componentDidMount() {
    const response = await fetch('/users', { credentials: 'same-origin' });
    const users = await response.json();

    this.setState({ users });
  }

  async updateUser(user, index) {
    this.setState(({ tableExpansion }) => ({
      tableExpansion: { ...tableExpansion, [index]: false },
    }));
  }

  async onSubmitInvitation(user) {
    this.updateUser(user);
    this.setState({ showModal: false, modalType: null });

    const response = await fetch('/auth/invitations', {
      method: 'POST',
      body: JSON.stringify({
        ...user,
        congregationId: this.props.congregationId,
      }),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      credentials: 'same-origin',
    });

    const invitation = await response.json();
    console.log(invitation);
  }

  async onSubmitUser(user) {
    this.updateUser(user);
    this.setState({ showModal: false, modalType: null });

    const response = await fetch(`/users/${user.userId}`, {
      method: 'PUT',
      body: JSON.stringify(user),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      credentials: 'same-origin',
    });

    user = await response.json();
    this.setState(({ users }) => ({
      users: updateItemById(users, user.userId, user, x => x.userId),
    }));
  }

  render() {
    const { users, selectedRowIndex, modalType } = this.state;
    if (!users) {
      return <Spinner />;
    }

    const isRowSelected =
      selectedRowIndex > -1 &&
      selectedRowIndex !== null &&
      selectedRowIndex !== undefined;

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'stretch', height: '40px' }}>
          <CommandBarButton
            iconProps={{ iconName: 'AddFriend' }}
            text="Invite a new user"
            onClick={() =>
              this.setState({ showModal: true, modalType: 'invitation' })
            }
          />
          <CommandBarButton
            disabled={!isRowSelected}
            iconProps={{ iconName: 'Edit' }}
            text="Edit"
            onClick={() =>
              this.setState({ showModal: true, modalType: 'editUser' })
            }
          />
          <CommandBarButton
            disabled={!isRowSelected}
            iconProps={{ iconName: 'Delete' }}
            text="Delete"
            onClick={() =>
              this.setState({ showModal: true, modalType: 'deleteUser' })
            }
          />
        </div>

        <ReactTable
          data={users}
          columns={[
            { accessor: 'email', Header: 'Email' },
            { accessor: 'name', Header: 'Name' },
            {
              accessor: 'isActive',
              Header: 'Active',
              Cell({ value }) {
                return value.toString();
              },
            },
            {
              accessor: 'roles',
              Header: 'Roles',
              Cell({ row: { roles } }) {
                return roles && roles.join(', ');
              },
            },
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
          getTdProps={(state, rowInfo, column, instance) => {
            if (!rowInfo) {
              return {};
            }

            const rowSelected = this.state.selectedRowIndex === rowInfo.index;
            return {
              onClick: (e, handleOriginal) => {
                this.setState(
                  { selectedRowIndex: rowSelected ? null : rowInfo.index },
                  handleOriginal,
                );
              },
              className: rowSelected ? 'ms-bgColor-themeTertiary' : 'undefined',
            };
          }}
          minRows={1}
        />

        <Modal
          isOpen={this.state.showModal}
          onDismiss={() => this.setState({ showModal: false, modalType: null })}
          isBlocking={false}
          containerClassName="pad"
        >
          {modalType === 'invitation' && (
            <EditUser type="invitation" onSubmit={this.onSubmitInvitation} />
          )}
          {modalType === 'editUser' && (
            <EditUser
              type="edit"
              onSubmit={this.onSubmitUser}
              user={users[selectedRowIndex]}
            />
          )}
        </Modal>
      </div>
    );
  }
}

UserList.propTypes = {
  congregationId: PropTypes.number,
};

export default UserList;
