import React from 'react';
import TextField from '@material-ui/core/TextField';



export default class LocationSearchBox extends React.Component {
     constructor(props) {
         super(props);
         this.state={
             address:props.address
         }
     }

    componentDidMount() {
        if (typeof google === 'undefined') {
            console.warn('Google Places was not initialized. LocationSearchBox will not function.');
            return;
        }

        const {country, onPlaceChanged} = this.props;
        const {places} = google.maps;

        let options;


        options = {
            componentRestrictions: {'country':"AU"}
        };

        const input = this.locationSearch;
        if (input) {


            if (!input._autocomplete) {
                input._autocomplete = new places.Autocomplete(input, options);

                input._autocomplete.addListener('place_changed', (() => {
                    onPlaceChanged && onPlaceChanged(input._autocomplete.getPlace());
                }).bind(input._autocomplete));
            }
        }
    }

    render() {
        return (
            <TextField
                label="Search address"
                style={{width: '100%'}}
                variant="outlined"
                inputRef={ref => (this.locationSearch = ref)}
                inputProps={{
                    style: {
                        fontSize: 18
                    }
                }}
                InputLabelProps={{
                    style: {
                        fontSize: 16
                    }
                }}
                disabled={!!this.state.address}
                defaultValue={this.state.address}
            />

        );
    }
}
