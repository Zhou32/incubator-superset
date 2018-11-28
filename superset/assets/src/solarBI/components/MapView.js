import React from 'react';
import LocationSearchBox from './LocationSearchBox'
import {Map, Marker, Circle, GoogleApiWrapper} from '../../visualizations/SolarBI/google_maps_react'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ReactEcharts from 'echarts-for-react';
import {Grid, Row, Col} from 'react-bootstrap';
import Button from '@material-ui/core/Button';
import DisplayQueryButton from '../../explore/components/DisplayQueryButton'
import {fetchSolarData} from '../actions/SolarActions'
import SaveModal from "./SaveModal";

const defaultProps = {
    center: {
        lat: -37.8136276,
        lng: 144.96305759999996
    },
    radius: 3,
    zoom: 11,
    options: {}
};


class MapView extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props);
        this.placeChanged = this.placeChanged.bind(this);
        this.getOption = this.getOption.bind(this);
        this.requestData = this.requestData.bind(this);
        this.resultHandler = this.resultHandler.bind(this);

        if (this.props.data.hasOwnProperty('form_data') && this.props.data.form_data.hasOwnProperty('spatial_address')) {
            var form_data = this.props.data.form_data;
            this.state = {
                center: {
                    lat: form_data['spatial_address']['lat'],
                    lng: form_data['spatial_address']['lon']
                },
                radius: form_data['radius'],
                data_source: form_data['datasource'],
                zoom: defaultProps.zoom,
                address:form_data['spatial_address']['address'],
                options: defaultProps.options,
                new_create: false,
                visibility: 'hidden',
                toggleModal: false
            };

            this.requestData();
        } else {
            this.state = {
                center: defaultProps.center,
                zoom: defaultProps.zoom,
                options: defaultProps.options,
                radius: defaultProps.radius,
                new_create: false,
                visibility: 'hidden',
                data_source: this.props.data.form_data['datasource'],
                toggleModal: false
            };
        }

    }

    placeChanged(place) {
        if (place) {
            console.log(place);
            this.setState({
                address: place.formatted_address,
                center: {
                    lat: place.geometry.location.lat.call(),
                    lng: place.geometry.location.lng.call()
                },
                zoom: 14,
                visibility: 'visible'
            });
        }
    }

    getOption(data) {
        if (data) {
            var data1 = data[1];
            var xAxisData = data[0];

            var option = {
                title: {
                    text: 'Irradiance Data'
                },
                legend: {
                    data: ['☀️ Irradiance ☀️ (W/m²)'],
                    align: 'left'
                },
                toolbox: {
                    showTitle: false,
                    feature: {
                        saveAsImage: {
                            pixelRatio: 2
                        },
                        dataView:{
                            show: true,
                            title: 'View Data',
                             "lang": ["Data View", "close", "refresh"]
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
                    name: '(W/m²)'
                },
                series: [{
                    name: '☀️ Irradiance ☀️ (W/m²)',
                    type: 'bar',
                    data: data1,
                    animationDelay: function (idx) {
                        return idx * 10;
                    }
                }],
                animationEasing: 'elasticOut',
                animationDelayUpdate: function (idx) {
                    return idx * 5;
                }
            };

            return option;
        }
        return {};
    }

    requestData() {
        var formData = {
            'datasource': this.state.data_source,
            'viz_type': 'solarBI',
            'radius': this.state.radius,
            'spatial_address': {
                'address': this.state.address,
                'lat': this.state.center.lat,
                'lon': this.state.center.lng,
                'latCol': 'longitude',
                'lonCol': 'latitude',
                'type': 'latlong'
            },

        };
        console.log(formData);
        fetchSolarData(formData, false, 60, '', this.resultHandler);

    };

    resultHandler(data) {
        if (data['status'] = 'success' && data['data']) {
            console.log(data);
            var newOptions = this.getOption(data['data']['data']['data']);
            this.setState({
                options: newOptions,
                style: {marginTop: '2%'}
            });
        } else {
            this.setState({
                options: defaultProps.options,
                style: {marginTop: '2%', display: 'none'}
            });
        }
    };

    render() {


        return (
            <div>
                <SaveModal
                    onHide={this.state.toggleModal}
                    actions={this.props.actions}
                    form_data={
                        {
                            'datasource': this.state.data_source,
                            'viz_type': 'solarBI',
                            'radius': this.state.radius,
                            'spatial_address': {
                                'address': this.state.address,
                                'lat': this.state.center.lat,
                                'lon': this.state.center.lng,
                                'latCol': 'longitude',
                                'lonCol': 'latitude',
                                'type': 'latlong'
                            },
                        }
                    }
                    userId={''}
                />
                <Grid>
                    <Row className="show-grid">
                        <Col md={4}>
                        </Col>
                        <Col md={4}>
                            <h2>{'Solar Business Intelligence'}</h2>
                        </Col>
                        <Col md={4}>
                        </Col>
                    </Row>

                    <Row className="show-grid" style={{marginTop: '3%'}}>
                        <Col md={2}>
                        </Col>
                        <Col md={8}>
                            <LocationSearchBox address={this.state.address} onPlaceChanged={(place) => this.placeChanged(place) }
                            />
                        </Col>
                        <Col md={2}>

                        </Col>
                    </Row>

                    <Row className="show-grid" style={{marginTop: '2%'}}>
                        <Col md={1}>
                        </Col>
                        <Col md={10}>
                            <Map google={this.props.google}
                                 zoom={this.state.zoom}

                                 initialCenter={this.state.center}
                                 center={this.state.center}
                            >
                                <Marker position={this.state.center}
                                        name={'Current location'}/>
                                <Circle
                                    radius={this.state.radius * 1000}
                                    center={this.state.center}
                                    strokeColor='transparent'
                                    strokeOpacity={0}
                                    strokeWeight={5}
                                    fillColor={'#FF0000'}
                                    fillOpacity={0.2}
                                />
                            </Map>
                        </Col>
                        <Col md={1}>

                        </Col>
                    </Row>
                    <Row className="show-grid" style={{marginTop: '2%', visibility: this.state.visibility}}>
                        <Col md={9}>
                        </Col>

                        <Col md={1}>
                            <Button variant="contained" size="medium" onClick={this.requestData}>
                                Run
                            </Button>
                        </Col>
                        <Col md={1}>
                            <Button variant="contained" size="medium" onClick={() => {
                                this.setState({toggleModal: true})
                            }}>
                                save
                            </Button>
                        </Col>
                        <Col md={1}>

                        </Col>
                    </Row>
                    <Row className="show-grid" style={this.state.style}>
                        <Col md={1}>
                        </Col>
                        <Col md={10}>
                            <ReactEcharts option={this.state.options}/>
                        </Col>
                        <Col md={1}>

                        </Col>
                    </Row>
                </Grid>


            </div>
        )
    }
}


export default GoogleApiWrapper({
    apiKey: "AIzaSyBhxmH4h8k0ZaUN713RVCb9T1uGTfsIX9k"
})(MapView)
