import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withRouter from 'react-router-dom/withRouter';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { buildPath } from '../../utils/url';
import autobind from 'react-autobind';

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
    const { name, render, title, previous, next, index, count } = this.props;
    return (
      <article style={{ display: 'flex', flex: '1 auto', flexDirection: 'column', height: '100%' }}>
        <header className="ms-bgColor-themeDarker ms-fontColor-neutralLighterAlt" style={{ padding: '24px' }}>
          <div className="ms-fontSize-mPlus ms-fontWeight-semibold">
            {title}: Step {index + 1} of {count}
          </div>
          <div className="ms-fontSize-xxl">{name}</div>
        </header>
        <div
          style={{ display: 'flex', justifyContent: previous ? 'space-between' : 'flex-end' }}
          className="ms-bgColor-themeDarker ms-fontColor-neutralLighterAlt"
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
        <section style={{ display: 'flex', flex: '1 auto', flexDirection: 'column' }}>{render({ stepApi: this.stepApi })}</section>
      </article>
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
