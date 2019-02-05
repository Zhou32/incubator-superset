import React from 'react';
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
} from 'react-places-autocomplete';

export default class LocationSearchBox extends React.Component {
    // componentDidMount() {
    //   if (typeof google === 'undefined') {
    //     console.warn('Google Places was not initialized. LocationSearchBox will not function.');
    //     return;
    //   }
    //
    //   const { country, onPlaceChanged } = this.props;
    //   const { places } = google.maps;
    //
    //   let options;
    //
    //   if (country) {
    //     options = {
    //       componentRestrictions: { country }
    //     };
    //   }
    //
    //   const input = this.locationSearch;
    //
    //   if (!input.autoComplete) {
    //     input.autoComplete = new places.Autocomplete(input, options);
    //
    //     input.autoComplete.addListener('place_changed', (() => {
    //       onPlaceChanged && onPlaceChanged(input.autoComplete.getPlace());
    //     }).bind(input.autoComplete));
    //   }
    // }

    // render() {
    //   return (
    //       <TextField autoComplete={new google.maps.places.Autocomplete(this.props.value)} placeholder="Search nearby"/>
    //   );
    // }


    constructor(props) {
        super(props);
        this.state = { address: '' };
    }

    handleChange(address) {
        this.setState({ address });
    };

    handleSelect(address) {
        geocodeByAddress(address)
            .then(results => getLatLng(results[0]))
            .then(latLng => console.log('Success', latLng))
            .catch(error => console.error('Error', error));
    };

    render() {
        return (
            <PlacesAutocomplete
                value={this.state.address}
                onChange={this.handleChange}
                onSelect={this.handleSelect}
            >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                    <div>
                        <input
                            {...getInputProps({
                                placeholder: 'Search Places ...',
                                className: 'location-search-input',
                            })}
                        />
                        <div className="autocomplete-dropdown-container">
                            {loading && <div>Loading...</div>}
                            {suggestions.map(suggestion => {
                                const className = suggestion.active
                                    ? 'suggestion-item--active'
                                    : 'suggestion-item';
                                // inline style for demonstration purpose
                                const style = suggestion.active
                                    ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                    : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                return (
                                    <div
                                        {...getSuggestionItemProps(suggestion, {
                                            className,
                                            style,
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
        );
    }

}

