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
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { requestSolarData } from '../actions/solarActions';

const propTypes = {
  classes: PropTypes.object.isRequired,
  solarBI: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  requestSolarData: PropTypes.func.isRequired,
};

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      main: '#489795',
    },
  },
});


const styles = tm => ({
  button: {
    fontSize: '1.2em',
  },
  dialog: {
    width: '80%',
    padding: 10,
  },
  title: {
    fontSize: '1.6em',
  },
  formLabel: {
    fontSize: '1.4rem',
    width: '10%',
    float: 'left',
    borderBottom: 'none',
    marginTop: '12px',
    marginRight: '20px',
  },
  formControl: {
    width: '90%',
    display: 'inline-block',
    margin: theme.spacing.unit * 2,
  },
  formControlLabel: {
    fontSize: '1.5rem',
  },
  typeGroup: {
    flexDirection: 'row',
    width: '70%',
    float: 'left',
  },
  resolutionGroup: {
    flexDirection: 'row',
    width: '80%',
    float: 'left',
  },
  notUse: {
    margin: tm.spacing.unit,
  },
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class ExportModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      type: 'dni',
      startDate: '2017-01-01',
      endDate: '2018-01-01',
      resolution: 'hourly',
    };

    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.handleResolutionChange = this.handleResolutionChange.bind(this);
    this.handleRequestData = this.handleRequestData.bind(this);
  }

  handleTypeChange(event) {
    this.setState({ type: event.target.value });
  }

  handleStartDateChange(event) {
    this.setState({ startDate: event.target.value });
  }

  handleEndDateChange(event) {
    this.setState({ endDate: event.target.value });
  }

  handleResolutionChange(event) {
    this.setState({ resolution: event.target.value });
  }

  handleRequestData() {
    const sDate = new Date(this.state.startDate);
    const eDate = new Date(this.state.endDate);
    if (sDate > eDate) {
      alert('Start date cannot be later than end date!'); // eslint-disable-line no-alert
    } else {
      const queryData = {
        lat: this.props.solarBI.queryResponse.data.lat + '',
        lng: this.props.solarBI.queryResponse.data.lng + '',
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        type: this.state.type,
        resolution: this.state.resolution,
      };
      this.props.requestSolarData(queryData);
      this.props.onHide();
    }
  }

  render() {
    const { classes, open, onHide } = this.props;
    const { startDate, endDate } = this.state;

    return (
      <div>
        <MuiThemeProvider theme={theme}>
          <Dialog
            classes={{ paper: classes.dialog }}
            open={open}
            onClose={onHide}
            TransitionComponent={Transition}
            keepMounted
          >
            <DialogTitle
              disableTypography
              className={classes.title}
              id="form-dialog-title"
            >
              Options
            </DialogTitle>
            <DialogContent>
              <FormLabel classes={{ root: classes.formLabel }} component="legend">Length</FormLabel>
              <TextField
                id="date"
                label="Start"
                type="date"
                value={startDate}
                onChange={this.handleStartDateChange}
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                id="date"
                label="End"
                type="date"
                value={endDate}
                onChange={this.handleEndDateChange}
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel classes={{ root: classes.formLabel }} component="legend">Type</FormLabel>
                <RadioGroup
                  aria-label="type"
                  name="type"
                  className={classes.typeGroup}
                  value={this.state.type}
                  onChange={this.handleTypeChange}
                >
                  <FormControlLabel classes={{ label: classes.formControlLabel }} value="dni" control={<Radio />} label="DNI" />
                  <FormControlLabel classes={{ label: classes.formControlLabel }} value="ghi" control={<Radio />} label="GHI" />
                  <FormControlLabel classes={{ label: classes.formControlLabel }} value="both" control={<Radio />} label="Download Both" />
                </RadioGroup>
              </FormControl>

              <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel classes={{ root: classes.formLabel }} component="legend">Resolution</FormLabel>
                <RadioGroup
                  aria-label="resolution"
                  name="resolution"
                  className={classes.resolutionGroup}
                  value={this.state.resolution}
                  onChange={this.handleResolutionChange}
                >
                  <FormControlLabel classes={{ label: classes.formControlLabel }} value="hourly" control={<Radio />} label="Hourly" />
                  <FormControlLabel classes={{ label: classes.formControlLabel }} value="daily" control={<Radio />} label="Daily" />
                  {/* <FormControlLabel classes={{ label: classes.formControlLabel }} value="weekly" control={<Radio />} label="Weekly" /> */}
                  <FormControlLabel classes={{ label: classes.formControlLabel }} value="monthly" control={<Radio />} label="Monthly" />
                </RadioGroup>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button
                className={classes.button}
                onClick={this.handleRequestData}
                color="primary"
              >
                Request
              </Button>

              <Button
                className={classes.button}
                onClick={onHide}
                color="primary"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </MuiThemeProvider>
      </div>
    );
  }
}

ExportModal.propTypes = propTypes;

const mapStateToProps = state => ({
  solarBI: state.solarBI,
});

export default withStyles(styles)(
  connect(
    mapStateToProps,
    { requestSolarData },
  )(ExportModal),
);
