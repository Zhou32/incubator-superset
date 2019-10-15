/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
} from 'react-stripe-elements';
import { changePlan } from '../actions/billingActions';

const useStyles = makeStyles(theme => ({
  button: {
    fontSize: '1.2em',
  },
  contentText: {
    fontSize: '1.2em',
  },
  title: {
    '& h2': {
      fontSize: '1.6em',
    },
  },
  notUse: {
    margin: theme.spacing(1),
  },
}));

const createOptions = () => ({
  style: {
    base: {
      fontSize: '14px',
      color: '#424770',
      letterSpacing: '0.025em',
      fontFamily: 'Source Code Pro, monospace',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: 0,
    },
    invalid: {
      color: '#9e2146',
    },
  },
});

function AddCreditCard({ planId, stripe, openACC, handleCloseACC, changePlanConnect }) {
  const classes = useStyles();

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (stripe) {
      stripe.createToken().then((payload) => {
        changePlanConnect(planId, payload).then(console.log('succsss'));
      });
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  return (
    <div>
      <Dialog open={openACC} onClose={handleCloseACC} aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.title}>Add Credit Card</DialogTitle>
        <DialogContent>
          <DialogContentText className={classes.contentText}>
            Seems like you have not added a credit card yet.
          </DialogContentText>
          <div>
            <label className="card-elm-label">
              Card number
              <CardNumberElement {...createOptions()} />
            </label>
            <label className="card-elm-label">
              Expiration date
              <CardExpiryElement {...createOptions()} />
            </label>
            <label className="card-elm-label">
              CVC
              <CardCVCElement {...createOptions()} />
            </label>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} color="primary" className={classes.button}>
            Submit
          </Button>
          <Button onClick={handleCloseACC} color="primary" className={classes.button}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

AddCreditCard.propTypes = {
  planId: PropTypes.number.isRequired,
  openACC: PropTypes.bool.isRequired,
  handleCloseACC: PropTypes.func.isRequired,
};

function mapStateToProps({ billing }) {
  return {
    billing,
  };
}

export default injectStripe(connect(
  mapStateToProps,
  { changePlanConnect: changePlan },
)(AddCreditCard));
