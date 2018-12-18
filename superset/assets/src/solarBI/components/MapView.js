import React from "react";
import PropTypes from "prop-types";
import LocationSearchBox from "./LocationSearchBox";
import {
  Map,
  Marker,
  Circle,
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
import Loading from "./Loading";
import { t } from "@superset-ui/translation";

const propTypes = {
  solarBI: PropTypes.object.isRequired
};

class MapView extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);

    this.state = {
      center: {
        lat: -37.8136276,
        lng: 144.96305759999996
      },
      radius: 3,
      data_source: "",
      zoom: 11,
      address: "",
      options: {},
      new_create: false,
      visibility: "hidden",
      showModal: false,
      searching: true,
      showingMap: false
    };

    this.onPlaceChanged = this.onPlaceChanged.bind(this);
    this.onGoBackClick = this.onGoBackClick.bind(this);
    this.getOption = this.getOption.bind(this);
    this.requestData = this.requestData.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  componentWillMount() {
    const { solarBI } = this.props;
    const { form_data } = solarBI;
    if (
      solarBI.hasOwnProperty("form_data") &&
      form_data.hasOwnProperty("spatial_address")
    ) {
      this.setState({
        center: {
          lat: form_data["spatial_address"]["lat"],
          lng: form_data["spatial_address"]["lon"]
        },
        radius: form_data["radius"],
        data_source: form_data["datasource"],
        address: form_data["spatial_address"]["address"],
        showingMap: true,
        searching: false
      });
    } else {
      this.setState({ data_source: form_data["datasource"] });
    }
  }

  componentDidMount() {
    const { solarBI } = this.props;
    const { form_data } = solarBI;
    if (
      solarBI.hasOwnProperty("form_data") &&
      form_data.hasOwnProperty("spatial_address")
    ) {
      this.requestData();
    }
    // if (this.state.showingMap && !this.state.searching) {
    //   this.requestData();
    // }
  }

  onPlaceChanged(place) {
    if (place) {
      // console.log(place);
      this.setState({
        address: place.formatted_address,
        center: {
          lat: place.geometry.location.lat.call(),
          lng: place.geometry.location.lng.call()
        },
        zoom: 12,
        visibility: "visible",
        searching: false,
        showingMap: true
      });
    }
    this.requestData();
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
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

  requestData() {
    const formData = {
      datasource: this.state.data_source,
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

    this.props.fetchSolarData(formData, false, 60, "");
  }

  onGoBackClick() {
    this.setState({
      searching: true,
      showingMap: false
    });
  }

  render() {
    let reactEcharts = null;
    const { solarStatus, queryResponse, solarAlert } = this.props.solarBI;
    if (solarStatus === "success" && queryResponse) {
      const newOptions = this.getOption(queryResponse["data"]["data"]);
      reactEcharts = <ReactEcharts option={newOptions} />;
    } else if (solarStatus === "loading") {
      reactEcharts = <Loading size={50} />;
    } else if (solarStatus === "failed") {
      reactEcharts = (
        <Alert bsStyle="danger">
          <p style={{ textAlign: "center" }}>
            <strong>{solarAlert}! Please try again!</strong>
          </p>
        </Alert>
      );
    }

    // else if (solarStatus === "waiting") {
    //   reactEcharts = (
    //     <Alert bsStyle="info">
    //       <p style={{ textAlign: "center" }}>
    //         <strong>Please enter an address in above to allow search</strong>
    //       </p>
    //     </Alert>
    //   );
    // } else if (solarStatus === "failed") {
    //   reactEcharts = (
    //     <Alert bsStyle="danger">
    //       <p style={{ textAlign: "center" }}>
    //         <strong>{solarAlert}! Please try again!</strong>
    //       </p>
    //     </Alert>
    //   );
    // }
    return (
      <div>
        {this.state.showModal && (
          <SaveModal
            onHide={this.toggleModal}
            actions={this.props.actions}
            form_data={{
              datasource: this.state.data_source,
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
        )}

        {this.state.searching && (
          <Grid>
            <Row className="show-grid" style={{ marginTop: "30%" }}>
              <Col md={10} mdOffset={1}>
                <LocationSearchBox
                  address={this.state.address}
                  onPlaceChanged={place => this.onPlaceChanged(place)}
                />
              </Col>
            </Row>
          </Grid>
        )}

        {this.state.showingMap && (
          <Grid>
            <Row className="show-grid" style={{ marginTop: "10%" }}>
              <Col md={10} mdOffset={1}>
                <Map
                  google={this.props.google}
                  zoom={this.state.zoom}
                  initialCenter={this.state.center}
                  center={this.state.center}
                  style={{
                    boxShadow:
                      "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
                    borderRadius: "2em",
                    height: "100%",
                    width: "100%"
                  }}
                >
                  <Marker
                    position={this.state.center}
                    name={"Current location"}
                  />
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
            </Row>

            <Row
              className="show-grid"
              style={{ marginTop: "2%", visibility: this.state.visibility }}
            >
              <Col md={1} mdOffset={1}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={this.onGoBackClick}
                >
                  Go Back
                </Button>
              </Col>
              <Col md={1} mdOffset={7}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={this.toggleModal}
                >
                  Save
                </Button>
              </Col>
              <Col md={1}>
                <Button variant="contained" size="medium">
                  Export
                </Button>
              </Col>
            </Row>

            <Row className="show-grid" style={{ marginTop: "2%" }}>
              <Col md={10} mdOffset={1}>
                {reactEcharts}
              </Col>
            </Row>
          </Grid>
        )}
      </div>
    );
  }
}

MapView.propTypes = propTypes;

const mapStateToProps = state => ({
  solarBI: state.solarBI
});

export default connect(
  mapStateToProps,
  { fetchSolarData }
)(
  GoogleApiWrapper({
    apiKey: "AIzaSyBhxmH4h8k0ZaUN713RVCb9T1uGTfsIX9k"
  })(MapView)
);
