import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import classnames from 'classnames';
import styled from 'styled-components';
import NavLink from 'react-router-dom/NavLink';

const activeClassName = 'nav-item-active';

const NavItem = styled(NavLink).attrs({ activeClassName })`
  padding: 6px 24px;
  border-top: 4px transparent solid;
  border-bottom: 1px #5c005c solid;
  
  &.${activeClassName} {
   border-top-color: #5c005c;
   border-bottom-color: transparent;
   border-left: 1px solid #5c005c;
   border-right: 1px solid #5c005c;
 }
`;

// TODO this is ugly
class NavBar extends Component {
  constructor(props, context) {
    super(props, context);
    autobind(this);

    this.state = {};
  }

  render() {
    const {} = this.props;
    const {} = this.state;
    return (
      <div style={{ display: 'flex' }}>
        {React.Children.map(this.props.children, item => <NavItem {...item.props} activeClassName={activeClassName} />)}
      </div>
    );
  }
}

NavBar.propTypes = {};

export default NavBar;
