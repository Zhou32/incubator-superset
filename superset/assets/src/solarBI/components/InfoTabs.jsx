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
  envCard: {
    minWidth: 850,
    minHeight: 180,
    marginTop: 20
  },
  financeCard: {
    minWidth: 850,
    minHeight: 200,
    marginTop: 20
  },
  textField: {
    marginLeft: 20,
    marginRight: 20
  },
  cardContent: {
    margin: "0 20"
  },
  typography: {
    textAlign: "center"
  }
});

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

class InfoTabs extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      tabValue:0
    }
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  componentDidMount(){
    console.log("Loading Info tabs");
  }

  handleTabChange(event, tabValue) {
    this.setState({ tabValue });
  }

  render(){
    const {classes} = this.props;
    let tabValue = this.state.tabValue;
    return(
      <div>
      <Card className={classes.financeCard}>
        <CardContent className={classes.cardContent}>
          <IconBtn content="Based on your usage, Project Sunroof can recommend the optimal solar installation size that can fit on your roof." />
          <Typography variant="h4" id="label" className={classes.typography}>
            Your potential environmental impact
          </Typography>
          <AppBar position="static" color="default">
            <Tabs
              value={tabValue}
              variant="fullWidth"
              onChange={this.handleTabChange}
              inkBarStyle={{background: 'green'}}
              // centered
            >
              <Tab label="Item One" />
              <Tab label="Item Two" />
              <Tab label="Item Three" />
            </Tabs>
          </AppBar>
          {tabValue === 0 && <TabContainer>Item One</TabContainer>}
          {tabValue === 1 && <TabContainer>Item Two</TabContainer>}
          {tabValue === 2 && <TabContainer>Item Three</TabContainer>}
        </CardContent>
      </Card>
      </div>
    )
  }
}

InfoTabs.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(InfoTabs);
