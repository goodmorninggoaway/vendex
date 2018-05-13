import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import classnames from 'classnames';
import ReactTable from 'react-table';
import axios from 'axios';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import sortBy from 'lodash/sortBy';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH } from '../../../../domain/models/enums/locationInterfaces';
import { withState } from './StateContext';

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
      const { data } = await axios.post(`/alba/${this.props.source}/location-import/analyze`);
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
    const { congregationId } = this.props;
    return (
      <div>
        <blockquote>
          Setup relationships with other congregations by{' '}
          <a href="/ui/congregations">adding</a> the congregation, then <a href={`/ui/congregations/${congregationId}`}>your congregation</a> to link them.
          You should only import locations for congregations with whom you've agreed to share locations.
        </blockquote>
        <blockquote>
          If an address exists more than once in the import data, the last one wins.
        </blockquote>
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
  congregationId: PropTypes.number.isRequired,
  source: PropTypes.oneOf([ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH]),
};

PreImport.defaultProps = {
  source: ALBA,
};

export default withState(PreImport);
