import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import classnames from 'classnames';
import ReactTable from 'react-table';
import axios from 'axios';

class SessionTable extends Component {
  constructor(props, context) {
    super(props, context);
    autobind(this);

    this.state = {};
  }

  async processLocation(locationId) {
    try {
      const { data } = await axios.post(`/alba/session/locations/${locationId}/process`);
      this.props.updateLocation(data);
    } catch (ex) {
      console.log(ex);
    }

  }

  render() {
    const { locations, rowCount } = this.props;
    const {} = this.state;
    return (
      <div>
        <ReactTable
          data={locations}
          columns={[
            { Header: 'Address ID', accessor: 'payload.Address_ID' },
            { Header: 'Suite', accessor: 'payload.Suite' },
            { Header: 'Address', accessor: 'payload.Address' },
            { Header: 'City', accessor: 'payload.City' },
            { Header: 'Province', accessor: 'payload.Province' },
            { Header: 'Postal_code', accessor: 'payload.Postal_code' },
            { Header: 'Country', accessor: 'payload.Country' },
            { Header: 'Notes', accessor: 'payload.Notes' },
            { Header: 'Kind', accessor: 'payload.Kind' },
            { Header: 'Status', accessor: 'payload.Status' },
            { Header: 'Account', accessor: 'payload.Account' },
            { Header: 'Language', accessor: 'payload.Language' },
            {
              Header: 'Actions',
              id: 'actions',
              Cell: ({ original: { id } }) => <button onClick={() => this.processLocation(id)}>Process</button>
            }
          ]}
        />
      </div>
    );
  }
}

SessionTable.propTypes = {
  locations: PropTypes.arrayOf(PropTypes.shape({
    payload: PropTypes.shape({
      Address_ID: PropTypes.string.isRequired,
      Suite: PropTypes.string.isRequired,
      Address: PropTypes.string.isRequired,
      City: PropTypes.string.isRequired,
      Province: PropTypes.string.isRequired,
      Postal_code: PropTypes.string.isRequired,
      Country: PropTypes.string.isRequired,
      Notes: PropTypes.string.isRequired,
      Kind: PropTypes.string.isRequired,
      Status: PropTypes.string.isRequired,
      Account: PropTypes.string.isRequired,
      Language: PropTypes.string.isRequired,
    }),
  })),
  updateLocation: PropTypes.func.isRequired,
};

export default SessionTable;
