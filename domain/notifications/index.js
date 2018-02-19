const Mailgun = require('mailgun-js');
const Path = require('path');
const React = require('react');
const ReactDomServer = require('react-dom/server');

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

    return await mailgun.messages().send(
      Object.assign(values, attributes, {
        html: ReactDomServer.renderToStaticMarkup(
          React.createElement(template, values.properties),
        ),
        to: 'Marque Davis <mdavis777@gmail.com>',
      }),
    );
  }
}

Notification.types = {
  INVITE_NEW_USER: 'inviteNewUser',
  PASSWORD_RESET: 'passwordReset',
};

module.exports = Notification;
