import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { Box } from 'grommet/es6/components/Box';
import { Button } from 'grommet/es6/components/Button';
import { Layer } from 'grommet/es6/components/Layer';
import { Edit, Trash, Add } from 'grommet-icons';
import { Spinner } from 'office-ui-fabric-react/lib-es2015/Spinner';
import { Table, TableBody, TableCell, TableHeader, TableRow } from 'grommet/es6/components/Table';
import { Text } from 'grommet/es6/components/Text';
import axios from 'axios';
import CongregationForm from './CongregationForm';
import DeleteCongregation from './DeleteCongregation';

class Congregations extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = {};
  }

  componentDidMount() {
    this.loadCongregations();
  }

  async loadCongregations() {
    await this.setStateAsync({ loading: true });
    try {
      const { data } = await axios.get('/congregations');
      this.setStateAsync({ congregations: data, loading: false });
    } catch (ex) {
      console.log(ex.response);
      this.setStateAsync({ error: ex.message });
    }
  }

  setStateAsync(arg) {
    return new Promise(resolve => this.setState(arg, resolve));
  }

  closeModal() {
    this.setState({ showCreateModal: false, showUpdateModal: false, showDeleteDialog: false });
  }

  async onSubmit() {
    this.closeModal();
    await this.loadCongregations();
  }

  render() {
    const { loading, congregations, showCreateModal, showUpdateModal, showDeleteDialog, selected } = this.state;
    if (loading) {
      return <Spinner />;
    }

    if (congregations) {
      return (
        <Box>
          <Box>
            <Table caption="Congregations">
              <TableHeader>
                <TableRow>
                  <TableCell scope="col" border="bottom">
                    <Text>Congregation</Text>
                  </TableCell>
                  <TableCell scope="col" border="bottom">
                    <Text>Language</Text>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell scope="row" direction="row">
                    <Button label="Add a congregation" onClick={e => this.setState({ showCreateModal: true })} plain icon={<Add />} />
                  </TableCell>
                  <TableCell scope="row" />
                </TableRow>
                {congregations.map((congregation) => {
                  const { name, language, congregationId } = congregation;
                  return (
                    <TableRow key={congregationId}>
                      <TableCell scope="row" direction="row">
                        <Text>{name}</Text>
                        <Button icon={<Edit />} plain active onClick={() => this.setState({ showUpdateModal: true, selected: congregation })} />
                        <Button icon={<Trash />} plain active onClick={() => this.setState({ showDeleteDialog: true, selected: congregation })} />
                      </TableCell>
                      <TableCell scope="row">
                        <Text>{language}</Text>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
          {showCreateModal && (
            <Layer position="top" onEsc={this.closeModal}>
              <CongregationForm onSubmit={this.onSubmit} onCancel={this.closeModal} create />
            </Layer>
          )}
          {showUpdateModal && (
            <Layer position="top" onEsc={this.closeModal}>
              <CongregationForm onSubmit={this.onSubmit} onCancel={this.closeModal} modify initialCongregation={selected} />
            </Layer>
          )}
          {showDeleteDialog && (
            <Layer position="top" onEsc={this.closeModal}>
              <DeleteCongregation onSubmit={this.onSubmit} onCancel={this.closeModal} initialCongregation={selected} />
            </Layer>
          )}
        </Box>
      );
    }

    return null;
  }
}

Congregations.propTypes = {};

export default Congregations;
