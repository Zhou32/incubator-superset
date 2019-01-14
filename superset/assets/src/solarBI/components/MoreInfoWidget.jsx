import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import CardHeader from "@material-ui/core/CardHeader";
import InfoIcon from "@material-ui/icons/Info";
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
// import IconBtn from "./IconBtn";

const styles = theme => ({
  card: {
    minWidth: 450
  },
  financeCard: {
    minWidth: 850,
    minHeight: 200,
    marginTop: 20
  },
  cardContent: {
    margin: "0 20"
  },
  typography: {
    textAlign: "center"
  },
  popover: {
    margin: theme.spacing.unit * 2,
    fontSize: 15,
    width: 300
  }
});

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

class MoreInfoWidget extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      anchor: null,
      tabValue: 0
    };

    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleTabChange(event, tabValue) {
    this.setState({ tabValue });
  }

  handleClick(event) {
    this.setState({
      anchor: event.currentTarget
    });
  }

  handleClose() {
    this.setState({
      anchor: null
    });
  }

  render() {
    const { classes } = this.props;
    const { tabValue, anchor } = this.state;
    const open = Boolean(anchor);

    return (
      <div>
        <Card className={classes.financeCard}>
          <CardHeader
            action={
              <IconButton style={{ zIndex: 10 }} onClick={this.handleClick}>
                <InfoIcon />
              </IconButton>
            }
          />
          <CardContent className={classes.cardContent}>
            {/* <IconBtn content="Based on your usage, Project Sunroof can recommend the optimal solar installation size that can fit on your roof." /> */}
            <Typography variant="h4" id="label" className={classes.typography}>
              Need More?
            </Typography>
            <AppBar position="static" color="default">
              <Tabs
                value={tabValue}
                variant="fullWidth"
                onChange={this.handleTabChange}
                indicatorColor="secondary"
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
        <Popover
          id="moreinfo-popper"
          open={open}
          anchorEl={anchor}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center"
          }}
        >
          <Typography className={classes.popover}>
            Barchart Lorem Ipsum has been the industry's standard.
          </Typography>
        </Popover>
      </div>
    );
  }
}

MoreInfoWidget.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MoreInfoWidget);
