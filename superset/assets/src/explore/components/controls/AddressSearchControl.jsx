import React from "react";
import PropTypes from "prop-types";
import ControlHeader from "../ControlHeader";

import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";

const propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.object,
  choices: PropTypes.array
};

const defaultProps = {
  onChange: () => {},
  animation: true,
  choices: []
};

export default class AddressSearchControl extends React.Component {
  constructor(props) {
    super(props);
    const v = props.value || {};
    this.state = {
      type: "latlong",
      latCol: v.latCol,
      lonCol: v.lonCol,
      address: "",
      value: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  setType(type) {
    this.setState({ type });
  }

  handleChange(address) {
    this.setState({ address });
    this.props.onChange(address, []);
  }

  handleSelect(address) {
    this.setState({ address });

    geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        console.log("Success", latLng);
        let value = {
          lat: latLng.lat,
          lon: latLng.lng,
          latCol: "longitude",
          lonCol: "latitude",
          type: this.state.type
        };

        console.log("Success11", latLng);
        this.setState({ value });
        this.props.onChange(value, []);
      })
      .catch(error => console.error("Error", error));
  }

  componentDidMount() {
    this.props.onChange(null, []);
  }

  render() {
    return (
      <div>
        <ControlHeader {...this.props} />
        <PlacesAutocomplete
          value={this.state.address}
          onChange={this.handleChange}
          onSelect={this.handleSelect}
        >
          {({
            getInputProps,
            suggestions,
            getSuggestionItemProps,
            loading
          }) => (
            <div>
              <input
                {...getInputProps({
                  placeholder: "Search Places ...",
                  className: "location-search-input"
                })}
                style={{ width: "100%" }}
              />
              <div className="autocomplete-dropdown-container">
                {loading && <div>Loading...</div>}
                {suggestions.map(suggestion => {
                  const className = suggestion.active
                    ? "suggestion-item--active"
                    : "suggestion-item";
                  // inline style for demonstration purpose
                  const style = suggestion.active
                    ? { backgroundColor: "#fafafa", cursor: "pointer" }
                    : { backgroundColor: "#ffffff", cursor: "pointer" };
                  return (
                    <div
                      {...getSuggestionItemProps(suggestion, {
                        className,
                        style
                      })}
                    >
                      <span>{suggestion.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>
      </div>
    );
  }
}

AddressSearchControl.propTypes = propTypes;
AddressSearchControl.defaultProps = defaultProps;
