import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import Popover from "@material-ui/core/Popover";

const styles = theme => ({
  root: {
    display: "flex",
    float: "right"
  },
  icon: {
    float: "right"
  },
  typography: {
    margin: theme.spacing.unit * 2,
    fontSize: 15,
    width: 300
  }
});

class IconBtn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClick(event) {
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
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    const { value } = this.state;

    return (
      <div className={classes.root}>
        <IconButton 
          id="iconButton"
          className={classes.icon}
          onClick={this.handleClick}
        >
          <InfoIcon />
        </IconButton>
        <Popover
          id="simple-popper"
          open={open}
          anchorEl={anchorEl}
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
          <Typography
            id='popContent'
            className={classes.typography}>
            {this.props.content}
          </Typography>
        </Popover>
      </div>
    );
  }
}

IconBtn.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(IconBtn);
