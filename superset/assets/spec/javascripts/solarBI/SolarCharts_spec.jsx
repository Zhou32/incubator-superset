import React from 'react';
import { shallow,mount } from 'enzyme';
import SolarCharts from '../../../src/solarBI/components/SolarCharts';

describe('Solar Charts', () => {
    let wrapper;
    let data = [
        [
            "2017/01",
            "2017/02",
            "2017/03",
            "2017/04",
            "2017/05",
            "2017/06",
            "2017/07",
            "2017/08",
            "2017/09",
            "2017/10",
            "2017/11",
            "2017/12",
            "2018/01",
            "2018/02",
            "2018/03",
            "2018/04",
            "2018/05",
            "2018/06",
            "2018/07"
        ],
        [
            100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116
        ]
    ]

    beforeEach(() => {
        wrapper = shallow(<SolarCharts queryData={data}/>)
    })

    it('should render charts',() => {
        expect(wrapper.find('ReactEcharts').length).toBe(2);
    })
})