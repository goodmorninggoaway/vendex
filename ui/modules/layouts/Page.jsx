import React from 'react';
import PropTypes from 'prop-types';

const Page = ({ children, title, footer }) => (
  <article>
    <header className="ms-bgColor-themeDarker ms-fontColor-neutralLighterAlt" style={{ padding: '24px' }}>
      <h4 style={{ margin: 0 }}>{title}</h4>
    </header>
    <main>{children}</main>
    <footer>{footer}</footer>
  </article>
);

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
};

export default Page;
