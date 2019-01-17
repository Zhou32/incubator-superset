import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'react-bootstrap';
import WelcomePage from '../../../src/solarBI/components/WelcomePage';


describe('WelcomePage', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<WelcomePage />);
    });

    it('renders a button', () => {
        expect(wrapper.find('Button')).toHaveLength(1);
    });

});