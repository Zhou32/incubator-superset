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
        can_save: true,
        can_export: true,
        solar_new: true,
    };


    beforeEach(() => {
      wrapper = mount(<InfoTabs {...mockProps} />);
    });
    

    it('save icon click should save', () => {
        wrapper
          .find('IconButton#saveIcon')
          .simulate('click');
        expect(clickSv).toHaveBeenCalled();
    });

    it('back icon click should call back', () => {
      wrapper
        .find('IconButton#backIcon')
        .simulate('click');
      expect(clickBk).toHaveBeenCalled();
    });

    it('export icon click should pop export', () => {
      wrapper
        .find('IconButton#exportIcon')
        .simulate('click');
      expect(clickEx).toHaveBeenCalled();
    });

    describe('Different tabs', () => {
        it('tabValue 0 leads to tab 1 and content 1, hide others', () => {
          wrapper.setState({ tabValue: 0 });
          expect(wrapper.find('Tab#tab1').length).toBe(1);
          expect(wrapper.find('TabContainer#tab1Content').length).toBe(1);
          expect(wrapper.find('TabContainer#tab2Content').length).toBe(0);
          expect(wrapper.find('TabContainer#tab3Content').length).toBe(0);
        });

        it('tabValue 1 leads to tab 2 and content 2', () => {
          wrapper.setState({ tabValue: 1 });
          wrapper.update();
          expect(wrapper.state('tabValue')).toBe(1);
          expect(wrapper.find('TabContainer#tab2Content').length).toBe(1);
          // expect(wrapper.find('TabContainer#tab1Content').length).toBe(0);
          // expect(wrapper.find('TabContainer#tab3Content').length).toBe(0);
      });

      it('tabValue 2 leads to tab 3 and content 3, hide others', () => {
        wrapper.setState({ tabValue: 2 });
        wrapper.update();
        expect(wrapper.state('tabValue')).toBe(2);
        // expect(wrapper.find('TabContainer#tab1Content').length).toBe(0);
        // expect(wrapper.find('TabContainer#tab2Content').length).toBe(0);
        // expect(wrapper.find('TabContainer#tab3Content').length).toBe(1);
      });
    });

  it('hide save icon if not new data', () => {
    wrapper.setProps({ solar_new: false });
    expect(wrapper.find('Tooltip#Save')).toHaveLength(0);
});

});
