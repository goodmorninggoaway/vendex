const React = require('react');
const PropTypes = require('prop-types');

const InviteNewUser = ({ activationLink, congregation, invitingUserName }) => (
  <div>
    <p>Welcome to Vendex!</p>
    <p>
      {invitingUserName || 'Administrator'} has invited you to the{' '}
      {congregation.name} Congregation.
    </p>

    <p>
      <a href={activationLink} title="Accept invitation">
        Click here to accept this invitation.
      </a>
    </p>
  </div>
);

InviteNewUser.propTypes = {
  activationLink: PropTypes.string.isRequired,
  congregation: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  invitingUserName: PropTypes.string,
};

module.exports = InviteNewUser;
