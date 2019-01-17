import React from 'react';
import { mount } from 'enzyme';
import InfoTabs from '../../../src/solarBI/components/InfoTabs';


describe('InfoTabs', () => {
    let wrapper;
    const clickBk = jest.fn();
    const clickSv = jest.fn();
    const clickEx = jest.fn();

    const clickCsv = jest.fn();
    const mockProps = {
        onBackClick: clickBk,
        onSaveClick: clickSv,
        onExportClick: clickEx,
        getCSVURL: clickCsv,
    };


    it('button click should hide component', () => {
        wrapper = mount(<InfoTabs {...mockProps} />);
        wrapper
          .find('SaveIcon')
          .simulate('click');
        expect(clickBk).toHaveBeenCalled();
      });

});
