/* eslint camelcase: 0 */
import React from "react";
import PropTypes from "prop-types";
import { Modal, Alert, Button, Radio } from "react-bootstrap";
import Select from "react-select";
import { t } from "@superset-ui/translation";
import { saveSlice } from "../actions/solarActions";

import { supersetURL } from "../../utils/common";

const propTypes = {
  can_overwrite: PropTypes.bool,
  onHide: PropTypes.bool.isRequired,
  actions: PropTypes.object,
  form_data: PropTypes.object,
  userId: PropTypes.string.isRequired,
  dashboards: PropTypes.array,
  alert: PropTypes.string,
  slice: PropTypes.object,
  datasource: PropTypes.object
};

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
      vizType: props.form_data.viz_type,
      show: this.props.onHide
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({ show: nextProps.onHide });
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

    saveSlice(this.props.form_data, sliceParams, data => {
      // Go to new slice url or dashboard url
      if (data.json.slice) {
        window.location = data.json.slice.slice_url;
      }
    });
    this.setState({ show: false });
  }

  removeAlert() {
    this.setState({ alert: null });
  }

  render() {
    const canNotSaveToDash = true;
    return (
      <Modal show={this.state.show} bsStyle="large">
        <Modal.Header closeButton>
          <Modal.Title>{t("Save A Chart")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(this.state.alert || this.props.alert) && (
            <Alert>
              {this.state.alert ? this.state.alert : this.props.alert}
              <i
                className="fa fa-close pull-right"
                onClick={this.removeAlert.bind(this)}
                style={{ cursor: "pointer" }}
              />
            </Alert>
          )}
          {this.props.slice && (
            <Radio
              id="overwrite-radio"
              disabled={!this.props.can_overwrite}
              checked={this.state.action === "overwrite"}
              onChange={this.changeAction.bind(this, "overwrite")}
            >
              {t("Overwrite chart %s", this.props.slice.slice_name)}
            </Radio>
          )}

          <Radio
            id="saveas-radio"
            inline
            checked={this.state.action === "saveas"}
            onChange={this.changeAction.bind(this, "saveas")}
          >
            {" "}
            {t("Save as")} &nbsp;
          </Radio>
          <input
            name="new_slice_name"
            placeholder={t("[chart name]")}
            onChange={this.onChange.bind(this, "newSliceName")}
            onFocus={this.changeAction.bind(this, "saveas")}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            id="btn_modal_save"
            className="btn pull-left"
            onClick={this.saveOrOverwrite.bind(this, false)}
          >
            {t("Save")}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

SaveModal.propTypes = propTypes;

function mapStateToProps({ explore, saveModal }) {
  return {
    datasource: explore.datasource,
    slice: explore.slice,
    can_overwrite: explore.can_overwrite,
    userId: explore.user_id,
    dashboards: saveModal.dashboards,
    alert: saveModal.saveModalAlert
  };
}

export default SaveModal;
