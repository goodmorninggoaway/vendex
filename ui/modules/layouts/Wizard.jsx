import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withRouter from 'react-router-dom/withRouter';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Icon, IconType } from 'office-ui-fabric-react/lib/Icon';
import { buildPath } from '../../utils/url';
import autobind from 'react-autobind';
import classnames from 'classnames'

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
    const { name, render, title, previous, next, index, count, steps, id } = this.props;
    return <article style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="ms-fontColor-themeDarkAlt ms-bgColor-neutralQuaternary">
        <div className="ms-fontSize-mPlus ms-fontWeight-semibold">{title}</div>
        <div className="ms-fontSize-xxl">{name}</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {steps.map((step) => (
            <Icon
              iconName="CircleShapeSolid"
              iconType={IconType.default}
              className={classnames({ 'ms-fontColor-themeDarkAlt ms-font-m': id === step.id, 'ms-fontColor-neutralLight ms-font-m': id !== step.id })}
              style={{ marginRight: '16px' }}
            />
          ))}
        </div>
      </header>
      <main style={{ display: 'flex', flex: '1 auto', flexDirection: 'column', overflow: 'auto' }}>{render({ stepApi: this.stepApi })}</main>
      <footer style={{ padding: '12px 0' }}>
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
      </footer>
    </article>;
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
              count={arr.length}
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
    render: PropTypes.func.isRequired,
    onBeforeGoToPrevious: PropTypes.func,
    onBeforeGoToNext: PropTypes.func,
  })),
  match: PropTypes.shape(),

};

export default withRouter(Wizard);
