import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { StripeProvider, Elements } from 'react-stripe-elements';
import ChangeConfirm from './ChangeConfirm';
import AddCreditCard from './AddCreditCard';

const useStyles = makeStyles(tm => ({
  button: {
    float: 'right',
    width: 255,
    height: 80,
    color: '#024067',
    borderColor: '#024067',
    borderRadius: 10,
    fontSize: '1.2em',
  },
  notUse: {
    margin: tm.spacing(1),
  },
}));

function Plan({ billing }) {
  const classes = useStyles();
  const [openCC, setOpenCC] = useState(false);
  const [openACC, setOpenACC] = useState(false);
  const [planId, setPlanId] = useState('00');

  const handleCloseCC = () => {
    setOpenCC(false);
  };

  const handleCloseACC = () => {
    setOpenACC(false);
  };

  const handlePlanClick = (id) => {
    if (billing.pm_id === null) {
      setPlanId(id);
      setOpenACC(true);
    } else {
      setOpenCC(true);
    }
  };


  return (
    <React.Fragment>
      <div className="tab-pane" id="plan">
        <h1 id="select-plan">Select Plan</h1>
        <div className="plan-option-pane">
          <div className="option-name"><i className="fas fa-list-ul" /><span>Free</span></div>
          <div className="option-description">On demand you will be charge every new downloadable data set</div>
          <div className="option-submit">
            <Button variant="outlined" color="primary" className={classes.button} onClick={() => handlePlanClick('01')} disabled={billing.plan_id === '00'}>
              {billing.plan_id === '00' ? 'Current' : 'Chooose'}
            </Button>
          </div>
        </div>
        <div className="plan-option-pane">
          <div className="option-name"><i className="fas fa-hotel" /><span>Starter</span></div>
          <div className="option-description">$100 Increases for upto 3 new download data sets</div>
          <div className="option-submit">
            <Button variant="outlined" color="primary" className={classes.button} onClick={() => handlePlanClick('01')} disabled={billing.plan_id === '01'}>
              {billing.plan_id === '01' ? 'Current' : 'Chooose'}
            </Button>
          </div>
        </div>
        <div className="plan-option-pane">
          <div className="option-name"><i className="fas fa-project-diagram" /><span>Medium</span></div>
          <div className="option-description">$1000 month flat fee for all the downloads you can do !</div>
          <div className="option-submit">
            <Button variant="outlined" color="primary" className={classes.button} onClick={() => handlePlanClick('02')} disabled={billing.plan_id === '02'}>
              {billing.plan_id === '02' ? 'Current' : 'Chooose'}
            </Button>
          </div>
        </div>
        <div className="plan-option-pane">
          <div className="option-name"><i className="fas fa-project-diagram" /><span>Advance</span></div>
          <div className="option-description">$1000 month flat fee for all the downloads you can do !</div>
          <div className="option-submit">
            <Button variant="outlined" color="primary" className={classes.button} onClick={() => handlePlanClick('03')} disabled={billing.plan_id === '03'}>
              {billing.plan_id === '03' ? 'Current' : 'Chooose'}
            </Button>
          </div>
        </div>
      </div>

      <StripeProvider apiKey="pk_test_2CT1LvA7viLp1j7yCHJ2MezU00xXxxnRdM">
        <Elements>
          <AddCreditCard planId={planId} openACC={openACC} handleCloseACC={handleCloseACC} />
        </Elements>
      </StripeProvider>

      <ChangeConfirm openCC={openCC} handleCloseCC={handleCloseCC} />
    </React.Fragment>
  );
}

Plan.propTypes = {
  billing: PropTypes.object.isRequired,
};

function mapStateToProps({ billing }) {
  return {
    billing,
  };
}

export default connect(
  mapStateToProps,
  {},
)(Plan);
