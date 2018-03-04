import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import classnames from 'classnames';
import ReactTable from 'react-table';

class SessionTable extends Component {
  constructor(props, context) {
    super(props, context);
    autobind(this);

    this.state = {};
  }

  render() {
    const { payload, rowCount } = this.props;
    const {} = this.state;
    return (
      <div>
        <ReactTable
          data={payload}
          columns={[
            { Header: 'Address ID', accessor: 'Address_ID' },
            { Header: 'Suite', accessor: 'Suite' },
            { Header: 'Address', accessor: 'Address' },
            { Header: 'City', accessor: 'City' },
            { Header: 'Province', accessor: 'Province' },
            { Header: 'Postal_code', accessor: 'Postal_code' },
            { Header: 'Country', accessor: 'Country' },
            { Header: 'Notes', accessor: 'Notes' },
            { Header: 'Kind', accessor: 'Kind' },
            { Header: 'Status', accessor: 'Status' },
            { Header: 'Account', accessor: 'Account' },
            { Header: 'Language', accessor: 'Language' },
          ]}
        />
      </div>
    );
  }
}

SessionTable.propTypes = {
  payload: PropTypes.arrayOf(PropTypes.shape({
    "Address_ID": PropTypes.string.isRequired,
    "Suite": PropTypes.string.isRequired,
    "Address": PropTypes.string.isRequired,
    "City": PropTypes.string.isRequired,
    "Province": PropTypes.string.isRequired,
    "Postal_code": PropTypes.string.isRequired,
    "Country": PropTypes.string.isRequired,
    "Notes": PropTypes.string.isRequired,
    "Kind": PropTypes.string.isRequired,
    "Status": PropTypes.string.isRequired,
    "Account": PropTypes.string.isRequired,
    "Language": PropTypes.string.isRequired,
  })).isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default SessionTable;
