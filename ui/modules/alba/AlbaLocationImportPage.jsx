import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import axios from 'axios';

class AlbaLocationImportPage extends Component {
  constructor(props) {
    super(props);
    autobind(this);

    this.state = {};
  }

  submitLocations(e) {
    e.preventDefault();

    this.setState({ loading: true });
    const { locations: body } = this.state;

    fetch('/alba/locations', {
      body,
      method: 'POST',
      headers: new Headers({
        'content-type': 'text/plain',
        'content-length': body.length,
      }),
      credentials: 'same-origin',
    })
      .then((response) => {
        this.setState({ loading: false });

        if (response.ok) {
          Materialize.toast('Locations successfully imported.', 5000);
          return;
        }

        Materialize.toast('Error importing locations.', 5000);
        return response.text().then(x => errorMessageEl.innerText);
      })
      .catch((err) => {
        this.setState({ loading: false });
        Materialize.toast(err, 5000);
      });
  }

  render() {
    const { congregationId } = this.props;

    return (
      <div>
        <h4>Alba > Import Locations</h4>
        <blockquote>
          Setup relationships with other congregations by{' '}
          <a href="/ui/congregations">adding</a> the congregation, then <a href={`/ui/congregations/${congregationId}`}>edit this one</a> to link them.
          You should only import locations for congregations with whom you've agreed to share locations.
        </blockquote>
        <blockquote>
          Importing locations from Alba can take a long time to complete the initial import. Estimate about 1-2 seconds per location.
          Note that you may see an import error if it takes more than 30s to complete; It is still running in the background.
        </blockquote>
        <blockquote>
          If an address exists more than once in the import data, the last one wins.
        </blockquote>
        <form id=" alba-location-import">
          <div className=" row">
            <label for=" alba-export-tsv">
              Paste ALBA location export from <a target=" _blank" href=" https://www.mcmxiv.com/alba/addresses">Alba</a>:
              <textarea
                id="alba-export-tsv" onChange={(e) => this.setState({ locations: e.target.value })}
              />
            </label>
          </div>

          <div className="row">
            <button onClick={this.submitLocations}>Import</button>
          </div>

          <div className="progress hide">
            <div className="indeterminate"></div>
          </div>

          <div id="error-message"></div>
        </form>
      </div>
    );
  }
}

AlbaLocationImportPage.propTypes = {
  congregationId: PropTypes.number.isRequired,
};

export default AlbaLocationImportPage;
