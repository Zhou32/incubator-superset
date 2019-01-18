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
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import IconBtn from "./IconBtn";
import SaveModal from "./SaveModal";
import ExportModal from "./ExportModal";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import SaveIcon from "@material-ui/icons/Save";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";

const styles = theme => ({
  root: {
    display: "flex"
  },
  slider: {
    padding: "22px 0px"
  },
  card: {
    minWidth: 450
  },
  infoCard: {
    minHeight: 200,
    marginTop: 10,
    marginBottom: 100
  },
  cardContent: {
    margin: "0 20"
  },
  typography: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30
  },
  icon: {
    color: "#09290f",
    backgroundColor: "#489795",
    transform: "scale(1.4)",
    margin: "15 20"
  },
  tooltip: {
    fontSize: 14
  },
  tabContainer: {
    fontWeight: 300
  }
});

const tabHeadStyles = {
  fontSize: 20,
  textTransform: "none"
};

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      main: "#489795"
    },
    secondary: {
      main: "#8E44AD"
    }
  }
});

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3, fontSize: 20 }}>
      {props.children}
    </Typography>
  );
}

class InfoTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0
    };
    this.handleTabChange = this.handleTabChange.bind(this);
    this.onBackClick = this.onBackClick.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.onExportClick = this.onExportClick.bind(this);
  }

  onBackClick() {
    this.props.onBackClick();
  }

  onSaveClick() {
    this.props.onSaveClick();
  }

  onExportClick() {
    this.props.onExportClick();
  }

  getCSVURL() {
    return this.props.getCSVURL();
  }

  handleTabChange(event, tabValue) {
    this.setState({ tabValue });
  }

  render() {
    const { classes } = this.props;
    let tabValue = this.state.tabValue;
    return (
      <div>
        <Card className={classes.infoCard} md={6} xs={3}>
          <CardContent className={classes.cardContent}>
            <IconBtn content="Based on your usage, Project Sunroof can recommend the optimal solar installation size that can fit on your roof." />
            <Typography
              variant="h3"
              id="label"
              className={classes.typography}
              style={{ marginBottom: "35px" }}
            >
              Need more?
            </Typography>
            <AppBar position="static" color="default">
              <Tabs
                id="tabs"
                value={tabValue}
                variant="fullWidth"
                onChange={this.handleTabChange}
                indicatorColor="secondary"
              >
                <Tab id="tab1" label="Solar Solution" style={tabHeadStyles} />
                <Tab id="tab2" label="Energy Profile" style={tabHeadStyles} />
                <Tab id="tab3" label="Business Case" style={tabHeadStyles} />
              </Tabs>
            </AppBar>
            {tabValue === 0 && (
              <TabContainer>
                <p style={{ fontWeight: 300 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Vivamus felis nulla, feugiat non efficitur et, pharetra sed
                  orci. Donec commodo sapien in nisi scelerisque dignissim.
                  Nullam ut orci eu ligula blandit aliquam. Sed eget convallis
                  dolor. Donec vulputate elit at elit tincidunt convallis. Etiam
                  porttitor, lacus vel pretium porta, dolor ante aliquam magna,
                  sed accumsan arcu purus pulvinar metus.
                </p>
              </TabContainer>
            )}
            {tabValue === 1 && (
              <TabContainer>
                <p style={{ fontWeight: 300 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
                  rutrum quam sem, ut vulputate nulla faucibus eu. Sed eu augue
                  sed magna luctus iaculis placerat et neque. Nulla sed quam ut
                  libero semper vestibulum vel ut sapien. Integer rutrum metus
                  sed velit aliquam viverra. Sed consequat sit amet ligula sed
                  laoreet.
                </p>
              </TabContainer>
            )}
            {tabValue === 2 && (
              <TabContainer>
                <p style={{ fontWeight: 300 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                  sit amet egestas nibh, nec ornare lectus. Donec tristique
                  justo sit amet placerat placerat. Maecenas et eros non est
                  tincidunt aliquet. Suspendisse euismod consectetur odio.
                  Nullam fermentum sem vel turpis faucibus iaculis.
                </p>
              </TabContainer>
            )}
            <Tooltip title="Go Back" classes={{ tooltip: classes.tooltip }}>
              <IconButton
                id="backIcon"
                className={classes.icon}
                onClick={this.onBackClick}
              >
                <KeyboardBackspaceIcon />
              </IconButton>
            </Tooltip>
            <div style={{ float: "right" }}>
              {this.props.can_save && this.props.solar_new && (
                <Tooltip title="Save" classes={{ tooltip: classes.tooltip }}>
                  <IconButton
                    id="saveIcon"
                    className={classes.icon}
                    onClick={this.onSaveClick}
                  >
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              )}
              {this.props.can_export && (
                <Tooltip
                  title="Export As CSV"
                  classes={{ tooltip: classes.tooltip }}
                >
                  <IconButton
                    id="exportIcon"
                    className={classes.icon}
                    href={this.getCSVURL()}
                    onClick={this.onExportClick}
                  >
                    <CloudDownloadIcon />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

InfoTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  onBackClick: PropTypes.func.isRequired,
  onSaveClick: PropTypes.func.isRequired,
  onExportClick: PropTypes.func.isRequired,
  getCSVURL: PropTypes.func.isRequired,
  can_save: PropTypes.bool.isRequired,
  can_export: PropTypes.bool.isRequired,
  solar_new: PropTypes.bool.isRequired
};

export default withStyles(styles)(InfoTabs);
