import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';


const useStyles = makeStyles({
  button: {
    fontSize: '1.2em',
  },
  helperText: {
    color: 'red',
    fontSize: '12px',
  },
  textInput: {
    fontFamily: 'Montserrat',
    fontSize: '1.5em',
  },
  label: {
    color: '#757575',
    display: 'block',
    marginLeft: 3,
  },
});

function ChangeAddress({
  open,
  handleChangeAddressClose,
  billingValues,
  setBillingValues,
}) {
  const classes = useStyles();

  const [newAddress, setNewAddress] = useState({
    country: billingValues.country,
    line1: billingValues.line1,
    line2: billingValues.line2,
    city: billingValues.city,
    state: billingValues.state,
    postal_code: billingValues.postal_code,
  });

  const [country, setCountry] = useState(billingValues.country);
  const [region, setRegion] = useState(billingValues.state);

  const [countryError, setCountryError] = useState(false);
  const [line1Error, setLine1Error] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [stateError, setStateError] = useState(false);
  const [postalError, setPostalError] = useState(false);

  const handleNewAddressChange = name => (event) => {
    setNewAddress({ ...newAddress, [name]: event.target.value });
  };

  const selectCountry = (val) => {
    setCountry(val);
    setNewAddress({ ...newAddress, country: val });
  };

  const selectRegion = (val) => {
    setRegion(val);
    setNewAddress({ ...newAddress, state: val });
  };

  const handleClick = () => {
    setCountryError(false);
    setLine1Error(false);
    setCityError(false);
    setStateError(false);
    setPostalError(false);
    if (newAddress.country === '') {
      setCountryError(true);
    }
    if (newAddress.line1 === '') {
      setLine1Error(true);
    }
    if (newAddress.city === '') {
      setCityError(true);
    }
    if (newAddress.state === '') {
      setStateError(true);
    }
    if (newAddress.postal_code === '') {
      setPostalError(true);
    }
    if (newAddress.country !== '' && newAddress.line1 !== '' && newAddress.city !== '' &&
      newAddress.state !== '' && newAddress.postal_code !== '') {
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
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleChangeAddressClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
        <DialogContent>
          <div>
            <label className={classes.label} htmlFor="country">Country</label>
            <CountryDropdown
              valueType="short"
              value={country}
              onChange={val => selectCountry(val)}
            />
            {countryError ? <p className={classes.helperText}>* Country required</p> : null}
          </div>
          <TextField
            margin="normal"
            id="line1"
            label="Address Line 1"
            error={line1Error}
            helperText={line1Error ? '* Address line1 required' : ''}
            FormHelperTextProps={{ classes: { root: classes.helperText } }}
            InputProps={{
              classes: { input: classes.textInput },
            }}
            InputLabelProps={{
              style: { fontSize: '1.1em' },
            }}
            fullWidth
            value={newAddress.line1}
            onChange={handleNewAddressChange('line1')}
          />
          <TextField
            margin="normal"
            id="line2"
            label="Address Line 2"
            FormHelperTextProps={{ classes: { root: classes.helperText } }}
            InputProps={{
              classes: { input: classes.textInput },
            }}
            InputLabelProps={{
              style: { fontSize: '1.1em' },
            }}
            fullWidth
            value={newAddress.line2}
            onChange={handleNewAddressChange('line2')}
          />
          <TextField
            margin="normal"
            id="city"
            label="City"
            error={cityError}
            helperText={cityError ? '* City required' : ''}
            FormHelperTextProps={{ classes: { root: classes.helperText } }}
            InputProps={{
              classes: { input: classes.textInput },
            }}
            InputLabelProps={{
              style: { fontSize: '1.1em' },
            }}
            fullWidth
            value={newAddress.city}
            onChange={handleNewAddressChange('city')}
          />
          <div style={{ marginTop: 15 }}>
            <label className={classes.label} htmlFor="state">State</label>
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
            {stateError ? <p className={classes.helperText}>* State required</p> : null}
          </div>
          <TextField
            margin="normal"
            id="postal"
            label="Postal Code"
            error={postalError}
            helperText={postalError ? '* Postal code required' : ''}
            FormHelperTextProps={{ classes: { root: classes.helperText } }}
            InputProps={{
              classes: { input: classes.textInput },
            }}
            InputLabelProps={{
              style: { fontSize: '1.1em' },
            }}
            fullWidth
            value={newAddress.postal_code}
            onChange={handleNewAddressChange('postal_code')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClick} color="primary" className={classes.button}>
            Change
          </Button>
          <Button onClick={handleChangeAddressClose} color="primary" className={classes.button}>
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
  setBillingValues: PropTypes.func.isRequired,
};

export default ChangeAddress;
