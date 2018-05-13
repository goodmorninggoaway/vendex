import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { buildPath } from '../../../utils/url';
import autobind from 'react-autobind';
import classnames from 'classnames';
import isFunction from 'lodash/isFunction';
import { Header, Main, TitleBar, Page } from '../Page';

class Step extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.stepApi = {
      onBeforeGoToNext: this.setOnBeforeGoToNext,
    };

    this.step = {
      onBeforeGoToNext: fn => fn(),
    };
  }

  setOnBeforeGoToNext(callback) {
    this.step.onBeforeGoToNext = callback;
  }

  next() {
    this.step.onBeforeGoToNext(() => {
      const { nextStep, match, history } = this.props;
      return history.push(buildPath(match.url, nextStep.id));
    });
  }

  render() {
    const { render, component: RenderComponent, title, nextStep, steps, id, index } = this.props;

    return (
      <Page>
        <Header>
          <TitleBar>{title}</TitleBar>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}
            className="ms-fontColor-neutralLighterAlt"
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {steps.map((step, stepIndex) => {
                const isComplete = index > stepIndex;
                const isCurrent = id === step.id;

                return (
                  <span
                    key={step.id}
                    style={{ marginRight: '16px', display: 'flex', alignItems: 'center', flexDirection: 'column' }}
                  >
                    <div
                      style={{
                        borderRadius: '100%',
                        padding: '4px',
                        height: '2em',
                        width: '2em',
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      className={classnames({
                        'ms-fontWeight-semibold': true,
                        'ms-bgColor-purple': isCurrent,
                        'ms-bgColor-neutralTertiary': !isCurrent,
                        'ms-fontColor-white': true,
                      })}
                    >
                      {!isComplete && (stepIndex + 1)}
                      {isComplete && <i className="ms-Icon ms-Icon--SkypeCheck" aria-hidden="true" />}
                      </div>
                    <span
                      className={classnames({
                        'ms-fontWeight-semibold': isCurrent,
                        'ms-fontColor-purple': isCurrent,
                        'ms-fontColor-neutralTertiary': !isCurrent,
                      })}
                    >
                      {step.name}
                      </span>
                  </span>
                );
              })}
            </div>

            {nextStep && (
              <DefaultButton
                className="ms-bgColor-purple ms-fontColor-white ms-fontColor-white--hover ms-bgColor-purpleDark--hover"
                text="Next"
                onClick={this.next}
                iconProps={{ iconName: 'ChevronRightMed' }}
              />
            )}
          </div>
        </Header>
        <Main>
          {isFunction(render) && render({ stepApi: this.stepApi })}
          {isFunction(RenderComponent) && <RenderComponent stepApi={this.stepApi} />}
        </Main>
      </Page>
    );
  }
}

Step.propTypes = {
  /**
   * This allows for convenient inline rendering and wrapping of a component.
   * See https://reacttraining.com/web/api/Route/route-props for props
   * props.render or props.component is required
   */
  render: PropTypes.func,

  /**
   * This allows for convenient inline rendering and wrapping of a component.
   * See https://reacttraining.com/web/api/Route/route-props for props
   * props.render or props.component is required
   */
  component: PropTypes.func,

  title: PropTypes.string.isRequired,
  nextStep: PropTypes.object,
  steps: PropTypes.arrayOf(PropTypes.object).isRequired,
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,

  // Injected by react-router
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
};

export default Step;
