import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import Moment from 'moment';
import { Spinner } from 'office-ui-fabric-react/lib-es2015/Spinner';
import {
  CommandBarButton,
  PrimaryButton,
  DefaultButton,
} from 'office-ui-fabric-react/lib-es2015/Button';
import { Modal } from 'office-ui-fabric-react/lib-es2015/Modal';
import {
  Dialog,
  DialogType,
  DialogFooter,
} from 'office-ui-fabric-react/lib/Dialog';
import { Route, Link } from 'react-router-dom';
import autobind from 'react-autobind';
import { removeItemsById } from 'redux-toolbelt-immutable-helpers';
import EditUser from './EditUser';

class PendingInvitationList extends Component {
  constructor(...args) {
    super(...args);
    autobind(this);
    this.state = {
      tableExpansion: {},
      showModal: false,
      modalType: null,
      selectedRowIndex: undefined,
      invitations: null,
    };
  }

  async componentDidMount() {
    const response = await fetch('/auth/invitations', {
      credentials: 'same-origin',
    });

    const invitations = await response.json();

    this.setState({ invitations });
  }

  async deleteInvitation() {
    this.hideDialog();

    const { invitations, selectedRowIndex } = this.state;
    const invitation = invitations[selectedRowIndex];

    if (!invitation) {
      return;
    }

    const response = await fetch(
      `/auth/invitations/${invitation.invitationId}`,
      {
        method: 'DELETE',
        credentials: 'same-origin',
      },
    );

    if (response.status === 200) {
      this.setState(({ invitations }) => ({
        invitations: invitations.filter(
          x => x.invitationId !== invitation.invitationId,
        ),
      }));
    } else {
      window.alert('Error deleting invitation');
    }
  }

  hideDialog() {
    this.setState({ showDialog: false });
  }

  showDialog() {
    this.setState({ showDialog: true });
  }

  render() {
    const { invitations, selectedRowIndex } = this.state;
    const { congregations, isAdmin } = this.props;
    if (!invitations) {
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
            disabled={!isRowSelected}
            iconProps={{ iconName: 'Delete' }}
            text="Delete Invitation"
            onClick={this.showDialog}
          />
        </div>

        <Dialog
          hidden={!this.state.showDialog}
          onDismiss={this.hideDialog}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Delete this invitation?',
          }}
          modalProps={{
            isBlocking: true,
            containerClassName: 'ms-dialogMainOverride',
          }}
        >
          <DialogFooter>
            <PrimaryButton onClick={this.deleteInvitation} text="Yes" />
            <DefaultButton onClick={this.hideDialog} text="No" />
          </DialogFooter>
        </Dialog>

        <ReactTable
          data={invitations}
          columns={[
            { accessor: 'email', Header: 'Email' },
            { accessor: 'name', Header: 'Name' },
            {
              accessor: 'congregationId',
              Header: 'Congregation',
              show: isAdmin,
              Cell({ value }) {
                const congregation = congregations.find(c => c.congregationId == value);
                return (congregation && congregation.name) || '';
              },
            },
            { accessor: 'code', Header: 'Code' },
            {
              accessor: 'isExpired',
              Header: 'Expired',
              Cell({ value }) {
                return value ? 'Expired' : 'Pending';
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
      </div>
    );
  }
}

PendingInvitationList.propTypes = {
  congregationId: PropTypes.number,
  congregations: PropTypes.array,
  isAdmin: PropTypes.bool,
};

export default PendingInvitationList;
