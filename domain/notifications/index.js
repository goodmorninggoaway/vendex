const Mailgun = require('mailgun-js');
const Path = require('path');
const React = require('react');
const ReactDomServer = require('react-dom/server');

const DEBUG_EMAIL_DESTINATION = process.env.DEBUG_NOTIFICATION_TO_EMAIL;
const NOTIFICATION_BCC = process.env.DEBUG_NOTIFICATION_BCC_EMAIL;

const mailgun = new Mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const internals = new WeakMap();

class Notification {
  constructor(id) {
    internals.set(this, { id, from: process.env.MAILGUN_FROM });
  }

  asEmail() {
    internals.get(this).type = 'email';
    return this;
  }

  to(to) {
    internals.get(this).to = to;
    return this;
  }

  properties(properties) {
    internals.get(this).properties = properties;
    return this;
  }

  async send() {
    const values = internals.get(this);
    const attributes = require(Path.join(__dirname, `./${values.id}.json`));
    const template = require(Path.join(__dirname, `./${values.id}.jsx`));

    const options = {
      ...values,
      ...attributes,
      html: ReactDomServer.renderToStaticMarkup(
        React.createElement(template, values.properties),
      ),
      to: DEBUG_EMAIL_DESTINATION || values.to,
    };

    if (NOTIFICATION_BCC) {
      options.bcc = NOTIFICATION_BCC;
    }

    return await mailgun.messages().send(options);
  }
}

Notification.types = {
  INVITE_NEW_USER: 'inviteNewUser',
  PASSWORD_RESET: 'passwordReset',
};

module.exports = Notification;
