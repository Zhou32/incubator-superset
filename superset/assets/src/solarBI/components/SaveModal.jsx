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
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// import { Alert, Radio } from "react-bootstrap";
import Select from "react-select";
import { t } from "@superset-ui/translation";
import { saveSolarData } from "../actions/solarActions";
import { supersetURL } from "../../utils/common";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Slide from "@material-ui/core/Slide";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
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
  // actions: PropTypes.object,
  // form_data: PropTypes.object,
  // userId: PropTypes.string.isRequired,
  // dashboards: PropTypes.array,
  // alert: PropTypes.string
  // slice: PropTypes.object,
  // datasource: PropTypes.object
};

const styles = theme => ({
  modal: {
    position: "absolute",
    width: theme.spacing.unit * 60,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
    padding: theme.spacing.unit * 4
  },
  input: {
    width: "100%",
    height: 40,
    fontSize: 20
  },
  button: {
    marginTop: 20,
    fontSize: 12,
    color: "white",
    float: "right"
  },
  divider: {
    marginTop: 15,
    marginBottom: 12
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
    // marginTop: 40,
    // width: "100%"
  },
  resize: {
    fontSize: 20
  }
});

class SaveModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saveToDashboardId: null,
      newDashboardName: "",
      newSliceName: "",
      dashboards: [],
      alert: null,
      action: props.can_overwrite ? "overwrite" : "saveas",
      addToDash: "noSave",
      vizType: props.form_data.viz_type
    };
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
    this.setState({ alert: null });
    const sliceParams = {};

    let sliceName = null;
    sliceParams.action = this.state.action;
    if (this.props.slice && this.props.slice.slice_id) {
      sliceParams.slice_id = this.props.slice.slice_id;
    }
    if (sliceParams.action === "saveas") {
      sliceName = this.state.newSliceName;
      if (sliceName === "") {
        this.setState({ alert: t("Please enter a chart name") });
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

  removeAlert() {
    this.setState({ alert: null });
  }

  render() {
    const { classes } = this.props;
    const canNotSaveToDash = true;
    return (
      <div>
        <Modal
          aria-describedby="simple-modal-description"
          open={this.props.open}
          onClose={this.props.onHide}
          disableAutoFocus
        >
          <Slide direction="up" in={this.props.open} mountOnEnter unmountOnExit>
            <div style={{ top: "35%", left: "35%" }} className={classes.modal}>
              <Typography variant="h4" id="modal-title">
                Save Chart
              </Typography>
              <Divider light className={classes.divider} />
              <TextField
                label="Chart Name"
                className={classes.input}
                onChange={this.onChange.bind(this, "newSliceName")}
                inputProps={{
                  "aria-label": "Save"
                }}
                InputLabelProps={{
                  style: {
                    fontSize: 16
                  }
                }}
                InputProps={{
                  style: {
                    fontSize: 16
                  }
                }}
              />
              {/* <TextField
                id="outlined-email-input"
                label="Email"
                className={classes.textField}
                margin="normal"
                // inputProps={{
                //   style: {
                //     fontSize: "1.5rem"
                //   }
                // }}
                // InputProps={{
                //   classes: {
                //     input: classes.resize
                //   }
                // }}
                // InputLabelProps={{
                //   classes: {
                //     root: classes.resize
                //   }
                // }}
                name="email"
                variant="outlined" */}
              <MuiThemeProvider theme={theme}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.saveOrOverwrite.bind(this, true)}
                  className={classes.button}
                >
                  Save
                </Button>
              </MuiThemeProvider>
            </div>
          </Slide>
        </Modal>
      </div>

      // <Modal show onHide={this.props.onHide} bsStyle="large">
      //   <Modal.Header closeButton>
      //     <Modal.Title>{t("Save A Chart")}</Modal.Title>
      //   </Modal.Header>
      //   <Modal.Body>
      //     {(this.state.alert || this.props.alert) && (
      //       <Alert>
      //         {this.state.alert ? this.state.alert : this.props.alert}
      //         <i
      //           className="fa fa-close pull-right"
      //           onClick={this.removeAlert.bind(this)}
      //           style={{ cursor: "pointer" }}
      //         />
      //       </Alert>
      //     )}
      //     {this.props.slice && (
      //       <Radio
      //         id="overwrite-radio"
      //         disabled={!this.props.can_overwrite}
      //         checked={this.state.action === "overwrite"}
      //         onChange={this.changeAction.bind(this, "overwrite")}
      //       >
      //         {t("Overwrite chart %s", this.props.slice.slice_name)}
      //       </Radio>
      //     )}

      //     <Radio
      //       id="saveas-radio"
      //       inline
      //       checked={this.state.action === "saveas"}
      //       onChange={this.changeAction.bind(this, "saveas")}
      //     >
      //       {" "}
      //       {t("Save as")} &nbsp;
      //     </Radio>
      //     <input
      //       name="new_slice_name"
      //       placeholder={t("[chart name]")}
      //       onChange={this.onChange.bind(this, "newSliceName")}
      //       onFocus={this.changeAction.bind(this, "saveas")}
      //     />
      //   </Modal.Body>

      //   <Modal.Footer>
      //     <Button
      //       type="button"
      //       id="btn_modal_save"
      //       className="btn pull-left"
      //       onClick={this.saveOrOverwrite.bind(this, true)}
      //     >
      //       {t("Save")}
      //     </Button>
      //   </Modal.Footer>
      // </Modal>
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

export { SaveModal };
export default withStyles(styles)(
  connect(
    mapStateToProps,
    { saveSolarData }
  )(SaveModal)
);
