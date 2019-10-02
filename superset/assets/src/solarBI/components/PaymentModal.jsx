/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint camelcase: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeStyles, createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
// import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { StripeProvider, Elements } from 'react-stripe-elements';
import PaymentForm from './PaymentForm';
import { saveSolarData } from '../actions/solarActions';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      main: '#0063B0',
    },
  },
});

const propTypes = {

};

const useStyles = makeStyles({
  button: {
    fontSize: '1.2em',
  },
  modal: {
    position: 'absolute',
    width: theme.spacing(60),
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    padding: theme.spacing(4),
  },
  payBtn: {
    margin: '10 0',
    height: 40,
    padding: '0 16px',
    minWidth: 115,
    borderRadius: 60,
    color: 'white',
    backgroundColor: '#0063B0',
    border: 'none',
    fontSize: 16,
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 'bold',
    float: 'right',
    '&:hover': {
      color: 'white',
      backgroundColor: '#034980',
    },
  },
  dialog: {
    width: '80%',
    padding: 10,
  },
  title: {
    fontSize: '1.6em',
  },
  resize: {
    fontSize: 20,
  },
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function PaymentModal() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // handleRequestData() {
  //   const sDate = new Date(this.state.startDate);
  //   const eDate = new Date(this.state.endDate);
  //   if (sDate > eDate) {
  //     alert('Start date cannot be later than end date!'); // eslint-disable-line no-alert
  //   } else if (new Date(sDate) < new Date('1990-01-01') ||
  //     new Date(eDate) > new Date('2019-07-31')) {
  //     alert('Available date: 01/01/1990 ~ 31/07/2019.'); // eslint-disable-line no-alert
  //   } else {
  //     const queryData = {
  //       lat: this.props.solarBI.queryResponse.data.lat + '',
  //       lng: this.props.solarBI.queryResponse.data.lng + '',
  //       startDate: this.state.startDate,
  //       endDate: this.state.endDate,
  //       type: this.state.type,
  //       resolution: this.state.resolution,
  //       datasource_id: this.props.solarBI.queryResponse.form_data.datasource_id,
  //       datasource_type: this.props.solarBI.queryResponse.form_data.datasource_type,
  //       viz_type: this.props.solarBI.queryResponse.form_data.viz_type,
  //       radius: this.props.solarBI.queryResponse.radius,
  //       spatial_address: { ...this.props.solarBI.queryResponse.form_data.spatial_address },
  //       address_name: this.props.address.slice(0, -11),
  //     };
  //     this.props.onHide();
  //     this.props.requestSolarData(queryData)
  //       .then((json) => {
  //         if (json.type === 'REQEUST_SOLAR_DATA_SUCCEEDED') {
  //           window.location = '/solar/list';
  //         }
  //       });
  //   }
  // }

  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <Button className={classes.payBtn} onClick={handleClickOpen} color="primary">Pay</Button>
        <Dialog
          classes={{ paper: classes.dialog }}
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
          TransitionComponent={Transition}
          keepMounted
        >
          <DialogTitle
            disableTypography
            className={classes.title}
            id="form-dialog-title"
          >
            Save Chart
          </DialogTitle>
          <DialogContent>
            <DialogContentText style={{ fontSize: '1.2em' }}>
              To save the chart, please enter a name here.
            </DialogContentText>

            <StripeProvider apiKey="pk_test_lI5CLi35jT3cdstUruHCnyNh005vklotw2">
              <Elements>
                <PaymentForm />
              </Elements>
            </StripeProvider>

            {/* <TextField
              // error={this.state.alert}
              autoFocus
              margin="dense"
              id="name"
              label="Chart Name"
              fullWidth
              onChange={this.onChange.bind(this, 'newSliceName')}
              InputLabelProps={{
                style: {
                  fontSize: '1.2em',
                },
              }}
              InputProps={{
                style: {
                  fontSize: '1.2em',
                },
              }}
            /> */}
          </DialogContent>
          <DialogActions>
            <Button
              className={classes.button}
              color="primary"
            >
              Save
            </Button>
            <Button
              className={classes.button}
              onClick={handleClose}
              color="primary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </React.Fragment>
  );
}

PaymentModal.propTypes = propTypes;

const mapStateToProps = state => ({
  solarBI: state.solarBI,
});

export default connect(
  mapStateToProps,
  { saveSolarData },
)(PaymentModal);

