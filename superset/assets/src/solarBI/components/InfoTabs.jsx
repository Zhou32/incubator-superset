import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Grid, Row, Col } from "react-bootstrap";
import IconBtn from "./IconBtn";

const styles = {

}

class InfoTabs extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      tabValue=0,
    };
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  handleTabChange(event, tabValue) {
    this.setState({ tabValue });
  }
}
