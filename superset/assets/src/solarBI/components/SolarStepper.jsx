import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';

const propTypes = {
  activeStep: PropTypes.number.isRequired,
  classes: PropTypes.object,
};

const useStyles = makeStyles({
  stepLabel: {
    '& svg': {
      fontSize: 25,
    },
    '& svg text': {
      fontSize: 15,
      fontFamily: 'Montserrat',
    },
    '& span': {
      fontSize: 15,
      fontFamily: 'Montserrat',
    },
  },
  stepper: {
    background: 'transparent',
  },
});


function SolarStepper({ activeStep }) {
  const classes = useStyles();
  return (
    <Stepper className={classes.stepper} activeStep={activeStep}>
      {['Search a location', 'View quick result', 'Get more data'].map((label, index) => {
        const labelProps = {};
        if (index === 2) {
          labelProps.optional = <Typography variant="caption">Optional</Typography>;
        }
        return (
          <Step key={label}>
            <StepLabel {...labelProps} className={classes.stepLabel}>{label}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}

SolarStepper.propTypes = propTypes;

export default SolarStepper;
