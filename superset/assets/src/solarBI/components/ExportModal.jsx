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
import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
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
  notUse: {
    margin: tm.spacing.unit,
  },
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

function ExportModal({ classes, open, onHide }) {
  return (
    <div>
      <MuiThemeProvider theme={theme}>
        <Dialog
          classes={{ paper: classes.dialog }}
          open={open}
          // open={this.props.open}
          onClose={onHide}
          // onClose={this.props.onHide}
          TransitionComponent={Transition}
          keepMounted
        >
          <DialogTitle
            disableTypography
            className={classes.title}
            id="form-dialog-title"
          >
            Export Data
          </DialogTitle>
          <DialogContent>
            <DialogContentText style={{ fontSize: '1.2em' }}>
              The radiation data will start to download in just a second. You
              can close this dialog now.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              className={classes.button}
              onClick={onHide}
              // onClick={this.props.onHide}
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

ExportModal.propTypes = propTypes;

export default withStyles(styles)(ExportModal);
