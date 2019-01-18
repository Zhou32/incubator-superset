import React from 'react';
import { mount } from 'enzyme';
import LocationSearchBox from '../../../src/solarBI/components/LocationSearchBox';

describe('Location Search Box', () => {
  let wrapper;

  const placeChg = jest.fn();
  const mockProps = {
    onPlaceChanged: placeChg,
    address: '',
  };

  beforeEach(() => {
    wrapper = mount(<LocationSearchBox {...mockProps} />);
  });

  it('search function is called', () => {
    wrapper.find('Fab#searchFab').simulate('click');
    expect(placeChg).toHaveBeenCalled();
  });

});
