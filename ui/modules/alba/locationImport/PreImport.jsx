import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import groupBy from 'lodash/groupBy';
import find from 'lodash/find';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { ALBA, SYTHETIC_ALBA__OLD_APEX_SPANISH } from '../../../../domain/models/enums/locationInterfaces';
import { withState } from './StateContext';

class PreImport extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = { preCheck: {} };
  }

  componentDidMount() {
    this.props.stepApi.onBeforeGoToNext(this.submitChanges);
    this.preImportAnalysis();
  }

  async preImportAnalysis() {
    try {
      this.setState({ preCheck: { loading: true } });
      const { data } = await axios.post(`/alba/${this.props.source}/location-import/analyze`);
      this.setState({ 
        preCheck: { loading: false },
        integrationAnalysis: this.groupIntegrationAnalysisByAccount(data)
      });
    } catch (ex) {
      console.log(ex);
      this.setState({ preCheck: { error: ex } });
    }
  }

  groupIntegrationAnalysisByAccount(analysisResponse) {
    var rawIntegrationAnalysis = analysisResponse && analysisResponse.congregationIntegrationAnalysis;
    if (!rawIntegrationAnalysis || !rawIntegrationAnalysis.length) {
      return {};
    }

    return groupBy(rawIntegrationAnalysis, 'account');
  }

  updateIntegrationAnalysis(account, language, enabled) {
    if (!this.state.integrationAnalysis) {
      return null;
    }

    const found = find(this.state.integrationAnalysis[account], { language });
    if (!found) {
      return;
    }

    this.setState(({integrationAnalysis}) => ({
      integrationAnalysis: {
        ...integrationAnalysis,
        [account]: integrationAnalysis[account].map((acc) => ({
          ...acc,
          ...(acc.language === language && { enabled })
        }))
      }
    }));
  }

  // Maps selections to integration events
  buildEvents() {
    if (!this.state.integrationAnalysis) {
      return null;
    }

    return Object.values(this.state.integrationAnalysis)
      .flatMap(account => find(account, {language: '*', enabled: true}) || account)
      .map(account => ({
        account: account.account,
        language: account.language,
        operation: account.enabled ? 'I' : 'D'
      }));
  }

  async submitChanges(done) {
    const events = this.buildEvents();
    const { source } = this.props;

    if (events && events.length) {
      const { data: existingIntegrations } = await axios.get(`/alba/integrations?source=${this.props.source}`);
      for (let i = 0; i < events.length; i++) {
        const { operation, account, language } = events[i];
        const integration = find(existingIntegrations, { account, language });

        if (!integration && operation === 'I') {
          await axios.post('/alba/integrations', { source, account, language, anyLanguage: language === '*' });
        } else if (integration && operation === 'D') {
          await axios.delete(`/alba/integrations/${integration.albaIntegrationId}`);
        }
      }
    }

    return done();
  }

  render() {
    const { preCheck } = this.state;
    return (
      <div>
        <div style={{ marginBottom: '1em' }} className="ms-font-m-plus">
          Which locations do you want to load?
          <ul className="browser-default" style={{ margin: '0' }}>
            <li>To load all locations from a congregation, select the name.</li>
            <li>To load locations for a specific language, select the language.</li>
            <li>You should only load data when the overseers of the congregations/groups have approved it.</li>
          </ul>
        </div>
        {preCheck.loading && <Spinner />}
        {preCheck.error && (
          <div style={{ marginBottom: '1em' }}>
            <MessageBar messageBarType={MessageBarType.error} isMultiline>{preCheck.error}</MessageBar>
          </div>
        )}
        <div className="ms-font-m-plus">
          {Object.values(this.state.integrationAnalysis || {}).map((accountGroup) => {
            const [{ account, enabled: allLanguagesEnabled, matchCount: count }] = accountGroup;
            return (
              <div key={account} style={{ marginBottom: '20px' }}>
                <Checkbox
                  label={`${account} (${count})`}
                  checked={allLanguagesEnabled}
                  onChange={(e, checked) => this.updateIntegrationAnalysis(account, '*', checked)}
                  styles={{ root: { marginBottom: '4px' } }}
                />
                {accountGroup.slice(1).map(({ language, enabled: languageEnabled, matchCount }) => (
                  <Checkbox
                    key={language}
                    label={`${language || 'Unknown'} (${matchCount})`}
                    checked={allLanguagesEnabled || languageEnabled}
                    disabled={allLanguagesEnabled}
                    onChange={(e, checked) => this.updateIntegrationAnalysis(account, language, checked)}
                    styles={{ label: { marginLeft: '2em' }, root: { marginBottom: '4px' } }}
                  />
                ))}
              </div>
            );
          })}
        </div>
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
