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
import ReactEcharts from "echarts-for-react";
import { Grid, Row, Col, Alert } from "react-bootstrap";
import Button from "@material-ui/core/Button";
import DisplayQueryButton from "../../explore/components/DisplayQueryButton";
import { fetchSolarData, addSuccessToast } from "../actions/solarActions";
import SaveModal from "./SaveModal";
import ExportModal from "./ExportModal";
import InfoWidgets from "./InfoWidgets";
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
      zoom: 13,
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
    this.getOption = this.getOption.bind(this);
    this.getHeatmapOption = this.getHeatmapOption.bind(this);
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
          zoom: 13,
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

  getHeatmapOption() {
    var hours = [
      "12a",
      "1a",
      "2a",
      "3a",
      "4a",
      "5a",
      "6a",
      "7a",
      "8a",
      "9a",
      "10a",
      "11a",
      "12p",
      "1p"
    ];
    var days = [
      "Saturday",
      "Friday",
      "Thursday",
      "Wednesday",
      "Tuesday",
      "Monday",
      "Sunday"
    ];

    var data = [
      [0, 0, 5],
      [0, 1, 1],
      [0, 2, 0],
      [0, 3, 0],
      [0, 4, 0],
      [0, 5, 0],
      [0, 6, 0],
      [0, 7, 0],
      [0, 8, 0],
      [0, 9, 0],
      [0, 10, 0],
      [0, 11, 2],
      [0, 12, 4],
      [0, 13, 1],
      [1, 0, 7],
      [1, 1, 0],
      [1, 2, 0],
      [1, 3, 0],
      [1, 4, 0],
      [1, 5, 0],
      [1, 6, 0],
      [1, 7, 0],
      [1, 8, 0],
      [1, 9, 0],
      [1, 10, 5],
      [1, 11, 2],
      [1, 12, 2],
      [1, 13, 6],
      [2, 0, 1],
      [2, 1, 1],
      [2, 2, 0],
      [2, 3, 0],
      [2, 4, 0],
      [2, 5, 0],
      [2, 6, 0],
      [2, 7, 0],
      [2, 8, 0],
      [2, 9, 0],
      [2, 10, 3],
      [2, 11, 2],
      [2, 12, 1],
      [2, 13, 9],
      [3, 0, 7],
      [3, 1, 3],
      [3, 2, 0],
      [3, 3, 0],
      [3, 4, 0],
      [3, 5, 0],
      [3, 6, 0],
      [3, 7, 0],
      [3, 8, 1],
      [3, 9, 0],
      [3, 10, 5],
      [3, 11, 4],
      [3, 12, 7],
      [3, 13, 14]
    ];

    data = data.map(function(item) {
      return [item[1], item[0], item[2] || "-"];
    });

    var option = {
      tooltip: {
        position: "top"
      },
      animation: false,
      grid: {
        height: "50%",
        y: "10%"
      },
      xAxis: {
        type: "category",
        data: hours,
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: "category",
        data: days,
        splitArea: {
          show: true
        }
      },
      visualMap: {
        min: 0,
        max: 10,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "15%",
        inRange: {
          color: ["#adfff1", "#22c3aa", "#489795"]
        }
      },
      series: [
        {
          name: "Punch Card",
          type: "heatmap",
          data: data,
          label: {
            normal: {
              show: true
            }
          },
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            },
            color: "rgb(128, 128, 0)"
          }
        }
      ]
    };
    return option;
  }

  getOption(data) {
    if (data) {
      var data1 = data[1];
      var xAxisData = data[0];

      var option = {
        title: {
          text: "Irradiance Data"
        },
        legend: {
          data: ["☀️ Irradiance ☀️ (W/m²)"],
          align: "left"
        },
        toolbox: {
          showTitle: false,
          feature: {
            saveAsImage: {
              pixelRatio: 2
            },
            dataView: {
              show: true,
              title: "View Data",
              lang: ["Data View", "close", "refresh"]
            }
          }
        },
        tooltip: {},
        xAxis: {
          data: xAxisData,
          silent: false,
          splitLine: {
            show: false
          }
        },
        yAxis: {
          name: "(W/m²)"
        },
        itemStyle: {
          color: "#489795"
        },
        series: [
          {
            name: "☀️ Irradiance ☀️ (W/m²)",
            type: "bar",
            data: data1,
            animationDelay: function(idx) {
              return idx * 10;
            }
          }
        ],
        animationEasing: "elasticOut",
        animationDelayUpdate: function(idx) {
          return idx * 5;
        }
      };

      return option;
    }
    return {};
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
    const isSmallScreen = /xs|sm|md/.test(width);
    const buttonProps = {
      size: isSmallScreen ? "medium" : "large"
    };
    let reactEcharts = null;
    let closestMarker = null;
    let infoWindow = null;
    let { solarStatus, queryResponse, solarAlert } = this.props.solarBI;
    if (solarStatus === "success" && queryResponse) {
      const newOptions = this.getOption(queryResponse["data"]["data"]);
      const heatmapOptions = this.getHeatmapOption();
      const closestPoint = {
        lat: queryResponse["data"]["lat"],
        lng: queryResponse["data"]["lng"]
      };
      closestMarker = (
        <Marker
          position={closestPoint}
          name="Closest point"
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
            <p>{this.state.selectedPlace.name}</p>
          </div>
        </InfoWindow>
      );
      reactEcharts = (
        <div style={{ display: "flex" }}>
          <ReactEcharts style={{ width: "100%" }} option={heatmapOptions} />
          <ReactEcharts style={{ width: "100%" }} option={newOptions} />
        </div>
      );
    } else if (solarStatus === "loading") {
      reactEcharts = <Loading size={50} style={{ marginTop: "20%" }} />;
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
        {this.state.searching && (
          <Grid>
            <Row className="show-grid" style={{ marginTop: "20%" }}>
              <Col xs={10} xsOffset={1} md={10} mdOffset={1}>
                <LocationSearchBox
                  address={this.state.address}
                  onPlaceChanged={place => this.onPlaceChanged(place)}
                />
              </Col>
            </Row>
            <Row className="show-grid" style={{ marginTop: "8%" }}>
              <Col xs={4} xsOffset={1}>
                <InfoWidgets />
              </Col>
            </Row>
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
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.12), 0 4px 6px rgba(29,114,12,0.24)",
            borderRadius: "1em",
            height: "110%",
            width: "100%",
            position: "relative"
          }}
        >
          <Marker
            position={this.state.center}
            name="Current location"
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

        {this.state.showingMap && (
          <div style={{ marginTop: "6.5em" }}>{reactEcharts}</div>
        )}

        <Grid>
          {/* <Row className="show-grid" style={{ marginTop: "1%" }}>
            <Col xs={10} xsOffset={1}>
              <Map
                visible={this.state.showingMap}
                google={this.props.google}
                zoom={this.state.zoom}
                onClick={this.onMapClicked}
                initialCenter={this.state.center}
                center={this.state.center}
                style={{
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.12), 0 4px 6px rgba(29,114,12,0.24)",
                  borderRadius: "1em",
                  height: "110%",
                  width: "100%",
                  position: "relative"
                }}
              >
                <Marker
                  position={this.state.center}
                  name="Current location"
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
            </Col>
          </Row> */}

          {/* {this.state.showingMap && (
            <Row className="show-grid" style={{ marginTop: "6.5em" }}>
              <Col xs={12}>{reactEcharts}</Col>
            </Row>
          )} */}

          {this.state.showingMap && (
            <MuiThemeProvider theme={theme}>
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
                <Col xs={1} md={1}>
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
            </MuiThemeProvider>
          )}
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
