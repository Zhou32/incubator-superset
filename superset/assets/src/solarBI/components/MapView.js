import React from "react";
import PropTypes from "prop-types";
import LocationSearchBox from "./LocationSearchBox";
import {
  Map,
  Marker,
  Circle,
  InfoWindow,
  GoogleApiWrapper
} from "../../visualizations/SolarBI/google_maps_react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Grid, Row, Col, Alert } from "react-bootstrap";
import Button from "@material-ui/core/Button";
import DisplayQueryButton from "../../explore/components/DisplayQueryButton";
import { fetchSolarData, addSuccessToast } from "../actions/solarActions";
import SaveModal from "./SaveModal";
import ExportModal from "./ExportModal";
import InfoWidgets from "./InfoWidgets";
import InfoTabs from "./InfoTabs";
import SolarCharts from "./SolarCharts";
import WelcomePage from "./WelcomePage";
import Loading from "./Loading";
import classNames from "classnames";
import URI from "urijs";
import withWidth from "@material-ui/core/withWidth";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { t } from "@superset-ui/translation";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      main: "#489795"
    },
    secondary: {
      main: "#8E44AD"
    }
  }
});

const propTypes = {
  solarBI: PropTypes.object.isRequired
};

class MapView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      center: {
        lat: -37.8136276,
        lng: 144.96305759999996
      },
      radius: 3.5,
      datasource_id: "",
      datasource_type: "",
      zoom: 14,
      address: "",
      options: {},
      showModal: false,
      showExportModal: false,
      searching: true,
      showingMap: false,
      activeMarker: {},
      selectedPlace: {},
      showingInfoWindow: false,
      showingEmptyAlert: false,
      showingWrongAlert: false
    };

    this.onPlaceChanged = this.onPlaceChanged.bind(this);
    this.onGoBackClick = this.onGoBackClick.bind(this);
    this.requestData = this.requestData.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleExportModal = this.toggleExportModal.bind(this);
    this.getFormData = this.getFormData.bind(this);
    this.getCSVURL = this.getCSVURL.bind(this);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onInfoWindowClose = this.onInfoWindowClose.bind(this);
    this.onMapClicked = this.onMapClicked.bind(this);
    this.handleEmptyErrorAlert = this.handleEmptyErrorAlert.bind(this);
    this.handleWrongErrorAlert = this.handleWrongErrorAlert.bind(this);
  }

  componentWillMount() {
    const { solarBI } = this.props;
    const { form_data } = solarBI;
    if (
      solarBI.hasOwnProperty("form_data") &&
      form_data.hasOwnProperty("spatial_address")
    ) {
      this.setState(
        {
          center: {
            lat: form_data["spatial_address"]["lat"],
            lng: form_data["spatial_address"]["lon"]
          },
          radius: form_data["radius"],
          address: form_data["spatial_address"]["address"],
          showingMap: true,
          searching: false,
          datasource_id: solarBI["datasource_id"],
          datasource_type: solarBI["datasource_type"],
          solar_new: false,
          can_save: false,
          can_export: false
        },
        function() {
          this.requestData();
        }
      );
    } else {
      this.setState({
        // data_source: form_data["datasource"],
        datasource_id: solarBI["datasource_id"],
        datasource_type: solarBI["datasource_type"],
        solar_new: true,
        can_save: false,
        can_export: false
      });
    }
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  toggleExportModal() {
    this.setState({ showExportModal: !this.state.showExportModal });
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
            lng
          },
          zoom: 14,
          searching: false,
          showingMap: true
        },
        function() {
          this.requestData();
        }
      );
    } else if (place === "") {
      this.handleEmptyErrorAlert();
    } else {
      this.handleWrongErrorAlert();
    }
  }

  handleEmptyErrorAlert() {
    this.setState({
      showingEmptyAlert: true
    });

    setTimeout(() => {
      this.setState({
        showingEmptyAlert: false
      });
    }, 3000);
  }

  handleWrongErrorAlert() {
    this.setState({
      showingWrongAlert: true
    });

    setTimeout(() => {
      this.setState({
        showingWrongAlert: false
      });
    }, 3000);
  }

  getFormData() {
    return {
      datasource_id: this.state.datasource_id,
      datasource_type: this.state.datasource_type,
      viz_type: "solarBI",
      radius: this.state.radius,
      spatial_address: {
        address: this.state.address,
        lat: this.state.center.lat,
        lon: this.state.center.lng,
        latCol: "longitude",
        lonCol: "latitude",
        type: "latlong"
      }
    };
  }

  requestData() {
    const formData = this.getFormData();
    this.props.fetchSolarData(formData, false, 60, "");
  }

  getCSVURL() {
    const formData = this.getFormData();
    const uri = new URI("/");
    const directory =
      "/superset/explore_json/" +
      formData["datasource_type"] +
      "/" +
      formData["datasource_id"] +
      "/";
    const search = uri.search(true);
    search.form_data = JSON.stringify(formData);
    search.standalone = "true";
    search.csv = "true";
    const part_uri = uri
      .directory(directory)
      .search(search)
      .toString();
    return window.location.origin + part_uri + `&height=${this.state.height}`;
  }

  onGoBackClick() {
    this.setState({
      searching: true,
      showingMap: false,
      can_save: false,
      can_export: false
    });
  }

  onMarkerClick(props, marker) {
    this.setState({
      activeMarker: marker,
      selectedPlace: props,
      showingInfoWindow: true
    });
  }

  onInfoWindowClose() {
    this.setState({
      activeMarker: {},
      showingInfoWindow: false
    });
  }

  onMapClicked() {
    if (this.state.showingInfoWindow)
      this.setState({
        activeMarker: {},
        showingInfoWindow: false
      });
  }

  render() {
    const { width } = this.props;
    const { entry } = this.props.solarBI;
    const isSmallScreen = /xs|sm|md/.test(width);
    const buttonProps = {
      size: isSmallScreen ? "medium" : "large"
    };
    let reactEcharts = null;
    let closestMarker = null;
    let infoWindow = null;
    let { solarStatus, queryResponse, solarAlert } = this.props.solarBI;
    if (solarStatus === "success" && queryResponse) {
      const closestPoint = {
        lat: queryResponse["data"]["lat"],
        lng: queryResponse["data"]["lng"]
      };
      closestMarker = (
        <Marker
          position={closestPoint}
          name="Nearest Data Collection Point"
          onClick={this.onMarkerClick}
          icon={{
            url:
              "https://s3-ap-southeast-2.amazonaws.com/public-asset-test/red_marker.png"
          }}
        />
      );
      infoWindow = (
        <InfoWindow
          marker={this.state.activeMarker}
          onClose={this.onInfoWindowClose}
          visible={this.state.showingInfoWindow}
        >
          <div>
            <p
              style={{
                fontFamily: "Helvetica,Arial,sans-serif",
                margin: "auto"
              }}
            >
              {this.state.selectedPlace.name}
            </p>
          </div>
        </InfoWindow>
      );
      reactEcharts = (
        <div>
          <p
            style={{
              fontSize: 23,
              textAlign: "center",
              color: "#8E44AD",
              marginTop: 50,
              marginBottom: 30
            }}
          >
            Based on your location find below data from Jan 2017 until the
            latest satellite update.
          </p>

          <SolarCharts queryData={queryResponse["data"]["data"]} />
          <InfoTabs
            onBackClick={this.onGoBackClick}
            onSaveClick={this.toggleModal}
            onExportClick={this.toggleExportModal}
            getCSVURL={this.getCSVURL}
          />
        </div>
      );
    } else if (solarStatus === "loading") {
      reactEcharts = <Loading size={80} />;
    } else if (solarStatus === "failed") {
      reactEcharts = (
        <Alert bsStyle="danger">
          <p style={{ textAlign: "center" }}>
            <strong>{solarAlert}! Please try again!</strong>
          </p>
        </Alert>
      );
    }

    const defaultIcon = {
      url:
        "https://s3-ap-southeast-2.amazonaws.com/public-asset-test/icons8-marker-48.png"
      // scaledSize: new this.props.google.maps.Size(20, 30) // scaled size
    };

    return (
      <div>
        <MuiThemeProvider theme={theme}>
          {this.state.showingEmptyAlert && (
            <Grid>
              <Row className="show-grid" xs={12}>
                <Col>
                  <Alert bsStyle="danger" style={{ margin: "auto" }}>
                    Please Enter An Address
                  </Alert>
                </Col>
              </Row>
            </Grid>
          )}
          {this.state.showingWrongAlert && (
            <Grid>
              <Row className="show-grid" xs={12}>
                <Col>
                  <Alert bsStyle="danger" style={{ margin: "auto" }}>
                    Please Select An Address From The Pop-up Window
                  </Alert>
                </Col>
              </Row>
            </Grid>
          )}

          {this.state.searching &&
            entry === "welcome" && (
              <div>
                <WelcomePage />
              </div>
            )}
          {this.state.searching && 
            entry !== "welcome" && (
              <Grid>
                <Row className="show-grid" style={{ marginTop: "20%" }}>
                  <Col xs={10} xsOffset={1} md={10} mdOffset={1}>
                    <LocationSearchBox
                      address={this.state.address}
                      onPlaceChanged={place => this.onPlaceChanged(place)}
                    />
                  </Col>
                </Row>
                {/* <Row className="show-grid" style={{ marginTop: "8%" }}>
              <Col xs={4} xsOffset={1}>
                <InfoWidgets />
              </Col>
            </Row> */}
              </Grid>
            )}

          <Map
            visible={this.state.showingMap}
            google={this.props.google}
            zoom={this.state.zoom}
            onClick={this.onMapClicked}
            initialCenter={this.state.center}
            center={this.state.center}
            style={{
              marginTop: "-19px",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.12), 0 4px 6px rgba(29,114,12,0.24)",
              borderRadius: "1em",
              height: "495px",
              width: "100%",
              position: "relative"
            }}
          >
            <Marker
              position={this.state.center}
              name={this.state.address}
              icon={defaultIcon}
              onClick={this.onMarkerClick}
            />
            {closestMarker}
            {infoWindow}

            <Circle
              radius={this.state.radius * 1000}
              center={this.state.center}
              strokeColor="transparent"
              strokeOpacity={0}
              strokeWeight={5}
              fillColor={"#FF0000"}
              fillOpacity={0.2}
            />
          </Map>

          <Grid>
            {this.state.showingMap && (
              <Row className="show-grid" style={{ marginTop: "2em" }}>
                <Col xsOffset={1} xs={10} md={12} mdOffset={0}>
                  {reactEcharts}
                </Col>
              </Row>
            )}

            {/* {this.state.showingMap && (
              <Row className="show-grid">
                <Col xsOffset={1} xs={1} md={1} mdOffset={1}>
                  {this.state.solar_new &&
                    this.props.solarBI.can_save && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.onGoBackClick}
                        style={{
                          width: 80,
                          fontSize: 12,
                          color: "white"
                        }}
                        {...buttonProps}
                      >
                        Back
                      </Button>
                    )}
                </Col>
                <Col xs={1} xsOffset={6}>
                  {this.state.solar_new &&
                    this.props.solarBI.can_save && (
                      <Button
                        {...buttonProps}
                        variant="contained"
                        color="primary"
                        onClick={this.toggleModal}
                        style={{
                          width: 80,
                          fontSize: 12,
                          color: "white"
                        }}
                      >
                        Save
                      </Button>
                    )}
                </Col>
                <Col>
                  {this.props.solarBI.can_export && (
                    <Button
                      {...buttonProps}
                      variant="contained"
                      color="primary"
                      onClick={this.toggleExportModal}
                      style={{
                        marginLeft: "5em",
                        fontSize: 12,
                        color: "white",
                        width: 80
                      }}
                      href={this.getCSVURL()}
                    >
                      Export
                    </Button>
                  )}
                </Col>
              </Row>
            )} */}
          </Grid>

          <SaveModal
            open={this.state.showModal}
            onHide={this.toggleModal}
            actions={this.props.actions}
            form_data={{
              datasource_id: this.state.datasource_id,
              datasource_type: this.state.datasource_type,
              viz_type: "solarBI",
              radius: this.state.radius,
              spatial_address: {
                address: this.state.address,
                lat: this.state.center.lat,
                lon: this.state.center.lng,
                latCol: "longitude",
                lonCol: "latitude",
                type: "latlong"
              }
            }}
            userId={""}
          />
          <ExportModal
            open={this.state.showExportModal}
            onHide={this.toggleExportModal}
          />
        </MuiThemeProvider>
      </div>
    );
  }
}

MapView.propTypes = propTypes;

const mapStateToProps = state => ({
  solarBI: state.solarBI
});

export default withWidth()(
  connect(
    mapStateToProps,
    { fetchSolarData }
  )(
    GoogleApiWrapper({
      apiKey: "AIzaSyBhxmH4h8k0ZaUN713RVCb9T1uGTfsIX9k"
    })(MapView)
  )
);
