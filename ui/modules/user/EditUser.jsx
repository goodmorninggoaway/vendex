import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Text, Radio, RadioGroup, Select, Checkbox } from 'react-form';
import { DefaultButton } from 'office-ui-fabric-react/lib-es2015/Button';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import Dropdown from '../forms/Dropdown'
import ToggleField from '../forms/ToggleField';

class EditUser extends Component {
  render() {
    const { onSubmit, user, type, isAdmin } = this.props;
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
            <label style={{ display: isAdmin ? "block" : "none" }}>
              Congregation
              <Dropdown field="congregationId"
                style={{ marginBottom: '10px' }}
                options={this.props.congregations.map(c => ({ key: c.congregationId, text: c.name }))} />
            </label>
            {isAdmin && <ToggleField label="Is Admin" field={['roles', 0]} />}
            {type === 'edit' && <ToggleField label="Active" field="isActive" />}
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
  isAdmin: PropTypes.bool,
  congregations: PropTypes.array,
};

export default EditUser;
