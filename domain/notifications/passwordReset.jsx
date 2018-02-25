const React = require('react');
const PropTypes = require('prop-types');

const PasswordReset = ({ name, resetLink }) => (
  <div>
    <p>Hi {name}</p>
    <p>
      You recently requested to reset your password for your Vendex account. Use
      the link below to reset it.{' '}
      <strong>This reset is only valid for one hour.</strong>
    </p>
    <p>
      <a href={resetLink}>Reset your password</a>
    </p>
    <p>If you did not request this reset, please ignore this email.</p>
    <p>Vendex</p>
  </div>
);

PasswordReset.propTypes = {
  name: PropTypes.string.isRequired,
  resetLink: PropTypes.string.isRequired,
};

module.exports = PasswordReset;
