import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import Popover from "@material-ui/core/Popover";
import { Grid, Row, Col } from "react-bootstrap";

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
  textField: {
    marginLeft: 20,
    marginRight: 20
  },
  icon: {
    float: "right"
  }
});

class RecomCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: 50,
      anchorEl: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleChange(event, value) {
    this.setState({ value });
  }

  handleClick(even) {
    this.setState({
      anchorEl: event.currentTarget
    });
  }

  handleClose() {
    this.setState({
      anchorEl: null
    });
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardContent style={{ margin: "0 20" }}>
            <IconButton className={classes.icon}>
              <InfoIcon />
            </IconButton>
            <Typography variant="h4" id="label">
              What's your average monthly electric bill?
            </Typography>
            <Typography variant="subtitle1" id="subtitle1">
              We use your bill to estimate how much electricity you use based on
              typical utility rates in your area.
            </Typography>

            <TextField
              id="filled-adornment-amount"
              className={classes.textField}
              variant="filled"
              label="Bill Price"
              value={Math.round(value * 5)}
              // disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                )
              }}
            />
            <div style={{ display: "flex" }}>
              <span>$0</span>
              <Slider
                classes={{ container: classes.slider }}
                value={value}
                aria-labelledby="label"
                onChange={this.handleChange}
              />
              <span>$500</span>
            </div>
          </CardContent>
        </Card>

        <Card className={classes.card}>
          <CardContent style={{ margin: "0 20" }}>
            <IconButton className={classes.icon}>
              <InfoIcon />
            </IconButton>
            <Typography variant="h4" id="label">
              Your recommended solar installation size
            </Typography>
            <Typography variant="subtitle1" id="subtitle1">
              This size will cover about 99% of your electricity usage. Solar
              installations are sized in kilowatts (kW).
            </Typography>

            <Typography variant="h4" id="label">
              {(value / 3).toFixed(2)} kW
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }
}

RecomCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(RecomCard);
