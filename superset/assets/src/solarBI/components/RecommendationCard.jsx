import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/lab/Slider";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Grid, Row, Col } from "react-bootstrap";

const styles = {
  root: {
    width: 300
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
  }
};

class BillSlider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: 50
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, value) {
    this.setState({ value });
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <Card className={classes.card}>
        <CardContent style={{ margin: "0 20" }}>
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
          <Typography variant="h4" id="label">
            Your recommended solar installation size is:{" "}
            {(value / 3).toFixed(2)} kw
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

BillSlider.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(BillSlider);
