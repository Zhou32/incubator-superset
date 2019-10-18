import React from 'react';
import PropTypes from 'prop-types';
import ReactEcharts from 'echarts-for-react';
import { makeStyles } from '@material-ui/core/styles';
import { CSVLink } from 'react-csv';

const propTypes = {
  ausState: PropTypes.string.isRequired,
};

const useStyles = makeStyles({
  csvLink: {
    position: 'absolute',
    right: 100,
    top: 9,
    zIndex: 200,
    color: '#424242',
    fontFamily: 'Open Sans,Helvetica,Arial,sans-serif',
    '& span': {
      display: 'none',
      fontSize: 12,
      transform: 'translateY(3px)',
    },
    '&:hover span': {
      top: 0,
      left: -70,
      width: 160,
      margin: 10,
      display: 'block',
      padding: '5px 20px 5px 5px',
      zIndex: 200,
      position: 'absolute',
      textDecoration: 'none',
      color: '#4297bd',
    },
  },
});

function DemoChart({ ausState }) {
  const classes = useStyles();
  const solarDataOfState = {
    VIC: {
      dni: [
        338.5648649, 345.5372024, 299.0188425, 230.7600555, 96.98115747, 109.7361111, 96.98387097,
        136.9386085, 222.2888889, 268.472973, 235.4706704, 283.5507442, 383.7281292,
      ],
      ghi: [
        307.7054054, 282.1636905, 234.4078062, 164.1803051, 93.6218035, 82.79583333, 88.21774194,
        123.2196453, 191.5013889, 242.7878378, 260.9888268, 286.2286874, 328.5868102,
      ],
    },
    NSW: {
      dni: [
        367.0337838, 323.1011905, 319.2113055, 296.9056865, 227.218035, 174.4638889, 217.9193548,
        252.9508197, 273.1777778, 283.1786198, 298.8044693, 415.2489851, 348.6877524,
      ],
      ghi: [
        326.5391892, 288.6815476, 256.4454913, 205.2343967, 149.2032301, 116.8861111, 137.5268817,
        174.670765, 224.0222222, 259.9648173, 287.2849162, 346.623816, 322.0282638,
      ],
    },
    QLD: {
      dni: [
        369.8525034, 332.1369048, 285.3391655, 327, 260.6783311, 235.5236111, 272.4650538,
        329.0532787, 363.3069444, 392.4393531, 363.9401947, 403.1324324, 386.2341857,
      ],
      ghi: [
        331.4262517, 306.3690476, 258.384926, 246.8446602, 194.9757739, 169.0958333, 187.8454301,
        232.6147541, 279.3791667, 317.4784367, 323.9888734, 345.0364865, 330.2476447,
      ],
    },
    NT: {
      dni: [
        299.8013514, 363.0029762, 327.4549125, 315.5270458, 282.9569314, 301.1805556, 307.7795699,
        325.2728513, 373.1041667, 367.7708895, 333.7194444, 390.0755735, 374.0430686,
      ],
      ghi: [
        302.0783784, 320.2514881, 282.3499327, 253.0499307, 211.4199192, 200.6388889, 210.7513441,
        244.8499318, 290.2527778, 314.4555256, 309.8555556, 339.0661269, 329.8734859,
      ],
    },
    WA: {
      dni: [
        264.6400541, 285.4285714, 325.7738896, 254.0402219, 250.3876178, 223.3416667, 282.2916667,
        314.058663, 347.7833333, 374.0581081, 360.9111111, 428.8083671, 317.5431267,
      ],
      ghi: [
        280.7902571, 281.4389881, 269.1318977, 213.7961165, 178.8963661, 150.7097222, 180.0739247,
        219.3533424, 267.7013889, 313.0824324, 317.8097222, 354.3589744, 309.8584906,
      ],
    },
    SA: {
      dni: [
        373.9702703, 347.8303571, 357.0982503, 275.4868239, 232.5248991, 198.5361111, 243.0094086,
        259.7667121, 315.5708333, 300.4380054, 338.3777778, 375.0445344, 368.8627187,
      ],
      ghi: [
        326.6594595, 296.6636905, 272.6716016, 206.517337, 155.4589502, 131.4722222, 152.0322581,
        183.5225102, 241.9277778, 273.1603774, 309.9402778, 333.9325236, 330.2018843,

      ],
    },
    TAS: {
      dni: [
        290.0959459, 199.0550595, 155.0565276, 143.0263523, 80.72139973, 69.66527778, 32.09543011,
        122.0545703, 183.7, 227.1626016, 132.0835655, 286.8108108, 369.769852,
      ],
      ghi: [
        283.1851351, 219.3645833, 166.3432032, 122.1040222, 74.46971736, 59.73611111, 51.81989247,
        101.3206003, 163.5972222, 218.6883469, 208.5654596, 290.2594595, 324.5800808,
      ],
    },
  };

  function getBarchartOption(data) {
    if (data) {
      const dni = data.dni;
      const ghi = data.ghi;
      const xAxisData = [
        '2018/01', '2018/02', '2018/03', '2018/04', '2018/05', '2018/06', '2018/07', '2018/08', '2018/09',
        '2018/10', '2018/11', '2018/12', '2019/01',
        // '2019/02', '2019/03', '2019/04', '2019/05', '2019/06',
        // '2019/07',
      ];

      const option = {
        // title: {
        //   text: 'Solar Irradiation for ' + ausState,
        //   left: 'center',
        // },
        legend: {
          data: ['dni', 'ghi'],
          align: 'left',
          top: 10,
        },
        grid: {
          left: 50,
          right: 50,
        },
        toolbox: {
          feature: {
            saveAsImage: {
              icon: 'image://https://i.ibb.co/LvGQLgf/4444.png',
              pixelRatio: 2,
              title: 'Save As Image',
            },
          },
          right: 50,
          top: 5,
        },
        tooltip: {},
        xAxis: {
          data: xAxisData,
          silent: false,
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          name: '(W/m²)',
        },
        // itemStyle: {
        //   color: '#0063B0',
        // },
        series: [
          {
            name: 'dni',
            type: 'bar',
            data: dni,
            animationDelay(idx) {
              return idx * 20;
            },
          },
          {
            name: 'ghi',
            type: 'bar',
            data: ghi,
            animationDelay(idx) {
              return idx * 20 + 100;
            },
          },
        ],
        animationEasing: 'elasticOut',
        animationDelayUpdate(idx) {
          return idx * 5;
        },
      };

      return option;
    }
    return {};
  }

  const headers = [
    { label: 'Date', key: 'date' },
    { label: 'DNI Data', key: 'dni_data' },
    { label: 'GHI Data', key: 'ghi_data' },
  ];
  const dates = [
    '2018/01', '2018/02', '2018/03', '2018/04', '2018/05', '2018/06', '2018/07', '2018/08', '2018/09',
    '2018/10', '2018/11', '2018/12', '2019/01',
  ];
  const mergedData = [];
  for (let i = 0; i < dates.length; i++) {
    mergedData.push({
      date: dates[i],
      dni_data: solarDataOfState[ausState].dni[i],
      ghi_data: solarDataOfState[ausState].ghi[i],
    });
  }


  return (
    <div style={{ position: 'relative' }}>
      <CSVLink filename={`solar-data-${ausState}.csv`} className={classes.csvLink} data={mergedData} headers={headers}>
        <i className="fas fa-download" /><span>Download As CSV</span>
      </CSVLink>
      <ReactEcharts
        style={{ width: '100%', height: 350 }}
        option={getBarchartOption(solarDataOfState[ausState])}
      />
    </div>
  );
}

DemoChart.propTypes = propTypes;

export default DemoChart;
