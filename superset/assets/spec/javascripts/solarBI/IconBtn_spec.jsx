import React from 'react';
import { shallow,mount } from 'enzyme';
import IconBtn from '../../../src/solarBI/components/IconBtn';

describe('Location Search Box', () => {
  let wrapper;

  it('click shows content', () => {
      wrapper = mount(<IconBtn />);
      wrapper.find('IconButton#iconButton').simulate('click');
      expect(wrapper.find('Popover#simple-popper').length).toBe(1);
      expect(wrapper.find('Typography#popContent').length).toBe(1);
  });


});