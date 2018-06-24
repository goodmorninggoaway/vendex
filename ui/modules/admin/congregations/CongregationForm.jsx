import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { Box } from 'grommet/es6/components/Box';
import { Button } from 'grommet/es6/components/Button';
import { TextInput } from 'grommet/es6/components/TextInput';
import { FormField } from 'grommet/es6/components/FormField';
import { Heading } from 'grommet/es6/components/Heading';
import Trash from 'grommet-icons/es6/icons/Trash';
import { Spinner } from 'office-ui-fabric-react/lib-es2015/Spinner';
import axios from 'axios';

class CongregationForm extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = props.initialCongregation || { name: null, language: null };
  }

  setStateAsync(arg) {
    return new Promise(resolve => this.setState(arg, resolve));
  }

  async save() {
    const { create, modify, onSubmit } = this.props;
    const { name, language, congregationId } = this.state;

    await this.setStateAsync({ loading: true });
    try {
      if (create) {
        await axios.post('/congregations', { name, language });
      } else if (modify) {
        await axios.post(`/congregations/${congregationId}`, { name, language });
      } else {
        return;
      }
    } catch (e) {
      // TODO flash an error message
      console.error(e);
    }

    return onSubmit();
  }

  render() {
    const { name, language, loading } = this.state;
    const { create, modify, onCancel, onRequestRemove } = this.props;
    return (
      <Box pad="medium">
        {create && <Heading margin="small">Create a congregation</Heading>}
        {modify && <Heading margin="small">Update congregation</Heading>}
        <Box>
          <FormField label="Name" htmlFor="name">
            <TextInput id="name" name="name" value={name} onInput={e => this.setState({ name: e.target.value })} />
          </FormField>
          <FormField label="Language" htmlFor="language">
            <TextInput id="language" name="language" value={language} onInput={e => this.setState({ language: e.target.value })} />
          </FormField>
        </Box>
        <Box direction="row" justify="between" margin={{ top: 'medium' }}>
          {modify && (
            <Button
              icon={<Trash />}
              onClick={onRequestRemove}
              primary
              color="status-critical"
              disabled={loading}
              fill={false}
            />
          )}
          <Box direction="row" gap="small" justify="end">
            {/* TODO The spinner is atrocious */}
            <Button label="Save" onClick={this.save} disabled={loading} primary fill={false} icon={loading ? <Spinner /> : null} />
            <Button label="Cancel" onClick={onCancel} disabled={loading} fill={false} />
          </Box>
        </Box>
      </Box>
    );
  }
}

CongregationForm.propTypes = {
  create: PropTypes.bool,
  modify: PropTypes.bool,
  initialCongregation: PropTypes.shape({
    name: PropTypes.string,
    language: PropTypes.string,
    congregationId: PropTypes.number,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onRequestRemove: PropTypes.func.isRequired,
};

export default CongregationForm;
