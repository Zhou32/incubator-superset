/* eslint camelcase: 0 */
import React from "react";
import PropTypes from "prop-types";
import { t } from "@superset-ui/translation";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Slide from "@material-ui/core/Slide";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      main: "#489795"
    }
  }
});

const propTypes = {
  open: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired
};

const styles = theme => ({
  button: {
    fontSize: "1.2em"
  },
  dialog: {
    width: "80%",
    padding: 10
  },
  title: {
    fontSize: "1.6em"
  }
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class ExportModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <MuiThemeProvider theme={theme}>
          <Dialog
            classes={{ paper: classes.dialog }}
            open={this.props.open}
            onClose={this.props.onHide}
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
              <DialogContentText style={{ fontSize: "1.2em" }}>
                The radiation data will start to download in just a second. You
                can close this dialog now.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                className={classes.button}
                onClick={this.props.onHide}
                color="primary"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </MuiThemeProvider>

        {/* <Modal
          aria-describedby="simple-modal-description"
          open={this.props.open}
          onClose={this.props.onHide}
          disableAutoFocus
        >
          <Slide direction="up" in={this.props.open} mountOnEnter unmountOnExit>
            <div style={{ top: "35%", left: "35%" }} className={classes.modal}>
              <Typography variant="h4" id="modal-title">
                Your download will start in just a second
              </Typography>
              <MuiThemeProvider theme={theme}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.props.onHide}
                  className={classes.button}
                >
                  Close
                </Button>
              </MuiThemeProvider>
            </div>
          </Slide>
        </Modal> */}
      </div>
    );
  }
}

ExportModal.propTypes = propTypes;

export default withStyles(styles)(ExportModal);
