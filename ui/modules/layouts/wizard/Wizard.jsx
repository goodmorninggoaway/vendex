import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withRouter from 'react-router-dom/withRouter';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import matchPath from 'react-router-dom/matchPath';
import Redirect from 'react-router-dom/Redirect';
import Step from './Step';
import { buildPath } from '../../../utils/url';

class Wizard extends Component {
  /**
   * Always start at the first step
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.redirectTo) {
      const { match, location, steps: [step] } = nextProps;
      const isFirstStep = matchPath(location.pathname, { path: buildPath(match.path, ':id') });

      if (!isFirstStep || isFirstStep.params.id !== step.id) {
        return { redirectTo: buildPath(match.url, step.id) };
      } else {
        return { redirectTo: null };
      }
    }

    return {};
  }

  constructor(props) {
    super(props);
    this.state = Wizard.getDerivedStateFromProps(props, { redirectTo: true });
  }

  render() {
    const { steps, match, location, history, ...props } = this.props;
    if (this.state.redirectTo) {
      //return <Redirect to={this.state.redirectTo} />;
    }

    return (
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
              render={() => (
                <Step
                  {...props}
                  {...step}
                  id={id}
                  steps={steps}
                  previousStep={previous}
                  nextStep={next}
                  match={match}
                  location={location}
                  history={history}
                  index={index}
                />
              )}
            />
          );
        })}
      </Switch>
    );
  }
}

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
