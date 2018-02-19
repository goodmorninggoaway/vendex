import React, { Component } from 'react';
import autobind from 'react-autobind';
import { Form, Text, Radio, RadioGroup, Select, Checkbox } from 'react-form';
import { DefaultButton } from 'office-ui-fabric-react/lib-es2015/Button';
import { Spinner } from 'office-ui-fabric-react/lib-es2015/Spinner';
import {
  MessageBar,
  MessageBarType,
} from 'office-ui-fabric-react/lib-es2015/MessageBar';
import { TextField } from '../forms';

class ForgotPassword extends Component {
  constructor(...args) {
    super(...args);
    autobind(this);

    this.state = { error: null, loading: false, success: false };
  }

  onSubmit({ email }) {
    this.setState({ loading: true }, async () => {
      const response = await fetch(`/auth/password-reset-requests`, {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });

      this.setState({ error: response.status !== 200, loading: false });
    });
  }

  render() {
    const { error, loading, success } = this.state;
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
                Forgot Password
              </div>
              {success && (
                <div className="ms-fontColor-magentaDark ms-fontSize-l">
                  If there is an account with your email address, you should
                  receive instructions in a few minutes.
                </div>
              )}
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
                        Something's wrong. Did you use the right email address?
                      </MessageBar>
                    </div>
                  )}
                  {error === false && (
                    <div style={{ margin: '12px 0' }}>
                      <MessageBar
                        messageBarType={MessageBarType.success}
                        isMultiline
                      >
                        Check your email for a password reset link.
                      </MessageBar>
                    </div>
                  )}
                  <TextField label="Email" field="email" />

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
                      text="Send Email"
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

export default ForgotPassword;
