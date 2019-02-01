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
