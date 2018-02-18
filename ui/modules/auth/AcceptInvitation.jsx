import React, { Component } from 'react';
import autobind from 'react-autobind';
import { Form, Text, Radio, RadioGroup, Select, Checkbox } from 'react-form';
import { DefaultButton } from 'office-ui-fabric-react/lib-es2015/Button';
import { Spinner } from 'office-ui-fabric-react/lib-es2015/Spinner';
import {
  MessageBar,
  MessageBarType,
} from 'office-ui-fabric-react/lib-es2015/MessageBar';
import { TextField, PasswordField } from '../forms';

class AcceptInvitation extends Component {
  constructor(...args) {
    super(...args);
    autobind(this);

    this.state = { registrationError: false, loading: false, success: false };
  }

  parseQuery() {
    let { search } = window.location;
    if (search.startsWith('?')) {
      search = search.replace('?', '');
    }

    return search.split('&').reduce((memo, pair) => {
      const [key, value] = pair.split('=');
      memo[decodeURI(key)] = decodeURI(value);
      return memo;
    }, {});
  }

  onSubmit(user) {
    this.setState({ loading: true }, async () => {
      const response = await fetch('/auth/invitations/accept', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        credentials: 'same-origin',
        redirect: 'error',
      });

      if (response.status !== 200) {
        this.setState({ registrationError: true, loading: false });
      } else {
        window.location.href = `/ui/accept-invitation/welcome?name=${
          user.name
        }`;
      }
    });
  }

  validate(opts) {
    if (!opts) {
      return {};
    }

    const { password, confirmPassword } = opts;
    return {
      confirmPassword:
        confirmPassword &&
        confirmPassword.length &&
        password !== confirmPassword &&
        'Passwords should match.',
    };
  }

  render() {
    const { registrationError, loading } = this.state;
    return (
      <div className="ms-Grid">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .ms-TextField {
            margin-bottom: 16px;
          }
        `,
          }}
        />

        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-md4" />
          <div className="ms-Grid-col ms-md4">
            <div className="ms-fontWeight-semibold">
              <div className="ms-fontColor-magentaDark ms-fontSize-xl">
                You've been invited to Vendex!
              </div>
              <div className="ms-fontColor-magentaDark ms-fontSize-su">
                Create your account.
              </div>
            </div>

            <Form
              onSubmit={this.onSubmit}
              defaultValues={this.parseQuery()}
              validateError={this.validate}
            >
              {formApi => (
                <form onSubmit={formApi.submitForm}>
                  {registrationError && (
                    <div style={{ margin: '12px 0' }}>
                      <MessageBar
                        messageBarType={MessageBarType.error}
                        isMultiline
                        onDismiss={() =>
                          this.setState({ registrationError: null })
                        }
                      >
                        There was a problem creating your account. Please ask
                        your overseer to invite you again.
                      </MessageBar>
                    </div>
                  )}
                  <TextField
                    label="Name"
                    field="name"
                    errorMessage={formApi.errors.name}
                  />
                  <TextField label="Email" field="email" />
                  <PasswordField
                    label="Password"
                    field="password"
                    type="password"
                    validate
                  />
                  <PasswordField
                    label="Type password again"
                    field="confirmPassword"
                    type="password"
                    validate={false}
                  />

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <DefaultButton
                      primary={true}
                      type="submit"
                      text="Create account"
                      disabled={loading}
                    />
                    {loading && <Spinner />}
                  </div>
                </form>
              )}
            </Form>
          </div>
          <div className="ms-Grid-col ms-md4" />
        </div>
      </div>
    );
  }
}

export default AcceptInvitation;
