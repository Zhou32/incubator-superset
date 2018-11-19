import React from 'react';
import PropTypes from 'prop-types';
import {Panel, Row, Col, Tabs, Tab, FormControl} from 'react-bootstrap';
import LocationSearchBox from './components/LocationSearchBox';

const propTypes = {
    user: PropTypes.object.isRequired,
};

export default class Welcome extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            search: '',
        };
        this.onSearchChange = this.onSearchChange.bind(this);
    }

    onSearchChange(event) {
        this.setState({search: event.target.value});
    }

    render() {
        return <LocationSearchBox onSearchChange={(place) => this.onSearchChange(place)}/>

    }
}

Welcome.propTypes = propTypes;
