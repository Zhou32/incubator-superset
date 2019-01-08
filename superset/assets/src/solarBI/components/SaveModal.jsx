/* eslint camelcase: 0 */
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Select from "react-select";
import { t } from "@superset-ui/translation";
import { saveSolarData } from "../actions/solarActions";
import { supersetURL } from "../../utils/common";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
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
  // can_overwrite: PropTypes.bool,
  onHide: PropTypes.func.isRequired
  // actions: PropTypes.object
};

const styles = theme => ({
  modal: {
    position: "absolute",
    width: theme.spacing.unit * 60,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
    padding: theme.spacing.unit * 4
  },
  button: {
    fontSize: "1.2em"
  },
  dialog: {
    width: "80%",
    padding: 10
  },
  title: {
    fontSize: "1.6em"
  },
  resize: {
    fontSize: 20
  }
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class SaveModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saveToDashboardId: null,
      newDashboardName: "",
      newSliceName: "",
      dashboards: [],
      alert: false,
      action: props.can_overwrite ? "overwrite" : "saveas",
      addToDash: "noSave",
      vizType: props.form_data.viz_type
    };

    this.handleClose = this.handleClose.bind(this);
    this.saveOrOverwrite = this.saveOrOverwrite.bind(this);
  }

  onChange(name, event) {
    switch (name) {
      case "newSliceName":
        this.setState({ newSliceName: event.target.value });
        break;
      case "saveToDashboardId":
        this.setState({ saveToDashboardId: event.value });
        this.changeDash("existing");
        break;
      case "newDashboardName":
        this.setState({ newDashboardName: event.target.value });
        break;
      default:
        break;
    }
  }

  changeAction(action) {
    this.setState({ action });
  }

  changeDash(dash) {
    this.setState({ addToDash: dash });
  }

  saveOrOverwrite(gotodash) {
    this.setState({ alert: false });
    const sliceParams = {};

    let sliceName = null;
    sliceParams.action = this.state.action;
    if (this.props.slice && this.props.slice.slice_id) {
      sliceParams.slice_id = this.props.slice.slice_id;
    }
    if (sliceParams.action === "saveas") {
      sliceName = this.state.newSliceName;
      if (sliceName === "") {
        this.setState({ alert: true });
        return;
      }
      sliceParams.slice_name = sliceName;
    } else {
      sliceParams.slice_name = this.props.slice.slice_name;
    }

    this.props
      .saveSolarData(this.props.form_data, sliceParams)
      .then(({ data }) => {
        console.log(data);
        // Go to new slice url or dashboard url
        if (gotodash) {
          // window.location = data.slice.slice_url;
          window.location = "/solar/list";
        }
      });
    this.props.onHide();
  }

  handleClose() {
    this.setState({ alert: false });
    this.props.onHide();
  }

  render() {
    const { classes } = this.props;
    const canNotSaveToDash = true;
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
              Save Chart
            </DialogTitle>
            <DialogContent>
              <DialogContentText style={{ fontSize: "1.2em" }}>
                To save the chart, please enter a name here.
              </DialogContentText>
              <TextField
                error={this.state.alert}
                autoFocus
                margin="dense"
                id="name"
                label="Chart Name"
                fullWidth
                onChange={this.onChange.bind(this, "newSliceName")}
                InputLabelProps={{
                  style: {
                    fontSize: "1.2em"
                  }
                }}
                InputProps={{
                  style: {
                    fontSize: "1.2em"
                  }
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                className={classes.button}
                onClick={this.handleClose}
                color="primary"
              >
                Cancel
              </Button>
              <Button
                className={classes.button}
                onClick={() => this.saveOrOverwrite(true)}
                color="primary"
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </MuiThemeProvider>
      </div>
    );
  }
}

SaveModal.propTypes = propTypes;

function mapStateToProps({ explore, saveModal }) {
  return {
    // datasource: explore.datasource,
    // slice: explore.slice,
    // can_overwrite: explore.can_overwrite,
    // userId: explore.user_id,
    // dashboards: saveModal.dashboards,
    // alert: saveModal.saveModalAlert
  };
}

export default withStyles(styles)(
  connect(
    mapStateToProps,
    { saveSolarData }
  )(SaveModal)
);
