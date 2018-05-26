import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import classnames from 'classnames';
import axios from 'axios';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import sortBy from 'lodash/sortBy';
import find from 'lodash/find';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
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
    if (!analysis) {
      return null;
    }

    let { existing, requested } = analysis;

    // Rather than sending each event to server immediately, use the queue to influence the displayed UI until they click next
    const { events } = this.state;
    if (events) {
      existing = { ...existing };
      events.forEach(({ account, language, operation }) => {
        existing[account] = existing[account] || {};
        existing[account][language] = operation === 'I';
      });
    }

    // Merge the requested and existing objects to something that can be useful client-side
    const parse = Object.entries(requested).reduce((memo, [account, languages]) => {
      const accountResult = {
        name: account,
        allLanguagesEnabled: !!(existing[account] && (existing[account]['*'])),
        languages: [],
      };

      Object.entries(languages).forEach(([language, count]) => {
        accountResult.languages.push({
          language,
          count,
          enabled: existing[account] && (existing[account][language] || existing[account]['*']),
        });
      });

      accountResult.languages = sortBy(accountResult.languages, 'language');

      return memo.concat(accountResult);
    }, []);

    parse.sort((a, b) => {
      return a.name < b.name ? -1 : 1;
    });

    return parse;
  }

  enqueueIntegrationEvent(account, language, operation) {
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
            Note that if a location is duplicated, the last one to be imported "wins".
          </MessageBar>
        </div>

        {!preCheck.value && !preCheck.error && <Spinner />}
        {preCheck.error && <MessageBar messageBarType={MessageBarType.error} isMultiline>{preCheck.error}</MessageBar>}
        <div className="ms-font-m-plus">
          {preCheck.value && this.parseIntegrationAnalysis().map(({ name, allLanguagesEnabled, languages }) => (
            <div key={name} style={{ marginBottom: '1em' }}>
              <span
                className={classnames({
                  'ms-fontColor-green ms-fontWeight-semibold': allLanguagesEnabled,
                  'ms-fontColor-neutralSecondary': !allLanguagesEnabled,
                })}
              >
                <Checkbox
                  label={name}
                  checked={allLanguagesEnabled}
                  onChange={(e, checked) => this.enqueueIntegrationEvent(name, '*', checked ? 'I' : 'D')}
                />
              </span>
              <div>
                {languages.map(({ language, count, enabled }) => (
                  <div key={language}>
                    <Checkbox
                      label={`${language} (${count})`}
                      checked={enabled || allLanguagesEnabled}
                      styles={{ label: { marginLeft: '24px' } }}
                      disabled={allLanguagesEnabled}
                      onChange={(e, checked) => this.enqueueIntegrationEvent(name, language, checked ? 'I' : 'D')}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
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
