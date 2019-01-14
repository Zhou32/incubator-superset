import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Grid, Row, Col, Alert } from "react-bootstrap";
import Button from "@material-ui/core/Button";
import { fetchSolarData, addSuccessToast } from "../actions/solarActions";
import Loading from "./Loading";
import classNames from "classnames";
import withWidth from "@material-ui/core/withWidth";
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

class WelcomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { width } = this.props;
    const isSmallScreen = /xs|sm|md/.test(width);
    const buttonProps = {
      size: isSmallScreen ? "medium" : "large"
    };

    return <div />;
  }
}

MapView.propTypes = propTypes;

export default withWidth()(MapView);
