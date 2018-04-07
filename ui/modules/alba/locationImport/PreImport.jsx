import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import classnames from 'classnames';
import ReactTable from 'react-table';
import axios from 'axios';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import sortBy from 'lodash/sortBy';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';

class PreImport extends Component {
  constructor(props, context) {
    super(props, context);
    autobind(this);

    this.state = { preCheck: {} };
  }

  componentDidMount() {
    this.preImportAnalysis();
  }

  async preImportAnalysis() {
    try {
      this.setState({ preCheck: { loading: true } });
      const { data } = await axios.post(`/alba/location-import/analyze`);
      this.setState({ preCheck: { loading: false, value: data } });
    } catch (ex) {
      console.log(ex);
      this.setState({ preCheck: { error: ex } });
    }
  }

  parseAnalysis() {
    const analysis = this.state.preCheck.value && this.state.preCheck.value.congregationIntegrationAnalysis;
    if (!analysis) {
      return null;
    }

    const { existing, requested } = analysis;
    const parsed = Object.entries(requested).reduce((memo, [congregation, languages]) => {
      return Object.entries(languages).reduce((memo2, [language, count]) => {
        return memo2.concat({
          congregation,
          language,
          count,
          enabled: existing[congregation] && (existing[congregation][language] || existing[congregation]['*'])
        });
      }, []).concat(memo);
    }, []);

    return sortBy(parsed, ['congregation', 'language']);
  }

  render() {
    const { preCheck } = this.state;
    return (
      <div>
        {!preCheck.value && !preCheck.error && <Spinner />}
        {preCheck.error && <MessageBar messageBarType={MessageBarType.error} isMultiline>{preCheck.error}</MessageBar>}
        {preCheck.value && (
          <ReactTable
            data={this.parseAnalysis()}
            columns={[
              { Header: 'Congregation', accessor: 'congregation' },
              {
                Header: 'Language',
                accessor: 'language',
                Cell: ({ original: { language } }) => (!language || !language.length ? <em>Unknown</em> : language),
              },
              { Header: 'Count', accessor: 'count' },
            ]}
            getTdProps={(state, rowInfo, column) => {
              if (!rowInfo || column.id === 'actions') {
                return {};
              }

              return ({
                className: classnames({
                  'ms-fontColor-green ms-fontWeight-semibold': rowInfo.original.enabled,
                  'ms-fontColor-neutralSecondary': !rowInfo.original.enabled,
                }),
              });
            }}
            defaultPageSize={10}
          />
        )}
      </div>
    );
  }
}

PreImport.propTypes = {
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

export default PreImport;
