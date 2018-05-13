import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withRouter from 'react-router-dom/withRouter';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import Link from 'react-router-dom/Link';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Icon, IconType } from 'office-ui-fabric-react/lib/Icon';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { buildPath } from '../../utils/url';
import autobind from 'react-autobind';
import classnames from 'classnames'
import isFunction from 'lodash/isFunction';
import { Footer, Header, Main, TitleBar, Page } from './Page';

class StepContainer extends Component {
  constructor(...args) {
    super(...args);
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
      const { next, match, history } = this.props;
      return history.push(buildPath(match.url, next.id));
    });
  }

  previous() {
    this.step.onBeforeGoToPrevious(() => {
      const { previous, match, history } = this.props;
      return history.push(buildPath(match.url, previous.id));
    });
  }

  render() {
    const { name, render, component: RenderComponent, title, previous, next, steps, id, match, index } = this.props;

    return (
      <Page>
        <Header>
          {/*<PreTitle className="ms-fontSize-mPlus ms-fontWeight-semibold">{title}</PreTitle>*/}
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
            style={{ display: 'flex', justifyContent: previous ? 'space-between' : 'flex-end' }}
            className="ms-fontColor-neutralLighterAlt"
          >
            {previous && (
              <DefaultButton
                primary
                text={`Back: ${previous.name}`}
                onClick={this.previous}
                iconProps={{ iconName: 'CaretLeftSolid8' }}
              />
            )}
            {next && (
              <DefaultButton
                primary
                text={`Next: ${next.name}`}
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

const Wizard = ({ steps, match, location, history, ...props }) => (
  <Switch>
    {steps.map(({ id, ...step }, index, arr) => {
      const isFirst = index === 0;
      const isLast = index === arr.length - 1;
      const previous = !isFirst ? arr[index - 1] : null;
      const next = !isLast ? arr[index + 1] : null;

      return (
        <Route
          key={id}
          path={`/${id}`}
          render={routeProps => (
            <StepContainer
              {...props}
              {...step}
              id={id}
              steps={steps}
              previous={previous}
              next={next}
              match={match}
              location={location}
              history={history}
              index={index}
            />
          )}
        />
      );
    })}
    <Route
      render={() => (
        <StepContainer
          {...props}
          {...steps[0]}
          next={steps[1]}
          match={match}
          location={location}
          history={history}
          steps={steps}
        />
      )}
    />
  </Switch>
);

Wizard.propTypes = {
  title: PropTypes.string.isRequired,
  steps: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,

    /**
     * Either render() or a component is required.
     * @param {{ stepApi: StepApi }} props
     */
    render: PropTypes.func,

    /**
     * Either render() or a component is required.
     * @param {{ stepApi: StepApi }} props
     */
    component: PropTypes.func,
  })),
  match: PropTypes.shape(),

};

export default withRouter(Wizard);
