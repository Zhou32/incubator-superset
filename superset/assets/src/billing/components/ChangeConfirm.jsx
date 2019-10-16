import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
  button: {
    fontSize: '1.2em',
  },
  contentText: {
    fontSize: '1.2em',
  },
  loading: {
    width: 30,
    margin: 0,
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

function ChangeConfirm({ planId, openCC, handleCloseCC, changePlan, billing }) {
  const classes = useStyles();

  const handleSubmit = (e) => {
    e.preventDefault();
    changePlan(planId, null).then(() => {
      handleCloseCC();
    });
  };

  return (
    <div>
      <Dialog open={openCC} onClose={handleCloseCC} aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.title}>Ready to Change Plan?</DialogTitle>
        <DialogContent>
          <DialogContentText className={classes.contentText}>
            Are you sure to change your current plan to the new one?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {billing.plan_change === 'changing' ?
            (<img className={classes.loading} alt="Loading..." src="/static/assets/images/loading.gif" />) :
            (<Button onClick={handleSubmit} color="primary" className={classes.button}>Confirm</Button>)
          }
          <Button onClick={handleCloseCC} color="primary" className={classes.button}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

ChangeConfirm.propTypes = {
  billing: PropTypes.object.isRequired,
  planId: PropTypes.string.isRequired,
  openCC: PropTypes.bool.isRequired,
  handleCloseCC: PropTypes.func.isRequired,
  changePlan: PropTypes.func.isRequired,
};


export default ChangeConfirm;
