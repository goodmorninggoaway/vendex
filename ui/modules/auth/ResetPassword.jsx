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
import parseQuery from '../../utils/parseQuery';

class ResetPassword extends Component {
  constructor(...args) {
    super(...args);
    autobind(this);

    this.state = { error: null, loading: false, success: false };
  }

  onSubmit({ code, password, confirmPassword }) {
    this.setState({ loading: true }, async () => {
      const response = await fetch(
        `/auth/password-reset-requests/${window.encodeURI(code)}`,
        {
          method: 'PUT',
          body: JSON.stringify({ password, confirmPassword }),
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        },
      );

      this.setState({
        error: response.status !== 200,
        success: response.status === 200,
        loading: false,
      });
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
                Reset Password
              </div>
            </div>
            {success && (
              <div style={{ margin: '12px 0' }}>
                <MessageBar messageBarType={MessageBarType.success} isMultiline>
                  Your password has been updated. You can now{' '}
                  <a href="/ui/login">login</a>.
                </MessageBar>
              </div>
            )}
            {!success && (
              <Form
                onSubmit={this.onSubmit}
                defaultValues={{ code: parseQuery().code }}
              >
                {formApi => (
                  <form onSubmit={formApi.submitForm}>
                    {error && (
                      <div style={{ margin: '12px 0' }}>
                        <MessageBar
                          messageBarType={MessageBarType.error}
                          isMultiline
                          onDismiss={() => this.setState({ error: null })}
                        >
                          Something's wrong. You're code is probably expired.{' '}
                          <a href="/ui/forgot-password">Start over.</a>
                        </MessageBar>
                      </div>
                    )}
                    <PasswordField
                      label="New Password"
                      field="password"
                      validate
                    />
                    <PasswordField
                      label="Type your password again"
                      field="confirmPassword"
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
                        text="Change Password"
                        disabled={loading}
                      />
                      {loading && <Spinner />}
                    </div>
                  </form>
                )}
              </Form>
            )}
          </div>
          <div className="ms-Grid-col ms-md4" />
        </div>
      </div>
    );
  }
}

export default ResetPassword;
