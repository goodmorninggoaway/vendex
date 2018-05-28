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
      this.setState({ preCheck: { loading: false, value: data } });
    } catch (ex) {
      console.log(ex);
      this.setState({ preCheck: { error: ex } });
    }
  }

  parseIntegrationAnalysis() {
    const analysis = this.state.preCheck.value && this.state.preCheck.value.congregationIntegrationAnalysis;
    if (!analysis || !analysis.length) {
      return null;
    }

    return Object.values(groupBy(analysis, 'account'))
      .map(it => {
        const allLanguagesEnabled = find(it, { language: '*', enabled: true });
        if (allLanguagesEnabled) {
          return it.map(that => that === it ? that : { ...that, checkboxDisabled: true });
        }

        return it;
      });
  }

  enqueueIntegrationEvent(account, language, operation) {
    const analysis = this.state.preCheck.value && this.state.preCheck.value.congregationIntegrationAnalysis;
    if (!analysis || !analysis.length) {
      return null;
    }

    const found = find(analysis, { account, language });
    if (!found) {
      return;
    }

    // Yes, I'm mutating the exising object because I'm triggering a setState anyway and it's all in the same component
    found.enabled = operation === 'I';

    this.setState(({ events }) => ({ events: [...(events || []), { account, language, operation }] }));
  }

  async submitChanges(done) {
    const { events } = this.state;
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
        <div style={{ marginBottom: '1em' }}>
          <MessageBar multiline>
            Enable data-sharing relationships with other congregations/groups by selecting them below.<br />
            If you want to load all locations from a congregation, select the name.<br />
            If you want to load selected locations based on the language, select the language.
          </MessageBar>
        </div>
        <div style={{ marginBottom: '1em' }}>
          <MessageBar>
            If a location is duplicated, the last one to be imported "wins".
          </MessageBar>
        </div>

        {!preCheck.value && !preCheck.error && <Spinner />}
        {preCheck.error && (
          <div style={{ marginBottom: '1em' }}>
            <MessageBar messageBarType={MessageBarType.error} isMultiline>{preCheck.error}</MessageBar>
          </div>
        )}
        <div className="ms-font-m-plus">
          {preCheck.value && this.parseIntegrationAnalysis().map((accountGroup) => {
            const [{ account, enabled: allLanguagesEnabled, matchCount: count }] = accountGroup;
            return (
              <div key={account}>
                <Checkbox
                  label={`${account} (${count})`}
                  checked={allLanguagesEnabled}
                  onChange={(e, checked) => this.enqueueIntegrationEvent(account, '*', checked ? 'I' : 'D')}
                />
                <div style={{ marginLeft: '24px' }}>
                  {accountGroup.slice(1).map(({ language, enabled: languageEnabled, matchCount }) => (
                    <Checkbox
                      key={language}
                      label={`${language || 'Unknown'} (${matchCount})`}
                      checked={allLanguagesEnabled || languageEnabled}
                      disabled={allLanguagesEnabled}
                      onChange={(e, checked) => this.enqueueIntegrationEvent(account, language, checked ? 'I' : 'D')}
                    />
                  ))}
                </div>
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
