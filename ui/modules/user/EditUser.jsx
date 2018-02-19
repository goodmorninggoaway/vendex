import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Text, Radio, RadioGroup, Select, Checkbox } from 'react-form';
import { DefaultButton } from 'office-ui-fabric-react/lib-es2015/Button';

class EditUser extends Component {
  render() {
    const { onSubmit, user, type } = this.props;
    let buttonText = 'Update User';

    if (type === 'invitation') {
      buttonText = 'Send Invitation';
    }

    return (
      <Form onSubmit={onSubmit} defaultValues={user}>
        {formApi => (
          <form onSubmit={formApi.submitForm}>
            <label>
              Name
              <Text field="name" />
            </label>
            <label>
              Email Address
              <Text field="email" />
            </label>
            <DefaultButton primary={true} type="submit" text={buttonText} />
          </form>
        )}
      </Form>
    );
  }
}

EditUser.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  user: PropTypes.shape({}),
  type: PropTypes.oneOf(['invitation', 'edit']),
};

export default EditUser;
