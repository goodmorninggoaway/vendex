import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'react-router-dom/Link';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { buildPath } from '../../../utils/url';
import autobind from 'react-autobind';
import classnames from 'classnames'
import isFunction from 'lodash/isFunction';
import { Footer, Header, Main, TitleBar, Page } from '../Page';

class Step extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.stepApi = {
      onBeforeGoToNext: this.setOnBeforeGoToNext,
      onBeforeGoToPrevious: this.setOnBeforeGoToPrevious,
    };

    this.step = {
      onBeforeGoToNext: fn => fn(),
      onBeforeGoToPrevious: fn => fn(),
    };
  }

  setOnBeforeGoToNext(callback) {
    this.step.onBeforeGoToNext = callback;
  }

  setOnBeforeGoToPrevious(callback) {
    this.step.onBeforeGoToPrevious = callback;
  }

  next() {
    this.step.onBeforeGoToNext(() => {
      const { nextStep, match, history } = this.props;
      return history.push(buildPath(match.url, nextStep.id));
    });
  }

  previous() {
    this.step.onBeforeGoToPrevious(() => {
      const { previousStep, match, history } = this.props;
      return history.push(buildPath(match.url, previousStep.id));
    });
  }

  render() {
    const { render, component: RenderComponent, title, previousStep, nextStep, steps, id, match, index } = this.props;

    return (
      <Page>
        <Header>
          <TitleBar>{title}</TitleBar>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            {steps.map((step, stepIndex) => {
              const isComplete = index > stepIndex;
              const isCurrent = id === step.id;
              const NameComponent = isComplete ? Link : 'span';
              return (
                <NameComponent
                  key={step.id}
                  to={buildPath(match.url, step.id)}
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
                      alignItems: 'center'
                    }}
                    className={classnames({
                      'ms-fontWeight-semibold': true,
                      'ms-bgColor-purple': isCurrent,
                      'ms-bgColor-neutralTertiary': !isCurrent,
                      'ms-fontColor-white': true,
                    })}
                  >{stepIndex + 1}</div>
                  <span
                    className={classnames({
                      'ms-fontWeight-semibold': isCurrent,
                      'ms-fontColor-purple': isCurrent,
                      'ms-fontColor-neutralTertiary': !isCurrent,
                    })}
                  >{step.name}</span>
                </NameComponent>
              );
            })}
          </div>
        </Header>
        <Main>
          {isFunction(render) && render({ stepApi: this.stepApi })}
          {isFunction(RenderComponent) && <RenderComponent stepApi={this.stepApi} />}
        </Main>
        <Footer>
          <div
            style={{ display: 'flex', justifyContent: previousStep ? 'space-between' : 'flex-end' }}
            className="ms-fontColor-neutralLighterAlt"
          >
            {previousStep && (
              <DefaultButton
                primary
                text={`Back: ${previousStep.name}`}
                onClick={this.previous}
                iconProps={{ iconName: 'CaretLeftSolid8' }}
              />
            )}
            {nextStep && (
              <DefaultButton
                primary
                text={`Next: ${nextStep.name}`}
                onClick={this.next}
                iconProps={{ iconName: 'CaretRightSolid8' }}
              />
            )}
          </div>
        </Footer>
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
  previousStep: PropTypes.object,
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
