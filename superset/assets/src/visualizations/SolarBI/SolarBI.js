import React from 'react';
import {Map, Marker, GoogleApiWrapper, Circle} from './google_maps_react'
import ReactEcharts from 'echarts-for-react';

const defaultProps = {
    center: {
        lat: 40.854885,
        lng: -87.081807
    },
    zoom: 11
};

class SolarBI extends React.Component {



    constructor(props) {
        super(props);
        console.log(props);
        const results = props.data;
        this.state = {
            center: {lat:results.lat,lng:results.lng},
            zoom: defaultProps.zoom,
            options:this.getOption(),
            radius:results.radius
        };
        this.placeChanged.bind(this.placeChanged());
        this.getOption.bind(this.getOption());
    }


    placeChanged(place) {
        if (place) {
            console.log(place);
            this.setState({
                center: place.geometry.location,
                zoom: 16
            });
        }
    };

    getOption() {
        let processed_data = this.props.data.data;
        var data1 = processed_data[1];
        var xAxisData = processed_data[0];


        var option = {
            title: {
                text: 'Data from the past'
            },
            legend: {
                data: ['bar'],
                align: 'left'
            },
            toolbox: {
                // y: 'bottom',
                feature: {
                    magicType: {
                        type: ['stack', 'tiled']
                    },
                    dataView: {},
                    saveAsImage: {
                        pixelRatio: 2
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
            yAxis: {},
            series: [{
                name: 'bar',
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

    componentDidMount(){
        const results = this.props.data;
        this.setState({
            center: {lat:results.lat,lng:results.lng},
            options:this.getOption(),
            radius:results.radius
        })
    }

    render() {
        return (
            <div >

                <Map google={this.props.google}
                     zoom={this.state.zoom}
                     style={{position: 'relative',height: '45%', width: '90%',marginTop: 0}}
                     initialCenter={{
                         lat: 40.854885,
                         lng: -88.081807
                     }}
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
                <ReactEcharts option={this.state.options}
                              style={{position: 'absolute', width: '90%', height: '40%',marginTop:'36%'}}/>

            </div>
        )
    }
}


export default GoogleApiWrapper({
    apiKey: "AIzaSyBhxmH4h8k0ZaUN713RVCb9T1uGTfsIX9k"
})(SolarBI)
