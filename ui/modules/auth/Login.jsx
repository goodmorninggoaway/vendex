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

class Login extends Component {
  constructor(...args) {
    super(...args);
    autobind(this);

    this.state = { error: false, loading: false, success: false };
  }

  onSubmit(user) {
    this.setState({ loading: true }, async () => {
      const response = await fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        credentials: 'same-origin',
      });

      if (response.status !== 200) {
        this.setState({ error: true, loading: false });
      } else {
        window.location.href = `/ui`;
      }
    });
  }

  render() {
    const { error, loading } = this.state;
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
              <div className="ms-fontColor-magentaDark ms-fontSize-su">
                Vendex
              </div>
            </div>

            <Form onSubmit={this.onSubmit}>
              {formApi => (
                <form onSubmit={formApi.submitForm}>
                  {error && (
                    <div style={{ margin: '12px 0' }}>
                      <MessageBar
                        messageBarType={MessageBarType.error}
                        isMultiline
                        onDismiss={() => this.setState({ error: null })}
                      >
                        Invalid password.
                      </MessageBar>
                    </div>
                  )}
                  <TextField label="Email" field="email" />
                  <PasswordField
                    label="Password"
                    field="password"
                    type="password"
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
                      text="Login"
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

export default Login;
