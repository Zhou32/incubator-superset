import React from "react";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import Fab from "@material-ui/core/Fab";
import InputAdornment from "@material-ui/core/InputAdornment";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Input from "@material-ui/core/Input";
import Search from "@material-ui/icons/Search";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#489795"
    },
    secondary: {
      main: "#FFEBEE"
    }
  },
  typography: {
    useNextVariants: true
  }
});

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 750
  },
  button: {
    margin: "4px",
    fontSize: "13px"
  },
  fab: {
    margin: theme.spacing.unit
  },
  icon: {
    margin: theme.spacing.unit
  },
  input: {
    margin: "70 40",
    height: 60,
    // width: 750,
    width: "90%",
    backgroundColor: "#f6f6f6",
    borderRadius: "3em",
    border: "1px solid dimgray"
    // "&:focus": {
    //   borderColor: "#80bdff",
    //   boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)"
    // }
  },
  inputFocused: {
    // width: 750,
    width: "90%",
    borderColor: "#80bdff",
    boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)"
  },
  card: {
    minHeight: 250
  }
});

class LocationSearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: props.address
    };

    this.onSearchClick = this.onSearchClick.bind(this);
  }

  componentDidMount() {
    if (typeof google === "undefined") {
      console.warn(
        "Google Places was not initialized. LocationSearchBox will not function."
      );
      return;
    }

    const { country, onPlaceChanged } = this.props;
    const { places } = google.maps;
    let options;

    options = {
      componentRestrictions: { country: "AU" }
    };

    const input = this.locationSearch;

    if (input) {
      if (!input._autocomplete) {
        input._autocomplete = new places.Autocomplete(input, options);
        input._autocomplete.addListener(
          "place_changed",
          (() => {
            this.handlePlaceSelect(input._autocomplete.getPlace());
          }).bind(input._autocomplete)
        );
      }
    }
  }

  handlePlaceSelect(addressObject) {
    // let address = addressObject.formatted_address;
    if (addressObject) {
      this.setState({
        address: addressObject
      });
    }
  }

  onChange(name, event) {
    this.setState({
      [name]: event.target.value
    });
  }

  onSearchClick() {
    const { country, onPlaceChanged } = this.props;
    return onPlaceChanged(this.state.address);
  }

  render() {
    const { classes } = this.props;
    const { width } = this.props;

    return (
      <Card className={classes.card}>
        <CardContent>
          <Input
            autoFocus
            placeholder="Address"
            className={classes.input}
            classes={{ focused: classes.inputFocused }}
            inputRef={ref => (this.locationSearch = ref)}
            onChange={this.onChange.bind(this, "address")}
            inputProps={{
              style: {
                fontSize: 18,
                paddingLeft: 10
              }
            }}
            disableUnderline={true}
            endAdornment={
              <MuiThemeProvider theme={theme}>
                <InputAdornment position="end">
                  <Fab
                    size="medium"
                    color="primary"
                    aria-label="Search"
                    className={classes.fab}
                    onClick={this.onSearchClick}
                  >
                    <Search />
                  </Fab>
                </InputAdornment>
              </MuiThemeProvider>
            }
          />
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(LocationSearchBox);
