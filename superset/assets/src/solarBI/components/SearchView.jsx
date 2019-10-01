/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint camelcase: 0 react/jsx-filename-extension: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Row, Col, Alert } from 'react-bootstrap';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import LocationSearchBox from './LocationSearchBox';
import DemoBox from './DemoBox';
import { fetchSolarData } from '../actions/solarActions';
import Loading from './Loading';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      main: '#DAD800',
    },
    secondary: {
      main: '#0063B0',
    },
  },
});

const propTypes = {
  solarBI: PropTypes.object.isRequired,
  fetchSolarData: PropTypes.func.isRequired,
  // width: PropTypes.string.isRequired,
  // google: PropTypes.object.isRequired,
};

export class SearchView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      center: {
        lat: -37.8136276,
        lng: 144.96305759999996,
      },
      address: '',
      showingEmptyAlert: false,
      showingWrongAlert: false,
    };

    this.onPlaceChanged = this.onPlaceChanged.bind(this);
    // this.onGoBackClick = this.onGoBackClick.bind(this);
    this.requestData = this.requestData.bind(this);
    // this.toggleSaveModal = this.toggleSaveModal.bind(this);
    // this.toggleExportModal = this.toggleExportModal.bind(this);
    this.getFormData = this.getFormData.bind(this);
    // this.getCSVURL = this.getCSVURL.bind(this);
    // this.onMarkerClick = this.onMarkerClick.bind(this);
    // this.onInfoWindowClose = this.onInfoWindowClose.bind(this);
    // this.onMapClicked = this.onMapClicked.bind(this);
    this.handleEmptyErrorAlert = this.handleEmptyErrorAlert.bind(this);
    this.handleWrongErrorAlert = this.handleWrongErrorAlert.bind(this);
  }

  onPlaceChanged(place) {
    if (place && place.geometry) {
      const lat = place.geometry.location.lat.call();
      const lng = place.geometry.location.lng.call();
      this.setState(
        {
          address: place.formatted_address,
          center: {
            lat,
            lng,
          },
        }, () => {
          this.requestData();
        });
    } else if (place === '') {
      this.handleEmptyErrorAlert();
    } else {
      this.handleWrongErrorAlert();
    }
  }

  getFormData() {
    return {
      datasource_id: this.props.solarBI.datasource_id,
      datasource_type: this.props.solarBI.datasource_type,
      viz_type: 'solarBI',
      radius: 3.5,
      spatial_address: {
        address: this.state.address,
        lat: this.state.center.lat,
        lon: this.state.center.lng,
        latCol: 'longitude',
        lonCol: 'latitude',
        type: 'latlong',
      },
    };
  }

  requestData() {
    const formData = this.getFormData();
    this.props.fetchSolarData(formData, false, 60, '').then((json) => {
      if (json.type === 'SOLAR_UPDATE_SUCCEEDED') {
        window.location = '/solar/result';
      } else {
        window.location = '/solar/add';
      }
    });
  }

  handleWrongErrorAlert() {
    this.setState({
      showingWrongAlert: true,
    });

    setTimeout(() => {
      this.setState({
        showingWrongAlert: false,
      });
    }, 3000);
  }

  handleEmptyErrorAlert() {
    this.setState({
      showingEmptyAlert: true,
    });

    setTimeout(() => {
      this.setState({
        showingEmptyAlert: false,
      });
    }, 3000);
  }

  render() {
    const { solarStatus, solarAlert } = this.props.solarBI;
    return (
      <ThemeProvider theme={theme}>
        {this.state.showingEmptyAlert && (
          <Grid style={{ position: 'absolute', top: 0 }}>
            <Row className="show-grid" xs={12}>
              <Col>
                <Alert bsStyle="danger" style={{ margin: 'auto' }}>
                  Please Enter An Address
                </Alert>
              </Col>
            </Row>
          </Grid>
        )}
        {this.state.showingWrongAlert && (
          <Grid style={{ position: 'absolute', top: 0 }}>
            <Row className="show-grid" xs={12}>
              <Col>
                <Alert bsStyle="danger" style={{ margin: 'auto' }}>
                  Please Select An Address From The Pop-up Window
                </Alert>
              </Col>
            </Row>
          </Grid>
        )}
        {solarStatus === 'waiting' && (
          <Grid style={{ marginTop: 200 }}>
            <Row className="show-grid">
              <Col xs={10} xsOffset={1} md={10} mdOffset={1}>
                <LocationSearchBox
                  address={this.state.address}
                  onPlaceChanged={place => this.onPlaceChanged(place)}
                />
                <DemoBox />
              </Col>
            </Row>
          </Grid>
        )}
        {solarStatus === 'loading' && (<Loading size={80} />)}
        {solarStatus === 'failed' && (
          <Grid style={{ position: 'absolute', top: 0 }}>
            <Row className="show-grid" xs={12}>
              <Col>
                <Alert bsStyle="danger">
                  <p style={{ textAlign: 'center' }}>
                    <strong id="failAlert">{solarAlert}! Please try again!</strong>
                  </p>
                </Alert>
              </Col>
            </Row>
          </Grid>
        )};

      </ThemeProvider>
    );
  }
}

SearchView.propTypes = propTypes;

const mapStateToProps = state => ({
  solarBI: state.solarBI,
});

export default connect(
  mapStateToProps,
  { fetchSolarData },
)(SearchView);
