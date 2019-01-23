import React from 'react';
import { shallow,mount } from 'enzyme';
import EnvironmentImpact from '../../../src/solarBI/components/EnvironmentImpact';

describe('Environment Impact', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(<EnvironmentImpact />);
    });

    it('render the image', () =>{
        expect(wrapper.find('img').length).toBe(1);
    })

    it('render the titles', () => {
        expect(wrapper.find('Typography').length).toBe(3);
        expect(wrapper.find('Typography#subtitle1').length).toBe(1);
        expect(wrapper.find('Typography#subtitle2').length).toBe(1);
        expect(wrapper.find('Typography#subtitle3').length).toBe(1);
    })
})