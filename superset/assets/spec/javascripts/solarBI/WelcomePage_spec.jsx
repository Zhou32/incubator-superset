import React from 'react';
import { mount } from 'enzyme';
import { Button } from 'react-bootstrap';
import WelcomePage from '../../../src/solarBI/components/WelcomePage';


describe('WelcomePage', () => {
    let wrapper;
    const {reload} = window.location;
    beforeEach(() => {
        wrapper = mount(<WelcomePage />);
        window.location.reload = jest.fn();
    });

    it('renders a button', () => {
        expect(wrapper.find('Button')).toHaveLength(1);
    });

    it('should direct to /solar/add page', () => {
        // console.log(window.location);
        wrapper.find('Button').simulate('click');
        expect(window.location.href).toBe('http://localhost/');
    })

});