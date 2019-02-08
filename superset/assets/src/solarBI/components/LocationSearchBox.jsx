/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import InputAdornment from '@material-ui/core/InputAdornment';
import Input from '@material-ui/core/Input';
import Search from '@material-ui/icons/Search';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';


const propTypes = {
  classes: PropTypes.object.isRequired,
  address: PropTypes.string.isRequired,
  onPlaceChanged: PropTypes.func.isRequired,
};

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#489795',
    },
    secondary: {
      main: '#FFEBEE',
    },
  },
  typography: {
    useNextVariants: true,
  },
});

const styles = tm => ({
  textField: {
    marginLeft: tm.spacing.unit,
    marginRight: tm.spacing.unit,
    width: 750,
  },
  button: {
    margin: '4px',
    fontSize: '13px',
  },
  fab: {
    margin: tm.spacing.unit,
  },
  icon: {
    margin: tm.spacing.unit,
  },
  input: {
    margin: '70 40',
    height: 60,
    width: '90%',
    backgroundColor: '#f6f6f6',
    borderRadius: '3em',
    border: '1px solid dimgray',
  },
  inputFocused: {
    width: '90%',
    borderColor: '#80bdff',
    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
  },
  card: {
    minHeight: 250,
  },
});

class LocationSearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: props.address,
    };

    this.onSearchClick = this.onSearchClick.bind(this);
  }

  /*eslint-disable */
  componentDidMount() {
    if (typeof google === 'undefined') {
      return;
    }

    const { places } = google.maps;
    const options = {
      componentRestrictions: { country: 'AU' },
    };

    const input = this.locationSearch;

    if (input) {
      if (!input._autocomplete) {
        input._autocomplete = new places.Autocomplete(input, options);
        input._autocomplete.addListener(
          'place_changed',
          (() => {
            this.handlePlaceSelect(input._autocomplete.getPlace());
          }).bind(input._autocomplete)
        );
      }
    }
  }
  /* eslint-enable */

  onChange(name, event) {
    this.setState({
      [name]: event.target.value,
    });
  }

  onSearchClick() {
    const { onPlaceChanged } = this.props;
    return onPlaceChanged(this.state.address);
  }

  handlePlaceSelect(addressObject) {
    if (addressObject) {
      this.setState({
        address: addressObject,
      });
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <Card className={classes.card}>
        <CardContent>
          <Input
            autoFocus
            id="inputBox"
            placeholder="Address"
            className={classes.input}
            classes={{ focused: classes.inputFocused }}
            inputRef={ref => (this.locationSearch = ref)} // eslint-disable-line no-return-assign
            onChange={this.onChange.bind(this, 'address')}
            inputProps={{
              style: {
                fontSize: 18,
                paddingLeft: 10,
              },
            }}
            disableUnderline
            endAdornment={
              <MuiThemeProvider theme={theme}>
                <InputAdornment position="end">
                  <Fab
                    id="searchFab"
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

LocationSearchBox.propTypes = propTypes;

export default withStyles(styles)(LocationSearchBox);
