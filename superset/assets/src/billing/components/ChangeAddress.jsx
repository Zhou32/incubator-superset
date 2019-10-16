import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';


function ChangeAddress({
  open,
  handleChangeAddressClose,
  billingValues,
  handleChange,
  setBillingValues,
}) {
  const [newAddress, setNewAddress] = useState({
    country: billingValues.country,
    line1: billingValues.line1,
    line2: billingValues.line2,
    city: billingValues.city,
    state: billingValues.state,
    postal_code: billingValues.postal_code,
  });

  const handleNewAddressChange = name => (event) => {
    setNewAddress({ ...newAddress, [name]: event.target.value });
  };

  const [country, setCountry] = useState(newAddress.country);
  const [region, setRegion] = useState(newAddress.state);

  const selectCountry = (val) => {
    setCountry(val);
    setNewAddress({ ...newAddress, country: val });
  };

  const selectRegion = (val) => {
    setRegion(val);
    setNewAddress({ ...newAddress, state: val });
  };

  const handleClick = () => {
    setBillingValues({
      ...billingValues,
      country: newAddress.country,
      line1: newAddress.line1,
      line2: newAddress.line2,
      city: newAddress.city,
      state: newAddress.state,
      postal_code: newAddress.postal_code,
    });
    handleChangeAddressClose();
  };

  return (
    <div>
      <Dialog open={open} onClose={handleChangeAddressClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
        <DialogContent>
          <div>
            <CountryDropdown
              valueType="short"
              value={country}
              onChange={val => selectCountry(val)}
            />
          </div>
          <TextField
            margin="normal"
            id="line1"
            label="Address Line 1"
            fullWidth
            value={newAddress.line1}
            onChange={handleNewAddressChange('line1')}
          />
          <TextField
            margin="normal"
            id="line2"
            label="Address Line 2"
            fullWidth
            value={newAddress.line2}
            onChange={handleNewAddressChange('line2')}
          />
          <TextField
            margin="normal"
            id="city"
            label="City"
            fullWidth
            value={newAddress.city}
            onChange={handleNewAddressChange('city')}
          />
          <div>
            <RegionDropdown
              style={{ width: 150 }}
              countryValueType="short"
              valueType="short"
              blankOptionLabel="State"
              defaultOptionLabel="State"
              country={country}
              value={region}
              onChange={val => selectRegion(val)}
            />
          </div>
          <TextField
            margin="normal"
            id="postal"
            label="Postal Code"
            fullWidth
            value={newAddress.postal_code}
            onChange={handleNewAddressChange('postal_code')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClick} color="primary">
            Change
          </Button>
          <Button onClick={handleChangeAddressClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

ChangeAddress.propTypes = {
  open: PropTypes.bool.isRequired,
  handleChangeAddressClose: PropTypes.func.isRequired,
  billingValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  setBillingValues: PropTypes.func.isRequired,
};

export default ChangeAddress;
