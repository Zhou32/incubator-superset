import React from 'react';
import { shallow,mount } from 'enzyme';
import ExportModal from '../../../src/solarBI/components/ExportModal';


describe('ExportModal', () => {
    let wrapper;
    const onClose= jest.fn();

    beforeEach(() => {
        wrapper = mount(<ExportModal onHide={onClose} open={true}/>);
    })

    it('should render correctly', () => {
        expect(wrapper.find('Dialog').length).toBe(1);
        expect(wrapper.find('DialogTitle').length).toBe(1);
        expect(wrapper.find('DialogContent').length).toBe(1);
        expect(wrapper.find('DialogActions').length).toBe(1);
    })

    it('should close on click button', () => {
        wrapper.find('Button').simulate('click');
        expect(onClose).toHaveBeenCalled();
    })

})