import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { Box } from 'grommet/es6/components/Box';
import { Button } from 'grommet/es6/components/Button';
import { Heading } from 'grommet/es6/components/Heading';
import { Spinner } from 'office-ui-fabric-react/lib-es2015/Spinner';
import axios from 'axios';

class DeleteCongregation extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = { loading: false };
  }

  setStateAsync(arg) {
    return new Promise(resolve => this.setState(arg, resolve));
  }

  async save() {
    const { onSubmit, initialCongregation } = this.props;

    await this.setStateAsync({ loading: true });
    try {
      await axios.delete(`/congregations/${initialCongregation.congregationId}`);
    } catch (e) {
      // TODO flash an error message
      console.error(e);
    }

    return onSubmit();
  }

  render() {
    const { loading } = this.state;
    const { initialCongregation, onCancel } = this.props;
    return (
      <Box pad="medium">
        <Heading margin="small">Remove {initialCongregation.name}?</Heading>
        <Box direction="row" gap="small" justify="end" margin={{ top: 'medium' }}>
          {/* TODO The spinner is atrocious */}
          <Button label="Delete" onClick={this.save} disabled={loading} primary fill={false} icon={loading ? <Spinner /> : null} />
          <Button label="Cancel" onClick={onCancel} disabled={loading} fill={false} />
        </Box>
      </Box>
    );
  }
}

DeleteCongregation.propTypes = {
  initialCongregation: PropTypes.shape({
    name: PropTypes.string,
    language: PropTypes.string,
    congregationId: PropTypes.number,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default DeleteCongregation;
