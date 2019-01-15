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
import Button from "@material-ui/core/Button";

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
  financeCard: {
    minHeight: 200,
    marginTop: 10
  },
  cardContent: {
    margin: "0 20"
  },
  typography: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30
  }
});

const tabHeadStyles = {
  fontSize: 20,
  textTransform: "none"
};

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
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
      tabValue:0,
    }
    this.handleTabChange = this.handleTabChange.bind(this);
    this.onBackClick=this.onBackClick.bind(this);
    this.onSaveClick=this.onSaveClick.bind(this);
    this.onExportClick=this.onExportClick.bind(this);
  }

  handleTabChange(event, tabValue) {
    this.setState({ tabValue });
  }

  onBackClick(){
    this.props.onBackClick();
  }

  onSaveClick(){
    this.props.onSaveClick();
  }

  onExportClick(){
    this.props.onExportClick();
  }

  getCSVURL(){
    return this.props.getCSVURL();
  }

  render(){
    const {classes} = this.props;
    let tabValue = this.state.tabValue;
    return (
      <div>
        <MuiThemeProvider theme={theme}>
          <Card className={classes.financeCard} md={6} xs={3}>
            <CardContent className={classes.cardContent}>
              <IconBtn content="Based on your usage, Project Sunroof can recommend the optimal solar installation size that can fit on your roof." />
              <Typography
                variant="h3"
                id="label"
                className={classes.typography}
              >
                Need more?
              </Typography>
              <AppBar position="static" color="default">
                <Tabs
                  value={tabValue}
                  variant="fullWidth"
                  onChange={this.handleTabChange}
                  indicatorColor="secondary"
                >
                  <Tab label="Solar Solution" style={tabHeadStyles} />
                  <Tab label="Energy Profile" style={tabHeadStyles} />
                  <Tab label="Business Case" style={tabHeadStyles} />
                </Tabs>
              </AppBar>
              {tabValue === 0 && (
                <TabContainer>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Vivamus felis nulla, feugiat non efficitur et, pharetra sed
                  orci. Donec commodo sapien in nisi scelerisque dignissim.
                  Nullam ut orci eu ligula blandit aliquam. Sed eget convallis
                  dolor. Donec vulputate elit at elit tincidunt convallis. Etiam
                  porttitor, lacus vel pretium porta, dolor ante aliquam magna,
                  sed accumsan arcu purus pulvinar metus.
                </TabContainer>
              )}
              {tabValue === 1 && (
                <TabContainer>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
                  rutrum quam sem, ut vulputate nulla faucibus eu. Sed eu augue
                  sed magna luctus iaculis placerat et neque. Nulla sed quam ut
                  libero semper vestibulum vel ut sapien. Integer rutrum metus
                  sed velit aliquam viverra. Sed consequat sit amet ligula sed
                  laoreet.
                </TabContainer>
              )}
              {tabValue === 2 && (
                <TabContainer>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                  sit amet egestas nibh, nec ornare lectus. Donec tristique
                  justo sit amet placerat placerat. Maecenas et eros non est
                  tincidunt aliquet. Suspendisse euismod consectetur odio.
                  Nullam fermentum sem vel turpis faucibus iaculis.
                </TabContainer>
              )}
              <Col xsOffset={1} xs={1} md={1} mdOffset={1}>
              <Button
                variant="contained"
                color="primary"
                style={{
                  width: 80,
                  fontSize: 12,
                  color: "white",}}
                  onClick={this.onBackClick}
              >
              Back
              </Button>
            </Col>
            <Col xs={1} xsOffset={6}>
              <Button
                variant="contained"
                color="primary"
                style={{
                  width: 80,
                  fontSize: 12,
                  color: "white",}}
                onClick={this.onSaveClick}
              >
                Save
              </Button>
            </Col>
            <Col xsOffset={2}>
              <Button
                variant="contained"
                  color="primary"
                  style={{
                    width: 80,
                    fontSize: 12,
                    color: "white",
                    marginLeft:30,}}
                  href={this.getCSVURL()}
                  onClick={this.onExportClick}
              >
              Export
              </Button>
            </Col>
            </CardContent>
          </Card>
        </MuiThemeProvider>
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
};

export default withStyles(styles)(InfoTabs);
