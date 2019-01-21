import React from 'react';
import { shallow,mount } from 'enzyme';
import { Button } from 'react-bootstrap';
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import {MapView} from '../../../src/solarBI/components/MapView';
import getInitialState from "../../../src/solarBI/reducers/getInitialState";
import rootReducer from "../../../src/solarBI/reducers/index";
import { initEnhancer } from "../../../src/reduxUtils";
import { Provider } from "react-redux";

describe('MapView', () => {
    const mockSolarBI = {
        can_add: true,
        can_save: true,
        can_download: true,
        can_export: true,
        can_overwrite: true,
        solarStatus: "loading",
        form_data: {
            datasource: "13_table",
            spatial_address: {
                lat: -37,
                lng: 144,
            }
        }
    }
    let wrapper;
    const fetchSolarData = jest.fn();
    beforeEach(() => {
        wrapper = shallow(
            <MapView 
                solarBI={mockSolarBI}
                fetchSolarData={fetchSolarData} />
            );
        // connectedComponent = wrapper.dive();
    })

    it('Map always rendered', () => {
        // console.log(connectedComponent)
        // console.log(wrapper.debug());
        expect(wrapper.find('Map').length).toBe(1);
    })

    it('show loading icon on loading data', () => {
        expect(wrapper.find('Loading').length).toBe(1);
    })

    it('show alert if fail to fetch data', () => {
        wrapper.setState({solarStatus: "failed"});
        wrapper.update();
        expect(wrapper.find('strong#failAlert').length).toBe(1);
    })


})