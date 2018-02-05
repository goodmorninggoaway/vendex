import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Text, Radio, RadioGroup, Select, Checkbox } from 'react-form';

class EditUser extends Component {
  render() {
    const { onSubmit, user } = this.props;
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
            <button type="submit">Update</button>
          </form>
        )}
      </Form>
    );
  }
}

EditUser.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  user: PropTypes.shape({}),
};

export default EditUser;
